import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/sqlite/schema.ts',
  out: './.data',
  dbCredentials: {
    url: process.env.SQLITE_DB_PATH!
  }
});

