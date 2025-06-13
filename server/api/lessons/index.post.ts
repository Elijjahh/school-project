import { lessons } from '~/drizzle/schema';

const bodySchema = z.object({
  moduleId: z.number(),
  title: z.string(),
  content: z.string(),
  videoUrl: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { moduleId, title, content, videoUrl } = await readValidatedBody(event, bodySchema.parse);

  // Проверяем, что пользователь может создавать уроки в этом модуле
  const user = getCurrentUser(event);

  // Админ может создавать уроки в любом модуле
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
        statusMessage: 'Access denied. You can only create lessons in your own courses.',
      });
    }
  }

  const [{ value: lessonCount }] = await useDrizzle()
    .select({ value: count() })
    .from(lessons)
    .where(eq(lessons.moduleId, moduleId));

  const [result] = await useDrizzle()
    .insert(lessons)
    .values({ moduleId, title, content, videoUrl, order: lessonCount + 1 })
    .returning();
  return result;
});
