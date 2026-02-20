'use client';

import React, { useState, useCallback } from 'react';
import { ArrowRight, ClipboardCheck, Compass, MessageSquarePlus, Users, X } from 'lucide-react';

interface IntroScreenProps {
  onClose: () => void;
}

const slides = [
  {
    icon: MessageSquarePlus,
    title: null,
    description:
      'Ballot Builder fills out your ballot, analyzing how candidates and measures align with your demographics and political preferences, regardless of party affiliation.\n\nPlease consider leaving feedback so we can make Ballot Builder unbiased, accurate, and useful.',
  },
  {
    icon: ClipboardCheck,
    title: 'Know Your Ballot',
    description:
      'Every election has races and measures you\u2019ve never heard of. Ballot Builder walks you through your actual ballot so you can vote with confidence \u2014 not confusion.',
  },
  {
    icon: Compass,
    title: 'Vote Your Values',
    description:
      'Take a 5-minute assessment. We\u2019ll map your priorities to real candidates and ballot measures \u2014 no party labels, no spin. Just your values matched to your choices.',
  },
  {
    icon: Users,
    title: 'Prep Together',
    description:
      'Invite a few friends or family to your Voting Squad. See who\u2019s registered, who\u2019s prepped, and who\u2019s voted \u2014 without sharing what anyone chose. Election prep is easier together.\n\nThis is a demo. All ballot data, candidates, and recommendations shown are fictional and not reflective of your actual location or demographics.',
  },
];

export default function IntroScreen({ onClose }: IntroScreenProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  const isLast = current === slides.length - 1;

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 'left' : 'right');
      setCurrent(index);
    },
    [current],
  );

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      goTo(current + 1);
    }
  };

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Skip (hidden on last slide) */}
      <div className="flex justify-end px-5 pt-4">
        {!isLast ? (
          <button
            onClick={onClose}
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Skip
          </button>
        ) : (
          <div className="h-5" />
        )}
      </div>

      {/* Slide content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-40 text-center">
        <div
          key={current}
          className={direction === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right'}
        >
          {/* Icon */}
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-brand-primary-light">
            <Icon className="h-14 w-14 text-brand-primary" strokeWidth={1.5} />
          </div>

          {/* Title */}
          {slide.title && (
            <h1 className="mb-4 text-2xl font-bold text-text-primary">{slide.title}</h1>
          )}

          {/* Description */}
          <p className="mx-auto max-w-sm whitespace-pre-line leading-relaxed text-text-secondary">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom nav (fixed to bottom of modal) */}
      <div className="absolute inset-x-0 bottom-0 bg-white px-6 pb-8 pt-4">
        <div className="mx-auto max-w-md">
          {/* Dot indicators */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === current ? 'bg-brand-primary' : 'bg-border-default'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Action button */}
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-4 font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
          >
            {isLast ? 'Accept and continue' : 'Next'}
            {isLast && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* X close button — bottom-right corner */}
      <button
        onClick={onClose}
        className="absolute bottom-28 right-6 flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-gray-100 hover:text-text-primary"
        aria-label="Close onboarding"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
