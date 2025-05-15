export default defineEventHandler(async (event) => {
  const { moduleId } = await getValidatedRouterParams(
    event,
    z.object({
      moduleId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const db = useDrizzle();

  // Получаем сам модуль
  const module = await db.query.modules.findFirst({
    where: (modules, { eq }) => eq(modules.id, moduleId),
  });

  if (!module)
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Модуль с таким id не найден',
    });

  // Получаем уроки, связанные с этим модулем
  const lessons = await db.query.lessons.findMany({
    where: (lessons, { eq }) => eq(lessons.moduleId, moduleId),
    orderBy: (lessons, { asc }) => asc(lessons.order),
  });

  return {
    ...module,
    lessons,
  };
});
