import { courses } from '~/drizzle/schema';

const bodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  creatorId: z.number().optional(),
  image: z.string().optional(),
  categoryId: z.number().optional(),
});

export default defineEventHandler(async (event) => {
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const { title, description, creatorId, image, categoryId } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const result = await useDrizzle()
    .update(courses)
    .set({ title, description, creatorId, image, categoryId })
    .where(eq(courses.id, courseId))
    .returning();
  return result[0];
});
