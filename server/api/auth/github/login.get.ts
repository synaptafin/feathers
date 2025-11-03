export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl;
  console.log('baseURL: ', baseUrl);

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', config.githubClientId);
  githubAuthUrl.searchParams.set(
    'redirect_uri',
    `${baseUrl}/api/auth/github/callback`,
  );
  githubAuthUrl.searchParams.set('scope', 'user:email read:user');

  // Redirect to GitHub OAuth
  return sendRedirect(event, githubAuthUrl.toString());
});
