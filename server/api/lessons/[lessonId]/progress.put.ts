import { updateLessonProgress } from '~/server/utils/updateLessonProgress';

export default defineEventHandler(async (event) => {
  const lessonId = parseInt(getRouterParam(event, 'lessonId') as string);

  // Используем текущего пользователя вместо принятия userId из тела запроса
  const user = getCurrentUser(event);
  const userId = user.id;

  if (!lessonId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Lesson ID is required',
    });
  }

  try {
    return await updateLessonProgress(lessonId, userId);
  } catch (error) {
    console.error('Error updating lesson progress:', error);

    if (error instanceof Error) {
      if (error.message === 'Lesson not found') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Lesson not found',
        });
      }
      if (error.message === 'Module not found') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Module not found',
        });
      }
      if (error.message === 'User is not enrolled in this course') {
        throw createError({
          statusCode: 404,
          statusMessage: 'User is not enrolled in this course',
        });
      }
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update progress',
    });
  }
});
