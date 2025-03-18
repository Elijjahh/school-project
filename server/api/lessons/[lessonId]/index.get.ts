export default defineEventHandler(async (event) => {
  const { lessonId } = await getValidatedRouterParams(
    event,
    z.object({
      lessonId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const lesson = await useDrizzle().query.lessons.findFirst({
    where: (lessons, { eq }) => eq(lessons.id, lessonId),
  });

  if (!lesson)
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Урок с таким id не найден',
    });

  return lesson;
});
