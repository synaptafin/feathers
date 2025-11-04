import jwt from 'jsonwebtoken';
import { createError } from 'h3';
import type { StringValue } from 'ms';


const config = useRuntimeConfig();
const JWT_SECRET = config.jwtSecret;

/**
 * Generate access token
 */
export const generateToken = (
  payload: { id: string; email: string; type?: string },
  expiresIn: StringValue = '15d',
): string => {
    return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: {
  id: string;
  email: string;
}): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

/**
 * Verify and decode token
 */
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  } catch {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  }
};
