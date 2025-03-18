import { courses } from '~/drizzle/schema';

const bodySchema = z.object({
  title: z.string(),
  description: z.string(),
  creator_id: z.number(),
});

export default defineEventHandler(async (event) => {
  const { title, description, creator_id } = await readValidatedBody(event, bodySchema.parse);

  const result = await useDrizzle()
    .insert(courses)
    .values({ title, description, creator_id })
    .returning();
  return result[0];
});
