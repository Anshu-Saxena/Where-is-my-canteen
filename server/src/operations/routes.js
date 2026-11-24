import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../auth/session.js';
import { toMenuItemDto } from '../discovery/dto.js';
import { ApiError, asyncRoute } from '../errors.js';
import { indiaDateString } from '../../../src/utils/dates.js';

const menuItemSchema = z.object({
  name: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  price: z.coerce.number().positive().max(100000),
  isVeg: z.boolean().default(true),
  isSpecial: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  image: z.string().max(2048).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  rating: z.coerce.number().min(0).max(5).default(0),
  preparationTime: z.coerce.number().int().min(0).max(240).default(10),
  available: z.boolean().default(true),
  customizations: z.array(z.unknown()).default([])
}).strict();

const comboSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(2000).default(''),
  image: z.string().max(2048).default(''),
  price: z.coerce.number().positive().max(100000),
  items: z.array(z.object({
    itemId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).max(100)
  }).strict()).min(2).max(50)
}).strict().superRefine((value, context) => {
  const ids = value.items.map(item => item.itemId);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['items'],
      message: 'A menu item may appear only once in a combo.'
    });
  }
});

const expressSchema = z.object({
  enabled: z.boolean(),
  counterName: z.string().trim().min(1).max(120),
  prepTimeMinutes: z.coerce.number().int().min(1).max(240),
  itemIds: z.array(z.string().min(1)).max(500)
}).strict().superRefine((value, context) => {
  if (new Set(value.itemIds).size !== value.itemIds.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['itemIds'],
      message: 'Express item IDs must be unique.'
    });
  }
});

const pickupSchema = z.object({
  enabled: z.boolean(),
  autoAssign: z.boolean(),
  instructions: z.string().trim().min(1).max(2000),
  shelves: z.array(z.string().trim().min(1).max(20)).max(100)
}).strict().superRefine((value, context) => {
  if (new Set(value.shelves.map(label => label.toUpperCase())).size !== value.shelves.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['shelves'],
      message: 'Shelf labels must be unique.'
    });
  }
});

const slotSchema = z.object({
  serviceDate: z.string().optional(),
  time: z.string().trim().min(1).max(80),
  capacity: z.coerce.number().int().min(1).max(10000),
  isAvailable: z.boolean().optional()
}).strict();

const slotPatchSchema = slotSchema.omit({ serviceDate: true }).partial();

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'The request contains invalid fields.', result.error.flatten());
  }
  return result.data;
}

function ensureOwnerCanManage(request, canteenId) {
  const assignment = request.user.canteenStaff?.find(
    item => item.canteenId === canteenId && item.role === 'OWNER'
  );
  if (!assignment) {
    throw new ApiError(403, 'CANTEEN_ACCESS_DENIED', 'You are not an owner of this canteen.');
  }
}

async function ensureCanteen(prisma, canteenId) {
  const canteen = await prisma.canteen.findUnique({
    where: { id: canteenId },
    select: { id: true }
  });
  if (!canteen) throw new ApiError(404, 'CANTEEN_NOT_FOUND', 'Canteen was not found.');
  return canteen;
}

async function ensureItemsBelongToCanteen(prisma, canteenId, itemIds) {
  if (!itemIds.length) return [];
  const items = await prisma.menuItem.findMany({
    where: { canteenId, id: { in: itemIds } }
  });
  if (items.length !== itemIds.length) {
    throw new ApiError(400, 'INVALID_MENU_ITEMS', 'Every selected item must belong to this canteen.');
  }
  return items;
}

function toComboDto(combo) {
  const items = combo.items.map(line => ({
    itemId: line.menuItemId ?? `deleted-${line.id}`,
    itemName: line.menuItem?.name ?? line.itemName,
    quantity: line.quantity,
    menuItem: line.menuItem ? toMenuItemDto(line.menuItem) : null
  }));
  const componentsAvailable = combo.items.length > 0 &&
    combo.items.every(line => Boolean(line.menuItem?.available));

  return {
    id: combo.id,
    canteenId: combo.canteenId,
    name: combo.name,
    description: combo.description ?? '',
    image: combo.image ?? '',
    price: Number(combo.price),
    available: combo.available && componentsAvailable,
    items,
    createdAt: combo.createdAt.toISOString()
  };
}

