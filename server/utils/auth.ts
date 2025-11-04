import { setCookie } from 'h3';
import type { H3Event } from 'h3';
import { isProd } from 'server/utils/constants';

export const storeAuthToken = async (accessToken: string, refreshToken: string, event: H3Event, sessionData: { user: SafeUser }) => {
  setCookie(event, 'auth_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  });

  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  await setUserSession(event, sessionData);
};
