import { users, courses, coursesParticipations, testAttempts } from '~/drizzle/schema';
import { eq, count } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  // Только админы могут удалять пользователей
  requireAdmin(event);

  const userId = parseInt(getRouterParam(event, 'userId') as string);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    });
  }

  // Проверяем существование пользователя
  const existingUser = await useDrizzle().query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    });
  }

  try {
    // Проверяем связанные записи
    const [coursesCount, participationsCount, attemptsCount] = await Promise.all([
      useDrizzle().select({ count: count() }).from(courses).where(eq(courses.creatorId, userId)),
      useDrizzle()
        .select({ count: count() })
        .from(coursesParticipations)
        .where(eq(coursesParticipations.userId, userId)),
      useDrizzle()
        .select({ count: count() })
        .from(testAttempts)
        .where(eq(testAttempts.userId, userId)),
    ]);

    const totalCourses = coursesCount[0].count;
    const totalParticipations = participationsCount[0].count;
    const totalAttempts = attemptsCount[0].count;

    if (totalCourses > 0 || totalParticipations > 0 || totalAttempts > 0) {
      const reasons = [];
      if (totalCourses > 0) reasons.push(`создал ${totalCourses} курс(ов)`);
      if (totalParticipations > 0) reasons.push(`участвует в ${totalParticipations} курс(ах)`);
      if (totalAttempts > 0) reasons.push(`имеет ${totalAttempts} попыт(ок) прохождения тестов`);

      throw createError({
        statusCode: 409,
        statusMessage: `Невозможно удалить пользователя: ${reasons.join(', ')}`,
      });
    }

    const deletedUser = await useDrizzle().delete(users).where(eq(users.id, userId)).returning();

    return deletedUser[0];
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 409) {
      throw error;
    }

    throw createError({
      statusCode: 409,
      statusMessage: 'Невозможно удалить пользователя: есть связанные данные',
    });
  }
});
