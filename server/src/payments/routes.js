import { createHmac, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../auth/session.js';
import { ApiError, asyncRoute } from '../errors.js';
import { orderInclude, toOrderDto } from '../orders/dto.js';
import { createRazorpayClient, isRazorpayConfigured } from './gateway.js';

const idempotencySchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(100)
}).strict();

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
}).strict();

const sandboxSchema = z.object({
  outcome: z.enum(['SUCCESS', 'PENDING', 'FAILED', 'CANCELLED']).default('SUCCESS')
}).strict();

function orderIdWhere(id) {
  return { OR: [{ id }, { displayId: id }] };
}

function canAccessOrder(request, order, guestAllowed = false) {
  if (order.userId === request.user?.id) return true;
  if (request.user?.role === 'platform_admin') return true;
  if (guestAllowed && !order.userId) return true;
  return request.user?.canteenStaff?.some(item => item.canteenId === order.canteenId) ?? false;
}

function signatureMatches(secret, message, signature) {
  if (!secret || !signature || !/^[a-f0-9]+$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(message).digest();
  const received = Buffer.from(signature, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function toPaymentDto(payment) {
  return {
    id: payment.id,
    orderId: payment.order.displayId,
    canteenId: payment.canteenId,
    amount: Number(payment.amount),
    method: payment.method,
    gateway: payment.gateway,
    status: payment.status,
    isTest: payment.isTest,
    gatewayOrderId: payment.gatewayOrderId,
    gatewayPaymentId: payment.gatewayPaymentId,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    events: payment.events?.map(event => ({
      at: event.createdAt.toISOString(),
      type: event.type,
      note: event.note ?? ''
    })) ?? []
  };
}

async function findOrder(prisma, id) {
  const order = await prisma.order.findFirst({
    where: orderIdWhere(id),
    include: orderInclude
  });
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
  return order;
}

async function createGatewayPayment(prisma, order, idempotencyKey, env, gatewayFactory) {
  if (order.paymentMethod === 'Pay at Counter') {
    const existing = await prisma.paymentTransaction.findFirst({
      where: { orderId: order.id, gateway: 'offline' },
      include: { order: true, events: { orderBy: { createdAt: 'asc' } } }
    });
    if (existing) return existing;
    return prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        canteenId: order.canteenId,
        amount: order.totalAmount,
        method: order.paymentMethod,
        gateway: 'offline',
        status: 'PAY_AT_COUNTER',
        events: {
          create: { type: 'PAY_AT_COUNTER_SELECTED', note: 'Order set to pay at counter' }
        }
      },
      include: { order: true, events: { orderBy: { createdAt: 'asc' } } }
    });
  }

  const existingByKey = await prisma.paymentTransaction.findUnique({
    where: { idempotencyKey },
    include: { order: true, events: { orderBy: { createdAt: 'asc' } } }
  });
  if (existingByKey) {
    if (existingByKey.orderId !== order.id) {
      throw new ApiError(409, 'IDEMPOTENCY_KEY_REUSED', 'This payment request key is already associated with another order.');
    }
    if (!existingByKey.gatewayOrderId && ['CREATED', 'PENDING'].includes(existingByKey.status)) {
      throw new ApiError(409, 'PAYMENT_INITIALIZING', 'Payment setup is still in progress. Please retry shortly.');
    }
    return existingByKey;
  }

  const activePayment = await prisma.paymentTransaction.findFirst({
    where: { orderId: order.id, gateway: 'razorpay', status: { in: ['CREATED', 'PENDING'] } },
    include: { order: true, events: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
  if (activePayment) {
    if (!activePayment.gatewayOrderId) {
      throw new ApiError(409, 'PAYMENT_INITIALIZING', 'Payment setup is still in progress. Please retry shortly.');
    }
    return activePayment;
  }

  const client = gatewayFactory(env);
  const amount = Math.round(Number(order.totalAmount) * 100);
  const payment = await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      canteenId: order.canteenId,
      amount: order.totalAmount,
      method: order.paymentMethod,
      gateway: 'razorpay',
      status: 'CREATED',
      idempotencyKey,
      events: {
        create: { type: 'PAYMENT_INITIATED', note: 'Razorpay order creation requested.' }
      }
    },
    include: { order: true, events: { orderBy: { createdAt: 'asc' } } }
  });

  let gatewayOrder;
  try {
    gatewayOrder = await client.orders.create({
      amount,
      currency: 'INR',
      receipt: order.displayId,
      notes: { applicationOrderId: order.id }
    });
  } catch (error) {
    console.error('Razorpay order creation failed.', error?.message);
    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      }),
      prisma.paymentEvent.create({
        data: {
          paymentId: payment.id,
          type: 'GATEWAY_ORDER_CREATION_FAILED',
          note: 'The payment gateway could not create an order.'
        }
      })
    ]);
    throw new ApiError(502, 'RAZORPAY_ORDER_FAILED', 'The payment gateway could not initialize this payment.');
  }

  const updated = await prisma.paymentTransaction.update({
    where: { id: payment.id },
    data: {
      gatewayOrderId: gatewayOrder.id,
      status: 'PENDING',
      events: {
        create: {
          type: 'GATEWAY_ORDER_CREATED',
          note: 'Razorpay order created successfully.'
        }
      }
    },
    include: { order: true, events: { orderBy: { createdAt: 'asc' } } }
  });
  return { ...updated, gatewayAmount: amount, publicKey: env.RAZORPAY_KEY_ID };
}

