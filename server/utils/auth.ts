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
