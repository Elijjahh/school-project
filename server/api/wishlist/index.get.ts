export default defineEventHandler(async (event) => {
  const user = event.context.user;

  const wishlistItems = await useDrizzle().query.wishlist.findMany({
    where: (wishlist, { eq }) => eq(wishlist.userId, user.id),
    with: {
      course: true,
    },
  });

  return wishlistItems.map((item) => item.course);
});
