import { lessons } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'lessonId');
  const lesson = await useDrizzle()
    .delete(lessons)
    .where(eq(lessons.id, Number(id)))
    .returning();
  return lesson[0];
});
