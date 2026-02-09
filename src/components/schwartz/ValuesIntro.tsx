'use client';

import React from 'react';
import { Compass, ArrowRight, MessageSquarePlus } from 'lucide-react';

interface ValuesIntroProps {
  onStart: () => void;
  itemCount: number;
}

export default function ValuesIntro({ onStart, itemCount }: ValuesIntroProps) {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col bg-gradient-to-b from-violet-50 to-white">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Icon */}
        <div className="mb-8 rounded-full bg-violet-100 p-6">
          <Compass className="h-16 w-16 text-violet-600" />
        </div>

        {/* Title */}
        <h1 className="mb-4 text-center text-3xl font-bold text-gray-900">
          Build Your Blueprint
        </h1>

        {/* Description */}
        <p className="mb-8 max-w-md text-center text-gray-600">
          Your civic blueprint helps us match you with candidates and policies
          that align with what matters most to you.
        </p>

        {/* Prototype Banner */}
        <div className="mb-6 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1.5 text-sm font-bold text-amber-900">
            This is an early prototype!
          </p>
          <p className="mb-3 text-[13px] leading-[19px] text-amber-800">
            Ballot Builder helps you vote in a way that aligns with your values.
            We&apos;d love your feedback &mdash; what feels useful, what&apos;s
            confusing, what you&apos;d change.
          </p>
          <div className="flex items-center gap-2 text-[13px] text-amber-700">
            <MessageSquarePlus className="h-4 w-4 shrink-0" />
            <span>
              Tap the <span className="font-semibold">feedback button</span> in the bottom-right corner anytime.
            </span>
          </div>
        </div>

        {/* What to expect */}
        <div className="mb-8 w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">What to expect</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600">
                1
              </span>
              <span>
                You&apos;ll see {itemCount} statements about values and priorities
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600">
                2
              </span>
              <span>
                Rate each one from Strongly Disagree to Strongly Agree
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600">
                3
              </span>
              <span>
                See your civic blueprint with insights into what drives you
              </span>
            </li>
          </ul>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-violet-700 hover:shadow-xl active:scale-95"
        >
          <span>Get Started</span>
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Based on Schwartz&apos;s Theory of Basic Human Values
        </p>
      </div>
    </div>
  );
}
