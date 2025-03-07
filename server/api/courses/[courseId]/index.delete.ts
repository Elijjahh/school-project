import { courses } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'courseId');
  const course = await useDrizzle()
    .delete(courses)
    .where(eq(courses.id, Number(id)))
    .returning();
  return course[0];
});
