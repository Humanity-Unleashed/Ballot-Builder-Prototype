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
      <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white text-center text-[11px] font-medium py-0.5 tracking-wide">
        Prototype for evaluation only — not an official voter guide
      </div>
      <TopNav />
      <main className="mx-auto max-w-lg px-4 pt-[4.75rem]">
        {children}
      </main>
    </>
  );
}
