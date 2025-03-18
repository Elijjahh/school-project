export default defineEventHandler(async (_event) => {
  return await useDrizzle().query.lessons.findMany();
});
