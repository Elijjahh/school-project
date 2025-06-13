import { courses } from '~/drizzle/schema';

const bodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.number().optional(),
});

export default defineEventHandler(async (event) => {
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  // Проверяем, что пользователь может редактировать этот курс
  const user = getCurrentUser(event);

  // Админ может редактировать любой курс
  if (user.role !== 'admin') {
    // Проверяем, является ли пользователь создателем курса
    const course = await useDrizzle().query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, courseId),
      columns: { creatorId: true },
    });

    if (!course) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Course not found',
      });
    }

    if (course.creatorId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. You can only edit your own courses.',
      });
    }
  }

  const { title, description, image, categoryId } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const result = await useDrizzle()
    .update(courses)
    .set({ title, description, image, categoryId })
    .where(eq(courses.id, courseId))
    .returning();
  return result[0];
});
