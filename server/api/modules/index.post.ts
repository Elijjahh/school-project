import { modules } from '~/drizzle/schema';

const bodySchema = z.object({
  courseId: z.number(),
  title: z.string(),
  description: z.string(),
});

export default defineEventHandler(async (event) => {
  const { courseId, title, description } = await readValidatedBody(event, bodySchema.parse);

  // Проверяем, что пользователь может создавать модули в этом курсе
  const user = getCurrentUser(event);

  // Админ может создавать модули в любом курсе
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
        statusMessage: 'Access denied. You can only create modules in your own courses.',
      });
    }
  }

  const [{ value: moduleCount }] = await useDrizzle()
    .select({ value: count() })
    .from(modules)
    .where(eq(modules.courseId, courseId));

  const [result] = await useDrizzle()
    .insert(modules)
    .values({ courseId, title, description, order: moduleCount + 1 })
    .returning();
  return result;
});
