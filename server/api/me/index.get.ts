import { createError } from 'h3';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  // Get user from context (set by auth middleware)
  const user = event.context.user;

  if (!user) {
    return {
      user: null,
      message: 'No authenticated user',
      success: false
    };
  }

  let safeUser;

  // Fetch full user details from database
  try {
    [safeUser] = await pgDB
      .select(safeUserSelectFields)
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1);
  } catch {
    //TODO: server error should be logging
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user data'
    });
  }

  if (!safeUser) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    });
  }

  return { 
    user: safeUser ,
    message: 'User fetched successfully',
    success: true
  };
});
