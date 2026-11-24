import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../auth/session.js';
import { ApiError, asyncRoute } from '../errors.js';
import { computeQueue } from '../../../src/utils/queue.js';
import { indiaDateString } from '../../../src/utils/dates.js';
import { orderInclude, toOrderDto } from './dto.js';
import { createRazorpayClient } from '../payments/gateway.js';
import { initiateOrderRefund } from '../payments/refunds.js';
import {
  calculateOrderAmounts,
  NEXT_ORDER_STATUS,
  resolveCustomization,
  statusToUi
} from './pricing.js';

const createOrderSchema = z.object({
  canteenId: z.string().min(1),
  pickupSlotId: z.string().nullable().optional(),
  paymentMethod: z.string().trim().min(1).max(40),
  orderType: z.enum(['standard', 'express', 'kiosk']).default('standard'),
  customer: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().max(40).optional(),
    rollNumber: z.string().trim().max(80).optional()
  }).optional(),
  items: z.array(z.object({
    id: z.string().min(1),
    quantity: z.coerce.number().int().min(1).max(50),
    customization: z.string().max(500).optional()
  }).strict()).min(1).max(100)
}).strict();

const cancelSchema = z.object({
  reason: z.string().trim().max(500).optional()
}).strict();

const statusSchema = z.object({
  status: z.enum(['Accepted', 'Preparing', 'Ready for Pickup', 'Completed'])
}).strict();

const shelfSchema = z.object({
  label: z.string().trim().max(20).nullable()
}).strict();

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000)
}).strict();

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'The request contains invalid fields.', result.error.flatten());
  }
  return result.data;
}

function orderIdWhere(id) {
  return { OR: [{ id }, { displayId: id }] };
}

function assertCanViewOrder(request, order) {
  const isOwner = request.user.canteenStaff?.some(
    assignment => assignment.canteenId === order.canteenId
  );
  if (order.userId !== request.user.id && !isOwner && request.user.role !== 'platform_admin') {
    throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
  }
}

async function buildPricedLines(transaction, canteenId, requestedItems, orderType) {
  const ids = [...new Set(requestedItems.map(item => item.id))];
  const menuItems = await transaction.menuItem.findMany({
    where: { canteenId, id: { in: ids } }
  });
  const combos = await transaction.comboMeal.findMany({
    where: { canteenId, id: { in: ids } },
    include: { items: { include: { menuItem: true } } }
  });
  const menuById = new Map(menuItems.map(item => [item.id, item]));
  const comboById = new Map(combos.map(combo => [combo.id, combo]));

  if (orderType === 'express') {
    const config = await transaction.expressConfig.findUnique({
      where: { canteenId },
      include: { eligibleItems: true }
    });
    const eligibleIds = new Set(config?.eligibleItems.map(item => item.menuItemId) ?? []);
    if (!config?.enabled || requestedItems.some(item => !eligibleIds.has(item.id))) {
      throw new ApiError(400, 'EXPRESS_ITEMS_REQUIRED', 'Every item in an Express order must be eligible at this canteen.');
    }
  }

  return requestedItems.map(requested => {
    const menuItem = menuById.get(requested.id);
    if (menuItem) {
      if (!menuItem.available) {
        throw new ApiError(409, 'ITEM_UNAVAILABLE', `${menuItem.name} is no longer available.`);
      }
      const { summary, extraCents } = resolveCustomization(
        menuItem.customizations,
        requested.customization
      );
      return {
        menuItemId: menuItem.id,
        comboMealId: null,
        name: menuItem.name,
        price: (Math.round(Number(menuItem.price) * 100) + extraCents) / 100,
        quantity: requested.quantity,
        customization: summary
      };
    }

    const combo = comboById.get(requested.id);
    if (combo) {
      const available = combo.available &&
        combo.items.length > 0 &&
        combo.items.every(line => line.menuItem?.available);
      if (!available) {
        throw new ApiError(409, 'COMBO_UNAVAILABLE', `${combo.name} is no longer available.`);
      }
      return {
        menuItemId: null,
        comboMealId: combo.id,
        name: `${combo.name} (Combo)`,
        price: Number(combo.price),
        quantity: requested.quantity,
        customization: requested.customization || 'Combo meal'
      };
    }

    throw new ApiError(400, 'INVALID_CART_ITEM', 'A selected item does not belong to this canteen.');
  });
}

