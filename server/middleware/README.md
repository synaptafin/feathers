# Authentication Middleware

This Nuxt server middleware provides authentication and authorization functionality for your API routes.

## How It Works

The middleware runs on **every server request** and:
1. Checks for an authentication token in cookies or the Authorization header
2. Verifies and decodes the token
3. Attaches the user to `event.context.user` if authenticated
4. Sets `event.context.user` to `null` if not authenticated or token is invalid

## Public Routes

By default, these routes skip authentication:
- `/api/auth/login`
- `/api/auth/register`
- `/api/health`

You can modify the `publicRoutes` array in `server/middleware/auth.ts` to add more public routes.

## Usage in API Routes

### Check if User is Authenticated (Optional Auth)

```typescript
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  
  if (user) {
    return { message: `Hello ${user.email}!` };
  } else {
    return { message: 'Hello guest!' };
  }
});
```

### Require Authentication

```typescript
import { requireAuth } from '../middleware/auth';

export default defineEventHandler(async (event) => {
  // Throws 401 if not authenticated
  const user = await requireAuth(event);
  
  return {
    message: 'Protected data',
    userId: user.id,
  };
});
```

### Require Specific Roles

```typescript
import { requireRole } from '../middleware/auth';

export default defineEventHandler(async (event) => {
  // Throws 403 if user doesn't have admin role
  const user = await requireRole(['admin'])(event);
  
  return {
    message: 'Admin-only data',
    user,
  };
});
```

## Token Sources

The middleware checks for tokens in this order:
1. **Cookie**: `auth_token` cookie
2. **Header**: `Authorization: Bearer <token>`

## Security Notes

⚠️ **IMPORTANT**: The current `verifyToken` function is a **placeholder** that only decodes tokens without verification. This is **INSECURE** for production use.

### Implement Proper JWT Verification

Install a JWT library:

```bash
# Using jose (recommended for modern/edge environments)
pnpm add jose

# OR using jsonwebtoken
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken
```

#### Option 1: Using `jose` (Recommended)

```typescript
import { jwtVerify } from 'jose';

async function verifyToken(token: string): Promise<JWTPayload> {
  const config = useRuntimeConfig();
  const secret = new TextEncoder().encode(config.jwtSecret);
  
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256'],
  });
  
  return payload as JWTPayload;
}
```

#### Option 2: Using `jsonwebtoken`

```typescript
import jwt from 'jsonwebtoken';

async function verifyToken(token: string): Promise<JWTPayload> {
  const config = useRuntimeConfig();
  
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded as JWTPayload);
    });
  });
}
```

### Add JWT Secret to Runtime Config

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this',
  },
});
```

And create a `.env` file:

```
JWT_SECRET=your-super-secret-key-min-32-chars-long
```

## Type Safety

To get proper TypeScript types for `event.context.user`, create or update `server/types/auth.d.ts`:

```typescript
import type { JWTPayload } from '../middleware/auth';

declare module 'h3' {
  interface H3EventContext {
    user: JWTPayload | null;
  }
}
```

## Error Handling

The middleware throws standard H3 errors:

- **401 Unauthorized**: When `requireAuth` is called but user is not authenticated
- **403 Forbidden**: When `requireRole` is called but user lacks the required role

These errors are automatically handled by Nuxt's error handling system.

## Examples

See example implementations:
- `server/api/example-protected.ts` - Basic auth example
- `server/api/example-admin.ts` - Role-based auth example
