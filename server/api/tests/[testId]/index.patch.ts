import { tests, questions, answers } from '~/drizzle/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const { testId } = await getValidatedRouterParams(
    event,
    z.object({
      testId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const body = await readBody(event);
  const { maxAttempts, testQuestions } = body;

  const db = useDrizzle();

  // Проверяем, что пользователь может редактировать этот тест
  const user = getCurrentUser(event);

  // Админ может редактировать любой тест
  if (user.role !== 'admin') {
    // Получаем тест с информацией об уроке, модуле и курсе
    const test = await db.query.tests.findFirst({
      where: (tests, { eq }) => eq(tests.id, testId),
      with: {
        lesson: {
          with: {
            module: {
              with: {
                course: {
                  columns: { creatorId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!test) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Test not found',
      });
    }

    if (test.lesson.module.course.creatorId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. You can only edit tests in your own courses.',
      });
    }
  }

  // Обновляем тест
  await db
    .update(tests)
    .set({ maxAttempts: Number(maxAttempts) })
    .where(eq(tests.id, testId));

  // Удаляем старые вопросы и ответы
  const existingQuestions = await db.query.questions.findMany({
    where: eq(questions.testId, testId),
  });

  for (const question of existingQuestions) {
    await db.delete(answers).where(eq(answers.questionId, question.id));
  }
  await db.delete(questions).where(eq(questions.testId, testId));

  // Создаем новые вопросы и ответы
  if (testQuestions && Array.isArray(testQuestions)) {
    for (const questionData of testQuestions) {
      const [question] = await db
        .insert(questions)
        .values({
          testId,
          text: questionData.text,
        })
        .returning();

      if (questionData.answers && Array.isArray(questionData.answers)) {
        for (const answerData of questionData.answers) {
          await db.insert(answers).values({
            questionId: question.id,
            text: answerData.text,
            correct: answerData.correct,
          });
        }
      }
    }
  }

  // Возвращаем обновленный тест
  const updatedTest = await db.query.tests.findFirst({
    where: eq(tests.id, testId),
    with: {
      questions: {
        with: {
          answers: true,
        },
      },
    },
  });

  return updatedTest;
});
