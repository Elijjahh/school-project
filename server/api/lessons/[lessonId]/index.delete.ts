import { lessons } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { lessonId } = await getValidatedRouterParams(
    event,
    z.object({
      lessonId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  // Проверяем, что пользователь может удалить этот урок
  const user = getCurrentUser(event);

  // Админ может удалить любой урок
  if (user.role !== 'admin') {
    // Получаем урок с информацией о модуле и курсе
    const lesson = await useDrizzle().query.lessons.findFirst({
      where: (lessons, { eq }) => eq(lessons.id, lessonId),
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
        statusMessage: 'Access denied. You can only delete lessons in your own courses.',
      });
    }
  }

  const result = await useDrizzle().delete(lessons).where(eq(lessons.id, lessonId)).returning();
  return result[0];
});