function toExpressDto(config) {
  return {
    canteenId: config.canteenId,
    enabled: config.enabled,
    counterName: config.counterName,
    prepTimeMinutes: config.prepTimeMinutes,
    itemIds: config.eligibleItems.map(item => item.menuItemId)
  };
}

function toPickupDto(config, canteenId) {
  return {
    canteenId,
    enabled: config?.enabled ?? false,
    autoAssign: config?.autoAssign ?? false,
    instructions: config?.instructions ?? '',
    shelves: config?.shelves.map(shelf => shelf.label) ?? []
  };
}

function toSlotDto(slot) {
  return {
    id: slot.id,
    canteenId: slot.canteenId,
    time: slot.timeLabel,
    capacity: slot.capacity,
    maxOrdersPerSlot: slot.capacity,
    currentBookings: slot.currentBookings,
    isAvailable: slot.isAvailable && slot.currentBookings < slot.capacity,
    serviceDate: slot.serviceDate.toISOString().slice(0, 10)
  };
}

function parseTimeRange(value) {
  const parseTime = time => {
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hour = Number(match[1]);
    if (hour < 1 || hour > 12 || Number(match[2]) > 59) return null;
    hour %= 12;
    if (match[3].toUpperCase() === 'PM') hour += 12;
    return hour * 60 + Number(match[2]);
  };

  const parts = value.split(' - ');
  if (parts.length !== 2) return null;
  const startMinute = parseTime(parts[0]);
  const endMinute = parseTime(parts[1]);
  if (startMinute === null || endMinute === null || endMinute <= startMinute) return null;
  return { startMinute, endMinute };
}

