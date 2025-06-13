import type { H3Event } from 'h3';
import type { User } from '~/drizzle/types';

/**
 * Проверяет, является ли пользователь администратором
 */
export function requireAdmin(event: H3Event): void {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin role required.',
    });
  }
}

/**
 * Проверяет, является ли пользователь преподавателем или администратором
 */
export function requireTeacherOrAdmin(event: H3Event): void {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (user.role !== 'teacher' && user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Teacher or admin role required.',
    });
  }
}

/**
 * Проверяет, является ли пользователь студентом
 */
export function requireStudent(event: H3Event): void {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (user.role !== 'student') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Student role required.',
    });
  }
}

/**
 * Получает текущего пользователя из контекста
 */
export function getCurrentUser(event: H3Event): Omit<User, 'password'> {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  return user;
}

/**
 * Проверяет, является ли пользователь владельцем ресурса или администратором
 */
export function requireOwnerOrAdmin(event: H3Event, resourceOwnerId: number): void {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (user.role !== 'admin' && user.id !== resourceOwnerId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. You can only access your own resources.',
    });
  }
}

/**
 * Проверяет, является ли пользователь владельцем курса или администратором
 */
export async function requireCourseOwnerOrAdmin(event: H3Event, courseId: number): Promise<void> {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (user.role === 'admin') {
    return; // Админ может делать все
  }

  // Проверяем, является ли пользователь создателем курса
  const course = await useDrizzle().query.courses.findFirst({
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
      statusMessage: 'Access denied. You can only access your own courses.',
    });
  }
}

/**
 * Проверяет, может ли пользователь редактировать модуль (владелец курса или админ)
 */
export async function requireModuleEditAccess(event: H3Event, moduleId: number): Promise<void> {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (user.role === 'admin') {
    return; // Админ может делать все
  }

  // Получаем модуль с информацией о курсе
  const module = await useDrizzle().query.modules.findFirst({
    where: (modules, { eq }) => eq(modules.id, moduleId),
    with: {
      course: {
        columns: { creatorId: true },
      },
    },
  });

  if (!module) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Module not found',
    });
  }

  if (module.course.creatorId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. You can only edit modules in your own courses.',
    });
  }
}

/**
 * Проверяет, может ли пользователь редактировать урок (владелец курса или админ)
 */
export async function requireLessonEditAccess(event: H3Event, lessonId: number): Promise<void> {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (user.role === 'admin') {
    return; // Админ может делать все
  }

  // Получаем урок с информацией о модуле и курсе
  const lesson = await useDrizzle().query.lessons.findFirst({
    where: (lessons, { eq }) => eq(lessons.id, lessonId),
    with: {
      module: {
        with: {
          course: {
            columns: { creatorId: true },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Lesson not found',
    });
  }

  if (lesson.module.course.creatorId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. You can only edit lessons in your own courses.',
    });
  }
}

/**
 * Проверяет, может ли пользователь редактировать тест (владелец урока/курса или админ)
 */
export async function requireTestEditAccess(event: H3Event, testId: number): Promise<void> {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (user.role === 'admin') {
    return; // Админ может делать все
  }

  // Получаем тест с информацией об уроке, модуле и курсе
  const test = await useDrizzle().query.tests.findFirst({
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
