import { drizzle as drizzlePostgres } from 'drizzle-orm/neon-http';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { neon } from '@neondatabase/serverless';

// PostgreSQL(Neon) connection
const pgsql = neon(process.env.NEON_POSTGRESQL_DB_HOST!);
export const pgDB = drizzlePostgres({client: pgsql});


// SQLite (LibSQL) connection
export const sqlDB = drizzleLibsql({
    connection: {
      url: process.env.SQLITE_DB_PATH!, // e.g. 'file:./app.db' for local SQLite
      // authToken: process.env.DATABASE_AUTH_TOKEN, // Uncomment if needed
    }
});
