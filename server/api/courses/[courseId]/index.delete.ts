import { eq, inArray, count } from 'drizzle-orm';
import {
  courses,
  modules,
  lessons,
  tests,
  questions,
  answers,
  wishlist,
  coursesParticipations,
  coursesProgress,
  modulesProgress,
  lessonsProgress,
  testAttempts,
} from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const db = useDrizzle();

  // Проверяем, что пользователь может удалить этот курс
  const user = getCurrentUser(event);

  // Админ может удалить любой курс
  if (user.role !== 'admin') {
    // Проверяем, является ли пользователь создателем курса
    const course = await db.query.courses.findFirst({
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
        statusMessage: 'Access denied. You can only delete your own courses.',
      });
    }
  }

  // Проверяем связанные записи
  const [participationsCount, modulesCount, progressCount] = await Promise.all([
    db
      .select({ count: count() })
      .from(coursesParticipations)
      .where(eq(coursesParticipations.courseId, courseId)),
    db.select({ count: count() }).from(modules).where(eq(modules.courseId, courseId)),
    db
      .select({ count: count() })
      .from(coursesProgress)
      .where(eq(coursesProgress.courseId, courseId)),
  ]);

  const totalParticipations = participationsCount[0].count;
  const totalModules = modulesCount[0].count;
  const totalProgress = progressCount[0].count;

  if (totalParticipations > 0 || totalModules > 0 || totalProgress > 0) {
    const reasons = [];
    if (totalParticipations > 0) {
      reasons.push('имеет ' + totalParticipations + ' участник(ов)');
    }
    if (totalModules > 0) {
      reasons.push('содержит ' + totalModules + ' модул(ей)');
    }
    if (totalProgress > 0) {
      reasons.push('имеет прогресс у ' + totalProgress + ' студент(ов)');
    }

    throw createError({
      statusCode: 409,
      statusMessage: 'Невозможно удалить курс: ' + reasons.join(', '),
    });
  }

  // Каскадное удаление в транзакции
  return await db.transaction(async (transaction) => {
    // Найти все модули курса
    const foundModules = await transaction
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId));
    const moduleIds = foundModules.map((module) => module.id);

    // Найти все уроки этих модулей
    let lessonIds: number[] = [];
    if (moduleIds.length > 0) {
      const foundLessons = await transaction
        .select()
        .from(lessons)
        .where(inArray(lessons.moduleId, moduleIds));
      lessonIds = foundLessons.map((lesson) => lesson.id);
    }

    // Найти все тесты этих уроков
    let testIds: number[] = [];
    if (lessonIds.length > 0) {
      const foundTests = await transaction
        .select()
        .from(tests)
        .where(inArray(tests.lessonId, lessonIds));
      testIds = foundTests.map((test) => test.id);
    }

    // Найти все вопросы этих тестов
    let questionIds: number[] = [];
    if (testIds.length > 0) {
      const foundQuestions = await transaction
        .select()
        .from(questions)
        .where(inArray(questions.testId, testIds));
      questionIds = foundQuestions.map((question) => question.id);
    }

    // Найти все ответы этих вопросов
    let answerIds: number[] = [];
    if (questionIds.length > 0) {
      const foundAnswers = await transaction
        .select()
        .from(answers)
        .where(inArray(answers.questionId, questionIds));
      answerIds = foundAnswers.map((answer) => answer.id);
    }

    // Удалить ответы
    if (answerIds.length > 0) {
      await transaction.delete(answers).where(inArray(answers.id, answerIds));
    }
    // Удалить вопросы
    if (questionIds.length > 0) {
      await transaction.delete(questions).where(inArray(questions.id, questionIds));
    }
    // Удалить попытки тестов
    if (testIds.length > 0) {
      await transaction.delete(testAttempts).where(inArray(testAttempts.testId, testIds));
    }
    // Удалить тесты
    if (testIds.length > 0) {
      await transaction.delete(tests).where(inArray(tests.id, testIds));
    }
    // Удалить прогрессы уроков
    if (lessonIds.length > 0) {
      await transaction.delete(lessonsProgress).where(inArray(lessonsProgress.lessonId, lessonIds));
    }
    // Удалить уроки
    if (lessonIds.length > 0) {
      await transaction.delete(lessons).where(inArray(lessons.id, lessonIds));
    }
    // Удалить прогрессы модулей
    if (moduleIds.length > 0) {
      await transaction.delete(modulesProgress).where(inArray(modulesProgress.moduleId, moduleIds));
    }
    // Удалить модули
    if (moduleIds.length > 0) {
      await transaction.delete(modules).where(inArray(modules.id, moduleIds));
    }
    // Удалить прогрессы курса
    await transaction.delete(coursesProgress).where(eq(coursesProgress.courseId, courseId));
    // Удалить из wishlist
    await transaction.delete(wishlist).where(eq(wishlist.courseId, courseId));
    // Удалить сам курс
    const [deletedCourse] = await transaction
      .delete(courses)
      .where(eq(courses.id, courseId))
      .returning();
    return deletedCourse;
  });
});
