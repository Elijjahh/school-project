import { useDrizzle, eq, and, inArray, count } from '~/server/utils/drizzle';
import * as tables from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'userId'));

  // Проверяем, что пользователь может просматривать эту статистику
  const currentUser = getCurrentUser(event);

  // Админ может просматривать статистику любого пользователя, обычный пользователь только свою
  if (currentUser.role !== 'admin' && currentUser.id !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. You can only view your own statistics.',
    });
  }

  const db = useDrizzle();

  // Enrolled courses - получаем все участия пользователя
  const userParticipations = await db
    .select({
      participationId: tables.coursesParticipations.id,
      courseId: tables.coursesParticipations.courseId,
    })
    .from(tables.coursesParticipations)
    .where(eq(tables.coursesParticipations.userId, userId));

  const enrolledCoursesCount = userParticipations.length;

  if (enrolledCoursesCount === 0) {
    return {
      enrolledCourses: 0,
      activeCourses: 0,
      completedCourses: 0,
      instructors: 0,
    };
  }

  const participationIds = userParticipations.map((p) => p.participationId);

  // Completed courses - курсы где есть запись о завершении
  const [completedCourses] = await db
    .select({ count: count() })
    .from(tables.coursesProgress)
    .where(
      and(
        eq(tables.coursesProgress.finished, true),
        inArray(tables.coursesProgress.participationId, participationIds),
      ),
    );

  // Active courses - курсы где нет записи о завершении или завершение = false
  const completedParticipationIds = await db
    .select({ participationId: tables.coursesProgress.participationId })
    .from(tables.coursesProgress)
    .where(
      and(
        eq(tables.coursesProgress.finished, true),
        inArray(tables.coursesProgress.participationId, participationIds),
      ),
    );

  const completedParticipationIdsSet = new Set(
    completedParticipationIds.map((cp) => cp.participationId),
  );
  const activeCourses = enrolledCoursesCount - completedParticipationIdsSet.size;

  // Instructors (unique creators of user's courses)
  const instructorRows = await db.query.coursesParticipations.findMany({
    where: (cp, { eq }) => eq(cp.userId, userId),
    with: {
      course: {
        columns: { creatorId: true },
      },
    },
  });
  const instructorIds = Array.from(new Set(instructorRows.map((row) => row.course.creatorId)));
  const instructors = instructorIds.length;

  return {
    enrolledCourses: enrolledCoursesCount,
    activeCourses: activeCourses,
    completedCourses: completedCourses.count,
    instructors,
  };
});
