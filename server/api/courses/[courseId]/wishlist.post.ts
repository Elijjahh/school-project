import { wishlist } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );
  const db = useDrizzle();

  // Check if already in wishlist
  const existing = await db.query.wishlist.findFirst({
    where: (w, { and, eq }) => and(eq(w.userId, user.id), eq(w.courseId, courseId)),
  });
  if (existing) {
    return { success: true, wishlistItem: existing, alreadyInWishlist: true };
  }

  // Add to wishlist
  const [wishlistItem] = await db
    .insert(wishlist)
    .values({
      userId: user.id,
      courseId,
    })
    .returning();
  return { success: true, wishlistItem };
});
