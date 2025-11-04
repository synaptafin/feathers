import { deleteCookie, getCookie, createError } from 'h3';
import { logout } from 'server/services/authService';

export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const user = event.context.user;

    // Get refresh token from cookie
    const refreshToken = getCookie(event, 'refresh_token');

    // Clear the session if using nuxt-auth-utils
    await clearUserSession(event);

    // Delete cookies immediately (even if user is not authenticated)
    deleteCookie(event, 'auth_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true
    });

    deleteCookie(event, 'refresh_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true
    });

    // If user is authenticated, invalidate refresh token in database
    if (user && user.id) {
      try {
        await logout(user.id, refreshToken);
      } catch (dbError) {
        // Log error but don't fail the logout
        console.error('Failed to delete refresh token from database:', dbError);
      }
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    // Even if there's an error, try to clear cookies
    deleteCookie(event, 'auth_token', { path: '/' });
    deleteCookie(event, 'refresh_token', { path: '/' });

    throw createError({
      statusCode: (error as { statusCode?: number })?.statusCode || 500,
      message: (error as { message?: string })?.message || 'Logout failed',
    });
  }
});
