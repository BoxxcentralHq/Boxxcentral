import type { CookieOptions, Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'bxx_access';
export const REFRESH_TOKEN_COOKIE = 'bxx_refresh';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
// path-scoped so the refresh cookie only travels to admin auth endpoints
const REFRESH_PATH = '/api/v1/admin';

const baseOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: ACCESS_MAX_AGE_MS,
    path: '/',
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: REFRESH_MAX_AGE_MS,
    path: REFRESH_PATH,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...baseOptions, path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    ...baseOptions,
    path: REFRESH_PATH,
  });
}
