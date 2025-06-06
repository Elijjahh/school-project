export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID преподавателя обязателен',
    });
  }

  const db = useDrizzle();

  // Получаем преподавателя с его курсами
  const instructor = await db.query.users.findFirst({
    where: (users, { eq, and }) => and(eq(users.id, parseInt(id)), eq(users.role, 'teacher')),
    with: {
      courses: {
        with: {
          coursesParticipations: {
            columns: {
              id: true,
            },
          },
          category: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!instructor) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Преподаватель не найден',
    });
  }

  // Форматируем курсы
  const formattedCourses = instructor.courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    image: course.image,
    category: course.category?.name || null,
    studentsCount: course.coursesParticipations.length,
  }));

  // Подсчитываем общую статистику
  const totalStudents = instructor.courses.reduce(
    (sum, course) => sum + course.coursesParticipations.length,
    0,
  );

  const instructorData = {
    id: instructor.id,
    name: `${instructor.firstname} ${instructor.lastname}`,
    firstname: instructor.firstname,
    lastname: instructor.lastname,
    email: instructor.email,
    image: instructor.image || '/default-avatar.png',
    bio: instructor.bio || 'Информация о преподавателе скоро появится.',
    coursesCount: instructor.courses.length,
    studentsCount: totalStudents,
    joinedAt: instructor.createdAt,
    courses: formattedCourses,
  };

  return {
    instructor: instructorData,
  };
});
