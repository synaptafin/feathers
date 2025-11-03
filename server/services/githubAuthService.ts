// server/services/githubAuthService.ts
import { eq } from 'drizzle-orm';
import { generateToken, generateRefreshToken } from 'server/utils/jwt';

interface GitHubUser {
  id: number;
  login: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

/**
 * Exchange code for access token
 */
export const getGitHubAccessToken = async (code: string): Promise<string> => {
  const config = useRuntimeConfig();

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw createError({
      statusCode: 400,
      message: data.error_description || 'Failed to get access token',
    });
  }

  return data.access_token;
};

/**
 * Get GitHub user data
 */
export const getGitHubUser = async (
  accessToken: string,
): Promise<GitHubUser> => {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: 'Failed to fetch GitHub user',
    });
  }

  return await response.json();
};

/**
 * Get GitHub user emails
 */
export const getGitHubUserEmails = async (
  accessToken: string,
): Promise<GitHubEmail[]> => {
  const response = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: 'Failed to fetch GitHub emails',
    });
  }

  return await response.json();
};

/**
 * Find or create user from GitHub data
 */
export const findOrCreateGitHubUser = async (
  githubUser: GitHubUser,
  email: string,
) => {
  // Check if user exists by GitHub ID
  let [user] = await pgDB
    .select()
    .from(usersTable)
    .where(eq(usersTable.githubId, String(githubUser.id)))
    .limit(1);

  if (user) {
    // Update user info
    [user] = await pgDB
      .update(usersTable)
      .set({
        name: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
        githubUsername: githubUser.login,
        email: email,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id))
      .returning();
  } else {
    // Check if user exists by email
    [user] = await pgDB
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user) {
      // Link GitHub account to existing user
      [user] = await pgDB
        .update(usersTable)
        .set({
          githubId: String(githubUser.id),
          githubUsername: githubUser.login,
          avatar: githubUser.avatar_url,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id))
        .returning();
    } else {
      // Create new user
      [user] = await pgDB
        .insert(usersTable)
        .values({
          email,
          name: githubUser.name || githubUser.login,
          githubId: String(githubUser.id),
          githubUsername: githubUser.login,
          avatar: githubUser.avatar_url,
          emailVerified: true, // GitHub emails are verified
          password: '', // No password for OAuth users
        })
        .returning();
    }
  }

  return user;
};

/**
 * Complete GitHub OAuth flow
 */
export const authenticateWithGitHub = async (code: string) => {
  // Exchange code for access token
  const accessToken = await getGitHubAccessToken(code);

  // Get user data
  const [githubUser, emails] = await Promise.all([
    getGitHubUser(accessToken),
    getGitHubUserEmails(accessToken),
  ]);

  // Get primary email
  const primaryEmail = emails.find((e) => e.primary && e.verified);
  if (!primaryEmail) {
    throw createError({
      statusCode: 400,
      message: 'No verified email found on GitHub account',
    });
  }

  // Find or create user
  const user = await findOrCreateGitHubUser(githubUser, primaryEmail.email);

  // Generate JWT tokens
  const jwtAccessToken = generateToken({
    id: user.id,
    email: user.email,
  });

  const jwtRefreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
  });

  // Save refresh token
  await pgDB.insert(refreshTokensTable).values({
    token: jwtRefreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken: jwtAccessToken,
    refreshToken: jwtRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    },
  };
};
