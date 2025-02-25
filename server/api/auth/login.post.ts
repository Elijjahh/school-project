import { z } from 'zod';
import { prisma } from '~/server/db';
import bcrypt from 'bcryptjs';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Неверные учетные данные',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      message: 'Неверные учетные данные',
    });
  }

  await setUserSession(event, {
    user: {
      name: user.username,
    },
  });

  return {};
});