async function createOrder(prisma, request, orderType) {
  const data = parse(createOrderSchema, {
    ...request.body,
    orderType: orderType === 'kiosk' ? 'kiosk' : request.body.orderType
  });
  const { canteenId } = data;

  return prisma.$transaction(async transaction => {
    const canteen = await transaction.canteen.findUnique({
      where: { id: canteenId },
      include: { campus: { include: { university: true } } }
    });
    if (!canteen) throw new ApiError(404, 'CANTEEN_NOT_FOUND', 'Canteen was not found.');
    if (!canteen.isOpen) throw new ApiError(409, 'CANTEEN_CLOSED', 'This canteen is currently closed.');
    if (data.paymentMethod === 'Pay at Counter' && !canteen.acceptsPayAtCounter) {
      throw new ApiError(400, 'COUNTER_PAYMENT_UNAVAILABLE', 'This canteen does not accept payment at the counter.');
    }

    const lines = await buildPricedLines(transaction, canteenId, data.items, data.orderType);
    const amounts = calculateOrderAmounts(lines);
    let pickupSlot = null;
    if (data.pickupSlotId) {
      const reserved = await transaction.$executeRaw`
        UPDATE "PickupSlot"
        SET "currentBookings" = "currentBookings" + 1
        WHERE "id" = ${data.pickupSlotId}
          AND "canteenId" = ${canteenId}
          AND "isAvailable" = TRUE
          AND "serviceDate" >= ${indiaDateString()}::date
          AND "currentBookings" < "capacity"
      `;
      if (reserved !== 1) {
        throw new ApiError(409, 'SLOT_UNAVAILABLE', 'This pickup slot is no longer available.');
      }
      pickupSlot = await transaction.pickupSlot.findUnique({
        where: { id: data.pickupSlotId }
      });
    }

    const suffix = randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
    const tokenPrefix = data.orderType === 'express' ? 'X-' : 'T-';
    const paymentIsCounter = data.paymentMethod === 'Pay at Counter';
    const order = await transaction.order.create({
      data: {
        displayId: `WMC-${suffix}`,
        tokenNumber: `${tokenPrefix}${suffix}`,
        userId: request.user?.id,
        universityId: canteen.campus.universityId,
        campusId: canteen.campusId,
        canteenId,
        pickupSlotId: pickupSlot?.id,
        pickupSlotLabel: pickupSlot?.timeLabel ?? 'At counter',
        status: 'PENDING',
        orderType: data.orderType,
        ...amounts,
        paymentMethod: data.paymentMethod,
        paymentStatus: paymentIsCounter ? 'PAY_AT_COUNTER' : 'PAYMENT_PENDING',
        customerName: data.customer?.name ?? request.user?.name ?? 'Kiosk Guest',
        customerRoll: data.customer?.rollNumber ?? request.user?.rollNumber,
        customerPhone: data.customer?.phone ?? request.user?.phone,
        items: { create: lines.map(({ price, ...line }) => ({ ...line, unitPrice: price })) },
        ...(paymentIsCounter ? {
          payments: {
            create: {
              canteenId,
              amount: amounts.totalAmount,
              method: data.paymentMethod,
              gateway: 'offline',
              status: 'PAY_AT_COUNTER',
              events: {
                create: {
                  type: 'PAY_AT_COUNTER_SELECTED',
                  note: 'Order set to pay at counter'
                }
              }
            }
          }
        } : {})
      },
      include: orderInclude
    });
    return toOrderDto(order);
  });
}

async function cancelPendingOrder(transaction, target, reason) {
  if (target.status !== 'PENDING') {
    throw new ApiError(409, 'ORDER_NOT_CANCELLABLE', 'The kitchen has already started preparing this order.');
  }

  const nextPaymentStatus =
    target.paymentStatus === 'PAY_AT_COUNTER'
      ? 'CANCELLED_UNPAID'
      : target.paymentStatus === 'PAID_ONLINE' || target.paymentStatus === 'PAID_SANDBOX'
        ? 'REFUND_INITIATED'
        : 'PAYMENT_CANCELLED';
  const updated = await transaction.order.updateMany({
    where: { id: target.id, status: 'PENDING' },
    data: { status: 'CANCELLED', cancellationReason: reason, paymentStatus: nextPaymentStatus }
  });
  if (updated.count !== 1) {
    throw new ApiError(409, 'ORDER_STATUS_CHANGED', 'The order status changed; refresh and try again.');
  }

  await transaction.paymentTransaction.updateMany({
    where: { orderId: target.id, status: { in: ['CREATED', 'PENDING'] } },
    data: { status: 'CANCELLED' }
  });
  if (target.pickupSlotId) {
    await transaction.$executeRaw`
      UPDATE "PickupSlot"
      SET "currentBookings" = GREATEST("currentBookings" - 1, 0)
      WHERE "id" = ${target.pickupSlotId}
    `;
  }
  return transaction.order.findUnique({
    where: { id: target.id },
    include: orderInclude
  });
}

async function findAccessibleOrder(prisma, request, id) {
  const order = await prisma.order.findFirst({
    where: orderIdWhere(id),
    include: orderInclude
  });
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
  assertCanViewOrder(request, order);
  return order;
}

