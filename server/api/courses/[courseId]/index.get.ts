export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'courseId');
  const courses = await useDrizzle().query.courses.findFirst({
    where: (courses, { eq }) => eq(courses.id, Number(id)),
  });
  return course;
});
