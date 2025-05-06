export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'userId'));
  const db = useDrizzle();

  // Get all courses where the user is the creator (teacher)
  const courses = await db.query.courses.findMany({
    where: (courses, { eq }) => eq(courses.creatorId, userId),
    columns: { id: true },
  });
  const courseIds = courses.map((c) => c.id);

  let studentsCount = 0;
  let finishedParticipations = 0;

  if (courseIds.length > 0) {
    // Count all participations (students) in teacher's courses
    const [students] = await db
      .select({ count: count() })
      .from(tables.coursesParticipations)
      .where(inArray(tables.coursesParticipations.courseId, courseIds));
    studentsCount = students.count;

    // Count all finished participations in teacher's courses
    const [finished] = await db
      .select({ count: count() })
      .from(tables.coursesProgress)
      .where(
        and(
          eq(tables.coursesProgress.finished, true),
          inArray(tables.coursesProgress.courseId, courseIds),
        ),
      );
    finishedParticipations = finished.count;
  }

  return {
    studentsCount,
    coursesCount: courseIds.length,
    finishedParticipations,
  };
});