function requireCanteenOwner(request, canteenId) {
  const authorized = request.user.canteenStaff?.some(
    assignment => assignment.canteenId === canteenId && assignment.role === 'OWNER'
  );
  if (!authorized) {
    throw new ApiError(403, 'CANTEEN_ACCESS_DENIED', 'You are not an owner of this canteen.');
  }
}

export function createOrderRouter({ prisma, env }) {
  const router = Router();

  router.post(
    '/orders',
    requireAuth({ prisma, env }),
    requireRole('student', 'staff', 'guest'),
    asyncRoute(async (request, response) => {
      const order = await createOrder(prisma, request, 'account');
      return response.status(201).json({ order });
    })
  );

  router.post('/kiosk/orders', asyncRoute(async (request, response) => {
    const order = await createOrder(prisma, request, 'kiosk');
    return response.status(201).json({ order });
  }));

  router.get('/orders', requireAuth({ prisma, env }), asyncRoute(async (request, response) => {
    const assignments = request.user.canteenStaff?.map(item => item.canteenId) ?? [];
    const where = request.user.role === 'canteen_owner'
      ? {
          canteenId: { in: assignments },
          paymentStatus: { in: ['PAY_AT_COUNTER', 'PAID_ONLINE', 'PAID_SANDBOX'] }
        }
      : { userId: request.user.id };
    const orders = await prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' }
    });
    return response.json({ orders: orders.map(toOrderDto) });
  }));

  router.get('/orders/:orderId', requireAuth({ prisma, env }), asyncRoute(async (request, response) => {
    const order = await findAccessibleOrder(prisma, request, request.params.orderId);
    return response.json({ order: toOrderDto(order) });
  }));

  router.get('/orders/:orderId/queue', requireAuth({ prisma, env }), asyncRoute(async (request, response) => {
    const order = await findAccessibleOrder(prisma, request, request.params.orderId);
    if (!['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status)) {
      return response.json({
        position: null,
        ordersAhead: null,
        estimatedWaitMinutes: null,
        message: 'This order is no longer waiting in the kitchen queue.'
      });
    }
    if (!['PAY_AT_COUNTER', 'PAID_ONLINE'].includes(order.paymentStatus) || order.paymentIsTest) {
      return response.json({
        position: null,
        ordersAhead: null,
        estimatedWaitMinutes: null,
        message: 'Queue position is available after payment is confirmed.'
      });
    }

    const queuedOrders = await prisma.order.findMany({
      where: {
        canteenId: order.canteenId,
        paymentStatus: { in: ['PAY_AT_COUNTER', 'PAID_ONLINE'] },
        paymentIsTest: false,
        status: { in: ['PENDING', 'ACCEPTED', 'PREPARING'] }
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true, canteenId: true, status: true }
    });
    const index = queuedOrders.findIndex(item => item.id === order.id);
    if (index < 0) {
      return response.json({
        position: null,
        ordersAhead: null,
        estimatedWaitMinutes: null,
        message: 'This order is not currently in the active queue.'
      });
    }

    const position = index + 1;
    const queue = computeQueue(
      queuedOrders.map(item => ({ ...item, status: statusToUi(item.status) })),
      order.canteen
    );
    return response.json({
      position,
      ordersAhead: index,
      estimatedWaitMinutes: queue.available
        ? Math.round((position * queue.prepMinutes) / 3)
        : null,
      message: null
    });
  }));

  router.post('/orders/:orderId/cancel', requireAuth({ prisma, env }), asyncRoute(async (request, response) => {
    const { reason = 'Cancelled by student' } = parse(cancelSchema, request.body);
    const result = await prisma.$transaction(async transaction => {
      const target = await transaction.order.findFirst({
        where: orderIdWhere(request.params.orderId)
      });
      if (!target || target.userId !== request.user.id) {
        throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
      }
      return cancelPendingOrder(transaction, target, reason);
    });

    return response.json({ success: true, order: toOrderDto(result) });
  }));

  router.post(
    '/owner/orders/:orderId/reject',
    requireAuth({ prisma, env }),
    requireRole('canteen_owner'),
    asyncRoute(async (request, response) => {
      const { reason = 'Rejected by canteen' } = parse(cancelSchema, request.body);
      let shouldRefund = false;
      let order = await prisma.$transaction(async transaction => {
        const target = await transaction.order.findFirst({
          where: orderIdWhere(request.params.orderId)
        });
        if (!target) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
        requireCanteenOwner(request, target.canteenId);
        shouldRefund = ['PAID_ONLINE', 'PAID_SANDBOX'].includes(target.paymentStatus);
        return cancelPendingOrder(transaction, target, reason);
      });

      if (shouldRefund) {
        await initiateOrderRefund(prisma, order, env, createRazorpayClient);
        order = await findAccessibleOrder(prisma, request, request.params.orderId);
      }
      return response.json({ success: true, order: toOrderDto(order) });
    })
  );

  router.patch(
    '/owner/orders/:orderId/status',
    requireAuth({ prisma, env }),
    requireRole('canteen_owner'),
    asyncRoute(async (request, response) => {
      const { status } = parse(statusSchema, request.body);
      const target = await prisma.order.findFirst({
        where: orderIdWhere(request.params.orderId),
        include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });
      if (!target) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
      requireCanteenOwner(request, target.canteenId);
      const nextStatus = NEXT_ORDER_STATUS[target.status];
      if (statusToUi(nextStatus) !== status) {
        throw new ApiError(409, 'INVALID_ORDER_TRANSITION', 'The order cannot move to that status yet.');
      }
      if (!['PAY_AT_COUNTER', 'PAID_ONLINE', 'PAID_SANDBOX'].includes(target.paymentStatus)) {
        throw new ApiError(409, 'PAYMENT_NOT_SETTLED', 'The order cannot be prepared until payment is confirmed.');
      }

      const now = new Date();
      const updated = await prisma.order.update({
        where: { id: target.id },
        data: {
          status: nextStatus,
          ...(nextStatus === 'READY_FOR_PICKUP' ? { readyAt: now } : {}),
          ...(nextStatus === 'COMPLETED' ? { collectedAt: now } : {})
        },
        include: orderInclude
      });
      return response.json({ order: toOrderDto(updated) });
    })
  );

  router.patch(
    '/owner/orders/:orderId/shelf',
    requireAuth({ prisma, env }),
    requireRole('canteen_owner'),
    asyncRoute(async (request, response) => {
      const { label } = parse(shelfSchema, request.body);
      const target = await prisma.order.findFirst({ where: orderIdWhere(request.params.orderId) });
      if (!target) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
      requireCanteenOwner(request, target.canteenId);
      if (target.status !== 'READY_FOR_PICKUP') {
        throw new ApiError(409, 'ORDER_NOT_READY', 'A shelf can be assigned only when an order is ready.');
      }

      let pickupShelfId = null;
      if (label) {
        const config = await prisma.pickupConfig.findUnique({
          where: { canteenId: target.canteenId },
          include: { shelves: true }
        });
        if (!config?.enabled) throw new ApiError(409, 'SHELVES_DISABLED', 'Pickup shelves are disabled for this canteen.');
        const shelf = config.shelves.find(item => item.label === label.toUpperCase());
        if (!shelf) throw new ApiError(404, 'SHELF_NOT_FOUND', 'Pickup shelf was not found.');
        const occupied = await prisma.order.findFirst({
          where: {
            pickupShelfId: shelf.id,
            status: 'READY_FOR_PICKUP',
            collectedAt: null,
            id: { not: target.id }
          },
          select: { id: true }
        });
        if (occupied) throw new ApiError(409, 'SHELF_OCCUPIED', 'That pickup shelf is already assigned.');
        pickupShelfId = shelf.id;
      }

      const updated = await prisma.order.update({
        where: { id: target.id },
        data: { pickupShelfId },
        include: orderInclude
      });
      return response.json({ order: toOrderDto(updated) });
    })
  );

  router.post(
    '/owner/orders/:orderId/collect',
    requireAuth({ prisma, env }),
    requireRole('canteen_owner'),
    asyncRoute(async (request, response) => {
      const target = await prisma.order.findFirst({ where: orderIdWhere(request.params.orderId) });
      if (!target) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
      requireCanteenOwner(request, target.canteenId);
      if (target.status !== 'READY_FOR_PICKUP') {
        throw new ApiError(409, 'ORDER_NOT_READY', 'Only ready orders can be marked collected.');
      }
      const updated = await prisma.order.update({
        where: { id: target.id },
        data: { status: 'COMPLETED', collectedAt: target.collectedAt ?? new Date() },
        include: orderInclude
      });
      return response.json({ order: toOrderDto(updated) });
    })
  );

  router.get('/canteens/:canteenId/queue', asyncRoute(async (request, response) => {
    const canteen = await prisma.canteen.findUnique({
      where: { id: request.params.canteenId },
      include: { campus: true }
    });
    if (!canteen) throw new ApiError(404, 'CANTEEN_NOT_FOUND', 'Canteen was not found.');
    const orders = await prisma.order.findMany({
      where: {
        canteenId: canteen.id,
        paymentStatus: { in: ['PAY_AT_COUNTER', 'PAID_ONLINE'] },
        paymentIsTest: false
      },
      select: { canteenId: true, status: true }
    });
    const result = computeQueue(
      orders.map(order => ({ ...order, status: statusToUi(order.status) })),
      canteen
    );
    return response.json({ queue: result });
  }));

  return router;
}
