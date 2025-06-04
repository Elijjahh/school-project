import { teacherApplications } from '~/drizzle/schema';

const bodySchema = z.object({
  motivation: z.string().min(10, 'Мотивация должна содержать минимум 10 символов'),
  experience: z.string().optional(),
  education: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const user = getCurrentUser(event);

  // Проверяем, что пользователь является студентом
  if (user.role !== 'student') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only students can apply to become teachers',
    });
  }

  const { motivation, experience, education } = await readValidatedBody(event, bodySchema.parse);

  // Проверяем, есть ли уже заявка от этого пользователя
  const existingApplication = await useDrizzle().query.teacherApplications.findFirst({
    where: (teacherApplications, { eq }) => eq(teacherApplications.userId, user.id),
  });

  if (existingApplication) {
    throw createError({
      statusCode: 409,
      statusMessage: 'You already have a pending application',
    });
  }

  // Создаем новую заявку
  const [application] = await useDrizzle()
    .insert(teacherApplications)
    .values({
      userId: user.id,
      motivation,
      experience,
      education,
    })
    .returning();

  return {
    success: true,
    applicationId: application.id,
    message: 'Заявка успешно подана',
  };
});