async function verifyPayment(prisma, request, env, gatewayFactory, guestAllowed = false) {
  const data = verifySchema.safeParse(request.body);
  if (!data.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Razorpay payment verification fields are required.', data.error.flatten());
  }

  const payment = await prisma.paymentTransaction.findUnique({
    where: { gatewayOrderId: data.data.razorpay_order_id },
    include: { order: true, events: true }
  });
  if (!payment || !canAccessOrder(request, payment.order, guestAllowed)) {
    throw new ApiError(404, 'PAYMENT_NOT_FOUND', 'Payment was not found.');
  }
  if (payment.status === 'SUCCESS' && payment.gatewayPaymentId === data.data.razorpay_payment_id) {
    const order = await findOrder(prisma, payment.orderId);
    return { payment, order };
  }

  const client = gatewayFactory(env);
  const expectedSignatureMessage = `${data.data.razorpay_order_id}|${data.data.razorpay_payment_id}`;
  if (!signatureMatches(env.RAZORPAY_KEY_SECRET, expectedSignatureMessage, data.data.razorpay_signature)) {
    throw new ApiError(400, 'INVALID_PAYMENT_SIGNATURE', 'Razorpay signature verification failed.');
  }

  let gatewayPayment;
  try {
    gatewayPayment = await client.payments.fetch(data.data.razorpay_payment_id);
    if (gatewayPayment.order_id !== payment.gatewayOrderId) {
      throw new ApiError(400, 'PAYMENT_ORDER_MISMATCH', 'The gateway payment does not match this order.');
    }
    if (gatewayPayment.amount !== Math.round(Number(payment.amount) * 100) || gatewayPayment.currency !== 'INR') {
      throw new ApiError(400, 'PAYMENT_AMOUNT_MISMATCH', 'The gateway payment amount does not match this order.');
    }
    if (gatewayPayment.status === 'authorized') {
      gatewayPayment = await client.payments.capture(
        data.data.razorpay_payment_id,
        gatewayPayment.amount,
        gatewayPayment.currency
      );
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Razorpay payment verification failed.', error?.message);
    throw new ApiError(502, 'RAZORPAY_VERIFICATION_FAILED', 'The payment gateway could not verify this payment.');
  }

  const status = gatewayPayment.status === 'captured'
    ? 'SUCCESS'
    : gatewayPayment.status === 'failed'
      ? 'FAILED'
      : 'PENDING';
  const orderPaymentStatus = status === 'SUCCESS'
    ? 'PAID_ONLINE'
    : status === 'FAILED'
      ? 'PAYMENT_FAILED'
      : 'PAYMENT_PENDING';

  await prisma.$transaction([
    prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status,
        gatewayPaymentId: data.data.razorpay_payment_id,
        signature: data.data.razorpay_signature
      }
    }),
    prisma.paymentEvent.create({
      data: {
        paymentId: payment.id,
        type: `STATUS_${status}`,
        note: `Gateway verification returned ${gatewayPayment.status}.`,
        payload: {
          gatewayPaymentId: data.data.razorpay_payment_id,
          gatewayStatus: gatewayPayment.status,
          amount: gatewayPayment.amount,
          currency: gatewayPayment.currency
        }
      }
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: orderPaymentStatus, paymentIsTest: false }
    })
  ]);

  const [updatedPayment, order] = await Promise.all([
    prisma.paymentTransaction.findUnique({
      where: { id: payment.id },
      include: { order: true, events: { orderBy: { createdAt: 'asc' } } }
    }),
    findOrder(prisma, payment.orderId)
  ]);
  return { payment: updatedPayment, order };
}

