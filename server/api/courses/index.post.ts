import { courses } from '~/drizzle/schema';

const bodySchema = z.object({
  title: z.string(),
  description: z.string(),
  categoryId: z.number(),
  image: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  // Проверяем, что пользователь является преподавателем или администратором
  requireTeacherOrAdmin(event);

  const user = getCurrentUser(event);

  const { title, description, categoryId, image } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const result = await useDrizzle()
    .insert(courses)
    .values({
      title,
      description,
      creatorId: user.id, // Используем ID текущего пользователя
      categoryId,
      image,
    })
    .returning();
  return result[0];
});
