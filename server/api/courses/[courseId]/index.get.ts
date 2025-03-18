import { z } from 'zod';

export default defineEventHandler(async (event) => {
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const course = await useDrizzle().query.courses.findFirst({
    where: (courses, { eq }) => eq(courses.id, courseId),
  });

  if (!course)
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Курс с таким id не найден',
    });

  return course;
});
