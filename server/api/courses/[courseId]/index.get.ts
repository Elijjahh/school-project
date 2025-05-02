export default defineEventHandler(async (event) => {
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const db = useDrizzle();
  const user = event.context.user;

  // Get course with category and teacher
  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, courseId),
    with: {
      category: true,
      creator: true,
    },
  });
  if (!course) {
    throw createError({ statusCode: 404, message: 'Курс с таким id не найден' });
  }

  // Get modules and lessons
  const dbModules = await db.query.modules.findMany({
    where: (m, { eq }) => eq(m.courseId, courseId),
    orderBy: (m, { asc }) => asc(m.order),
  });
  const moduleIds = dbModules.map((m) => m.id);
  const dbLessons = moduleIds.length
    ? await db.query.lessons.findMany({
        where: (l, { inArray }) => inArray(l.moduleId, moduleIds),
        orderBy: (l, { asc }) => asc(l.order),
      })
    : [];

  const modulesWithLessons = dbModules.map((mod) => ({
    id: mod.id,
    title: mod.title,
    order: mod.order,
    lessons: dbLessons
      .filter((l) => l.moduleId === mod.id)
      .map((l) => ({ id: l.id, title: l.title, order: l.order })),
  }));

  // Participation and wishlist state for current user
  let isParticipating = false;
  let isInWishlist = false;
  if (user) {
    const participation = await db.query.coursesParticipations.findFirst({
      where: (cp, { and, eq }) => and(eq(cp.userId, user.id), eq(cp.courseId, courseId)),
    });
    isParticipating = !!participation;
    const wishlistItem = await db.query.wishlist.findFirst({
      where: (w, { and, eq }) => and(eq(w.userId, user.id), eq(w.courseId, courseId)),
    });
    isInWishlist = !!wishlistItem;
  }

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    image: course.image,
    category: course.category,
    teacher: {
      id: course.creator.id,
      firstname: course.creator.firstname,
      lastname: course.creator.lastname,
      image: course.creator.image,
    },
    modules: modulesWithLessons,
    isParticipating,
    isInWishlist,
  };
});
