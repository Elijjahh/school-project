export default defineEventHandler(async (_event) => {
  const lessons = await useDrizzle().query.lessons.findMany({});
  return lessons;
});
