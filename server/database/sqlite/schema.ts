import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';


export const scrapingData = sqliteTable('scraping_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull().unique(),
  linkedURLs: text('linked_urls', { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
  failed: integer('failed'), // 0 or 1, optional
  lastUpdated: text('last_updated'), // ISO string, optional
  remarks: text('remarks'), // optional
});

