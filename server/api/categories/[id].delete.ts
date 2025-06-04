import { categories } from '~/drizzle/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  // Проверяем, что пользователь является администратором
  requireAdmin(event);

  const categoryId = parseInt(getRouterParam(event, 'id') as string);

  if (!categoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required',
    });
  }

  // Проверяем, существует ли категория
  const existingCategory = await useDrizzle().query.categories.findFirst({
    where: eq(categories.id, categoryId),
  });

  if (!existingCategory) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found',
    });
  }

  // Проверяем, используется ли категория в каких-либо курсах
  const coursesWithCategory = await useDrizzle().query.courses.findMany({
    where: (courses, { eq }) => eq(courses.categoryId, categoryId),
    columns: { id: true },
  });

  if (coursesWithCategory.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Cannot delete category that is used by existing courses',
    });
  }

  // Удаляем категорию
  await useDrizzle().delete(categories).where(eq(categories.id, categoryId));

  return {
    success: true,
    message: 'Категория успешно удалена',
  };
});
