export default defineEventHandler(async (event) => {
  const { testId } = await getValidatedRouterParams(
    event,
    z.object({
      testId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const test = await useDrizzle().query.tests.findFirst({
    where: (tests, { eq }) => eq(tests.id, testId),
    with: {
      questions: {
        with: {
          answers: true,
        },
        orderBy: (questions, { asc }) => [asc(questions.id)],
      },
    },
  });

  if (!test)
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Теста с таким id не найден',
    });

  return test;
});
