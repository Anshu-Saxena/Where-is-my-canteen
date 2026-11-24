import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

const secret = 'test-secret-with-at-least-32-characters';
const razorpaySecret = 'razorpay-test-secret';
const userToken = jwt.sign({ sub: 'student-1' }, secret, { expiresIn: '1h' });
let server;
let baseUrl;
let gatewayCalls = 0;

const orderRecord = {
  id: 'database-order-1',
  displayId: 'WMC-ORDER01',
  tokenNumber: 'T-ORDER01',
  userId: 'student-1',
  universityId: 'university-1',
  campusId: 'campus-1',
  canteenId: 'canteen-1',
  pickupSlotId: null,
  pickupShelfId: null,
  status: 'PENDING',
  orderType: 'standard',
  pickupSlotLabel: 'At counter',
  itemSubtotal: 10,
  taxes: 0.5,
  convenienceFee: 5,
  totalAmount: 15.5,
  paymentMethod: 'UPI',
  paymentStatus: 'PAYMENT_PENDING',
  paymentIsTest: false,
  customerName: 'Test Student',
  customerRoll: null,
  customerPhone: null,
  cancellationReason: null,
  readyAt: null,
  collectedAt: null,
  createdAt: new Date('2026-11-25T10:00:00.000Z'),
  updatedAt: new Date('2026-11-25T10:00:00.000Z'),
  canteen: {
    id: 'canteen-1',
    name: 'Test Canteen',
    campus: { id: 'campus-1', name: 'Main Campus', university: { name: 'Test University' } }
  },
  university: { name: 'Test University' },
  campus: { name: 'Main Campus' },
  pickupShelf: null,
  items: [{
    id: 'order-item-1',
    menuItemId: 'item-1',
    comboMealId: null,
    name: 'Meal',
    unitPrice: 10,
    quantity: 1,
    customization: 'Standard'
  }],
  payments: []
};

const paymentRecord = {
  id: 'payment-1',
  orderId: orderRecord.id,
  canteenId: orderRecord.canteenId,
  amount: 15.5,
  method: 'UPI',
  gateway: 'razorpay',
  status: 'PENDING',
  isTest: false,
  gatewayOrderId: 'order_gateway_1',
  gatewayPaymentId: null,
  idempotencyKey: 'key-12345678',
  createdAt: new Date('2026-11-25T10:00:00.000Z'),
  updatedAt: new Date('2026-11-25T10:00:00.000Z'),
  order: orderRecord,
  events: []
};

const fakePrisma = {
  user: {
    async findUnique() {
      return {
        id: 'student-1',
        role: 'student',
        canteenStaff: [],
        favorites: []
      };
    }
  },
  order: {
    async findFirst() {
      return orderRecord;
    },
    async update({ data }) {
      Object.assign(orderRecord, data);
      return orderRecord;
    }
  },
  paymentTransaction: {
    async findUnique() {
      return paymentRecord;
    },
    async findFirst() {
      return paymentRecord;
    },
    async update({ data }) {
      Object.assign(paymentRecord, data, { updatedAt: new Date() });
      return paymentRecord;
    }
  },
  paymentEvent: {
    async create({ data }) {
      const event = { ...data, id: 'event-1', createdAt: new Date() };
      paymentRecord.events.push(event);
      return event;
    }
  },
  async $transaction(operations) {
    return Promise.all(operations);
  }
};

before(async () => {
  server = createApp({
    prismaClient: fakePrisma,
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: secret,
      RAZORPAY_KEY_ID: 'rzp_test_public',
      RAZORPAY_KEY_SECRET: razorpaySecret,
      RAZORPAY_WEBHOOK_SECRET: 'razorpay-webhook-test-secret'
    },
    gatewayFactory: () => ({
      payments: {
        async fetch() {
          gatewayCalls += 1;
          return {
            id: 'pay_gateway_1',
            order_id: 'order_gateway_1',
            amount: 1550,
            currency: 'INR',
            status: 'captured'
          };
        }
      }
    })
  }).listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
});

test('payment verification requires a valid Razorpay signature', async () => {
  const callsBefore = gatewayCalls;
  const response = await fetch(`${baseUrl}/api/v1/payments/verify`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `wmc_session=${userToken}`
    },
    body: JSON.stringify({
      razorpay_order_id: 'order_gateway_1',
      razorpay_payment_id: 'pay_gateway_1',
      razorpay_signature: 'bad-signature'
    })
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'INVALID_PAYMENT_SIGNATURE');
  assert.equal(gatewayCalls, callsBefore);
});

test('verified captured payments reconcile the transaction and order', async () => {
  const signature = createHmac('sha256', razorpaySecret)
    .update('order_gateway_1|pay_gateway_1')
    .digest('hex');
  const response = await fetch(`${baseUrl}/api/v1/payments/verify`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `wmc_session=${userToken}`
    },
    body: JSON.stringify({
      razorpay_order_id: 'order_gateway_1',
      razorpay_payment_id: 'pay_gateway_1',
      razorpay_signature: signature
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.payment.status, 'SUCCESS');
  assert.equal(payload.order.paymentStatus, 'PAID_ONLINE');
  assert.equal(gatewayCalls, 1);
});

test('Razorpay webhook rejects invalid signatures', async () => {
  const response = await fetch(`${baseUrl}/api/v1/payments/webhook`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-razorpay-signature': 'bad-signature',
      'x-razorpay-event-id': 'evt-invalid'
    },
    body: JSON.stringify({ event: 'payment.captured' })
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'INVALID_WEBHOOK_SIGNATURE');
});
