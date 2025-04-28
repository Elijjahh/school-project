import { wishlist } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  const { courseId } = await getValidatedRouterParams(
    event,
    z.object({
      courseId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  // Delete from wishlist
  await useDrizzle()
    .delete(wishlist)
    .where(and(eq(wishlist.userId, user.id), eq(wishlist.courseId, courseId)));

  return { success: true };
});
