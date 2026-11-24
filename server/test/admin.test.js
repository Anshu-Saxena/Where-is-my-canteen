import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

const secret = 'admin-test-secret-with-at-least-32-characters';
const universityAdminToken = jwt.sign({ sub: 'university-admin' }, secret, { expiresIn: '1h' });
const platformAdminToken = jwt.sign({ sub: 'platform-admin' }, secret, { expiresIn: '1h' });
let server;
let baseUrl;
let savedApplicationStatus;
let savedVerification;
let campusQuery;
let savedCampus;

const fakePrisma = {
  user: {
    async findUnique({ where }) {
      const users = {
        'university-admin': {
          id: 'university-admin',
          role: 'university_admin',
          universityId: 'university-1',
          canteenStaff: [],
          favorites: []
        },
        'platform-admin': {
          id: 'platform-admin',
          role: 'platform_admin',
          canteenStaff: [],
          favorites: []
        }
      };
      return users[where.id] || null;
    }
  },
  canteenApplication: {
    async findUnique() {
      return {
        id: 'application-1',
        universityId: 'university-2',
        canteenName: 'Test Canteen',
        ownerName: 'Test Owner',
        type: 'Canteen',
        status: 'PENDING',
        details: null,
        canteen: null,
        createdAt: new Date('2026-11-25T00:00:00.000Z')
      };
    },
    async update({ data }) {
      savedApplicationStatus = data.status;
      return {
        id: 'application-1',
        universityId: 'university-2',
        canteenName: 'Test Canteen',
        ownerName: 'Test Owner',
        type: 'Canteen',
        status: data.status,
        details: null,
        canteen: null,
        createdAt: new Date('2026-11-25T00:00:00.000Z')
      };
    }
  },
  university: {
    async findUnique({ where }) {
      return where.id === 'university-1' ? { id: where.id, name: 'University One' } : null;
    },
    async update({ data }) {
      savedVerification = data;
      return {
        id: 'university-1',
        name: 'Test University',
        shortName: 'TU',
        city: 'Delhi',
        state: 'Delhi',
        verified: data.verified,
        verificationStatus: data.verificationStatus,
        campuses: []
      };
    }
  },
  campus: {
    async findMany({ where }) {
      campusQuery = where;
      return [{
        id: 'campus-1',
        name: 'Main Campus',
        location: 'Delhi',
        isPopular: true,
        _count: { canteens: 2 }
      }];
    },
    async findFirst({ where }) {
      assert.equal(where.universityId, 'university-1');
      return null;
    },
    async create({ data }) {
      savedCampus = data;
      return {
        ...data,
        isPopular: false,
        _count: { canteens: 0 }
      };
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

test('university admins cannot review another university application', async () => {
  const response = await fetch(`${baseUrl}/api/v1/admin/applications/application-1`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      cookie: `wmc_session=${universityAdminToken}`
    },
    body: JSON.stringify({ status: 'APPROVED' })
  });

  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, 'UNIVERSITY_ACCESS_DENIED');
  assert.equal(savedApplicationStatus, undefined);
});

test('platform administrators can change university verification status', async () => {
  const response = await fetch(`${baseUrl}/api/v1/admin/universities/university-1/verification`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      cookie: `wmc_session=${platformAdminToken}`
    },
    body: JSON.stringify({ status: 'APPROVED' })
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(savedVerification.verificationStatus, 'APPROVED');
  assert.equal(savedVerification.verified, true);
  assert.equal(result.university.isVerified, true);
});

test('university admins only list campuses in their own university scope', async () => {
  const response = await fetch(`${baseUrl}/api/v1/admin/campuses`, {
    headers: { cookie: `wmc_session=${universityAdminToken}` }
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(campusQuery, { universityId: 'university-1' });
  assert.equal(result.university.name, 'University One');
  assert.equal(result.campuses[0].canteensCount, 2);
});

test('new campuses are created under the signed-in university admin scope', async () => {
  const response = await fetch(`${baseUrl}/api/v1/admin/campuses`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `wmc_session=${universityAdminToken}`
    },
    body: JSON.stringify({ name: 'North Campus', location: 'North Delhi' })
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(savedCampus.universityId, 'university-1');
  assert.equal(savedCampus.name, 'North Campus');
  assert.equal(result.campus.location, 'North Delhi');
});
