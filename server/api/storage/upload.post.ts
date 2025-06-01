import { createStorage } from 'unstorage';
import s3Driver from 'unstorage/drivers/s3';
import type { H3Error } from 'h3';

const isDevelopment = process.env.NODE_ENV !== 'production';

const storage = createStorage({
  driver: s3Driver({
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
    endpoint:
      process.env.S3_ENDPOINT || (isDevelopment ? 'http://localhost:9000' : 'http://minio:9000'),
    bucket: process.env.S3_BUCKET || 'uploads',
    region: process.env.S3_REGION || 'us-east-1',
  }),
});

export default defineEventHandler(async (event) => {
  try {
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
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (!allowedTypes.includes(file.type || '')) {
      throw createError({
        statusCode: 400,
        message:
          'Invalid file type. Only JPG, PNG, GIF images and MP4, WebM, OGG videos are allowed',
      });
    }

    // Validate file size based on type
    const isVideo = allowedVideoTypes.includes(file.type || '');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 2 * 1024 * 1024; // 100MB for videos, 2MB for images

    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        message: `File size exceeds ${isVideo ? '100MB' : '2MB'} limit`,
      });
    }

    // Generate a unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.filename?.split('.').pop()}`;

    // Try to upload the file
    try {
      await storage.setItemRaw(filename, file.data);
    } catch (error: unknown) {
      // If the error is about the bucket not existing, try to create it
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('NoSuchBucket') || errorMessage.includes('bucket does not exist')) {
        // Create the bucket by making a PUT request
        const response = await fetch(
          `${process.env.S3_ENDPOINT || (isDevelopment ? 'http://localhost:9000' : 'http://minio:9000')}/${process.env.S3_BUCKET || 'uploads'}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `AWS4-HMAC-SHA256 Credential=${process.env.S3_ACCESS_KEY || 'minioadmin'}/20250429/us-east-1/s3/aws4_request,SignedHeaders=host;x-amz-date,Signature=0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a`,
              'x-amz-date': '20250429T000000Z',
            },
          },
        );

        if (!response.ok) {
          throw createError({
            statusCode: 500,
            message: 'Failed to create bucket. Please check your MinIO configuration.',
          });
        }

        // Retry the upload after creating the bucket
        await storage.setItemRaw(filename, file.data);
      } else {
        throw error;
      }
    }

    return {
      url: `${process.env.S3_ENDPOINT || (isDevelopment ? 'http://localhost:9000' : 'http://minio:9000')}/${process.env.S3_BUCKET || 'uploads'}/${filename}`,
    };
  } catch (error: unknown) {
    console.error('Upload handler error:', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error as H3Error;
    }
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred during file upload',
    });
  }
});
