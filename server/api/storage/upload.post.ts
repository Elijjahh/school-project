import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';

const storage = createStorage({
  driver: fsDriver({
    base: './public/uploads',
  }),
});

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);
  if (!form) {
    throw createError({
      statusCode: 400,
      message: 'No file uploaded',
    });
  }

  const file = form.find((f) => f.name === 'file');
  if (!file) {
    throw createError({
      statusCode: 400,
      message: 'No file found in request',
    });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type || '')) {
    throw createError({
      statusCode: 400,
      message: 'Invalid file type. Only JPG, PNG and GIF are allowed',
    });
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.data.length > maxSize) {
    throw createError({
      statusCode: 400,
      message: 'File size exceeds 2MB limit',
    });
  }

  // Generate unique filename
  let extension = 'jpg';
  if (file.filename) {
    const parts = file.filename.split('.');
    if (parts.length > 1) {
      extension = parts[parts.length - 1];
    }
  }
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

  // Save file
  await storage.setItemRaw(filename, file.data);

  // Return the URL
  return {
    url: `/uploads/${filename}`,
  };
});
