import { z } from 'zod';
import bcrypt from 'bcryptjs';

const bodySchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { username, password } = await readValidatedBody(event, bodySchema.parse);

  const user = await useDrizzle().query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
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
