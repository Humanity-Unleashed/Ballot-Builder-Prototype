'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
  const { isAuthenticated, isLoading } = useAuth();
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between p-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center pt-10">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500">
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
          <Link href="/register" onClick={() => track('click', { element: 'get_started' })}>
            <Button title="Get Started" />
          </Link>
          <div className="mt-3">
            <Link href="/login" onClick={() => track('click', { element: 'has_account' })}>
              <Button title="I Already Have an Account" variant="outline" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
