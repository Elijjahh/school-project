import { lessons, tests, lessonsProgress } from '~/drizzle/schema';
import { eq, count } from 'drizzle-orm';

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

  // Проверяем связанные записи
  const [testsCount, progressCount] = await Promise.all([
    useDrizzle().select({ count: count() }).from(tests).where(eq(tests.lessonId, lessonId)),
    useDrizzle()
      .select({ count: count() })
      .from(lessonsProgress)
      .where(eq(lessonsProgress.lessonId, lessonId)),
  ]);

  const totalTests = testsCount[0].count;
  const totalProgress = progressCount[0].count;

  if (totalTests > 0 || totalProgress > 0) {
    const reasons = [];
    if (totalTests > 0) reasons.push(`содержит ${totalTests} тест(ов)`);
    if (totalProgress > 0) reasons.push(`имеет прогресс у ${totalProgress} студент(ов)`);

    throw createError({
      statusCode: 409,
      statusMessage: `Невозможно удалить урок: ${reasons.join(', ')}`,
    });
  }

  try {
    const result = await useDrizzle().delete(lessons).where(eq(lessons.id, lessonId)).returning();
    return result[0];
  } catch {
    // Если происходит ошибка foreign key constraint
    throw createError({
      statusCode: 409,
      statusMessage: 'Невозможно удалить урок: есть связанные данные',
    });
  }
});
