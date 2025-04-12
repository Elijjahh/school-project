import { lessons } from '~/drizzle/schema';

const bodySchema = z.object({
  moduleId: z.number(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const { lessonId } = await getValidatedRouterParams(
    event,
    z.object({
      lessonId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const { moduleId, title, content, order } = await readValidatedBody(event, bodySchema.parse);

  const result = await useDrizzle()
    .update(lessons)
    .set({ moduleId, title, content, order })
    .where(eq(lessons.id, lessonId))
    .returning();
  return result[0];
});
