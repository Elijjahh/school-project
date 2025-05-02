import { courses } from '~/drizzle/schema';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const categoryId = query.category ? Number(query.category) : undefined;
  const sortField = query.sort || 'id';
  const sortOrder = query.order === 'desc' ? 'desc' : 'asc';

  // Map allowed sort fields to actual column objects
  const sortFieldMap = {
    id: courses.id,
    title: courses.title,
    image: courses.image,
  };
  const field = sortFieldMap[sortField as keyof typeof sortFieldMap] || sortFieldMap.id;

  const db = useDrizzle();

  return await db.query.courses.findMany({
    where: categoryId ? (courses, { eq }) => eq(courses.categoryId, categoryId) : undefined,
    orderBy: (courses, { asc, desc }) => (sortOrder === 'desc' ? desc(field) : asc(field)),
    with: {
      category: true,
      creator: {
        columns: { id: true, username: true, firstname: true, lastname: true, image: true },
      },
    },
  });
});
