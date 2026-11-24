import { Router } from 'express';
import { ApiError, asyncRoute } from '../errors.js';
import { toCanteenDto, toMenuItemDto, toUniversityDto } from './dto.js';

export function createDiscoveryRouter({ prisma }) {
  const router = Router();

  router.get('/universities', asyncRoute(async (request, response) => {
    const search = String(request.query.search ?? '').trim();
    const universities = await prisma.university.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { state: { contains: search, mode: 'insensitive' } }
            ]
          }
        : undefined,
      include: {
        campuses: { include: { _count: { select: { canteens: true } } } }
      },
      orderBy: { name: 'asc' }
    });

    return response.json({ universities: universities.map(toUniversityDto) });
  }));

  router.get('/universities/:id', asyncRoute(async (request, response) => {
    const university = await prisma.university.findUnique({
      where: { id: request.params.id },
      include: {
        campuses: { include: { _count: { select: { canteens: true } } } }
      }
    });
    if (!university) throw new ApiError(404, 'UNIVERSITY_NOT_FOUND', 'University was not found.');
    return response.json({ university: toUniversityDto(university) });
  }));

  router.get('/campuses/:campusId/canteens', asyncRoute(async (request, response) => {
    const { campusId } = request.params;
    const search = String(request.query.search ?? '').trim();
    const category = String(request.query.category ?? '');
    const vegOnly = request.query.vegOnly === 'true';
    const sortBy = String(request.query.sortBy ?? '');
    const canteens = await prisma.canteen.findMany({
      where: {
        campusId,
        ...(vegOnly ? { pureVeg: true } : {}),
        ...(category && category !== 'All' ? { categories: { has: category } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { categories: { has: search } }
              ]
            }
          : {})
      },
      include: { campus: true },
      orderBy: sortBy === 'rating'
        ? [{ rating: 'desc' }, { name: 'asc' }]
        : sortBy === 'popularity'
          ? [{ reviewsCount: 'desc' }, { name: 'asc' }]
          : { name: 'asc' }
    });

    return response.json({ canteens: canteens.map(toCanteenDto) });
  }));

  router.get('/canteens/:id', asyncRoute(async (request, response) => {
    const canteen = await prisma.canteen.findUnique({
      where: { id: request.params.id },
      include: { campus: true }
    });
    if (!canteen) throw new ApiError(404, 'CANTEEN_NOT_FOUND', 'Canteen was not found.');
    return response.json({ canteen: toCanteenDto(canteen) });
  }));

  router.get('/canteens/:id/menu', asyncRoute(async (request, response) => {
    const canteenId = request.params.id;
    const category = String(request.query.category ?? 'All');
    const items = await prisma.menuItem.findMany({
      where: {
        canteenId,
        ...(category !== 'All' ? { category } : {})
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    return response.json({ items: items.map(toMenuItemDto) });
  }));

  return router;
}
