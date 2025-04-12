import { courses } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const result = await useDrizzle().delete(courses).where(eq(courses.id, courseId)).returning();
  return result[0];
});
