import { useDrizzle, eq, and, inArray } from '~/server/utils/drizzle';
import {
  modules,
  lessons,
  coursesParticipations,
  coursesProgress,
  modulesProgress,
  lessonsProgress,
  tests,
  testAttempts,
  users,
} from '~/drizzle/schema';

interface TestAttempt {
  userId: number;
  testId: number;
  score: number | null;
  totalQuestions: number;
  completed: boolean;
  datetime: Date | null;
}

export default defineEventHandler(async (event) => {
  const courseId = parseInt(getRouterParam(event, 'courseId') as string);
  const session = await getUserSession(event);

  if (!session.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    const db = useDrizzle();

    // Проверяем, что пользователь является создателем курса
    const course = await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, courseId),
      columns: { creatorId: true, title: true },
    });

    if (!course || course.creatorId !== session.user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied',
      });
    }

    // Получаем всех участников курса
    const participants = await db
      .select({
        participationId: coursesParticipations.id,
        userId: coursesParticipations.userId,
        username: users.username,
        firstName: users.firstname,
        lastName: users.lastname,
        image: users.image,
      })
      .from(coursesParticipations)
      .innerJoin(users, eq(coursesParticipations.userId, users.id))
      .where(eq(coursesParticipations.courseId, courseId));

    if (!participants.length) {
      return {
        courseId,
        courseTitle: course.title,
        students: [],
        totalStudents: 0,
      };
    }

    const participationIds = participants.map((p) => p.participationId);
    const userIds = participants.map((p) => p.userId);

    // Получаем структуру курса
    const allModules = await db
      .select({
        id: modules.id,
        title: modules.title,
        order: modules.order,
      })
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.order);

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

    // Получаем прогресс по курсам
    const coursesProgressData = await db
      .select({
        participationId: coursesProgress.participationId,
        finished: coursesProgress.finished,
      })
      .from(coursesProgress)
      .where(
        and(
          eq(coursesProgress.courseId, courseId),
          inArray(coursesProgress.participationId, participationIds),
        ),
      );

    // Получаем прогресс по модулям
    const modulesProgressData = await db
      .select({
        participationId: modulesProgress.participationId,
        moduleId: modulesProgress.moduleId,
        finished: modulesProgress.finished,
      })
      .from(modulesProgress)
      .where(inArray(modulesProgress.participationId, participationIds));

    // Получаем прогресс по урокам
    const lessonsProgressData = await db
      .select({
        participationId: lessonsProgress.participationId,
        lessonId: lessonsProgress.lessonId,
        finished: lessonsProgress.finished,
      })
      .from(lessonsProgress)
      .where(inArray(lessonsProgress.participationId, participationIds));

    // Получаем все попытки тестов
    const allAttempts = await db
      .select({
        userId: testAttempts.userId,
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
      .where(and(eq(modules.courseId, courseId), inArray(testAttempts.userId, userIds)))
      .orderBy(testAttempts.datetime);

    // Организуем данные для быстрого доступа
    const courseProgressMap = new Map(
      coursesProgressData.map((cp) => [cp.participationId, cp.finished]),
    );
    const moduleProgressMap = new Map();
    modulesProgressData.forEach((mp) => {
      if (!moduleProgressMap.has(mp.participationId)) {
        moduleProgressMap.set(mp.participationId, new Set());
      }
      if (mp.finished) {
        moduleProgressMap.get(mp.participationId).add(mp.moduleId);
      }
    });

    const lessonProgressMap = new Map();
    lessonsProgressData.forEach((lp) => {
      if (!lessonProgressMap.has(lp.participationId)) {
        lessonProgressMap.set(lp.participationId, new Set());
      }
      if (lp.finished) {
        lessonProgressMap.get(lp.participationId).add(lp.lessonId);
      }
    });

    const attemptsMap = new Map();
    allAttempts.forEach((attempt) => {
      if (!attemptsMap.has(attempt.userId)) {
        attemptsMap.set(attempt.userId, new Map());
      }
      if (!attemptsMap.get(attempt.userId).has(attempt.testId)) {
        attemptsMap.get(attempt.userId).set(attempt.testId, []);
      }
      attemptsMap.get(attempt.userId).get(attempt.testId).push(attempt);
    });

    // Формируем результат для каждого студента
    const studentsProgress = participants.map((participant) => {
      const completedLessons = lessonProgressMap.get(participant.participationId) || new Set();
      const completedModules = moduleProgressMap.get(participant.participationId) || new Set();
      const courseCompleted = courseProgressMap.get(participant.participationId) || false;
      const userAttempts = attemptsMap.get(participant.userId) || new Map();

      // Статистика по тестам
      let totalTests = 0;
      let passedTests = 0;
      let totalAttempts = 0;
      let avgScore = 0;
      let scoreSum = 0;
      let completedTestsCount = 0;

      allTests.forEach((test) => {
        totalTests++;
        const testAttempts = userAttempts.get(test.id) || [];
        totalAttempts += testAttempts.length;

        const completedAttempts = (testAttempts as TestAttempt[]).filter(
          (a: TestAttempt) => a.completed,
        );
        if (completedAttempts.length > 0) {
          const bestAttempt = completedAttempts.reduce(
            (best: TestAttempt, current: TestAttempt) => {
              return (current.score || 0) > (best.score || 0) ? current : best;
            },
          );

          if (bestAttempt.score && bestAttempt.totalQuestions) {
            scoreSum += (bestAttempt.score / bestAttempt.totalQuestions) * 100;
            completedTestsCount++;

            // Тест считается пройденным при 60%
            if (bestAttempt.score >= Math.ceil(bestAttempt.totalQuestions * 0.6)) {
              passedTests++;
            }
          }
        }
      });

      avgScore = completedTestsCount > 0 ? Math.round(scoreSum / completedTestsCount) : 0;

      return {
        participationId: participant.participationId,
        userId: participant.userId,
        username: participant.username,
        firstName: participant.firstName,
        lastName: participant.lastName,
        image: participant.image,
        fullName:
          `${participant.firstName || ''} ${participant.lastName || ''}`.trim() ||
          participant.username,
        progress: {
          courseCompleted,
          completedLessons: completedLessons.size,
          totalLessons: allLessons.length,
          completedModules: completedModules.size,
          totalModules: allModules.length,
          overallProgress:
            allLessons.length > 0
              ? Math.round((completedLessons.size / allLessons.length) * 100)
              : 0,
          testsStats: {
            totalTests,
            passedTests,
            totalAttempts,
            avgScore,
            passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
          },
        },
      };
    });

    // Сортируем студентов по прогрессу (сначала с наибольшим прогрессом)
    studentsProgress.sort((a, b) => b.progress.overallProgress - a.progress.overallProgress);

    return {
      courseId,
      courseTitle: course.title,
      students: studentsProgress,
      totalStudents: studentsProgress.length,
      summary: {
        totalModules: allModules.length,
        totalLessons: allLessons.length,
        totalTests: allTests.length,
        avgProgress:
          studentsProgress.length > 0
            ? Math.round(
                studentsProgress.reduce((sum, s) => sum + s.progress.overallProgress, 0) /
                  studentsProgress.length,
              )
            : 0,
        completedStudents: studentsProgress.filter((s) => s.progress.courseCompleted).length,
      },
    };
  } catch (error) {
    console.error('Error getting students progress:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get students progress',
    });
  }
});
