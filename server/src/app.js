import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './database.js';
import { createAuthRouter } from './auth/routes.js';
import { createUserRouter } from './auth/userRoutes.js';
import { createDiscoveryRouter } from './discovery/routes.js';
import { createOperationsRouter } from './operations/routes.js';
import { createOrderRouter } from './orders/routes.js';
import { createReviewRouter } from './reviews/routes.js';
import { createPaymentRouter } from './payments/routes.js';
import { createAdminRouter } from './admin/routes.js';
import { errorHandler } from './errors.js';

export function createApp({ prismaClient = prisma, env = process.env, gatewayFactory } = {}) {
  const app = express();
  const allowedOrigins = (env.WEB_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true
  }));
  app.use(express.json({
    limit: '1mb',
    verify(request, _response, buffer) {
      request.rawBody = Buffer.from(buffer);
    }
  }));
  app.use(cookieParser());

  app.get('/api/v1/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'canteen-api'
    });
  });

  app.use('/api/v1/auth', createAuthRouter({ prisma: prismaClient, env }));
  app.use('/api/v1/users', createUserRouter({ prisma: prismaClient, env }));
  app.use('/api/v1', createDiscoveryRouter({ prisma: prismaClient }));
  app.use('/api/v1', createOperationsRouter({ prisma: prismaClient, env }));
  app.use('/api/v1', createOrderRouter({ prisma: prismaClient, env }));
  app.use('/api/v1', createReviewRouter({ prisma: prismaClient, env }));
  app.use('/api/v1', createPaymentRouter({
    prisma: prismaClient,
    env,
    gatewayFactory
  }));
  app.use('/api/v1', createAdminRouter({ prisma: prismaClient, env }));

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested API resource was not found.'
      }
    });
  });

  app.use(errorHandler);
  return app;
}
