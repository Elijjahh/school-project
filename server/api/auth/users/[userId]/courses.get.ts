import { useDrizzle, inArray } from '~/server/utils/drizzle';
import { coursesProgress, lessonsProgress, modules, lessons } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'userId'));

  // Проверяем, что пользователь может просматривать курсы этого пользователя
  const currentUser = getCurrentUser(event);

  // Админ может просматривать курсы любого пользователя, обычный пользователь только свои
  if (currentUser.role !== 'admin' && currentUser.id !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. You can only view your own courses.',
    });
  }

  const db = useDrizzle();

  // Get all participations for the user
  const participations = await db.query.coursesParticipations.findMany({
    where: (cp, { eq }) => eq(cp.userId, userId),
    with: {
      course: {
        with: {
          category: true,
          creator: true,
        },
      },
    },
  });

  if (!participations.length) {
    return [];
  }

  const participationIds = participations.map((p) => p.id);
  const courseIds = participations.map((p) => p.course.id);

  // Get progress for each course
  const coursesProgressData = await db
    .select()
    .from(coursesProgress)
    .where(inArray(coursesProgress.participationId, participationIds));

  // Get all modules for these courses
  const allModules = await db.select().from(modules).where(inArray(modules.courseId, courseIds));

  // Get all lessons for these modules
  const moduleIds = allModules.map((m) => m.id);
  const allLessons = moduleIds.length
    ? await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds))
    : [];

  // Get lessons progress
  const lessonsProgressData = participationIds.length
    ? await db
        .select()
        .from(lessonsProgress)
        .where(inArray(lessonsProgress.participationId, participationIds))
    : [];

  // Calculate progress for each course
  const result = participations.map((participation) => {
    const courseProgress = coursesProgressData.find(
      (cp) => cp.participationId === participation.id,
    );

    // Get modules for this course
    const courseModules = allModules.filter((m) => m.courseId === participation.course.id);
    const courseLessons = allLessons.filter((l) => courseModules.some((m) => m.id === l.moduleId));

    // Calculate progress percentage
    let progressPercentage = 0;
    if (courseLessons.length > 0) {
      const completedLessons = lessonsProgressData.filter(
        (lp) =>
          lp.participationId === participation.id &&
          lp.finished &&
          courseLessons.some((cl) => cl.id === lp.lessonId),
      );
      progressPercentage = Math.round((completedLessons.length / courseLessons.length) * 100);
    }

    return {
      id: participation.course.id,
      image: participation.course.image,
      title: participation.course.title,
      description: participation.course.description,
      completed: courseProgress?.finished || false,
      progress: progressPercentage,
      category: participation.course.category,
      creator: participation.course.creator,
    };
  });

  return result;
});
