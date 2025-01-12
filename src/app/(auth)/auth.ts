import { cookies } from 'next/headers';

async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  return session?.value;
}

async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

async function requireAuth() {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }
}

export const auth = {
  getSession,
  isAuthenticated,
  requireAuth,
}; 