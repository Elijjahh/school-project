export default defineEventHandler(async (_event) => {
  return await useDrizzle().query.tests.findMany();
});
