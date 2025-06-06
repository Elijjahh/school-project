export default defineEventHandler(async (_event) => {
  const db = useDrizzle();

  // Получаем недавние курсы, используя order по ID (последние добавленные)
  const recentCourses = await db.query.courses.findMany({
    with: {
      creator: {
        columns: {
          firstname: true,
          lastname: true,
        },
      },
      category: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: (courses, { desc }) => [desc(courses.id)],
    limit: 6,
  });

  // Форматируем данные
  const coursesFormatted = recentCourses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    image: course.image || '/placeholder-course.jpg',
    creatorId: course.creatorId,
    categoryName: course.category?.name || 'Без категории',
    creatorName: course.creator
      ? `${course.creator.firstname} ${course.creator.lastname}`
      : 'Неизвестный преподаватель',
  }));

  return {
    courses: coursesFormatted,
    total: coursesFormatted.length,
  };
});
