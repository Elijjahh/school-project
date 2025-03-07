import { courses } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  title: z.string().optional,
  description: z.string().optional,
  creater_id: z.number().optional,
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'courseId');
  const { title, description, creater_id } = await readValidatedBody(event, bodySchema.parse);

  const course = await useDrizzle()
    .update(courses)
    .set({ title, description, creater_id })
    .where(eq(courses.id, Number(id)))
    .returning();
  return course[0];
});
