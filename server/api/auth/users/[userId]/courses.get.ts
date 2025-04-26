export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'userId'));
  const db = useDrizzle();

  // Get all participations for the user
  const participations = await db.query.coursesParticipations.findMany({
    where: (cp, { eq }) => eq(cp.userId, userId),
    with: {
      course: true,
    },
  });

  // Get progress for each participation
  const progresses = await db.query.coursesProgress.findMany({
    where: (cp, { eq }) => eq(cp.participationId, userId),
  });

  // Map participation to course info and progress
  const result = participations.map((p) => {
    const progress = progresses.find((pr) => pr.courseId === p.course.id);
    return {
      id: p.course.id,
      image: p.course.image,
      title: p.course.title,
      description: p.course.description,
      completed: progress ? progress.finished : false,
      progress: null, // You can calculate percent if you have more info
    };
  });

  return result;
});
