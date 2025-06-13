import { tests } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { lessonId, maxAttempts = 3 } = body;

  if (!lessonId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'lessonId is required',
    });
  }

  // Проверяем, что пользователь может создавать тесты в этом уроке
  const user = getCurrentUser(event);

  // Админ может создавать тесты в любом уроке
  if (user.role !== 'admin') {
    // Получаем урок с информацией о модуле и курсе
    const lesson = await useDrizzle().query.lessons.findFirst({
      where: (lessons, { eq }) => eq(lessons.id, Number(lessonId)),
      with: {
        module: {
          with: {
            course: {
              columns: { creatorId: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lesson not found',
      });
    }

    if (lesson.module.course.creatorId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. You can only create tests in your own courses.',
      });
    }
  }

  const [test] = await useDrizzle()
    .insert(tests)
    .values({
      lessonId: Number(lessonId),
      maxAttempts: Number(maxAttempts),
    })
    .returning();
  return test;
});
