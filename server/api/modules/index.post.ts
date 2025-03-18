import { modules } from '~/drizzle/schema';

const bodySchema = z.object({
  courseId: z.number(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const { courseId, title, description, order } = await readValidatedBody(event, bodySchema.parse);

  const result = await useDrizzle()
    .insert(modules)
    .values({ courseId, title, description, order })
    .returning();
  return result[0];
});
