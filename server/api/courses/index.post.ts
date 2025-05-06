import { courses } from '~/drizzle/schema';

const bodySchema = z.object({
  title: z.string(),
  description: z.string(),
  creatorId: z.number(),
  categoryId: z.number(),
  image: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { title, description, creatorId, categoryId, image } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const result = await useDrizzle()
    .insert(courses)
    .values({ title, description, creatorId, categoryId, image })
    .returning();
  return result[0];
});
