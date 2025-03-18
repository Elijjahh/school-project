import { tests } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { testId } = await getValidatedRouterParams(
    event,
    z.object({
      testId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const result = await useDrizzle().delete(tests).where(eq(tests.id, testId)).returning();
  return result[0];
});
