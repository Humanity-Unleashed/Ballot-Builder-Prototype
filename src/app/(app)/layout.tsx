'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TopNav from '@/components/layout/TopNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [authUnavailable, setAuthUnavailable] = useState(false);

  // If auth stays in loading state too long, assume auth backend is unavailable
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => setAuthUnavailable(true), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authUnavailable) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, authUnavailable, router]);

  if (isLoading && !authUnavailable) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated && !authUnavailable) {
    return null;
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-lg px-4 pt-14">
        {children}
      </main>
    </>
  );
}
