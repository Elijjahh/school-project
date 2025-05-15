import { modules } from '~/drizzle/schema';

const bodySchema = z.object({
  courseId: z.number(),
  title: z.string(),
  description: z.string(),
});

export default defineEventHandler(async (event) => {
  const { courseId, title, description } = await readValidatedBody(event, bodySchema.parse);

  const [{ value: moduleCount }] = await useDrizzle()
    .select({ value: count() })
    .from(modules)
    .where(eq(modules.courseId, courseId));

  const [result] = await useDrizzle()
    .insert(modules)
    .values({ courseId, title, description, order: moduleCount + 1 })
    .returning();
  return result;
});
