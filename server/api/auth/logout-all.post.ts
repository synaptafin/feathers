import { deleteCookie, createError } from 'h3';
import { logoutAllDevices } from 'server/services/authService';
import { isProd } from 'server/utils/constants';

/**
 * Logout from all devices
 * Invalidates all refresh tokens for the user
 */
export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const user = event.context.user;

    if (!user || !user.id) {
      throw createError({
        statusCode: 401,
        message: 'Not authenticated',
      });
    }

    // Invalidate all refresh tokens for this user
    await logoutAllDevices(user.id);

    // Clear the session if using nuxt-auth-utils
    await clearUserSession(event);

    // Delete cookies
    deleteCookie(event, 'auth_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
    });

    deleteCookie(event, 'refresh_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd
    });

    return {
      success: true,
      message: 'Logged out from all devices successfully',
    };
  } catch (error) {
    throw createError({
      statusCode: (error as { statusCode?: number })?.statusCode || 500,
      message: (error as { message?: string })?.message || 'Logout failed',
    });
  }
});
