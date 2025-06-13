export default defineEventHandler(async (_event) => {
  const db = useDrizzle();

  // Получаем курсы с количеством студентов
  const popularCourses = await db.query.courses.findMany({
    with: {
      coursesParticipations: {
        columns: {
          id: true,
        },
      },
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
  });

  // Сортируем по количеству студентов и добавляем нужные поля
  const coursesWithStats = popularCourses
    .map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      image: course.image,
      students: course.coursesParticipations.length,
      creatorId: course.creatorId,
      categoryName: course.category?.name || 'Без категории',
      creatorName: course.creator
        ? `${course.creator.firstname} ${course.creator.lastname}`
        : 'Неизвестный преподаватель',
    }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 6);

  return {
    courses: coursesWithStats,
    total: coursesWithStats.length,
  };
});
