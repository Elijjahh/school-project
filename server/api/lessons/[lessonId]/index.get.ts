export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'lessonId');
  const lesson = await useDrizzle().query.lessons.findFirst({
    where: (lessons, { eq }) => eq(lessons.id, Number(id)),
  });
  return lesson;
});
