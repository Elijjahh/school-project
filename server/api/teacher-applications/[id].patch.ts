import { teacherApplications, users } from '~/drizzle/schema';
import { eq } from 'drizzle-orm';

const bodySchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminComment: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  // Проверяем, что пользователь является администратором
  requireAdmin(event);

  const applicationId = parseInt(getRouterParam(event, 'id') as string);
  const { status, adminComment } = await readValidatedBody(event, bodySchema.parse);

  if (!applicationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Application ID is required',
    });
  }

  // Получаем заявку
  const application = await useDrizzle().query.teacherApplications.findFirst({
    where: eq(teacherApplications.id, applicationId),
    with: {
      user: true,
    },
  });

  if (!application) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Application not found',
    });
  }

  if (application.status !== 'pending') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Application has already been processed',
    });
  }

  const db = useDrizzle();

  // Обновляем статус заявки
  await db
    .update(teacherApplications)
    .set({
      status,
      adminComment,
      updatedAt: new Date(),
    })
    .where(eq(teacherApplications.id, applicationId));

  // Если заявка одобрена, обновляем роль пользователя
  if (status === 'approved') {
    await db
      .update(users)
      .set({
        role: 'teacher',
      })
      .where(eq(users.id, application.userId));
  }

  return {
    success: true,
    message:
      status === 'approved'
        ? 'Заявка одобрена, пользователь получил роль преподавателя'
        : 'Заявка отклонена',
  };
});
