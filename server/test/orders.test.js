import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

const secret = 'test-secret-with-at-least-32-characters';
let server;
let baseUrl;
let capturedOrder;
let slotReservationResult = 1;
const studentToken = jwt.sign({ sub: 'student-1' }, secret, { expiresIn: '1h' });
const canteen = {
  id: 'canteen-1',
  name: 'Test Canteen',
  isOpen: true,
  acceptsPayAtCounter: true,
  campusId: 'campus-1',
  campus: {
    id: 'campus-1',
    name: 'Main Campus',
    universityId: 'university-1',
    university: { id: 'university-1', name: 'Test University' }
  }
};

const transaction = {
  canteen: {
    async findUnique() {
      return canteen;
    }
  },
  menuItem: {
    async findMany() {
      return [{
        id: 'item-1',
        name: 'Test Meal',
        canteenId: 'canteen-1',
        price: 10,
        available: true,
        customizations: [{ id: 'size', options: [{ name: 'Large', price: 5 }] }]
      }];
    }
  },
  comboMeal: {
    async findMany() {
      return [];
    }
  },
  async $executeRaw() {
    return slotReservationResult;
  },
  pickupSlot: {
    async findUnique() {
      return {
        id: 'slot-1',
        timeLabel: '12:00 PM - 12:15 PM'
      };
    }
  },
  order: {
    async create({ data }) {
      capturedOrder = data;
      const { items, ...fields } = data;
      return {
        id: 'database-order-1',
        ...fields,
        createdAt: new Date('2026-11-25T10:00:00.000Z'),
        canteen,
        university: canteen.campus.university,
        campus: canteen.campus,
        pickupShelf: null,
        items: items.create.map((item, index) => ({ id: `order-item-${index}`, ...item })),
        payments: []
      };
    }
  }
};

const fakePrisma = {
  user: {
    async findUnique() {
      return {
        id: 'student-1',
        name: 'Test Student',
        role: 'student',
        phone: '+911234567890',
        canteenStaff: [],
        favorites: []
      };
    }
  },
  async $transaction(callback) {
    return callback(transaction);
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

test('order totals and line prices are computed from database menu data', async () => {
  const response = await fetch(`${baseUrl}/api/v1/orders`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `wmc_session=${studentToken}`
    },
    body: JSON.stringify({
      canteenId: 'canteen-1',
      paymentMethod: 'UPI',
      items: [{ id: 'item-1', quantity: 2, customization: 'Large' }]
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.order.itemSubtotal, 30);
  assert.equal(payload.order.taxes, 1.5);
  assert.equal(payload.order.totalAmount, 36.5);
  assert.equal(payload.order.items[0].price, 15);
  assert.equal(capturedOrder.paymentStatus, 'PAYMENT_PENDING');
});

test('order creation rejects when the selected slot is full', async () => {
  slotReservationResult = 0;
  const response = await fetch(`${baseUrl}/api/v1/orders`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `wmc_session=${studentToken}`
    },
    body: JSON.stringify({
      canteenId: 'canteen-1',
      pickupSlotId: 'slot-1',
      paymentMethod: 'UPI',
      items: [{ id: 'item-1', quantity: 1 }]
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 409);
  assert.equal(payload.error.code, 'SLOT_UNAVAILABLE');
  slotReservationResult = 1;
});
