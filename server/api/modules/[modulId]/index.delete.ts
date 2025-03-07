import { modules } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'moduleId');
  const module = await useDrizzle()
    .delete(modules)
    .where(eq(modules.id, Number(id)))
    .returning();
  return module[0];
});
