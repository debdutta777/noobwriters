import { getServerAuthSession } from './lib/auth-helpers';

// Export the auth function for use in API routes
export async function auth() {
  return await getServerAuthSession();
} 