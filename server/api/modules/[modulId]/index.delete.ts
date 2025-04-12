import { modules } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { moduleId } = await getValidatedRouterParams(
    event,
    z.object({
      moduleId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const result = await useDrizzle().delete(modules).where(eq(modules.id, moduleId)).returning();
  return result[0];
});
