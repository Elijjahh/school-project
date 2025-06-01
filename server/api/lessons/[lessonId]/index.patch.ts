import { lessons } from '~/drizzle/schema';

const bodySchema = z.object({
  moduleId: z.number(),
  title: z.string(),
  content: z.string(),
  videoUrl: z.string().optional().nullable(),
  order: z.number(),
});

export default defineEventHandler(async (event) => {
  const { lessonId } = await getValidatedRouterParams(
    event,
    z.object({
      lessonId: z.number({ coerce: true }).int().positive(),
    }).parse,
  );

  const { moduleId, title, content, videoUrl, order } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  // Handle videoUrl explicitly - if undefined or null, set to null
  const processedVideoUrl = videoUrl === undefined ? null : videoUrl;

  const result = await useDrizzle()
    .update(lessons)
    .set({ moduleId, title, content, videoUrl: processedVideoUrl, order })
    .where(eq(lessons.id, lessonId))
    .returning();

  return result[0];
});