async function runSandboxPayment(prisma, order, outcome, env) {
  if (env.NODE_ENV === 'production' || env.ENABLE_PAYMENT_SANDBOX !== 'true') {
    throw new ApiError(404, 'NOT_FOUND', 'The requested API resource was not found.');
  }
  if (order.paymentMethod === 'Pay at Counter') {
    throw new ApiError(400, 'COUNTER_PAYMENT_SELECTED', 'Counter payments do not use the payment sandbox.');
  }

  const status = outcome;
  const gatewayPaymentId = status === 'SUCCESS' ? `pay_test_${randomUUID()}` : null;
  const record = await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      canteenId: order.canteenId,
      amount: order.totalAmount,
      method: order.paymentMethod,
      gateway: 'sandbox',
      status,
      isTest: true,
      gatewayPaymentId,
      events: {
        create: {
          type: `STATUS_${status}`,
          note: `Sandbox outcome: ${status}`
        }
      }
    },
    include: { order: true, events: { orderBy: { createdAt: 'asc' } } }
  });
  const orderPaymentStatus = status === 'SUCCESS'
    ? 'PAID_SANDBOX'
    : status === 'FAILED'
      ? 'PAYMENT_FAILED'
      : status === 'CANCELLED'
        ? 'PAYMENT_CANCELLED'
        : 'PAYMENT_PENDING';
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: orderPaymentStatus, paymentIsTest: true }
  });
  return record;
}

