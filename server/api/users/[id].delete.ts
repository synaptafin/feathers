import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = event.method;
  if (method !== 'DELETE') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
  }

  const userId = Number(event.context.params?.id);  // [id].ts
  if (userId !== event.context.user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  } 
  await db.delete(usersTable).where(eq(usersTable.id, userId)).run();
  return { message: 'User deleted successfully' };
});
