import { tests } from '~/drizzle/schema';

export default defineEventHandler(async (_event) => {
  const test = await useDrizzle().insert(tests).values({}).returning();
  return test[0];
});
