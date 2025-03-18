import { modules } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  courseId: z.number(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const { courseId, title, description, order } = await readValidatedBody(event, bodySchema.parse);

  const module = await useDrizzle()
    .insert(modules)
    .values({ courseId, title, description, order })
    .returning();
  return module[0];
});
