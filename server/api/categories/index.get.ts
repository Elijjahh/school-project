export default defineEventHandler(async (_event) => {
  const categories = await useDrizzle().query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  return {
    categories,
    total: categories.length,
  };
});
