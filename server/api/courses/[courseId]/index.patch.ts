import { courses } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  creator_id: z.number().optional(),
});

export default defineEventHandler(async (event) => {
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const { title, description, creator_id } = await readValidatedBody(event, bodySchema.parse);

  const course = await useDrizzle()
    .update(courses)
    .set({ title, description, creator_id })
    .where(eq(courses.id, courseId))
    .returning();
  return course[0];
});
