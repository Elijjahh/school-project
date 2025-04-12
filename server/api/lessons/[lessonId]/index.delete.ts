import { lessons } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { lessonId } = await getValidatedRouterParams(
    event,
    z.object({
      lessonId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const result = await useDrizzle().delete(lessons).where(eq(lessons.id, lessonId)).returning();
  return result[0];
});
