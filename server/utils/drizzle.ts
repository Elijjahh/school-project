import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '~/drizzle/schema';

export { sql, eq, and, or, count } from 'drizzle-orm';
export const tables = schema;

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    // ssl: true,
  },
  schema,
});

export function useDrizzle() {
  return db;
}

export type User = typeof schema.users.$inferSelect;
