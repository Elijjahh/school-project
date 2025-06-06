export default defineEventHandler(async (_event) => {
  const db = useDrizzle();

  // Получаем преподавателей с их курсами и количеством студентов
  const instructors = await db.query.users.findMany({
    where: (users, { eq }) => eq(users.role, 'teacher'),
    with: {
      courses: {
        with: {
          coursesParticipations: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
  });

  // Форматируем данные и считаем статистику
  const instructorsWithStats = instructors
    .map((instructor) => {
      const totalStudents = instructor.courses.reduce(
        (sum, course) => sum + course.coursesParticipations.length,
        0,
      );

      // Определяем экспертизу на основе категорий курсов (в идеале это нужно выносить в отдельное поле)
      const expertise =
        instructor.courses.length > 0
          ? `${instructor.courses.length} курс${instructor.courses.length === 1 ? '' : instructor.courses.length < 5 ? 'а' : 'ов'}`
          : 'Новый преподаватель';

      return {
        id: instructor.id,
        name: `${instructor.firstname} ${instructor.lastname}`,
        image: instructor.image || '/default-avatar.png',
        expertise,
        studentsCount: totalStudents,
        coursesCount: instructor.courses.length,
        role: instructor.role,
      };
    })
    .filter((instructor) => instructor.coursesCount > 0) // Только те, у кого есть курсы
    .sort((a, b) => b.studentsCount - a.studentsCount) // Сортируем по количеству студентов
    .slice(0, 8); // Берем топ-8

  return {
    instructors: instructorsWithStats,
    total: instructorsWithStats.length,
  };
});
