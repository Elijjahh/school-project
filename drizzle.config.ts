import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://admin:root@localhost:5432/school_db?schema=public',
  },
});
