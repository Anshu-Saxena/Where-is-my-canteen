import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../auth/session.js';
import { ApiError, asyncRoute } from '../errors.js';

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000)
}).strict();

function toReviewDto(review) {
  return {
    id: review.id,
    canteenId: review.canteenId,
    userName: review.userName,
    userRole: review.userRole,
    userAvatar: review.userAvatar,
    rating: review.rating,
    date: review.createdAt.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }),
    comment: review.comment,
    verifiedOrder: Boolean(review.orderId),
    canteenResponse: review.canteenResponse
  };
}

export function createReviewRouter({ prisma, env }) {
  const router = Router();

  router.get('/canteens/:canteenId/reviews', asyncRoute(async (request, response) => {
    const reviews = await prisma.review.findMany({
      where: { canteenId: request.params.canteenId },
      orderBy: { createdAt: 'desc' }
    });
    return response.json({ reviews: reviews.map(toReviewDto) });
  }));

  router.post(
    '/canteens/:canteenId/reviews',
    requireAuth({ prisma, env }),
    requireRole('student', 'staff', 'guest'),
    asyncRoute(async (request, response) => {
      const parsed = reviewSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'The request contains invalid fields.', parsed.error.flatten());
      }

      const order = await prisma.order.findFirst({
        where: {
          userId: request.user.id,
          canteenId: request.params.canteenId,
          status: 'COMPLETED',
          review: null
        },
        orderBy: { createdAt: 'desc' }
      });
      if (!order) {
        throw new ApiError(403, 'COMPLETED_ORDER_REQUIRED', 'A completed order is required before submitting a review.');
      }

      const userRole = request.user.role === 'staff'
        ? `Faculty (${request.user.department || 'Campus'})`
        : `Student (${request.user.department || request.user.rollNumber || 'Verified'})`;
      const reviewData = {
        canteenId: order.canteenId,
        userId: request.user.id,
        orderId: order.id,
        userName: request.user.name,
        userRole,
        userAvatar: request.user.avatar,
        rating: parsed.data.rating,
        comment: parsed.data.comment
      };

      let review;
      try {
        review = await prisma.$transaction(async transaction => {
          const created = await transaction.review.create({ data: reviewData });
          const aggregate = await transaction.review.aggregate({
            where: { canteenId: order.canteenId },
            _avg: { rating: true },
            _count: { _all: true }
          });
          await transaction.canteen.update({
            where: { id: order.canteenId },
            data: {
              rating: aggregate._avg.rating ?? 0,
              reviewsCount: aggregate._count._all
            }
          });
          return created;
        });
      } catch (error) {
        if (error?.code === 'P2002') {
          throw new ApiError(409, 'ORDER_ALREADY_REVIEWED', 'This order already has a review.');
        }
        throw error;
      }

      return response.status(201).json({ review: toReviewDto(review) });
    })
  );

  router.patch(
    '/owner/reviews/:reviewId/response',
    requireAuth({ prisma, env }),
    requireRole('canteen_owner'),
    asyncRoute(async (request, response) => {
      const parsed = z.object({ response: z.string().trim().min(1).max(2000) }).safeParse(request.body);
      if (!parsed.success) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'A response of up to 2,000 characters is required.');
      }
      const review = await prisma.review.findUnique({
        where: { id: request.params.reviewId }
      });
      if (!review) throw new ApiError(404, 'REVIEW_NOT_FOUND', 'Review was not found.');
      const isOwner = request.user.canteenStaff?.some(
        assignment => assignment.canteenId === review.canteenId && assignment.role === 'OWNER'
      );
      if (!isOwner) throw new ApiError(403, 'CANTEEN_ACCESS_DENIED', 'You are not an owner of this canteen.');

      const updated = await prisma.review.update({
        where: { id: review.id },
        data: { canteenResponse: parsed.data.response }
      });
      return response.json({ review: toReviewDto(updated) });
    })
  );

  return router;
}
