export default defineEventHandler(async (_event) => {
  const tests = await useDrizzle().query.tests.findMany({});
  return tests;
});
