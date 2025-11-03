import { login } from 'server/services/authService';
import { setCookie } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { accessToken, refreshToken, user } = await login(body);

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

  await setUserSession(event, {
    user: {
      name: user.name,
    }
  });

  return { user };
});
