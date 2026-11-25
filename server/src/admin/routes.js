import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../auth/session.js';
import { toUniversityDto } from '../discovery/dto.js';
import { ApiError, asyncRoute } from '../errors.js';

const applicationStatusSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'APPROVED', 'REJECTED'])
}).strict();

const verificationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
}).strict();
const campusSchema = z.object({
  name: z.string().trim().min(1).max(160),
  location: z.string().trim().min(1).max(500)
}).strict();

function indiaDayStart(date) {
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

function indiaMonthStart(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, 1) - 330 * 60 * 1000);
}

function toApplicationDto(application) {
  const details = application.details && typeof application.details === 'object'
    ? application.details
    : {};
  return {
    id: application.id,
    name: application.canteenName,
    type: application.type,
    status: application.status,
    campus: application.canteen?.campus?.name ?? details.campusName ?? 'Not specified',
    operator: application.ownerName,
    createdAt: application.createdAt.toISOString()
  };
}

function toPlatformUniversityDto(university) {
  return {
    ...toUniversityDto(university),
    isVerified: university.verified,
    verificationStatus: university.verificationStatus
  };
}

function ensureUniversityScope(user) {
  if (!user.universityId) {
    throw new ApiError(403, 'UNIVERSITY_SCOPE_REQUIRED', 'Your account is not assigned to a university.');
  }
  return user.universityId;
}

