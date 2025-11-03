import argon2 from 'argon2';

import { eq, and, gt, lt } from 'drizzle-orm';
import { generateToken, verifyToken, generateRefreshToken } from 'server/utils/jwt';
import { createError } from 'h3';
import type { JwtPayload } from 'jsonwebtoken';

import type {
  AuthTokens,
  LoginCredentials,
  RegisterInput,
} from 'server/models/types';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Register a new user
 */
export const register = async (input: RegisterInput): Promise<AuthTokens> => {
  // Check if user already exists
  const [existingUser] = await pgDB
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, input.email))
    .limit(1);

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'User with this email already exists',
    });
  }

  // Hash password
  const hashedPassword = await argon2.hash(input.password);

  // Create user
  const [user] = await pgDB
    .insert(usersTable)
    .values({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    })
    .returning(safeUserSelectFields);

  // Generate tokens
  const accessToken = generateToken({
    id: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
  });

  // Save refresh token to database
  await pgDB.insert(refreshTokensTable).values({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return {
    accessToken,
    refreshToken,
    user
  };
};

/**
 * Login user with email and password
 */
export const login = async (
  credentials: LoginCredentials,
): Promise<AuthTokens> => {
  const { email, password } = credentials;

  // Find user
  const [user] = await pgDB
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    console.log('User not found for email:', email);
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
    });
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingTime = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60000,
    );
    throw createError({
      statusCode: 423,
      message: `Account is locked. Try again in ${remainingTime} minutes`,
    });
  }

  // Check if account is active
  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      message: 'Account is deactivated. Please contact support',
    });
  }

  // Verify password
  const isValidPassword = await argon2.verify(user.password, password);

  if (!isValidPassword) {
    // Increment login attempts
    const newAttempts = (user.loginAttempts || 0) + 1;
    const updateData: {
      loginAttempts: number;
      updatedAt: Date;
      lockedUntil?: Date | null;
    } = {
      loginAttempts: newAttempts,
      updatedAt: new Date(),
    };

    // Lock account if max attempts reached
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      updateData.loginAttempts = 0;
    }

    await pgDB.update(usersTable).set(updateData).where(eq(usersTable.id, user.id));

    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
      data: {
        attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - newAttempts),
      },
    });
  }

  // Reset login attempts on successful login
  await pgDB
    .update(usersTable)
    .set({
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, user.id));

  // Generate tokens
  const accessToken = generateToken({
    id: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
  });

  // Save refresh token
  await pgDB.insert(refreshTokensTable).values({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: user
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  token: string,
): Promise<AuthTokens> => {
  // Verify refresh token
  try {
    verifyToken(token);
  } catch {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired refresh token',
    });
  }

  // Check if refresh token exists in database with user data
  const [storedToken] = await pgDB
    .select({
      tokenId: refreshTokensTable.id,
      token: refreshTokensTable.token,
      expiresAt: refreshTokensTable.expiresAt,
      userId: usersTable.id,
      email: usersTable.email,
      avatar: usersTable.avatar,
      name: usersTable.name,
      isActive: usersTable.isActive,
      emailVerified: usersTable.emailVerified,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(refreshTokensTable)
    .innerJoin(usersTable, eq(refreshTokensTable.userId, usersTable.id))
    .where(eq(refreshTokensTable.token, token))
    .limit(1);

  if (!storedToken) {
    throw createError({
      statusCode: 401,
      message: 'Refresh token not found',
    });
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    await pgDB
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.id, storedToken.tokenId));

    throw createError({
      statusCode: 401,
      message: 'Refresh token expired',
    });
  }

  // Check if user is active
  if (!storedToken.isActive) {
    throw createError({
      statusCode: 403,
      message: 'Account is deactivated',
    });
  }

  // Generate new access token
  const accessToken = generateToken({
    id: storedToken.userId,
    email: storedToken.email,
  });

  // Generate new refresh token (token rotation)
  const newRefreshToken = generateRefreshToken({
    id: storedToken.userId,
    email: storedToken.email,
  });

  // Delete old refresh token and create new one (transaction)
  await pgDB.transaction(async (tx) => {
    await tx
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.id, storedToken.tokenId));

    await tx.insert(refreshTokensTable).values({
      token: newRefreshToken,
      userId: storedToken.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: storedToken.userId,
      email: storedToken.email,
      name: storedToken.name,
      avatar: storedToken.avatar,
      emailVerified: storedToken.emailVerified,
      githubUsername: null,
    },
  };
};

