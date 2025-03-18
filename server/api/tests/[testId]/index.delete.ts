import { tests } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'testId');
  const test = await useDrizzle()
    .delete(tests)
    .where(eq(tests.id, Number(id)))
    .returning();
  return test[0];
});
