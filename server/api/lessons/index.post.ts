import { lessons } from '~/drizzle/schema';

const bodySchema = z.object({
  moduleId: z.number(),
  title: z.string(),
  content: z.string(),
});

export default defineEventHandler(async (event) => {
  const { moduleId, title, content } = await readValidatedBody(event, bodySchema.parse);

  const [{ value: lessonCount }] = await useDrizzle()
    .select({ value: count() })
    .from(lessons)
    .where(eq(lessons.moduleId, moduleId));

  const [result] = await useDrizzle()
    .insert(lessons)
    .values({ moduleId, title, content, order: lessonCount + 1 })
    .returning();
  return result;
});