function parseServiceDate(value) {
  const input = value ?? indiaDateString();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    throw new ApiError(400, 'INVALID_DATE', 'date must use YYYY-MM-DD format.');
  }
  const date = new Date(`${input}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== input) {
    throw new ApiError(400, 'INVALID_DATE', 'The requested service date is not valid.');
  }
  return date;
}

function indianDayStart(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return new Date(Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day)
  ) - 330 * 60 * 1000);
}

export function createOperationsRouter({ prisma, env }) {
  const router = Router();
  router.use('/owner', requireAuth({ prisma, env }), requireRole('canteen_owner'));

  router.get('/owner/canteens/:canteenId/analytics', asyncRoute(async (request, response) => {
    const { canteenId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    await ensureCanteen(prisma, canteenId);

    const now = new Date();
    const todayStart = indianDayStart(now);
    const yesterdayStart = new Date(todayStart.valueOf() - 24 * 60 * 60 * 1000);
    const [todayOrders, yesterdayRevenue] = await Promise.all([
      prisma.order.findMany({
        where: {
          canteenId,
          createdAt: { gte: todayStart, lte: now }
        },
        include: { items: true }
      }),
      prisma.order.aggregate({
        where: {
          canteenId,
          createdAt: { gte: yesterdayStart, lt: todayStart },
          paymentStatus: 'PAID_ONLINE',
          status: { not: 'CANCELLED' },
          paymentIsTest: false
        },
        _sum: { totalAmount: true }
      })
    ]);

    const realPayments = todayOrders.filter(order =>
      order.status !== 'CANCELLED' &&
      order.paymentStatus === 'PAID_ONLINE' &&
      !order.paymentIsTest
    );
    const totalRevenue = realPayments.reduce(
      (total, order) => total + Number(order.totalAmount),
      0
    );
    const previousRevenue = Number(yesterdayRevenue._sum.totalAmount ?? 0);
    const revenueGrowth = previousRevenue > 0
      ? `${totalRevenue >= previousRevenue ? '+' : ''}${Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)}%`
      : totalRevenue > 0 ? 'New' : '0%';
    const validOrders = todayOrders.filter(order =>
      ['PAY_AT_COUNTER', 'PAID_ONLINE'].includes(order.paymentStatus) &&
      order.status !== 'CANCELLED' &&
      !order.paymentIsTest
    );
    const popularItemMap = new Map();
    const hourlyCounts = new Map();
    validOrders.forEach(order => {
      const localHour = Number(new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        hourCycle: 'h23'
      }).format(order.createdAt));
      hourlyCounts.set(localHour, (hourlyCounts.get(localHour) || 0) + 1);
      order.items.forEach(item => {
        const current = popularItemMap.get(item.name) || { name: item.name, count: 0, revenue: 0 };
        current.count += item.quantity;
        current.revenue += Number(item.unitPrice) * item.quantity;
        popularItemMap.set(item.name, current);
      });
    });

    const peakHours = Array.from({ length: 13 }, (_value, index) => {
      const hour = index + 8;
      const label = hour % 12 || 12;
      const endHour = (hour + 1) % 12 || 12;
      return {
        time: `${label} ${hour < 12 ? 'AM' : 'PM'} - ${endHour} ${hour + 1 < 12 ? 'AM' : 'PM'}`,
        count: hourlyCounts.get(hour) || 0
      };
    });
    const totalPaidItems = realPayments.reduce(
      (total, order) => total + order.items.reduce((count, item) => count + item.quantity, 0),
      0
    );
    const peakOrderCount = Math.max(0, ...peakHours.map(slot => slot.count));

    return response.json({
      analytics: {
        todayStats: {
          totalRevenue,
          revenueGrowth,
          totalOrders: todayOrders.filter(order => order.status !== 'CANCELLED').length,
          averageTicketSize: realPayments.length ? totalRevenue / realPayments.length : 0,
          averageItemsPerPaidOrder: realPayments.length ? totalPaidItems / realPayments.length : 0,
          pendingOrders: todayOrders.filter(order => order.status === 'PENDING').length,
          preparingOrders: todayOrders.filter(order => order.status === 'PREPARING').length,
          readyOrders: todayOrders.filter(order => order.status === 'READY_FOR_PICKUP').length,
          peakOrderCount
        },
        peakHours,
        popularItems: [...popularItemMap.values()]
          .sort((left, right) => right.count - left.count)
          .slice(0, 5)
      }
    });
  }));

  router.get('/canteens/:canteenId/slots', asyncRoute(async (request, response) => {
    await ensureCanteen(prisma, request.params.canteenId);
    const serviceDate = parseServiceDate(request.query.date);
    const slots = await prisma.pickupSlot.findMany({
      where: { canteenId: request.params.canteenId, serviceDate },
      orderBy: { startMinute: 'asc' }
    });
    return response.json({ slots: slots.map(toSlotDto) });
  }));

  router.post('/owner/canteens/:canteenId/slots', asyncRoute(async (request, response) => {
    const { canteenId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    await ensureCanteen(prisma, canteenId);
    const data = parse(slotSchema, request.body);
    const time = parseTimeRange(data.time);
    if (!time) throw new ApiError(400, 'INVALID_SLOT_TIME', 'Use a valid time range such as 03:00 PM - 03:15 PM.');

    const serviceDate = parseServiceDate(data.serviceDate);
    const slot = await prisma.pickupSlot.create({
      data: {
        canteenId,
        serviceDate,
        timeLabel: data.time,
        ...time,
        capacity: data.capacity,
        isAvailable: data.isAvailable ?? true
      }
    });
    return response.status(201).json({ slot: toSlotDto(slot) });
  }));

  router.patch('/owner/canteens/:canteenId/slots/:slotId', asyncRoute(async (request, response) => {
    const { canteenId, slotId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    const patch = parse(slotPatchSchema, request.body);
    const current = await prisma.pickupSlot.findFirst({ where: { id: slotId, canteenId } });
    if (!current) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Pickup slot was not found.');

    const nextTime = patch.time === undefined ? null : parseTimeRange(patch.time);
    if (patch.time !== undefined && !nextTime) {
      throw new ApiError(400, 'INVALID_SLOT_TIME', 'Use a valid time range such as 03:00 PM - 03:15 PM.');
    }
    if (patch.capacity !== undefined && patch.capacity < current.currentBookings) {
      throw new ApiError(409, 'CAPACITY_BELOW_BOOKINGS', 'Capacity cannot be lower than existing reservations.');
    }

    const slot = await prisma.pickupSlot.update({
      where: { id: slotId },
      data: {
        ...(patch.time !== undefined ? { timeLabel: patch.time, ...nextTime } : {}),
        ...(patch.capacity !== undefined ? { capacity: patch.capacity } : {}),
        ...(patch.isAvailable !== undefined ? { isAvailable: patch.isAvailable } : {})
      }
    });
    return response.json({ slot: toSlotDto(slot) });
  }));

  router.delete('/owner/canteens/:canteenId/slots/:slotId', asyncRoute(async (request, response) => {
    const { canteenId, slotId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    const slot = await prisma.pickupSlot.findFirst({ where: { id: slotId, canteenId } });
    if (!slot) throw new ApiError(404, 'SLOT_NOT_FOUND', 'Pickup slot was not found.');
    await prisma.pickupSlot.delete({ where: { id: slotId } });
    return response.status(204).end();
  }));

  router.get('/canteens/:canteenId/express', asyncRoute(async (request, response) => {
    await ensureCanteen(prisma, request.params.canteenId);
    const config = await prisma.expressConfig.findUnique({
      where: { canteenId: request.params.canteenId },
      include: { eligibleItems: true }
    });
    return response.json({
      express: config
        ? toExpressDto(config)
        : { canteenId: request.params.canteenId, enabled: false, counterName: 'Express Counter', prepTimeMinutes: 5, itemIds: [] }
    });
  }));

  router.put('/owner/canteens/:canteenId/express', asyncRoute(async (request, response) => {
    const { canteenId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    await ensureCanteen(prisma, canteenId);
    const data = parse(expressSchema, request.body);
    await ensureItemsBelongToCanteen(prisma, canteenId, data.itemIds);

    const config = await prisma.$transaction(async transaction => {
      const saved = await transaction.expressConfig.upsert({
        where: { canteenId },
        update: {
          enabled: data.enabled,
          counterName: data.counterName,
          prepTimeMinutes: data.prepTimeMinutes
        },
        create: {
          canteenId,
          enabled: data.enabled,
          counterName: data.counterName,
          prepTimeMinutes: data.prepTimeMinutes
        }
      });
      await transaction.expressEligibleItem.deleteMany({ where: { expressConfigId: saved.id } });
      if (data.itemIds.length) {
        await transaction.expressEligibleItem.createMany({
          data: data.itemIds.map(menuItemId => ({ expressConfigId: saved.id, menuItemId }))
        });
      }
      return transaction.expressConfig.findUnique({
        where: { id: saved.id },
        include: { eligibleItems: true }
      });
    });
    return response.json({ express: toExpressDto(config) });
  }));

  router.get('/canteens/:canteenId/combos', asyncRoute(async (request, response) => {
    await ensureCanteen(prisma, request.params.canteenId);
    const combos = await prisma.comboMeal.findMany({
      where: { canteenId: request.params.canteenId },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return response.json({ combos: combos.map(toComboDto) });
  }));

  router.post('/owner/canteens/:canteenId/combos', asyncRoute(async (request, response) => {
    const { canteenId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    await ensureCanteen(prisma, canteenId);
    const data = parse(comboSchema, request.body);
    const items = await ensureItemsBelongToCanteen(
      prisma,
      canteenId,
      data.items.map(item => item.itemId)
    );
    const itemNames = new Map(items.map(item => [item.id, item.name]));
    const combo = await prisma.comboMeal.create({
      data: {
        canteenId,
        name: data.name,
        description: data.description,
        image: data.image,
        price: data.price,
        items: {
          create: data.items.map(line => ({
            menuItemId: line.itemId,
            itemName: itemNames.get(line.itemId),
            quantity: line.quantity
          }))
        }
      },
      include: { items: { include: { menuItem: true } } }
    });
    return response.status(201).json({ combo: toComboDto(combo) });
  }));

  router.patch('/owner/canteens/:canteenId/combos/:comboId', asyncRoute(async (request, response) => {
    const { canteenId, comboId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    const data = parse(comboSchema.partial(), request.body);
    const existing = await prisma.comboMeal.findFirst({
      where: { id: comboId, canteenId },
      include: { items: true }
    });
    if (!existing) throw new ApiError(404, 'COMBO_NOT_FOUND', 'Combo was not found.');

    const selectedItems = data.items
      ? await ensureItemsBelongToCanteen(prisma, canteenId, data.items.map(item => item.itemId))
      : null;
    const itemNames = new Map((selectedItems ?? []).map(item => [item.id, item.name]));
    const combo = await prisma.$transaction(async transaction => {
      if (data.items) {
        await transaction.comboItem.deleteMany({ where: { comboMealId: comboId } });
      }
      return transaction.comboMeal.update({
        where: { id: comboId },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.image !== undefined ? { image: data.image } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.items ? {
            items: {
              create: data.items.map(line => ({
                menuItemId: line.itemId,
                itemName: itemNames.get(line.itemId),
                quantity: line.quantity
              }))
            }
          } : {})
        },
        include: { items: { include: { menuItem: true } } }
      });
    });
    return response.json({ combo: toComboDto(combo) });
  }));

  router.patch('/owner/canteens/:canteenId/combos/:comboId/availability', asyncRoute(async (request, response) => {
    const { canteenId, comboId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    const availability = z.object({ available: z.boolean() }).safeParse(request.body);
    if (!availability.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'available must be a boolean.');
    }
    const updated = await prisma.comboMeal.updateMany({
      where: { id: comboId, canteenId },
      data: { available: availability.data.available }
    });
    if (!updated.count) throw new ApiError(404, 'COMBO_NOT_FOUND', 'Combo was not found.');
    const combo = await prisma.comboMeal.findUnique({
      where: { id: comboId },
      include: { items: { include: { menuItem: true } } }
    });
    return response.json({ combo: toComboDto(combo) });
  }));

  router.delete('/owner/canteens/:canteenId/combos/:comboId', asyncRoute(async (request, response) => {
    const { canteenId, comboId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    const deleted = await prisma.comboMeal.deleteMany({ where: { id: comboId, canteenId } });
    if (!deleted.count) throw new ApiError(404, 'COMBO_NOT_FOUND', 'Combo was not found.');
    return response.status(204).end();
  }));

  router.get('/canteens/:canteenId/pickup', asyncRoute(async (request, response) => {
    await ensureCanteen(prisma, request.params.canteenId);
    const config = await prisma.pickupConfig.findUnique({
      where: { canteenId: request.params.canteenId },
      include: { shelves: { orderBy: { label: 'asc' } } }
    });
    return response.json({ pickup: toPickupDto(config, request.params.canteenId) });
  }));

  router.put('/owner/canteens/:canteenId/pickup', asyncRoute(async (request, response) => {
    const { canteenId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    await ensureCanteen(prisma, canteenId);
    const data = parse(pickupSchema, request.body);
    const shelves = data.shelves.map(label => label.trim().toUpperCase());
    if (new Set(shelves).size !== shelves.length) {
      throw new ApiError(400, 'DUPLICATE_SHELF', 'Shelf labels must be unique.');
    }

    const config = await prisma.$transaction(async transaction => {
      const saved = await transaction.pickupConfig.upsert({
        where: { canteenId },
        update: {
          enabled: data.enabled,
          autoAssign: data.enabled && data.autoAssign,
          instructions: data.instructions
        },
        create: {
          canteenId,
          enabled: data.enabled,
          autoAssign: data.enabled && data.autoAssign,
          instructions: data.instructions
        }
      });
      await transaction.pickupShelf.deleteMany({
        where: {
          pickupConfigId: saved.id,
          ...(shelves.length ? { label: { notIn: shelves } } : {})
        }
      });
      if (shelves.length) {
        await transaction.pickupShelf.createMany({
          data: shelves.map(label => ({ pickupConfigId: saved.id, label })),
          skipDuplicates: true
        });
      }
      return transaction.pickupConfig.findUnique({
        where: { id: saved.id },
        include: { shelves: { orderBy: { label: 'asc' } } }
      });
    });
    return response.json({ pickup: toPickupDto(config, canteenId) });
  }));

  router.post('/owner/canteens/:canteenId/menu', asyncRoute(async (request, response) => {
    const { canteenId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    await ensureCanteen(prisma, canteenId);
    const data = parse(menuItemSchema, request.body);
    const item = await prisma.menuItem.create({
      data: { id: `item-${randomUUID()}`, canteenId, ...data }
    });
    return response.status(201).json({ item: toMenuItemDto(item) });
  }));

  router.patch('/owner/canteens/:canteenId/menu/:itemId', asyncRoute(async (request, response) => {
    const { canteenId, itemId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    const data = parse(menuItemSchema.partial(), request.body);
    const existing = await prisma.menuItem.findFirst({ where: { id: itemId, canteenId } });
    if (!existing) throw new ApiError(404, 'MENU_ITEM_NOT_FOUND', 'Menu item was not found.');
    const item = await prisma.menuItem.update({ where: { id: itemId }, data });
    return response.json({ item: toMenuItemDto(item) });
  }));

  router.delete('/owner/canteens/:canteenId/menu/:itemId', asyncRoute(async (request, response) => {
    const { canteenId, itemId } = request.params;
    ensureOwnerCanManage(request, canteenId);
    const deleted = await prisma.menuItem.deleteMany({ where: { id: itemId, canteenId } });
    if (!deleted.count) throw new ApiError(404, 'MENU_ITEM_NOT_FOUND', 'Menu item was not found.');
    return response.status(204).end();
  }));

  return router;
}
