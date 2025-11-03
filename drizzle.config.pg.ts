import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/database/pg/schema.ts',
  out: './.data',
  dbCredentials: {
    url: process.env.NEON_POSTGRESQL_DB_HOST!
  }
});

