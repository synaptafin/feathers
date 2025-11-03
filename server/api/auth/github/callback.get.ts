import { authenticateWithGitHub } from 'server/services/githubAuthService';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;

  if (!code) {
    throw createError({
      statusCode: 400,
      message: 'Authorization code is missing',
    });
  }

  try {
    // Authenticate with GitHub
    const { accessToken, refreshToken, user } =
      await authenticateWithGitHub(code);

    // Set cookies
    setCookie(event, 'auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    setCookie(event, 'refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    setUserSession(event, {
      user: {
        name: user.name,
      }
    });

    // Redirect to dashboard or home
    return sendRedirect(event, '/');
  } catch (error) {
    console.error('GitHub OAuth error:', error);

    // Redirect to login with error
    return sendRedirect(event, '/login?error=github_auth_failed');
  }
});
