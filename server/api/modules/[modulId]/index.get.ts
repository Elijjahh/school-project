export default defineEventHandler(async (event) => {
  const { moduleId } = await getValidatedRouterParams(
    event,
    z.object({
      moduleId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const module = await useDrizzle().query.modules.findFirst({
    where: (modules, { eq }) => eq(modules.id, moduleId),
  });

  if (!module)
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Модуль с таким id не найден',
    });

  return module;
});
