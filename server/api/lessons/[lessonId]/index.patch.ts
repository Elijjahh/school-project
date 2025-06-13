import { lessons } from '~/drizzle/schema';

const bodySchema = z.object({
  moduleId: z.number(),
  title: z.string(),
  content: z.string(),
  videoUrl: z.string().optional().nullable(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const { lessonId } = await getValidatedRouterParams(
    event,
    z.object({
      lessonId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const { moduleId, title, content, videoUrl, order } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  // Проверяем, что пользователь может редактировать этот урок
  const user = getCurrentUser(event);

  // Админ может редактировать любой урок
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
        statusMessage: 'Access denied. You can only edit lessons in your own courses.',
      });
    }
  }

  // Handle videoUrl explicitly - if undefined or null, set to null
  const processedVideoUrl = videoUrl === undefined ? null : videoUrl;

  const result = await useDrizzle()
    .update(lessons)
    .set({ moduleId, title, content, videoUrl: processedVideoUrl, order })
    .where(eq(lessons.id, lessonId))
    .returning();

  return result[0];
});
