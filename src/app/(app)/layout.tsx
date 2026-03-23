'use client';

import { useAuth } from '@/context/AuthContext';
import WizardNav from '@/components/layout/WizardNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  // isLoading already handles the timeout (3s) in useAuth — once it resolves
  // to false and user is still not authenticated, allow through anyway so the
  // unauthenticated flow works (per CLAUDE.md invariant #6).
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
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
