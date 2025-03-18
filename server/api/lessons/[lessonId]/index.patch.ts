import { lessons } from '~/drizzle/schema';
import { z } from 'zod';

const bodySchema = z.object({
  moduleId: z.number(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'lessonsId');
  const { moduleId, title, content, order } = await readValidatedBody(event, bodySchema.parse);

  const lesson = await useDrizzle()
    .update(lessons)
    .set({ moduleId, title, content, order })
    .where(eq(lessons.id, Number(id)))
    .returning();
  return lesson[0];
});
