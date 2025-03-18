import { z } from 'zod';
import { courses } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const course = await useDrizzle().delete(courses).where(eq(courses.id, courseId)).returning();
  return course[0];
});
