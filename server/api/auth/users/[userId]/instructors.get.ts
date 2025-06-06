export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId');

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    });
  }

  const db = useDrizzle();

  // Получаем участие пользователя в курсах с информацией о создателях курсов
  const userParticipations = await db.query.coursesParticipations.findMany({
    where: (cp, { eq }) => eq(cp.userId, parseInt(userId)),
    with: {
      course: {
        with: {
          creator: {
            columns: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              image: true,
            },
          },
        },
        columns: {
          id: true,
          title: true,
        },
      },
    },
  });

  // Группируем курсы по преподавателям
  const instructorsMap = new Map();

  userParticipations.forEach((participation) => {
    const creator = participation.course.creator;
    const course = participation.course;

    if (!instructorsMap.has(creator.id)) {
      instructorsMap.set(creator.id, {
        id: creator.id,
        name: `${creator.firstname} ${creator.lastname}`,
        email: creator.email,
        image: creator.image || '/default-avatar.png',
        courses: [],
      });
    }

    instructorsMap.get(creator.id).courses.push({
      id: course.id,
      title: course.title,
    });
  });

  const instructors = Array.from(instructorsMap.values()).map((instructor) => ({
    ...instructor,
    coursesCount: instructor.courses.length,
  }));

  return {
    instructors,
    total: instructors.length,
  };
});
