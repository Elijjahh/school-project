export default defineEventHandler(async (event) => {
  const { testId } = await getValidatedRouterParams(
    event,
    z.object({
      testId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const session = await requireUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  // Получаем тест с вопросами
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

  if (!test) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Test not found',
    });
  }

  // Убираем правильные ответы для студентов
  const questionsForStudent = test.questions.map((question) => ({
    id: question.id,
    text: question.text,
    answers: question.answers.map((answer) => ({
      id: answer.id,
      text: answer.text,
      // Не показываем правильные ответы студентам
    })),
  }));

  return {
    questions: questionsForStudent,
    totalQuestions: test.questions.length,
  };
});
