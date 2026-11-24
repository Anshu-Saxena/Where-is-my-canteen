import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

const secret = 'test-secret-with-at-least-32-characters';
let server;
let baseUrl;
const ownerToken = jwt.sign({ sub: 'owner-1' }, secret, { expiresIn: '1h' });

const fakePrisma = {
  user: {
    async findUnique() {
      return {
        id: 'owner-1',
        role: 'canteen_owner',
        canteenStaff: [{ canteenId: 'canteen-1', role: 'OWNER', canteen: { name: 'Test Canteen' } }],
        favorites: []
      };
    }
  },
  canteen: {
    async findUnique({ where }) {
      return where.id === 'canteen-1' ? { id: where.id } : null;
    }
  },
  order: {
    async findMany() {
      return [
        {
          status: 'PENDING',
          createdAt: new Date(),
          paymentStatus: 'PAID_ONLINE',
          paymentIsTest: false,
          totalAmount: 25,
          items: [{ name: 'Tea', quantity: 2, unitPrice: 10 }]
        },
        {
          status: 'ACCEPTED',
          createdAt: new Date(),
          paymentStatus: 'PAY_AT_COUNTER',
          paymentIsTest: false,
          totalAmount: 20,
          items: [{ name: 'Sandwich', quantity: 1, unitPrice: 20 }]
        },
        {
          status: 'CANCELLED',
          createdAt: new Date(),
          paymentStatus: 'PAID_ONLINE',
          paymentIsTest: false,
          totalAmount: 15,
          items: [{ name: 'Cancelled Item', quantity: 1, unitPrice: 15 }]
        },
        {
          status: 'COMPLETED',
          createdAt: new Date(),
          paymentStatus: 'PAID_SANDBOX',
          paymentIsTest: true,
          totalAmount: 12,
          items: [{ name: 'Test Item', quantity: 1, unitPrice: 12 }]
        }
      ];
    },
    async aggregate() {
      return { _sum: { totalAmount: 10 } };
    }
  }
};

before(async () => {
  server = createApp({
    prismaClient: fakePrisma,
    env: { NODE_ENV: 'test', JWT_SECRET: secret }
  }).listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
});

test('owner routes reject access to another canteen', async () => {
  const response = await fetch(`${baseUrl}/api/v1/owner/canteens/canteen-2/slots`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `wmc_session=${ownerToken}`
    },
    body: JSON.stringify({ time: '03:00 PM - 03:15 PM', capacity: 20 })
  });

  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, 'CANTEEN_ACCESS_DENIED');
});

test('slot writes reject invalid time ranges before persistence', async () => {
  const response = await fetch(`${baseUrl}/api/v1/owner/canteens/canteen-1/slots`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `wmc_session=${ownerToken}`
    },
    body: JSON.stringify({
      serviceDate: '2026-11-25',
      time: 'not a time range',
      capacity: 20
    })
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'INVALID_SLOT_TIME');
});

test('owner analytics excludes cancelled and sandbox payments from revenue', async () => {
  const response = await fetch(`${baseUrl}/api/v1/owner/canteens/canteen-1/analytics`, {
    headers: { cookie: `wmc_session=${ownerToken}` }
  });
  const { analytics } = await response.json();

  assert.equal(response.status, 200);
  assert.equal(analytics.todayStats.totalRevenue, 25);
  assert.equal(analytics.todayStats.revenueGrowth, '+150%');
  assert.equal(analytics.todayStats.totalOrders, 3);
  assert.deepEqual(analytics.popularItems.map(item => item.name), ['Tea', 'Sandwich']);
});

test('owner sessions cannot access platform administration', async () => {
  const response = await fetch(`${baseUrl}/api/v1/admin/platform/dashboard`, {
    headers: { cookie: `wmc_session=${ownerToken}` }
  });

  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, 'FORBIDDEN');
});
