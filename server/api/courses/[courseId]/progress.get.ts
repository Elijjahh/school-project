import { useDrizzle, eq, and } from '~/server/utils/drizzle';
import {
  modules,
  lessons,
  coursesParticipations,
  coursesProgress,
  modulesProgress,
  lessonsProgress,
  tests,
  testAttempts,
} from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const courseId = parseInt(getRouterParam(event, 'courseId') as string);
  const query = getQuery(event);
  const userId = parseInt(query.userId as string);

  if (!userId || !courseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID and Course ID are required',
    });
  }

  try {
    const db = useDrizzle();

    // Проверяем участие пользователя в курсе
    const participation = await db
      .select({ id: coursesParticipations.id })
      .from(coursesParticipations)
      .where(
        and(eq(coursesParticipations.userId, userId), eq(coursesParticipations.courseId, courseId)),
      )
      .limit(1);

    if (!participation.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User is not enrolled in this course',
      });
    }

    // Получаем общий прогресс курса
    const courseProgressData = await db
      .select({ finished: coursesProgress.finished })
      .from(coursesProgress)
      .where(
        and(
          eq(coursesProgress.courseId, courseId),
          eq(coursesProgress.participationId, participation[0].id),
        ),
      )
      .limit(1);

    // Получаем все модули курса
    const allModules = await db
      .select({
        id: modules.id,
        title: modules.title,
        order: modules.order,
      })
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.order);

    // Получаем все уроки курса
    const allLessons = await db
      .select({
        id: lessons.id,
        moduleId: lessons.moduleId,
        title: lessons.title,
        order: lessons.order,
      })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.order, lessons.order);

    // Получаем все тесты курса
    const allTests = await db
      .select({
        id: tests.id,
        lessonId: tests.lessonId,
        maxAttempts: tests.maxAttempts,
      })
      .from(tests)
      .innerJoin(lessons, eq(tests.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(eq(modules.courseId, courseId));

    // Получаем все попытки пользователя
    const userAttempts = await db
      .select({
        testId: testAttempts.testId,
        score: testAttempts.score,
        totalQuestions: testAttempts.totalQuestions,
        completed: testAttempts.completed,
        datetime: testAttempts.datetime,
      })
      .from(testAttempts)
      .innerJoin(tests, eq(testAttempts.testId, tests.id))
      .innerJoin(lessons, eq(tests.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(and(eq(modules.courseId, courseId), eq(testAttempts.userId, userId)))
      .orderBy(testAttempts.datetime);

    // Получаем завершенные модули
    const completedModules = await db
      .select({ moduleId: modulesProgress.moduleId })
      .from(modulesProgress)
      .where(
        and(
          eq(modulesProgress.participationId, participation[0].id),
          eq(modulesProgress.finished, true),
        ),
      );

    // Получаем завершенные уроки
    const completedLessons = await db
      .select({ lessonId: lessonsProgress.lessonId })
      .from(lessonsProgress)
      .where(
        and(
          eq(lessonsProgress.participationId, participation[0].id),
          eq(lessonsProgress.finished, true),
        ),
      );

    const completedModuleIds = new Set(completedModules.map((m) => m.moduleId));
    const completedLessonIds = new Set(completedLessons.map((l) => l.lessonId));

    // Группируем тесты по урокам
    const testsByLesson = new Map();
    allTests.forEach((test) => {
      if (!testsByLesson.has(test.lessonId)) {
        testsByLesson.set(test.lessonId, []);
      }
      testsByLesson.get(test.lessonId).push(test);
    });

    // Группируем попытки по тестам
    const attemptsByTest = new Map();
    userAttempts.forEach((attempt) => {
      if (!attemptsByTest.has(attempt.testId)) {
        attemptsByTest.set(attempt.testId, []);
      }
      attemptsByTest.get(attempt.testId).push(attempt);
    });

    // Формируем ответ
    const moduleProgresses = allModules.map((module) => {
      const moduleLessons = allLessons.filter((lesson) => lesson.moduleId === module.id);
      const completedLessonsInModule = moduleLessons.filter((lesson) =>
        completedLessonIds.has(lesson.id),
      );

      return {
        moduleId: module.id,
        title: module.title,
        order: module.order,
        completed: completedModuleIds.has(module.id),
        totalLessons: moduleLessons.length,
        completedLessons: completedLessonsInModule.length,
        progress:
          moduleLessons.length > 0
            ? (completedLessonsInModule.length / moduleLessons.length) * 100
            : 0,
        lessons: moduleLessons.map((lesson) => {
          const lessonTests = testsByLesson.get(lesson.id) || [];
          return {
            lessonId: lesson.id,
            title: lesson.title,
            order: lesson.order,
            completed: completedLessonIds.has(lesson.id),
            tests: lessonTests.map((test: any) => {
              const testAttemptsList = attemptsByTest.get(test.id) || [];
              const completedAttempts = testAttemptsList.filter(
                (attempt: any) => attempt.completed,
              );
              const bestAttempt = completedAttempts.reduce((best: any, current: any) => {
                const currentScore = current.score || 0;
                const bestScore = best?.score || 0;
                return currentScore > bestScore ? current : best;
              }, null);
              const passed = bestAttempt
                ? (bestAttempt.score || 0) >= Math.ceil((bestAttempt.totalQuestions || 0) * 0.6)
                : false;

              return {
                testId: test.id,
                maxAttempts: test.maxAttempts,
                attemptsCount: testAttemptsList.length,
                completedAttempts: completedAttempts.length,
                bestScore: bestAttempt?.score || 0,
                bestPercentage: bestAttempt
                  ? Math.round(((bestAttempt.score || 0) / (bestAttempt.totalQuestions || 1)) * 100)
                  : 0,
                passed,
                lastAttemptAt:
                  testAttemptsList.length > 0
                    ? testAttemptsList[testAttemptsList.length - 1].datetime
                    : null,
              };
            }),
          };
        }),
      };
    });

    const totalLessons = allLessons.length;
    const totalCompletedLessons = completedLessons.length;
    const overallProgress = totalLessons > 0 ? (totalCompletedLessons / totalLessons) * 100 : 0;

    return {
      courseId,
      courseCompleted: courseProgressData.length > 0 ? courseProgressData[0].finished : false,
      overallProgress,
      totalModules: allModules.length,
      completedModules: completedModules.length,
      totalLessons,
      completedLessons: totalCompletedLessons,
      modules: moduleProgresses,
    };
  } catch (error) {
    console.error('Error getting course progress:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get progress',
    });
  }
});
