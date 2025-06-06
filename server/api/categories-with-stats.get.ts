export default defineEventHandler(async (_event) => {
  const db = useDrizzle();

  // Получаем категории с их курсами
  const categoriesWithCourses = await db.query.categories.findMany({
    with: {
      courses: {
        columns: {
          id: true,
        },
      },
    },
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  // Форматируем данные
  const categoriesStats = categoriesWithCourses.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    image: category.image,
    count: category.courses.length,
  }));

  return {
    categories: categoriesStats,
    total: categoriesStats.length,
  };
});
