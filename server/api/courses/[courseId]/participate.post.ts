import { coursesParticipations, coursesProgress } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const db = useDrizzle();

  // Check if already participating
  const existing = await db.query.coursesParticipations.findFirst({
    where: (cp, { and, eq }) => and(eq(cp.userId, user.id), eq(cp.courseId, courseId)),
  });

  // Check if in wishlist
  const inWishlist = await db.query.wishlist.findFirst({
    where: (w, { and, eq }) => and(eq(w.userId, user.id), eq(w.courseId, courseId)),
  });

  if (existing) {
    return {
      success: true,
      participation: existing,
      alreadyParticipating: true,
      inWishlist: !!inWishlist,
    };
  }

  // Create participation
  const [participation] = await db
    .insert(coursesParticipations)
    .values({
      userId: user.id,
      courseId,
    })
    .returning();

  // Create initial course progress
  await db.insert(coursesProgress).values({
    courseId,
    participationId: participation.id,
    finished: false,
  });

  return { success: true, participation, inWishlist: !!inWishlist };
});
