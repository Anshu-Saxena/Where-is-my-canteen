import { Router } from 'express';
import { z } from 'zod';
import { ApiError, asyncRoute } from '../errors.js';
import { requireAuth } from './session.js';

const favoriteSchema = z.object({ favourite: z.boolean() });

export function createUserRouter({ prisma, env }) {
  const router = Router();
  router.use(requireAuth({ prisma, env }));

  router.get('/me/favourites', (_request, response) => {
    return response.json({
      favourites: _request.user.favorites.map(favorite => favorite.canteenId)
    });
  });

  router.put('/me/favourites/:canteenId', asyncRoute(async (request, response) => {
    const parsed = favoriteSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'favourite must be a boolean.');
    }

    const canteen = await prisma.canteen.findUnique({
      where: { id: request.params.canteenId },
      select: { id: true }
    });
    if (!canteen) throw new ApiError(404, 'CANTEEN_NOT_FOUND', 'Canteen was not found.');

    const key = {
      userId_canteenId: {
        userId: request.user.id,
        canteenId: canteen.id
      }
    };
    if (parsed.data.favourite) {
      await prisma.userFavorite.upsert({
        where: key,
        update: {},
        create: key.userId_canteenId
      });
    } else {
      await prisma.userFavorite.deleteMany({
        where: key.userId_canteenId
      });
    }

    return response.json({ canteenId: canteen.id, favourite: parsed.data.favourite });
  }));

  return router;
}
