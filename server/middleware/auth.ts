import { getCookie, getHeader } from 'h3';

/**
 * Auth middleware for Nuxt server routes
 * Runs on every server request to check authentication status
 * Attaches user to event.context if authenticated
 */
export default defineEventHandler(async (event) => {
  // Skip auth for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health'];
  const path = event.path;

  if (publicRoutes.some((route) => path.startsWith(route))) {
    return;
  }

  // Get token from cookie or Authorization header
  const token =
    getCookie(event, 'auth_token') ||
    getHeader(event, 'authorization')?.replace('Bearer ', '');

  // If no token, attach null user (routes can check event.context.user)
  if (!token) {
    event.context.user = null;
    return;
  }

  try {
    // Verify token and decode payload
    const decoded = verifyToken(token);

    // Attach authenticated user to event context
    event.context.user = decoded;
  } catch {
    // Invalid token - set user to null
    event.context.user = null;
  }
});

