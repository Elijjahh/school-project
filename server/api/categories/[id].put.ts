import { categories } from '~/drizzle/schema';
import { eq } from 'drizzle-orm';

const bodySchema = z.object({
  name: z.string().min(1, 'Название категории обязательно'),
  description: z.string().optional(),
  image: z.string().url('Некорректный URL изображения').optional(),
});

export default defineEventHandler(async (event) => {
  // Проверяем, что пользователь является администратором
  requireAdmin(event);

  const categoryId = parseInt(getRouterParam(event, 'id') as string);
  const { name, description, image } = await readValidatedBody(event, bodySchema.parse);

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

  // Проверяем, не существует ли другая категория с таким же названием
  const duplicateCategory = await useDrizzle().query.categories.findFirst({
    where: (categories, { and, eq, ne }) =>
      and(eq(categories.name, name), ne(categories.id, categoryId)),
  });

  if (duplicateCategory) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Category with this name already exists',
    });
  }

  // Обновляем категорию
  const [updatedCategory] = await useDrizzle()
    .update(categories)
    .set({
      name,
      description,
      image,
    })
    .where(eq(categories.id, categoryId))
    .returning();

  return {
    success: true,
    category: updatedCategory,
    message: 'Категория успешно обновлена',
  };
});
