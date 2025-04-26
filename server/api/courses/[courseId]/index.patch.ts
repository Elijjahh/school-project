import { courses } from '~/drizzle/schema';

const bodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  creatorId: z.number(),
  image: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const { title, description, creatorId, image } = await readValidatedBody(event, bodySchema.parse);

  const result = await useDrizzle()
    .update(courses)
    .set({ title, description, creatorId, image })
    .where(eq(courses.id, courseId))
    .returning();
  return result[0];
});
