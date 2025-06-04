import { useDrizzle, eq, and, inArray, count } from '~/server/utils/drizzle';
import { asc } from 'drizzle-orm';
import {
  modules,
  lessons,
  coursesParticipations,
  modulesProgress,
  lessonsProgress,
  tests,
  testAttempts,
  questions,
} from '~/drizzle/schema';

interface TestAnalytics {
  testId: number;
  title: string;
  order: number;
  maxAttempts: number;
  totalStudents: number;
  studentsAttempted: number;
  studentsCompleted: number;
  studentsPassedRate: number;
  avgScore: number;
  avgAttempts: number;
  completionRate: number;
  passRate: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

interface LessonAnalytics {
  lessonId: number;
  title: string;
  order: number;
  totalStudents: number;
  studentsCompleted: number;
  completionRate: number;
  tests: TestAnalytics[];
  avgTestScore: number;
  hasTests: boolean;
}

interface ModuleAnalytics {
  moduleId: number;
  title: string;
  order: number;
  totalStudents: number;
  studentsCompleted: number;
  completionRate: number;
  lessons: LessonAnalytics[];
  avgLessonCompletion: number;
  avgTestScore: number;
  totalTests: number;
}

interface ContentAnalyticsData {
  courseId: number;
  courseTitle: string;
  totalStudents: number;
  modules: ModuleAnalytics[];
  summary: {
    totalModules: number;
    totalLessons: number;
    totalTests: number;
    avgModuleCompletion: number;
    avgLessonCompletion: number;
    avgTestCompletion: number;
    avgTestScore: number;
    mostDifficultContent: {
      type: 'module' | 'lesson' | 'test';
      id: number;
      title: string;
      completionRate: number;
    };
    easiestContent: {
      type: 'module' | 'lesson' | 'test';
      id: number;
      title: string;
      completionRate: number;
    };
  };
}

export default defineEventHandler(async (event): Promise<ContentAnalyticsData> => {
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
      })
      .from(coursesParticipations)
      .where(eq(coursesParticipations.courseId, courseId));

    const totalStudents = participants.length;
    const participationIds = participants.map((p) => p.participationId);
    const userIds = participants.map((p) => p.userId);

    if (!totalStudents) {
      return {
        courseId,
        courseTitle: course.title,
        totalStudents: 0,
        modules: [],
        summary: {
          totalModules: 0,
          totalLessons: 0,
          totalTests: 0,
          avgModuleCompletion: 0,
          avgLessonCompletion: 0,
          avgTestCompletion: 0,
          avgTestScore: 0,
          mostDifficultContent: { type: 'module', id: 0, title: '', completionRate: 0 },
          easiestContent: { type: 'module', id: 0, title: '', completionRate: 0 },
        },
      };
    }

