'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef, useCallback, Suspense } from 'react';
import {
  Users,
  ClipboardCheck,
  Shield,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const TOTAL_SLIDES = 4;
const SWIPE_THRESHOLD = 50;

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const squadCode = searchParams.get('squad');
  const [slide, setSlide] = useState(0);

  // Swipe handling
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only count horizontal swipes (ignore vertical scroll)
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) {
      setSlide((s) => Math.min(s + 1, TOTAL_SLIDES - 1));
    } else {
      setSlide((s) => Math.max(s - 1, 0));
    }
  }, []);

  const next = () => setSlide((s) => Math.min(s + 1, TOTAL_SLIDES - 1));
  const prev = () => setSlide((s) => Math.max(s - 1, 0));

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <div
        className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-between px-6 py-10"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {slide === 0 && (
            <div className="animate-fade-in-up">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
                <Users className="h-8 w-8 text-brand-primary" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                You&apos;ve been invited to a Voting Squad!
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                A friend wants you to prep your ballot together. Let&apos;s get you up to speed.
              </p>
              {squadCode && (
                <p className="text-xs text-gray-400 mt-4">
                  Invite code: <span className="font-mono font-semibold text-gray-500">{squadCode}</span>
                </p>
              )}
            </div>
          )}

          {slide === 1 && (
            <div className="animate-fade-in-up">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary">
                <span className="text-2xl font-bold text-white">BB</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                What is Ballot Builder?
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                Ballot Builder is a free, nonpartisan tool that helps you vote in a way that matches your values.
              </p>
              <div className="text-left space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">📋</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Take a quick values assessment</p>
                    <p className="text-xs text-gray-500">Answer simple questions &mdash; no right or wrong answers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">🗳️</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">See your personalized ballot</p>
                    <p className="text-xs text-gray-500">Every race and measure, matched to your values</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">✅</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Walk in ready to vote</p>
                    <p className="text-xs text-gray-500">Print or screenshot your sample ballot</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {slide === 2 && (
            <div className="animate-fade-in-up">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
                <ClipboardCheck className="h-8 w-8 text-brand-primary" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                What is a Voting Squad?
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                A Voting Squad is a small group that holds each other accountable to get ballot-ready before Election Day.
              </p>
              <div className="text-left space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">👀</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Track progress together</p>
                    <p className="text-xs text-gray-500">See who&apos;s registered, prepped, and voted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">🤝</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Gentle accountability</p>
                    <p className="text-xs text-gray-500">A nudge from friends is more effective than any reminder app</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">🔒</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Your votes stay private</p>
                    <p className="text-xs text-gray-500">Squad members never see your answers or who you voted for</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {slide === 3 && (
            <div className="animate-fade-in-up">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Your privacy is built in
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                This is what your squad can and can&apos;t see:
              </p>
              <div className="rounded-xl border border-border-default overflow-hidden text-left">
                <div className="p-4 space-y-2.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Visible to squad</p>
                  {['Whether you created an account', 'Whether you checked registration', 'Whether you completed your ballot', 'Whether you voted'].map((text) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded bg-success/15 flex items-center justify-center shrink-0">
                        <span className="text-success text-xs font-bold">✓</span>
                      </span>
                      <span className="text-sm text-gray-600">{text}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-red-50/30 border-t border-border-default space-y-2.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Never visible</p>
                  {['Your assessment answers', 'Your values or policy positions', 'Who you voted for'].map((text) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded bg-red-500/10 flex items-center justify-center shrink-0">
                        <span className="text-red-500 text-xs font-bold">✕</span>
                      </span>
                      <span className="text-sm text-gray-600">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom: dots + buttons */}
        <div className="pt-6 space-y-4">
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-5 bg-brand-primary' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {slide < TOTAL_SLIDES - 1 ? (
            <div className="flex gap-3">
              {slide > 0 && (
                <button
                  onClick={prev}
                  className="flex items-center justify-center w-12 rounded-xl border border-border-default bg-white hover:bg-gray-50 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-500" />
                </button>
              )}
              <button
                onClick={next}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={prev}
                className="flex items-center justify-center w-12 rounded-xl border border-border-default bg-white hover:bg-gray-50 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
              >
                Join Squad &amp; Get Started
              </button>
            </div>
          )}
          {slide === 0 && (
            <button
              onClick={() => router.push('/')}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              Skip intro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
