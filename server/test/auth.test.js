import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

let server;
let baseUrl;
let registerCalls = 0;
const loginPasswordHash = await bcrypt.hash('valid-test-password', 4);
const loginUser = {
  id: 'existing-student',
  name: 'Existing Student',
  email: 'existing@example.test',
  passwordHash: loginPasswordHash,
  phone: '+91 90000 00000',
  role: 'student',
  canteenStaff: [],
  favorites: []
};

const fakePrisma = {
  campus: {
    async findUnique() {
      return null;
    }
  },
  user: {
    async findUnique({ where }) {
      return where.email === loginUser.email ? loginUser : null;
    },
    async findMany({ where }) {
      if (where.phone === loginUser.phone) return [loginUser];
      if (where.phone === '+91 99999 00000') {
        return [loginUser, { ...loginUser, id: 'another-student' }];
      }
      return [];
    },
    async create({ data }) {
      registerCalls += 1;
      return {
        ...data,
        id: 'new-user',
        canteenStaff: [],
        favorites: []
      };
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

test('registration rejects attempts to self-assign privileged roles', async () => {
  const callsBefore = registerCalls;
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Admin',
      email: 'admin@example.test',
      password: 'long-enough-password',
      role: 'platform_admin'
    })
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'VALIDATION_ERROR');
  assert.equal(registerCalls, callsBefore);
});

test('registration returns a safe profile and an http-only session cookie', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student',
      email: 'STUDENT@example.test',
      password: 'long-enough-password',
      role: 'student'
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.user.email, 'student@example.test');
  assert.equal('passwordHash' in payload.user, false);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
});

test('authenticated profile endpoint rejects missing sessions', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/me`);

  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, 'UNAUTHENTICATED');
});

test('login accepts an unambiguous registered mobile number', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      identifier: loginUser.phone,
      password: 'valid-test-password'
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.user.id, loginUser.id);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
});

test('login rejects a mobile number shared by multiple accounts', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      identifier: '+91 99999 00000',
      password: 'valid-test-password'
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, 'INVALID_CREDENTIALS');
  assert.equal(response.headers.get('set-cookie'), null);
});
