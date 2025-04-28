import { wishlist } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  const { courseId } = await readBody(event);

  if (!courseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Course ID is required',
    });
  }

  // Check if course exists
  const course = await useDrizzle().query.courses.findFirst({
    where: (courses, { eq }) => eq(courses.id, courseId),
  });

  if (!course) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Course not found',
    });
  }

  // Check if already in wishlist
  const existingItem = await useDrizzle().query.wishlist.findFirst({
    where: (wishlist, { and, eq }) =>
      and(eq(wishlist.userId, user.id), eq(wishlist.courseId, courseId)),
  });

  if (existingItem) {
    return { success: true, existingItem };
  }

  // Add to wishlist
  const wishlistItem = await useDrizzle().insert(wishlist).values({
    userId: user.id,
    courseId,
  });

  return { success: true, wishlistItem };
});
