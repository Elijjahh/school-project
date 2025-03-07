import { lessons } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  moduleId: z.number(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const { moduleId, title, content, order } = await readValidatedBody(event, bodySchema.parse);

  const lesson = await useDrizzle()
    .insert(lessons)
    .values({ moduleId, title, content, order })
    .returning();
  return lesson[0];
});
