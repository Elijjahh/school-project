export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'userId'));
  const db = useDrizzle();

  // Enrolled courses
  const [enrolledCourses] = await db
    .select({ count: count() })
    .from(tables.coursesParticipations)
    .where(eq(tables.coursesParticipations.userId, userId));

  // Completed courses
  const [completedCourses] = await db
    .select({ count: count() })
    .from(tables.coursesProgress)
    .where(
      and(
        eq(tables.coursesProgress.finished, true),
        eq(tables.coursesProgress.participationId, userId),
      ),
    );

  // Active courses (enrolled but not finished)
  const [activeCourses] = await db
    .select({ count: count() })
    .from(tables.coursesProgress)
    .where(
      and(
        eq(tables.coursesProgress.finished, false),
        eq(tables.coursesProgress.participationId, userId),
      ),
    );

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
    enrolledCourses: enrolledCourses.count,
    activeCourses: activeCourses.count,
    completedCourses: completedCourses.count,
    instructors,
  };
});
