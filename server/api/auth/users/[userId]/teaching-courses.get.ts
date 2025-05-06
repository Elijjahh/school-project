export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'userId'));
  const db = useDrizzle();

  // Get all courses where the user is the creator (teacher)
  const courses = await db.query.courses.findMany({
    where: (courses, { eq }) => eq(courses.creatorId, userId),
    with: {
      category: true,
      creator: {
        columns: { id: true, username: true, firstname: true, lastname: true, image: true },
      },
    },
  });

  // Get students count for each course
  const courseIds = courses.map((c) => c.id);
  let studentsCounts: Record<number, number> = {};
  if (courseIds.length > 0) {
    const studentsCountsRaw = await db
      .select({ courseId: tables.coursesParticipations.courseId, count: count() })
      .from(tables.coursesParticipations)
      .where(inArray(tables.coursesParticipations.courseId, courseIds))
      .groupBy(tables.coursesParticipations.courseId);
    studentsCounts = Object.fromEntries(studentsCountsRaw.map((row) => [row.courseId, row.count]));
  }

  // Format the data for the frontend
  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    image: c.image,
    category: c.category?.name,
    creator: c.creator,
    studentsCount: studentsCounts[c.id] || 0,
  }));
});
