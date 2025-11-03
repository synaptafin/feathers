import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.email().optional(),
  bio: z.string().max(500).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event);
  const userId = getRouterParam(event, 'id');
  const body = await readBody(event);
  
  // Authorization check
  if (authUser.id !== userId && !authUser.roles.includes('admin')) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden'
    });
  }
  
  // Validate
  const validation = updateUserSchema.safeParse(body);
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      data: validation.error
    });
  }
  
  // Update user
  const updatedUser = await updateUser(userId!, validation.data);
  
  return {
    statusCode: 200,
    data: updatedUser
  };
});
