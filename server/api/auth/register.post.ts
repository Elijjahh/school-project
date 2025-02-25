import { prisma } from '~/server/db';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw createError({ statusCode: 400, message: 'Пользователь уже существует' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  await setUserSession(event, {
    user: {
      login: newUser.username,
    },
    secure: {
      apiToken: '1234567890',
    },
    loggedInAt: new Date(),
  });

  return { success: true };
});
