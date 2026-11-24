import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { ApiError, asyncRoute } from '../errors.js';
import {
  assertAuthConfigured,
  clearSessionCookie,
  requireAuth,
  setSessionCookie
} from './session.js';
import { toUserDto } from './userDto.js';

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(40).optional(),
  role: z.enum(['student', 'staff']).default('student'),
  universityId: z.string().optional(),
  campusId: z.string().optional(),
  rollNumber: z.string().trim().max(80).optional(),
  employeeId: z.string().trim().max(80).optional(),
  department: z.string().trim().max(120).optional(),
  year: z.string().trim().max(40).optional()
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(128)
});

const demoSchema = z.object({
  role: z.enum([
    'student',
    'staff',
    'guest',
    'canteen_owner',
    'university_admin',
    'platform_admin'
  ])
});

const DEMO_USER_IDS = {
  student: 'usr-student-01',
  staff: 'usr-staff-01',
  guest: 'usr-guest-01',
  canteen_owner: 'usr-owner-01',
  university_admin: 'usr-uni-admin-01',
  platform_admin: 'usr-platform-01'
};

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'The request contains invalid fields.', result.error.flatten());
  }
  return result.data;
}

function authInclude() {
  return {
    canteenStaff: { include: { canteen: true } },
    favorites: true
  };
}

function handleUniqueConflict(error) {
  if (error?.code === 'P2002') {
    throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.');
  }
  throw error;
}

export function createAuthRouter({ prisma, env }) {
  const router = Router();

  router.post('/register', asyncRoute(async (request, response) => {
    assertAuthConfigured(env);
    const data = parse(registerSchema, request.body);

    if (data.campusId) {
      const campus = await prisma.campus.findUnique({ where: { id: data.campusId } });
      if (!campus || (data.universityId && campus.universityId !== data.universityId)) {
        throw new ApiError(400, 'INVALID_CAMPUS', 'The selected campus does not belong to that university.');
      }
      data.universityId = campus.universityId;
    }

    const userData = {
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 12),
      phone: data.phone,
      role: data.role,
      universityId: data.universityId,
      campusId: data.campusId,
      rollNumber: data.rollNumber,
      employeeId: data.employeeId,
      department: data.department,
      year: data.year
    };

    let user;
    try {
      user = await prisma.user.create({ data: userData, include: authInclude() });
    } catch (error) {
      handleUniqueConflict(error);
    }

    setSessionCookie(response, user.id, env);
    return response.status(201).json({ user: toUserDto(user) });
  }));

  router.post('/login', asyncRoute(async (request, response) => {
    assertAuthConfigured(env);
    const data = parse(loginSchema, request.body);
    const normalizedIdentifier = data.identifier.includes('@')
      ? data.identifier.toLowerCase()
      : data.identifier;
    let user = await prisma.user.findUnique({
      where: { email: normalizedIdentifier },
      include: authInclude()
    });

    if (!user) {
      const phoneMatches = await prisma.user.findMany({
        where: { phone: normalizedIdentifier },
        take: 2,
        include: authInclude()
      });
      if (phoneMatches.length === 1) [user] = phoneMatches;
    }

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email, mobile number, or password is incorrect.');
    }

    setSessionCookie(response, user.id, env);
    return response.json({ user: toUserDto(user) });
  }));

  router.post('/demo', asyncRoute(async (request, response) => {
    if (env.NODE_ENV === 'production' || env.ENABLE_DEMO_AUTH !== 'true') {
      throw new ApiError(404, 'NOT_FOUND', 'The requested API resource was not found.');
    }

    assertAuthConfigured(env);
    const { role } = parse(demoSchema, request.body);
    const user = await prisma.user.findFirst({
      where: { id: DEMO_USER_IDS[role], role },
      include: authInclude()
    });
    if (!user) throw new ApiError(404, 'DEMO_USER_NOT_FOUND', 'No seeded demo user exists for this role.');

    setSessionCookie(response, user.id, env);
    return response.json({ user: toUserDto(user) });
  }));

  router.get('/me', requireAuth({ prisma, env }), (request, response) => {
    return response.json({ user: toUserDto(request.user) });
  });

  router.post('/logout', (_request, response) => {
    clearSessionCookie(response, env);
    return response.status(204).end();
  });

  return router;
}