    // Получаем структуру курса
    const allModules = await db
      .select({
        id: modules.id,
        title: modules.title,
        order: modules.order,
      })
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.order));

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
      .orderBy(asc(modules.order), asc(lessons.order));

    const allTests = await db
      .select({
        id: tests.id,
        lessonId: tests.lessonId,
        maxAttempts: tests.maxAttempts,
        questionsCount: count(questions.id),
      })
      .from(tests)
      .innerJoin(lessons, eq(tests.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .leftJoin(questions, eq(questions.testId, tests.id))
      .where(eq(modules.courseId, courseId))
      .groupBy(tests.id, tests.lessonId, tests.maxAttempts)
      .orderBy(asc(tests.id));

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
      .orderBy(asc(testAttempts.datetime));

    // Создаем мапы для быстрого доступа
    const moduleProgressMap = new Map<number, number>();
    modulesProgressData.forEach((mp) => {
      if (mp.finished) {
        moduleProgressMap.set(mp.moduleId, (moduleProgressMap.get(mp.moduleId) || 0) + 1);
      }
    });

    const lessonProgressMap = new Map<number, number>();
    lessonsProgressData.forEach((lp) => {
      if (lp.finished) {
        lessonProgressMap.set(lp.lessonId, (lessonProgressMap.get(lp.lessonId) || 0) + 1);
      }
    });

    // Анализ тестов
    const testAttemptsMap = new Map<number, typeof allAttempts>();
    allAttempts.forEach((attempt) => {
      if (!testAttemptsMap.has(attempt.testId)) {
        testAttemptsMap.set(attempt.testId, []);
      }
      testAttemptsMap.get(attempt.testId)!.push(attempt);
    });

    // Формируем аналитику по тестам
    const testsAnalytics = new Map<number, TestAnalytics>();
    allTests.forEach((test) => {
      const attempts = testAttemptsMap.get(test.id) || [];
      const uniqueUserAttempts = new Map<number, typeof allAttempts>();

      attempts.forEach((attempt) => {
        if (!uniqueUserAttempts.has(attempt.userId)) {
          uniqueUserAttempts.set(attempt.userId, []);
        }
        uniqueUserAttempts.get(attempt.userId)!.push(attempt);
      });

      const studentsAttempted = uniqueUserAttempts.size;
      let studentsCompleted = 0;
      let studentsPassedCount = 0;
      let totalScore = 0;
      let totalAttempts = 0;

      uniqueUserAttempts.forEach((userAttempts) => {
        totalAttempts += userAttempts.length;
        const completed = userAttempts.filter((a) => a.completed);
        if (completed.length > 0) {
          studentsCompleted++;
          const bestAttempt = completed.reduce((best, current) => {
            return (current.score || 0) > (best.score || 0) ? current : best;
          });
          if (bestAttempt.score !== null && bestAttempt.totalQuestions) {
            totalScore += (bestAttempt.score / bestAttempt.totalQuestions) * 100;
            if (bestAttempt.score >= Math.ceil(bestAttempt.totalQuestions * 0.6)) {
              studentsPassedCount++;
            }
          }
        }
      });

      const completionRate = totalStudents > 0 ? (studentsCompleted / totalStudents) * 100 : 0;
      const passRate = studentsCompleted > 0 ? (studentsPassedCount / studentsCompleted) * 100 : 0;
      const avgScore = studentsCompleted > 0 ? totalScore / studentsCompleted : 0;
      const avgAttempts = studentsAttempted > 0 ? totalAttempts / studentsAttempted : 0;

      // Определяем уровень сложности
      let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
      if (completionRate >= 80 && avgScore >= 80) {
        difficultyLevel = 'easy';
      } else if (completionRate <= 50 || avgScore <= 60) {
        difficultyLevel = 'hard';
      }

      testsAnalytics.set(test.id, {
        testId: test.id,
        title: `Тест ${test.id}`,
        order: test.id,
        maxAttempts: test.maxAttempts,
        totalStudents,
        studentsAttempted,
        studentsCompleted,
        studentsPassedRate: passRate,
        avgScore: Math.round(avgScore),
        avgAttempts: Math.round(avgAttempts * 10) / 10,
        completionRate: Math.round(completionRate),
        passRate: Math.round(passRate),
        difficultyLevel,
      });
    });

    // Формируем аналитику по урокам
    const lessonsAnalytics = new Map<number, LessonAnalytics>();
    allLessons.forEach((lesson) => {
      const studentsCompleted = lessonProgressMap.get(lesson.id) || 0;
      const completionRate = totalStudents > 0 ? (studentsCompleted / totalStudents) * 100 : 0;

      const lessonTests = allTests
        .filter((test) => test.lessonId === lesson.id)
        .map((test) => testsAnalytics.get(test.id)!)
        .filter(Boolean);

      const avgTestScore =
        lessonTests.length > 0
          ? lessonTests.reduce((sum, test) => sum + test.avgScore, 0) / lessonTests.length
          : 0;

      lessonsAnalytics.set(lesson.id, {
        lessonId: lesson.id,
        title: lesson.title,
        order: lesson.order,
        totalStudents,
        studentsCompleted,
        completionRate: Math.round(completionRate),
        tests: lessonTests,
        avgTestScore: Math.round(avgTestScore),
        hasTests: lessonTests.length > 0,
      });
    });

    // Формируем аналитику по модулям
    const modulesAnalytics: ModuleAnalytics[] = allModules.map((module) => {
      const studentsCompleted = moduleProgressMap.get(module.id) || 0;
      const completionRate = totalStudents > 0 ? (studentsCompleted / totalStudents) * 100 : 0;

      const moduleLessons = allLessons
        .filter((lesson) => lesson.moduleId === module.id)
        .map((lesson) => lessonsAnalytics.get(lesson.id)!)
        .filter(Boolean);

      const avgLessonCompletion =
        moduleLessons.length > 0
          ? moduleLessons.reduce((sum, lesson) => sum + lesson.completionRate, 0) /
            moduleLessons.length
          : 0;

      const allModuleTests = moduleLessons.flatMap((lesson) => lesson.tests);
      const avgTestScore =
        allModuleTests.length > 0
          ? allModuleTests.reduce((sum, test) => sum + test.avgScore, 0) / allModuleTests.length
          : 0;

      return {
        moduleId: module.id,
        title: module.title,
        order: module.order,
        totalStudents,
        studentsCompleted,
        completionRate: Math.round(completionRate),
        lessons: moduleLessons,
        avgLessonCompletion: Math.round(avgLessonCompletion),
        avgTestScore: Math.round(avgTestScore),
        totalTests: allModuleTests.length,
      };
    });

    // Вычисляем общую сводку
    const allContentItems = [
      ...modulesAnalytics.map((m) => ({
        type: 'module' as const,
        id: m.moduleId,
        title: m.title,
        completionRate: m.completionRate,
      })),
      ...Array.from(lessonsAnalytics.values()).map((l) => ({
        type: 'lesson' as const,
        id: l.lessonId,
        title: l.title,
        completionRate: l.completionRate,
      })),
      ...Array.from(testsAnalytics.values()).map((t) => ({
        type: 'test' as const,
        id: t.testId,
        title: t.title,
        completionRate: t.completionRate,
      })),
    ];

    const mostDifficult = allContentItems.reduce(
      (min, item) => (item.completionRate < min.completionRate ? item : min),
      allContentItems[0] || { type: 'module' as const, id: 0, title: '', completionRate: 100 },
    );

    const easiest = allContentItems.reduce(
      (max, item) => (item.completionRate > max.completionRate ? item : max),
      allContentItems[0] || { type: 'module' as const, id: 0, title: '', completionRate: 0 },
    );

    const avgModuleCompletion =
      modulesAnalytics.length > 0
        ? modulesAnalytics.reduce((sum, m) => sum + m.completionRate, 0) / modulesAnalytics.length
        : 0;

    const avgLessonCompletion =
      Array.from(lessonsAnalytics.values()).length > 0
        ? Array.from(lessonsAnalytics.values()).reduce((sum, l) => sum + l.completionRate, 0) /
          Array.from(lessonsAnalytics.values()).length
        : 0;

    const avgTestCompletion =
      Array.from(testsAnalytics.values()).length > 0
        ? Array.from(testsAnalytics.values()).reduce((sum, t) => sum + t.completionRate, 0) /
          Array.from(testsAnalytics.values()).length
        : 0;

    const avgTestScore =
      Array.from(testsAnalytics.values()).length > 0
        ? Array.from(testsAnalytics.values()).reduce((sum, t) => sum + t.avgScore, 0) /
          Array.from(testsAnalytics.values()).length
        : 0;

    return {
      courseId,
      courseTitle: course.title,
      totalStudents,
      modules: modulesAnalytics,
      summary: {
        totalModules: allModules.length,
        totalLessons: allLessons.length,
        totalTests: allTests.length,
        avgModuleCompletion: Math.round(avgModuleCompletion),
        avgLessonCompletion: Math.round(avgLessonCompletion),
        avgTestCompletion: Math.round(avgTestCompletion),
        avgTestScore: Math.round(avgTestScore),
        mostDifficultContent: mostDifficult,
        easiestContent: easiest,
      },
    };
  } catch (error) {
    console.error('Error getting content analytics:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get content analytics',
    });
  }
});
