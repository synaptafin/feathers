import { drizzle as drizzlePostgres } from 'drizzle-orm/neon-http';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { neon } from '@neondatabase/serverless';

const config = useRuntimeConfig();

// PostgreSQL(Neon) connection
const pgsql = neon(config.neonPostgresqlDbHost!);
export const pgDB = drizzlePostgres({client: pgsql});

// SQLite (LibSQL) connection
export const sqlDB = drizzleLibsql({
    connection: {
      url: config.sqliteDbPath
      // authToken: config.DATABASE_AUTH_TOKEN, // Uncomment if needed
    }
});