/**
 * Logout user by invalidating refresh token
 */
export const logout = async (
  userId: string,
  refreshToken?: string,
): Promise<void> => {
  if (refreshToken) {
    // Delete specific refresh token
    await pgDB
      .delete(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.userId, userId),
          eq(refreshTokensTable.token, refreshToken),
        ),
      );
  } else {
    // Delete all refresh tokens for user (logout from all devices)
    await pgDB.delete(refreshTokensTable).where(eq(refreshTokensTable.userId, userId));
  }
};

/**
 * Logout from all devices
 */
export const logoutAllDevices = async (userId: string): Promise<void> => {
  await pgDB.delete(refreshTokensTable).where(eq(refreshTokensTable.userId, userId));
};

/**
 * Change user password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  // Verify current password
  const isValid = await verifyPassword(userId, currentPassword);

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Current password is incorrect',
    });
  }

  // Hash new password
  const hashedPassword = await argon2.hash(newPassword);

  // Update password and invalidate all refresh tokens (transaction)
  await pgDB.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));

    await tx.delete(refreshTokensTable).where(eq(refreshTokensTable.userId, userId));
  });
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  const [user] = await pgDB
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  // Always return success to prevent email enumeration
  if (!user) {
    return;
  }

  // Generate reset token
  const resetToken = generateToken(
    { id: user.id, email: user.email, type: 'reset' },
    '1h',
  );

  // Save reset token to database
  await pgDB.insert(passwordResets).values({
    token: resetToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  // TODO: Send email with reset link
  // await sendPasswordResetEmail(user.email, resetToken)
};

/**
 * Reset password using reset token
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  // Verify token
  try {
    verifyToken(token);
  } catch {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired reset token',
    });
  }

  // Check if reset token exists and is valid
  const [resetRecord] = await pgDB
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.token, token))
    .limit(1);

  if (
    !resetRecord ||
    resetRecord.expiresAt < new Date() ||
    resetRecord.usedAt !== null
  ) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired reset token',
    });
  }

  // Hash new password
  const hashedPassword = await argon2.hash(newPassword);

  // Update password, mark token as used, and invalidate all sessions
  await pgDB.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, resetRecord.userId));

    await tx
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(passwordResets.id, resetRecord.id));

    await tx
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.userId, resetRecord.userId));
  });
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string): Promise<void> => {
  let decoded: JwtPayload | string;
  try {
    decoded = verifyToken(token);
  } catch {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired verification token',
    });
  }

  await pgDB
    .update(usersTable)
    .set({
      emailVerified: true,
      emailVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, (decoded as JwtPayload).id));
};

/**
 * Get user sessions (active refresh tokens)
 */
export const getUserSessions = async (userId: string) => {
  const sessions = await pgDB
    .select({
      id: refreshTokensTable.id,
      createdAt: refreshTokensTable.createdAt,
      expiresAt: refreshTokensTable.expiresAt,
    })
    .from(refreshTokensTable)
    .where(
      and(
        eq(refreshTokensTable.userId, userId),
        gt(refreshTokensTable.expiresAt, new Date()),
      ),
    )
    .orderBy(refreshTokensTable.createdAt);

  return sessions;
};

/**
 * Revoke specific session
 */
export const revokeSession = async (
  userId: string,
  sessionId: string,
): Promise<void> => {
  await pgDB
    .delete(refreshTokensTable)
    .where(
      and(eq(refreshTokensTable.id, sessionId), eq(refreshTokensTable.userId, userId)),
    );
};

/**
 * Clean up expired tokens (run as cron job)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  const result = await pgDB
    .delete(refreshTokensTable)
    .where(lt(refreshTokensTable.expiresAt, new Date()))
    .returning({ id: refreshTokensTable.id });

  return result.length;
};
