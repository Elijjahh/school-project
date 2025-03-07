import { modules } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  courseId: z.number(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'moduleId');
  const { courseId, title, description, order } = await readValidatedBody(event, bodySchema.parse);

  const module = await useDrizzle()
    .update(modules)
    .set({ courseId, title, description, order })
    .where(eq(modules.id, Number(id)))
    .returning();
  return module[0];
});
