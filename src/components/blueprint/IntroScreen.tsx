'use client';

import React, { useState, useCallback, useRef } from 'react';
import { ArrowRight, Clock, Compass, ListChecks, Users, X } from 'lucide-react';

interface IntroScreenProps {
  onClose: () => void;
}

const slides = [
  {
    icon: Clock,
    title: 'Ballot prep shouldn\u2019t take hours',
    description: null,
    customContent: (
      <div className="mx-auto flex max-w-sm flex-col gap-4 text-left">
        <div className="rounded-xl bg-gray-100 px-5 py-4">
          <p className="mb-2 text-sm font-semibold text-gray-500">Without Ballot Builder</p>
          <ul className="space-y-1 text-sm leading-relaxed text-gray-500">
            <li>You research every candidate yourself</li>
            <li>You read through voter guides</li>
            <li>You compare positions by hand</li>
            <li>You decode each ballot measure</li>
            <li>You hope you didn\u2019t miss anything</li>
          </ul>
        </div>
        <div className="rounded-xl bg-brand-primary/5 px-5 py-4">
          <p className="mb-2 text-sm font-semibold text-brand-primary">With Ballot Builder</p>
          <ul className="space-y-1 text-sm leading-relaxed text-brand-primary">
            <li>Take a 5-minute values quiz</li>
            <li>Get match scores for your ballot</li>
            <li>See every race explained simply</li>
            <li>Finish in about 15 minutes</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: ListChecks,
    title: 'Know Your Ballot',
    description:
      'Most ballots have 8\u201315 races you\u2019ve never heard of. We walk you through each one: the candidates, the measures, and what the office does. No surprises at the polls.',
    customContent: null,
  },
  {
    icon: Compass,
    title: 'Vote Your Values',
    description:
      'Take a 5-minute quiz about what matters to you. We\u2019ll match your values to real candidates and ballot measures. No party labels. No spin. Just your views matched to your choices.',
    customContent: null,
  },
  {
    icon: Users,
    title: 'Prep Together',
    description:
      'Start a Voting Squad with friends or family. See who is ballot-ready without seeing their votes. Keep each other on track.',
    customContent: null,
    note: 'Note: This demo uses sample ballot data for Austin, TX to show how the full experience works.',
  },
];

const SWIPE_THRESHOLD = 50;

export default function IntroScreen({ onClose }: IntroScreenProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const touchStartX = useRef<number | null>(null);

  const isLast = current === slides.length - 1;

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 'left' : 'right');
      setCurrent(index);
    },
    [current],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (delta < -SWIPE_THRESHOLD && current < slides.length - 1) {
      goTo(current + 1);
    } else if (delta > SWIPE_THRESHOLD && current > 0) {
      goTo(current - 1);
    }
  };

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
          {slide.description && (
            <p className="mx-auto max-w-sm whitespace-pre-line leading-relaxed text-text-secondary">
              {slide.description}
            </p>
          )}

          {/* Custom content (e.g. comparison cards on slide 0) */}
          {slide.customContent}

          {/* Note */}
          {'note' in slide && slide.note && (
            <p className="mx-auto mt-4 max-w-sm text-xs leading-relaxed text-text-secondary/70">
              {slide.note}
            </p>
          )}
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

          {/* Action button — only on last slide */}
          {isLast ? (
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-4 font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
            >
              Accept and continue
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <p className="text-center text-xs text-text-secondary">Swipe to continue</p>
          )}
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
