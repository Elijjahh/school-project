import { useDrizzle, eq, and, count } from '~/server/utils/drizzle';
import {
  lessons,
  lessonsProgress,
  coursesParticipations,
  modules,
  modulesProgress,
  coursesProgress,
} from '~/drizzle/schema';

export async function updateLessonProgress(lessonId: number, userId: number) {
  const db = useDrizzle();

  // Получаем урок и модуль
  const lesson = await db
    .select({
      id: lessons.id,
      moduleId: lessons.moduleId,
    })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson.length) {
    throw new Error('Lesson not found');
  }

  // Получаем модуль и курс
  const module = await db
    .select({
      id: modules.id,
      courseId: modules.courseId,
    })
    .from(modules)
    .where(eq(modules.id, lesson[0].moduleId))
    .limit(1);

  if (!module.length) {
    throw new Error('Module not found');
  }

  // Получаем участие пользователя в курсе
  const participation = await db
    .select({ id: coursesParticipations.id })
    .from(coursesParticipations)
    .where(
      and(
        eq(coursesParticipations.userId, userId),
        eq(coursesParticipations.courseId, module[0].courseId),
      ),
    )
    .limit(1);

  if (!participation.length) {
    throw new Error('User is not enrolled in this course');
  }

  // Обновляем или создаем прогресс урока
  await db
    .insert(lessonsProgress)
    .values({
      lessonId,
      participationId: participation[0].id,
      finished: true,
    })
    .onConflictDoUpdate({
      target: [lessonsProgress.participationId, lessonsProgress.lessonId],
      set: { finished: true },
    });

  // Проверяем, завершены ли все уроки в модуле
  const allLessonsInModule = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.moduleId, lesson[0].moduleId));

  const completedLessonsInModule = await db
    .select({ count: count() })
    .from(lessonsProgress)
    .innerJoin(lessons, eq(lessonsProgress.lessonId, lessons.id))
    .where(
      and(
        eq(lessons.moduleId, lesson[0].moduleId),
        eq(lessonsProgress.participationId, participation[0].id),
        eq(lessonsProgress.finished, true),
      ),
    );

  // Если все уроки модуля завершены, отмечаем модуль как завершенный
  if (completedLessonsInModule[0].count === allLessonsInModule.length) {
    await db
      .insert(modulesProgress)
      .values({
        moduleId: lesson[0].moduleId,
        participationId: participation[0].id,
        finished: true,
      })
      .onConflictDoUpdate({
        target: [modulesProgress.participationId, modulesProgress.moduleId],
        set: { finished: true },
      });

    // Проверяем, завершены ли все модули в курсе
    const allModulesInCourse = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.courseId, module[0].courseId));

    const completedModulesInCourse = await db
      .select({ count: count() })
      .from(modulesProgress)
      .innerJoin(modules, eq(modulesProgress.moduleId, modules.id))
      .where(
        and(
          eq(modules.courseId, module[0].courseId),
          eq(modulesProgress.participationId, participation[0].id),
          eq(modulesProgress.finished, true),
        ),
      );

    // Если все модули курса завершены, отмечаем курс как завершенный
    if (completedModulesInCourse[0].count === allModulesInCourse.length) {
      // Проверяем, существует ли уже запись о прогрессе курса
      const existingCourseProgress = await db
        .select({ id: coursesProgress.id })
        .from(coursesProgress)
        .where(
          and(
            eq(coursesProgress.courseId, module[0].courseId),
            eq(coursesProgress.participationId, participation[0].id),
          ),
        )
        .limit(1);

      if (existingCourseProgress.length) {
        // Обновляем существующую запись
        await db
          .update(coursesProgress)
          .set({ finished: true })
          .where(eq(coursesProgress.id, existingCourseProgress[0].id));
      } else {
        // Создаем новую запись
        await db.insert(coursesProgress).values({
          courseId: module[0].courseId,
          participationId: participation[0].id,
          finished: true,
        });
      }
    }
  }

  return { success: true, message: 'Progress updated successfully' };
}
