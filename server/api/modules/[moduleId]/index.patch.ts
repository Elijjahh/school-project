import { modules } from '~/drizzle/schema';

const bodySchema = z.object({
  courseId: z.number(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const { moduleId } = await getValidatedRouterParams(
    event,
    z.object({
      moduleId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const { courseId, title, description, order } = await readValidatedBody(event, bodySchema.parse);

  // Проверяем, что пользователь может редактировать этот модуль
  const user = getCurrentUser(event);

  // Админ может редактировать любой модуль
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
        statusMessage: 'Access denied. You can only edit modules in your own courses.',
      });
    }
  }

  const result = await useDrizzle()
    .update(modules)
    .set({ courseId, title, description, order })
    .where(eq(modules.id, moduleId))
    .returning();
  return result[0];
});
