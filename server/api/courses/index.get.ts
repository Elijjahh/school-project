export default defineEventHandler(async (_event) => {
  const courses = await useDrizzle().query.courses.findMany({});
  return courses;
});
