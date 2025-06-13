import { modules } from '~/drizzle/schema';

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

  const result = await useDrizzle().delete(modules).where(eq(modules.id, moduleId)).returning();
  return result[0];
});
