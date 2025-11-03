import { defineConfig } from 'drizzle-kit';

console.log(process.env.SQLITE_DB_PATH);

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/sqlite/schema.ts',
  out: './.data',
  dbCredentials: {
    url: process.env.SQLITE_DB_PATH!
  }
});

