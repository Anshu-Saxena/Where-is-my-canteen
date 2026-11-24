import jwt from 'jsonwebtoken';
import { ApiError, asyncRoute } from '../errors.js';

export const SESSION_COOKIE = 'wmc_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getJwtSecret(env) {
  const secret = env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new ApiError(
      503,
      'AUTH_NOT_CONFIGURED',
      'Authentication is unavailable until JWT_SECRET is configured with at least 32 characters.'
    );
  }
  return secret;
}

export function assertAuthConfigured(env) {
  getJwtSecret(env);
}

export function setSessionCookie(response, userId, env) {
  const secret = getJwtSecret(env);
  const token = jwt.sign({ sub: userId }, secret, { expiresIn: SESSION_TTL_SECONDS });

  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000
  });
}

export function clearSessionCookie(response, env) {
  response.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

export function requireAuth({ prisma, env }) {
  return asyncRoute(async (request, _response, next) => {
    const bearer = request.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = request.cookies?.[SESSION_COOKIE] || bearer;
    if (!token) throw new ApiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');

    let claims;
    try {
      claims = jwt.verify(token, getJwtSecret(env));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'INVALID_SESSION', 'Your session is invalid or has expired.');
      }
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      include: {
        canteenStaff: { include: { canteen: true } },
        favorites: true
      }
    });
    if (!user) throw new ApiError(401, 'INVALID_SESSION', 'Your account is no longer available.');

    request.user = user;
    return next();
  });
}

export function requireRole(...roles) {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
    }
    return next();
  };
}
