export default defineEventHandler(async (_event) => {
  const modules = await useDrizzle().query.modules.findMany({});
  return modules;
});
