import { modules, lessons, modulesProgress } from '~/drizzle/schema';
import { eq, count } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const { moduleId } = await getValidatedRouterParams(
    event,
    z.object({
      moduleId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  // Проверяем, что пользователь может удалить этот модуль
  const user = getCurrentUser(event);

  // Админ может удалить любой модуль
  if (user.role !== 'admin') {
    // Получаем модуль с информацией о курсе
    const module = await useDrizzle().query.modules.findFirst({
      where: (modules, { eq }) => eq(modules.id, moduleId),
      with: {
        course: {
          columns: { creatorId: true },
        },
      },
    });

    if (!module) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Module not found',
      });
    }

    if (module.course.creatorId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. You can only delete modules in your own courses.',
      });
    }
  }

  // Проверяем связанные записи
  const [lessonsCount, progressCount] = await Promise.all([
    useDrizzle().select({ count: count() }).from(lessons).where(eq(lessons.moduleId, moduleId)),
    useDrizzle()
      .select({ count: count() })
      .from(modulesProgress)
      .where(eq(modulesProgress.moduleId, moduleId)),
  ]);

  const totalLessons = lessonsCount[0].count;
  const totalProgress = progressCount[0].count;

  if (totalLessons > 0 || totalProgress > 0) {
    const reasons = [];
    if (totalLessons > 0) {
      reasons.push('содержит ' + totalLessons + ' урок(ов)');
    }
    if (totalProgress > 0) {
      reasons.push('имеет прогресс у ' + totalProgress + ' студент(ов)');
    }

    throw createError({
      statusCode: 409,
      statusMessage: 'Невозможно удалить модуль: ' + reasons.join(', '),
    });
  }

  const result = await useDrizzle().delete(modules).where(eq(modules.id, moduleId)).returning();
  return result[0];
});
