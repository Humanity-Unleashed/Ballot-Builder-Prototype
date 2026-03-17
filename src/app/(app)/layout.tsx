'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import WizardNav from '@/components/layout/WizardNav';

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
    <div className="flex flex-col h-[100dvh]">
      <div className="shrink-0 bg-amber-500 text-white text-center text-[11px] font-medium py-0.5 tracking-wide">
        Prototype for evaluation only — not an official voter guide
      </div>
      <WizardNav />
      <main className="flex-1 min-h-0 overflow-y-auto mx-auto max-w-lg px-4 w-full">
        {children}
      </main>
    </div>
  );
}
