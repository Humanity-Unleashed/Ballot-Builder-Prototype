'use client';

import React from 'react';
import { ArrowRight, Clock, BarChart3, FileText, CheckCheck, MessageSquarePlus } from 'lucide-react';
import type { Spec } from '@/types/civicAssessment';

interface IntroScreenProps {
  spec: Spec;
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="p-5 pb-10">
        {/* Prototype Welcome Banner */}
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1.5 text-sm font-bold text-amber-900">
            Welcome to the Ballot Builder prototype!
          </p>
          <p className="mb-3 text-[13px] leading-[19px] text-amber-800">
            Ballot Builder helps you vote in a way that aligns with your values.
            Take a short assessment, get a personalized civic blueprint, then
            browse your ballot with guidance tailored to you.
          </p>
          <p className="mb-1.5 text-[13px] leading-[19px] text-amber-800">
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

        {/* Hero */}
        <div className="mb-6">
          <h1 className="mb-2.5 text-xl font-extrabold leading-[26px] text-gray-900">
            Draft Your{'\n'}Civic Blueprint
          </h1>
          <p className="text-[15px] leading-[22px] text-gray-500">
            Answer a few quick questions about your values. We&apos;ll map your positions and
            match you to candidates who share them.
          </p>
        </div>

        {/* How It Works card */}
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <span className="mb-3.5 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
            HOW IT WORKS
          </span>

          {/* Steps */}
          {[
            {
              num: 1,
              title: 'Share your values',
              desc: 'Slide through questions on economy, healthcare, justice, and more',
            },
            {
              num: 2,
              title: 'See your blueprint',
              desc: 'Get a personalized civic profile with your positions mapped',
            },
            {
              num: 3,
              title: 'Build your ballot',
              desc: 'Match your values to real candidates and ballot measures',
            },
          ].map((step) => (
            <div key={step.num} className="mb-3.5 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600">
                <span className="text-[13px] font-bold text-white">{step.num}</span>
              </div>
              <div className="flex-1">
                <span className="block text-sm font-bold text-gray-900">{step.title}</span>
                <span className="block text-[13px] leading-[18px] text-gray-500">
                  {step.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={onStart}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 transition-opacity hover:opacity-90 active:opacity-80"
        >
          <span className="text-base font-bold text-white">Start Drafting</span>
          <ArrowRight className="h-5 w-5 text-white" />
        </button>

        {/* Time hint */}
        <div className="mb-6 flex items-center justify-center gap-1.5">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-[13px] text-gray-400">Takes about 3-5 minutes</span>
        </div>

        {/* What You'll Get card */}
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <span className="mb-3 block text-[11px] font-bold uppercase tracking-wide text-violet-600">
            WHAT YOU&apos;LL GET
          </span>

          {[
            {
              icon: <BarChart3 className="h-[18px] w-[18px] text-violet-600" />,
              title: 'Civic Blueprint',
              desc: 'A personalized profile mapping your stance across key policy areas',
            },
            {
              icon: <FileText className="h-[18px] w-[18px] text-violet-600" />,
              title: 'Policy Positions',
              desc: 'Detailed stances across 5 policy domains, 15 axes',
            },
            {
              icon: <CheckCheck className="h-[18px] w-[18px] text-violet-600" />,
              title: 'Candidate Matches',
              desc: 'Percentage match scores for every race on your ballot',
            },
          ].map((item) => (
            <div key={item.title} className="mb-3 flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                {item.icon}
              </div>
              <div className="flex-1">
                <span className="block text-sm font-bold text-gray-900">{item.title}</span>
                <span className="block text-[13px] leading-[18px] text-gray-500">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
