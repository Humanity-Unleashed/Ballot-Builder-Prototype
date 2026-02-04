'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/blueprint');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
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
          <Link href="/register">
            <Button title="Get Started" />
          </Link>
          <div className="mt-3">
            <Link href="/login">
              <Button title="I Already Have an Account" variant="outline" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
