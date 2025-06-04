import { categories } from '~/drizzle/schema';

const bodySchema = z.object({
  name: z.string().min(1, 'Название категории обязательно'),
  description: z.string().optional(),
  image: z.string().url('Некорректный URL изображения').optional(),
});

export default defineEventHandler(async (event) => {
  // Проверяем, что пользователь является администратором
  requireAdmin(event);

  const { name, description, image } = await readValidatedBody(event, bodySchema.parse);

  // Проверяем, существует ли уже категория с таким названием
  const existingCategory = await useDrizzle().query.categories.findFirst({
    where: (categories, { eq }) => eq(categories.name, name),
  });

  if (existingCategory) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Category with this name already exists',
    });
  }

  // Создаем новую категорию
  const [category] = await useDrizzle()
    .insert(categories)
    .values({
      name,
      description,
      image,
    })
    .returning();

  return {
    success: true,
    category,
    message: 'Категория успешно создана',
  };
});
