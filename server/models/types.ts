import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;
export type RefreshToken = InferSelectModel<typeof refreshTokensTable>;
export type PasswordReset = InferSelectModel<typeof passwordResets>;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

export interface JWTPayload {
  id: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}


