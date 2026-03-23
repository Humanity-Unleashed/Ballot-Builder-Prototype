'use client';

import { useState, useEffect } from 'react';
import { createAuthClient } from 'better-auth/react';
import { anonymousClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? '',
  plugins: [anonymousClient()],
});

export function useAuth() {
  const session = authClient.useSession();
  const [timedOut, setTimedOut] = useState(false);

  // If the session stays pending too long, the auth backend is unreachable
  useEffect(() => {
    if (!session.isPending) return;
    const timer = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [session.isPending]);

  const isLoading = session.isPending && !timedOut;

  return {
    user: session.data?.user ?? null,
    isAuthenticated: !!session.data?.session,
    isAnonymous: session.data?.user?.isAnonymous ?? false,
    isLoading,

    signInWithGoogle: () =>
      authClient.signIn.social({ provider: 'google' }),

    signInAnonymously: () => authClient.signIn.anonymous(),

    logout: () => authClient.signOut(),
  };
}
