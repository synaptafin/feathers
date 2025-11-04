import { defineEventHandler, readBody, setCookie } from 'h3';
import { isProd } from 'server/utils/constants';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, name } = body;

  // Basic validation
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required.',
    };
  }

  // Call register service (should throw on duplicate email)
  const { user, accessToken, refreshToken } = await register({ email, password, name });

  // Set auth cookie (JWT or session token)
  setCookie(event, 'auth_token', accessToken, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: true
  });

  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  await setUserSession(event, {
    user: {
      name: user.name,
    }
  });

  return {
    user,
    success: true,
    message: 'Registration successful',
  };
});
