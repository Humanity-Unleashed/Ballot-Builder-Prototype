'use client';

import { createAuthClient } from 'better-auth/react';
import { anonymousClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? '',
  plugins: [anonymousClient()],
});

export function useAuth() {
  const session = authClient.useSession();

  return {
    user: session.data?.user ?? null,
    isAuthenticated: !!session.data?.session,
    isAnonymous: session.data?.user?.isAnonymous ?? false,
    isLoading: session.isPending,

    signInWithGoogle: () =>
      authClient.signIn.social({ provider: 'google' }),

    signInAnonymously: () => authClient.signIn.anonymous(),

    logout: () => authClient.signOut(),
  };
}
