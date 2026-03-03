'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@/lib/auth-client';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import Button from '@/components/ui/Button';

interface ValueItemProps {
  emoji: string;
  title: string;
  description: string;
}

function ValueItem({ emoji, title, description }: ValueItemProps) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <span className="text-3xl leading-none">{emoji}</span>
      <div className="flex-1">
        <p className="text-base font-semibold text-gray-900 mb-0.5">{title}</p>
        <p className="text-sm leading-5 text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, signInWithGoogle, signInAnonymously } =
    useAuth();
  const { track } = useAnalyticsContext();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/blueprint');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const handleGoogle = async () => {
    track('click', { element: 'continue_with_google' });
    await signInWithGoogle();
  };

  const handleGuest = async () => {
    track('click', { element: 'continue_as_guest' });
    try {
      await signInAnonymously();
    } catch {
      // Auth unavailable (no DB) — continue without auth
    }
    router.replace('/blueprint');
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between p-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center pt-10">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-primary">
            <span className="text-3xl font-bold text-white">BB</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Ballot Builder</h1>
          <p className="mt-1 text-base text-gray-500">Your Personal Voting Guide</p>
        </div>

        {/* Prototype Banner */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1.5 text-sm font-bold text-amber-900">
            Welcome to the Ballot Builder prototype!
          </p>
          <p className="mb-3 text-[13px] leading-[19px] text-amber-800">
            Ballot Builder helps you vote in a way that aligns with your values.
            This is an early prototype and we&apos;d love your feedback &mdash; what
            feels useful, what&apos;s confusing, what you&apos;d change.
          </p>
          <div className="flex items-center gap-2 text-[13px] text-amber-700">
            <MessageSquarePlus className="h-4 w-4 shrink-0" />
            <span>
              Tap the <span className="font-semibold">feedback button</span> in the bottom-right corner anytime.
            </span>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="py-8">
          <ValueItem
            emoji="📋"
            title="Build Your Civic Blueprint"
            description="Answer simple questions to discover your values"
          />
          <ValueItem
            emoji="🗳️"
            title="Get Personalized Guidance"
            description="See how candidates and measures align with you"
          />
          <ValueItem
            emoji="✅"
            title="Vote With Confidence"
            description="Make informed decisions on every ballot item"
          />
        </div>

        {/* Action Buttons */}
        <div className="pb-6">
          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          <div className="mt-3">
            <Button
              title="Continue as Guest"
              variant="outline"
              onClick={handleGuest}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