export function createPaymentRouter({ prisma, env, gatewayFactory = createRazorpayClient }) {
  const router = Router();

  router.get('/payments/config', (_request, response) => {
    return response.json({
      gateway: 'razorpay',
      configured: isRazorpayConfigured(env),
      keyId: env.RAZORPAY_KEY_ID ?? null,
      sandboxEnabled: env.NODE_ENV !== 'production' && env.ENABLE_PAYMENT_SANDBOX === 'true'
    });
  });

  const createOrderPayment = allowGuest => asyncRoute(async (request, response) => {
    const { idempotencyKey } = parseIdempotency(request.body);
    const order = await findOrder(prisma, request.params.orderId);
    if (!canAccessOrder(request, order, allowGuest)) {
      throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
    }
    if (order.status === 'CANCELLED' || order.status === 'COMPLETED') {
      throw new ApiError(409, 'ORDER_CLOSED', 'A payment cannot be started for a closed order.');
    }

    const payment = await createGatewayPayment(prisma, order, idempotencyKey, env, gatewayFactory);
    const gatewayAmount = payment.gatewayAmount ?? Math.round(Number(payment.amount) * 100);
    return response.status(201).json({
      payment: toPaymentDto(payment),
      checkout: payment.gateway === 'offline' ? null : {
        keyId: payment.publicKey ?? env.RAZORPAY_KEY_ID,
        gatewayOrderId: payment.gatewayOrderId,
        amount: gatewayAmount,
        currency: 'INR',
        name: 'Where is my Canteen',
        description: `Order ${order.displayId}`
      }
    });
  });

  router.post(
    '/orders/:orderId/payments',
    requireAuth({ prisma, env }),
    requireRole('student', 'staff', 'guest'),
    createOrderPayment(false)
  );
  router.post('/kiosk/orders/:orderId/payments', createOrderPayment(true));

  const verifyRoute = guestAllowed => asyncRoute(async (request, response) => {
    const result = await verifyPayment(prisma, request, env, gatewayFactory, guestAllowed);
    return response.json({
      payment: toPaymentDto(result.payment),
      order: toOrderDto(result.order)
    });
  });
  router.post('/payments/verify', requireAuth({ prisma, env }), verifyRoute(false));
  router.post('/kiosk/payments/verify', verifyRoute(true));

  const sandboxRoute = guestAllowed => asyncRoute(async (request, response) => {
    const parsed = sandboxSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Unsupported sandbox payment outcome.', parsed.error.flatten());
    }
    const order = await findOrder(prisma, request.params.orderId);
    if (!canAccessOrder(request, order, guestAllowed)) {
      throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
    }
    const payment = await runSandboxPayment(prisma, order, parsed.data.outcome, env);
    const updatedOrder = await findOrder(prisma, order.id);
    return response.json({
      payment: toPaymentDto(payment),
      order: toOrderDto(updatedOrder)
    });
  });
  router.post(
    '/orders/:orderId/payments/sandbox',
    requireAuth({ prisma, env }),
    requireRole('student', 'staff', 'guest'),
    sandboxRoute(false)
  );
  router.post('/kiosk/orders/:orderId/payments/sandbox', sandboxRoute(true));

  router.post('/payments/webhook', asyncRoute(async (request, response) => {
    if (!env.RAZORPAY_WEBHOOK_SECRET || !request.rawBody) {
      throw new ApiError(503, 'WEBHOOK_NOT_CONFIGURED', 'The Razorpay webhook is not configured.');
    }
    const signature = request.get('x-razorpay-signature');
    const eventId = request.get('x-razorpay-event-id');
    if (!signatureMatches(env.RAZORPAY_WEBHOOK_SECRET, request.rawBody, signature)) {
      throw new ApiError(400, 'INVALID_WEBHOOK_SIGNATURE', 'Razorpay webhook signature verification failed.');
    }
    if (!eventId) throw new ApiError(400, 'MISSING_WEBHOOK_ID', 'Razorpay webhook event ID is required.');

    const existingEvent = await prisma.paymentEvent.findUnique({ where: { gatewayEventId: eventId } });
    if (existingEvent) return response.status(200).json({ received: true, duplicate: true });

    const event = request.body;
    const entity = event.payload?.payment?.entity;
    const refund = event.payload?.refund?.entity;
    const gatewayOrderId = entity?.order_id;
    const gatewayPaymentId = entity?.id ?? refund?.payment_id;
    const payment = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          ...(gatewayOrderId ? [{ gatewayOrderId }] : []),
          ...(gatewayPaymentId ? [{ gatewayPaymentId }] : [])
        ]
      }
    });
    if (!payment) return response.status(200).json({ received: true, matched: false });

    const statusByEvent = {
      'payment.captured': 'SUCCESS',
      'payment.failed': 'FAILED',
      'refund.created': 'REFUND_INITIATED',
      'refund.processed': 'REFUNDED'
    };
    const status = statusByEvent[event.event];
    if (!status) return response.status(200).json({ received: true, ignored: true });

    try {
      await prisma.$transaction([
        prisma.paymentEvent.create({
          data: {
            paymentId: payment.id,
            gatewayEventId: eventId,
            type: event.event,
            note: `Razorpay webhook: ${event.event}`,
            payload: {
              gatewayOrderId: entity?.order_id ?? null,
              gatewayPaymentId: entity?.id ?? refund?.payment_id ?? null,
              gatewayStatus: entity?.status ?? refund?.status ?? null,
              amount: entity?.amount ?? refund?.amount ?? null,
              currency: entity?.currency ?? null
            }
          }
        }),
        prisma.paymentTransaction.update({
          where: { id: payment.id },
          data: {
            status,
            ...(entity?.id ? { gatewayPaymentId: entity.id } : {})
          }
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: status === 'SUCCESS'
              ? 'PAID_ONLINE'
              : status === 'FAILED'
                ? 'PAYMENT_FAILED'
                : status
          }
        })
      ]);
    } catch (error) {
      if (error?.code === 'P2002') {
        return response.status(200).json({ received: true, duplicate: true });
      }
      throw error;
    }
    return response.status(200).json({ received: true });
  }));

  router.get(
    '/orders/:orderId/payments',
    requireAuth({ prisma, env }),
    asyncRoute(async (request, response) => {
      const order = await findOrder(prisma, request.params.orderId);
      if (!canAccessOrder(request, order)) {
        throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
      }
      const payments = await prisma.paymentTransaction.findMany({
        where: { orderId: order.id },
        include: { order: true, events: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'asc' }
      });
      return response.json({ transactions: payments.map(toPaymentDto) });
    })
  );

  router.get(
    '/owner/canteens/:canteenId/payments',
    requireAuth({ prisma, env }),
    requireRole('canteen_owner'),
    asyncRoute(async (request, response) => {
      const canteenId = request.params.canteenId;
      if (!request.user.canteenStaff?.some(item => item.canteenId === canteenId && item.role === 'OWNER')) {
        throw new ApiError(403, 'CANTEEN_ACCESS_DENIED', 'You are not an owner of this canteen.');
      }
      const payments = await prisma.paymentTransaction.findMany({
        where: { canteenId },
        include: { order: true, events: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'desc' }
      });
      return response.json({ transactions: payments.map(toPaymentDto) });
    })
  );

  router.post(
    '/orders/:orderId/refund',
    requireAuth({ prisma, env }),
    asyncRoute(async (request, response) => {
      const order = await findOrder(prisma, request.params.orderId);
      if (order.userId !== request.user.id || order.status !== 'CANCELLED') {
        throw new ApiError(404, 'ORDER_NOT_FOUND', 'A refundable cancelled order was not found.');
      }
      const payment = await prisma.paymentTransaction.findFirst({
        where: { orderId: order.id, status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' }
      });
      if (!payment) throw new ApiError(409, 'PAYMENT_NOT_REFUNDABLE', 'No successful payment is available to refund.');

      let gatewayRefund = null;
      if (!payment.isTest) {
        const client = gatewayFactory(env);
        try {
          gatewayRefund = await client.payments.refund(payment.gatewayPaymentId, {
            amount: Math.round(Number(payment.amount) * 100),
            notes: { applicationOrderId: order.id }
          });
        } catch (error) {
          console.error('Razorpay refund request failed.', error?.message);
          throw new ApiError(502, 'RAZORPAY_REFUND_FAILED', 'The payment gateway could not start this refund.');
        }
      }

      await prisma.$transaction([
        prisma.paymentTransaction.update({
          where: { id: payment.id },
          data: { status: 'REFUND_INITIATED' }
        }),
        prisma.paymentEvent.create({
          data: {
            paymentId: payment.id,
            type: 'REFUND_INITIATED',
            note: payment.isTest ? 'Sandbox refund requested.' : 'Refund requested from Razorpay.',
            payload: gatewayRefund ? { refundId: gatewayRefund.id, status: gatewayRefund.status } : undefined
          }
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'REFUND_INITIATED' }
        })
      ]);

      return response.json({ status: 'REFUND_INITIATED' });
    })
  );

  return router;
}

function parseIdempotency(body) {
  const result = idempotencySchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, 'IDEMPOTENCY_KEY_REQUIRED', 'A unique idempotencyKey is required for payment initialization.');
  }
  return result.data;
}