export function createAdminRouter({ prisma, env }) {
  const router = Router();
  router.use('/admin',
    requireAuth({ prisma, env }),
    requireRole('university_admin', 'platform_admin')
  );

  router.get('/admin/university/dashboard', requireRole('university_admin'), asyncRoute(async (request, response) => {
    const universityId = ensureUniversityScope(request.user);
    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) throw new ApiError(404, 'UNIVERSITY_NOT_FOUND', 'University was not found.');

    const now = new Date();
    const todayStart = indiaDayStart(now);
    const monthStart = indiaMonthStart(now);
    const [
      campuses,
      canteens,
      registeredStudents,
      dailyOrders,
      monthlyRevenue,
      pendingApplications,
      recentReviews
    ] = await Promise.all([
      prisma.campus.findMany({
        where: { universityId },
        include: { _count: { select: { canteens: true } } },
        orderBy: { name: 'asc' }
      }),
      prisma.canteen.findMany({
        where: { campus: { is: { universityId } } },
        include: { campus: true },
        orderBy: { name: 'asc' }
      }),
      prisma.user.count({
        where: { universityId, role: { in: ['student', 'staff'] } }
      }),
      prisma.order.count({
        where: {
          universityId,
          createdAt: { gte: todayStart, lte: now },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.order.aggregate({
        where: {
          universityId,
          createdAt: { gte: monthStart, lte: now },
          paymentStatus: 'PAID_ONLINE',
          paymentIsTest: false
        },
        _sum: { totalAmount: true }
      }),
      prisma.canteenApplication.findMany({
        where: { universityId, status: { in: ['PENDING', 'UNDER_REVIEW'] } },
        include: { canteen: { include: { campus: true } } },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.review.findMany({
        where: { canteen: { is: { campus: { is: { universityId } } } } },
        include: { canteen: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return response.json({
      data: {
        university: university.name,
        stats: {
          totalCampuses: campuses.length,
          activeCanteens: canteens.filter(canteen => canteen.isOpen).length,
          registeredStudents,
          dailyOrders,
          totalMonthlyGMV: Number(monthlyRevenue._sum.totalAmount ?? 0)
        },
        canteensList: canteens.map(canteen => ({
          id: canteen.id,
          name: canteen.name,
          manager: canteen.ownerName || 'Not listed',
          ownerName: canteen.ownerName || '',
          rating: canteen.rating,
          complianceScore: 'Not assessed',
          status: canteen.isOpen ? 'Active' : 'Inactive',
          campus: canteen.campus.name,
          coverImage: canteen.coverImage,
          contactNumber: canteen.contactNumber,
          openingHours: canteen.openingHours,
          categories: canteen.categories
        })),
        pendingApprovals: pendingApplications.map(toApplicationDto),
        recentFeedback: recentReviews.map(review => ({
          id: review.id,
          canteen: review.canteen.name,
          rating: review.rating,
          comment: review.comment
        }))
      }
    });
  }));

  router.patch('/admin/applications/:applicationId', asyncRoute(async (request, response) => {
    const parsed = applicationStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'A valid application status is required.');
    }

    const application = await prisma.canteenApplication.findUnique({
      where: { id: request.params.applicationId },
      include: { canteen: { include: { campus: true } } }
    });
    if (!application) throw new ApiError(404, 'APPLICATION_NOT_FOUND', 'Application was not found.');
    if (
      request.user.role === 'university_admin' &&
      application.universityId !== ensureUniversityScope(request.user)
    ) {
      throw new ApiError(403, 'UNIVERSITY_ACCESS_DENIED', 'You cannot review another university’s application.');
    }

    const updated = await prisma.canteenApplication.update({
      where: { id: application.id },
      data: { status: parsed.data.status },
      include: { canteen: { include: { campus: true } } }
    });
    return response.json({ application: toApplicationDto(updated) });
  }));

  router.get('/admin/campuses', requireRole('university_admin'), asyncRoute(async (request, response) => {
    const universityId = ensureUniversityScope(request.user);
    const university = await prisma.university.findUnique({
      where: { id: universityId },
      select: { id: true, name: true }
    });
    if (!university) throw new ApiError(404, 'UNIVERSITY_NOT_FOUND', 'University was not found.');

    const campuses = await prisma.campus.findMany({
      where: { universityId },
      include: { _count: { select: { canteens: true } } },
      orderBy: { name: 'asc' }
    });
    return response.json({
      university,
      campuses: campuses.map(campus => ({
        id: campus.id,
        name: campus.name,
        location: campus.location,
        isPopular: campus.isPopular,
        canteensCount: campus._count.canteens
      }))
    });
  }));

  router.post('/admin/campuses', requireRole('university_admin'), asyncRoute(async (request, response) => {
    const parsed = campusSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Campus name and location are required.');
    }

    const universityId = ensureUniversityScope(request.user);
    const duplicate = await prisma.campus.findFirst({
      where: {
        universityId,
        name: { equals: parsed.data.name, mode: 'insensitive' }
      },
      select: { id: true }
    });
    if (duplicate) throw new ApiError(409, 'CAMPUS_ALREADY_EXISTS', 'A campus with this name already exists.');

    const campus = await prisma.campus.create({
      data: {
        id: `campus-${randomUUID()}`,
        universityId,
        ...parsed.data
      },
      include: { _count: { select: { canteens: true } } }
    });
    return response.status(201).json({
      campus: {
        id: campus.id,
        name: campus.name,
        location: campus.location,
        isPopular: campus.isPopular,
        canteensCount: campus._count.canteens
      }
    });
  }));

  router.get('/admin/platform/dashboard', requireRole('platform_admin'), asyncRoute(async (_request, response) => {
    const now = new Date();
    const todayStart = indiaDayStart(now);
    const [
      universities,
      totalCampuses,
      totalCanteens,
      totalUsers,
      totalOrdersToday,
      gmvToday
    ] = await Promise.all([
      prisma.university.findMany({
        include: {
          campuses: { include: { _count: { select: { canteens: true } } } }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.campus.count(),
      prisma.canteen.count(),
      prisma.user.count(),
      prisma.order.count({
        where: {
          createdAt: { gte: todayStart, lte: now },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: todayStart, lte: now },
          paymentStatus: 'PAID_ONLINE',
          paymentIsTest: false
        },
        _sum: { totalAmount: true }
      })
    ]);
    const verificationRequests = universities
      .filter(university => !university.verified && university.verificationStatus === 'PENDING')
      .map(university => ({
        id: university.id,
        name: university.name,
        state: university.state,
        contactPerson: 'Not provided',
        contactEmail: 'Not provided',
        estimatedCampuses: university.campuses.length,
        estimatedCanteens: university.campuses.reduce(
          (count, campus) => count + campus._count.canteens,
          0
        )
      }));

    return response.json({
      data: {
        platformStats: {
          totalUniversities: universities.length,
          totalCampuses,
          totalCanteens,
          totalUsers,
          totalOrdersToday,
          totalGmvToday: Number(gmvToday._sum.totalAmount ?? 0)
        },
        universityRequests: verificationRequests,
        universities: universities.map(toPlatformUniversityDto),
        systemHealth: {
          apiStatus: 'Operational',
          uptime: `${Math.floor(process.uptime())} seconds`
        }
      }
    });
  }));

  router.get('/admin/universities', requireRole('platform_admin'), asyncRoute(async (_request, response) => {
    const universities = await prisma.university.findMany({
      include: {
        campuses: { include: { _count: { select: { canteens: true } } } }
      },
      orderBy: { name: 'asc' }
    });
    return response.json({ universities: universities.map(toPlatformUniversityDto) });
  }));

  router.patch('/admin/universities/:universityId/verification', requireRole('platform_admin'), asyncRoute(async (request, response) => {
    const parsed = verificationStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'status must be APPROVED or REJECTED.');
    }
    const university = await prisma.university.findUnique({
      where: { id: request.params.universityId },
      select: { id: true }
    });
    if (!university) throw new ApiError(404, 'UNIVERSITY_NOT_FOUND', 'University was not found.');

    const updated = await prisma.university.update({
      where: { id: request.params.universityId },
      data: {
        verificationStatus: parsed.data.status,
        verified: parsed.data.status === 'APPROVED'
      },
      include: {
        campuses: { include: { _count: { select: { canteens: true } } } }
      }
    });
    return response.json({ university: toPlatformUniversityDto(updated) });
  }));

  const universitySchema = z.object({
    name: z.string().trim().min(2).max(180),
    shortName: z.string().trim().min(2).max(40),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    type: z.string().trim().min(2).max(80).default('State University'),
    campusName: z.string().trim().min(2).max(160).optional(),
    campusLocation: z.string().trim().min(2).max(500).optional()
  }).strict();

  router.post('/admin/universities', requireRole('platform_admin'), asyncRoute(async (request, response) => {
    const parsed = universitySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Institution details are invalid.', parsed.error.flatten());
    }
    const { name, shortName, city, state, type, campusName, campusLocation } = parsed.data;
    const duplicate = await prisma.university.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        city: { equals: city, mode: 'insensitive' }
      }
    });
    if (duplicate) {
      throw new ApiError(409, 'DUPLICATE_INSTITUTION', 'An institution with this name and city already exists.');
    }

    const slug = `${shortName}-${city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 48);
    const id = `${slug || 'univ'}-${randomUUID().slice(0, 6)}`;

    const created = await prisma.university.create({
      data: {
        id,
        name,
        shortName,
        city,
        state,
        type,
        verified: true,
        verificationStatus: 'APPROVED',
        campuses: campusName
          ? {
              create: {
                id: `${id}-main`,
                name: campusName,
                location: campusLocation || `${city}, ${state}`,
                isPopular: true
              }
            }
          : undefined
      },
      include: {
        campuses: { include: { _count: { select: { canteens: true } } } }
      }
    });

    return response.status(201).json({ university: toPlatformUniversityDto(created) });
  }));

  router.get('/admin/users', asyncRoute(async (request, response) => {
    const where = request.user.role === 'university_admin'
      ? { universityId: ensureUniversityScope(request.user) }
      : {};
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        universityId: true,
        campusId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return response.json({ users });
  }));

  router.get('/admin/analytics', asyncRoute(async (request, response) => {
    const where = request.user.role === 'university_admin'
      ? { universityId: ensureUniversityScope(request.user) }
      : {};
    const [orders, users, canteens, revenue] = await Promise.all([
      prisma.order.count({ where: { ...where, status: { not: 'CANCELLED' } } }),
      prisma.user.count({
        where: request.user.role === 'university_admin' ? where : {}
      }),
      prisma.canteen.count({
        where: request.user.role === 'university_admin'
          ? { campus: { is: { universityId: where.universityId } } }
          : {}
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          paymentStatus: 'PAID_ONLINE',
          paymentIsTest: false
        },
        _sum: { totalAmount: true }
      })
    ]);
    return response.json({
      analytics: {
        orders,
        users,
        canteens,
        paidOnlineRevenue: Number(revenue._sum.totalAmount ?? 0)
      }
    });
  }));

  return router;
}
