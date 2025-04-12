import { modules } from '~/drizzle/schema';

const bodySchema = z.object({
  courseId: z.number(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const { moduleId } = await getValidatedRouterParams(
    event,
    z.object({
      moduleId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const { courseId, title, description, order } = await readValidatedBody(event, bodySchema.parse);

  const result = await useDrizzle()
    .update(modules)
    .set({ courseId, title, description, order })
    .where(eq(modules.id, moduleId))
    .returning();
  return result[0];
});
