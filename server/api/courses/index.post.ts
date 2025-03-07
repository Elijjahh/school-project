import { courses } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  title: z.string(),
  description: z.string(),
  creater_id: z.number(),
});

export default defineEventHandler(async (event) => {
  const { title, description, creater_id } = await readValidatedBody(event, bodySchema.parse);

  const course = await useDrizzle()
    .insert(courses)
    .values({ title, description, creater_id })
    .returning();
  return course[0];
});
