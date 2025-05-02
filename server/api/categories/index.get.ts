export default defineEventHandler(async (_event) => {
  const db = useDrizzle();
  return await db.query.categories.findMany();
});
