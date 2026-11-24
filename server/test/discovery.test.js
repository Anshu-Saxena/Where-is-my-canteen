import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

let server;
let baseUrl;

const fakePrisma = {
  university: {
    async findMany() {
      return [{
        id: 'dtu-delhi',
        name: 'Delhi Technological University',
        shortName: 'DTU',
        city: 'New Delhi',
        state: 'Delhi',
        verified: true,
        logo: null,
        banner: null,
        campuses: [{
          id: 'dtu-main',
          name: 'Main Campus, Rohini',
          location: 'Rohini, Delhi',
          isPopular: true,
          _count: { canteens: 6 }
        }]
      }];
    }
  },
  menuItem: {
    async findMany() {
      return [{
        id: 'item-101',
        canteenId: 'canteen-1',
        name: 'Iced Coffee',
        category: 'Beverages',
        price: { toString: () => '60.00', valueOf: () => 60 },
        isVeg: true,
        isSpecial: false,
        isRecommended: true,
        image: null,
        description: null,
        rating: 4.8,
        preparationTime: 5,
        available: true,
        customizations: []
      }];
    }
  }
};

before(async () => {
  server = createApp({
    prismaClient: fakePrisma,
    env: { NODE_ENV: 'test', JWT_SECRET: 'test-secret-with-at-least-32-characters' }
  }).listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
});

test('university discovery returns the frontend campus data shape', async () => {
  const response = await fetch(`${baseUrl}/api/v1/universities?search=DTU`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.universities[0].campuses[0].canteensCount, 6);
  assert.equal(payload.universities[0].totalCampuses, 1);
});

test('menu discovery converts database decimal prices to numbers', async () => {
  const response = await fetch(`${baseUrl}/api/v1/canteens/canteen-1/menu`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.items[0].price, 60);
  assert.equal(typeof payload.items[0].price, 'number');
});
