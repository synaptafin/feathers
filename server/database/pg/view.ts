import { pgView, QueryBuilder } from 'drizzle-orm/pg-core';
import type { PgColumn } from 'drizzle-orm/pg-core';

type PgColumnsExtractType<T extends Record<string, PgColumn>, Ref extends Record<string, unknown>> = {
  // [K in keyof T]: T[K]['_']['data'];
  // [K in keyof T]: T[K] extends { _: { data: infer D } } ? D : never;
  [K in keyof T & keyof Ref]: Ref[K] 
};
const qb = new QueryBuilder();

export const safeUserSelectFields = {
  id: usersTable.id,
  email: usersTable.email,
  name: usersTable.name,
  avatar: usersTable.avatar,
  emailVerified: usersTable.emailVerified,
  githubUsername: usersTable.githubUsername,
};

export const safeUsersView = pgView('safe_user_view').as(
  qb.select(safeUserSelectFields).from(usersTable)
);
export type SafeUser = PgColumnsExtractType<typeof safeUserSelectFields, UserEntity>;

