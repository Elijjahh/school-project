import { lessons } from '~/drizzle/schema';

const bodySchema = z.object({
  moduleId: z.number(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const { moduleId, title, content, order } = await readValidatedBody(event, bodySchema.parse);

  const result = await useDrizzle()
    .insert(lessons)
    .values({ moduleId, title, content, order })
    .returning();
  return result[0];
});
