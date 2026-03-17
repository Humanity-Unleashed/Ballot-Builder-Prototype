'use client';

import React, { useMemo } from 'react';
import {
  CheckSquare,
  Check,
  Info,
  LogIn,
  LogOut,
  Layers,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-client';
import {
  useBallotStore,
  selectCurrentPhase,
  selectCompletedPhases,
  DISPLAY_PHASES,
  DISPLAY_PHASE_CONFIG,
  getDisplayPhase,
  getSubStepIndex,
  isDisplayPhaseCompleted,
  type DisplayPhase,
  type WizardPhase,
} from '@/stores/ballotStore';


/** Short label for each display phase */
function getStepLabel(dp: DisplayPhase): string {
  if (dp === 'select-ballot') return 'Your Info';
  if (dp === 'blueprint') return 'Your Priorities';
  return 'Your Guide';
}

/** Subtitle for the expanded current phase */
function getBannerSubtitle(dp: DisplayPhase, wizardPhase: WizardPhase): string {
  if (dp === 'select-ballot') {
    const subIndex = getSubStepIndex(wizardPhase);
    switch (subIndex) {
      case 0: return 'Choose your state and ballot';
      case 1: return 'Tell us a bit about yourself';
      default: return '';
    }
  }
  if (dp === 'blueprint') {
    const subIndex = getSubStepIndex(wizardPhase);
    switch (subIndex) {
      case 0: return 'Share your perspective on key issues';
      case 1: return 'Fine-tune your positions before matching';
      default: return '';
    }
  }
  if (dp === 'build') {
    if (wizardPhase === 'summary') return 'Review your completed ballot';
    return 'Review candidates and make your picks';
  }
  return '';
}

/** Icon for each display phase */
function StepIcon({ dp, size = 12 }: { dp: DisplayPhase; size?: number }) {
  if (dp === 'select-ballot') return <MapPin style={{ width: size, height: size }} />;
  if (dp === 'blueprint') return <Layers style={{ width: size, height: size }} />;
  return <CheckSquare style={{ width: size, height: size }} />;
}

export default function WizardNav() {
  const pathname = usePathname();
  const { user, isAnonymous, signInWithGoogle, logout } = useAuth();
  const currentPhase = useBallotStore(selectCurrentPhase);
  const completedPhases = useBallotStore(selectCompletedPhases);
  const goToPhase = useBallotStore((s) => s.goToPhase);
  const currentDP = getDisplayPhase(currentPhase);
  const subStepIndex = getSubStepIndex(currentPhase);

  const phaseStates = useMemo(() => {
    const states: Record<DisplayPhase, 'completed' | 'current' | 'future'> = {
      'select-ballot': 'future',
      'blueprint': 'future',
      'build': 'future',
    };
    for (const dp of DISPLAY_PHASES) {
      if (dp === currentDP) {
        states[dp] = 'current';
      } else if (isDisplayPhaseCompleted(dp, completedPhases)) {
        states[dp] = 'completed';
      }
    }
    return states;
  }, [currentDP, completedPhases]);

  const handleStepClick = (dp: DisplayPhase) => {
    const config = DISPLAY_PHASE_CONFIG[dp];
    // Navigate to the last completed sub-phase, or the first one
    const lastCompleted = [...config.wizardPhases]
      .reverse()
      .find((wp) => completedPhases.includes(wp));
    if (lastCompleted) {
      goToPhase(lastCompleted);
    } else if (config.wizardPhases.length > 0) {
      goToPhase(config.wizardPhases[0]);
    }
  };

  const subtitle = getBannerSubtitle(currentDP, currentPhase);
  const config = DISPLAY_PHASE_CONFIG[currentDP];

  return (
    <nav className="shrink-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-lg px-4">
        {/* Top row: branding + auth */}
        <div className="flex h-10 items-center">
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <CheckSquare className="h-5 w-5 text-brand-primary" />
            <span className="text-base font-bold text-gray-900">Ballot Builder</span>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link
              href="/about"
              className={[
                'flex items-center rounded-lg p-1.5 transition-colors',
                pathname === '/about'
                  ? 'text-brand-primary bg-gray-100'
                  : 'text-gray-500 hover:bg-gray-100',
              ].join(' ')}
              aria-label="About Ballot Builder"
            >
              <Info className="h-3.5 w-3.5" />
            </Link>
            {isAnonymous ? (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </button>
            ) : user ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-700 hidden sm:inline">
                  {user.name || user.email}
                </span>
                <button
                  onClick={() => logout()}
                  className="flex items-center rounded-lg p-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Unified banner */}
        <div className="pb-2.5">
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#162D4A] rounded-[14px] px-3.5 py-3 text-white">
            {/* Stepper row */}
            <div className="flex items-center gap-0">
              {DISPLAY_PHASES.map((dp, idx) => {
                const state = phaseStates[dp];
                const isClickable = state === 'completed';
                const label = getStepLabel(dp);

                return (
                  <React.Fragment key={dp}>
                    {/* Connector line */}
                    {idx > 0 && (
                      <div
                        className={[
                          'flex-1 h-px mx-1',
                          state === 'future' ? 'bg-white/20' : 'bg-white/50',
                        ].join(' ')}
                      />
                    )}
                    {/* Step */}
                    {isClickable ? (
                      <button
                        onClick={() => handleStepClick(dp)}
                        className="flex items-center gap-1 hover:bg-white/15 rounded-full px-2 py-1 -mx-1 transition-colors"
                      >
                        <span className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center shrink-0">
                          <Check className="h-2.5 w-2.5 text-[#162D4A]" strokeWidth={3} />
                        </span>
                        <span className="text-[11px] font-semibold text-white/90">{label}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 -mx-1">
                        <span
                          className={[
                            'w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold',
                            state === 'current'
                              ? 'bg-white text-[#162D4A]'
                              : 'bg-white/20 text-white/50',
                          ].join(' ')}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className={[
                            'text-[11px] font-semibold',
                            state === 'current' ? 'text-white' : 'text-white/40',
                          ].join(' ')}
                        >
                          {state === 'current' ? label : DISPLAY_PHASE_CONFIG[dp].label}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Current phase detail */}
            {(
              <>
                {subtitle && (
                  <p className="text-[11px] opacity-80 mt-2 ml-1">{subtitle}</p>
                )}
                {/* Sub-step dots */}
                {config.subSteps.length > 0 && (
                  <div className="flex gap-1 mt-2 ml-1">
                    {config.subSteps.map((_, i) => {
                      const isCurrent = i === subStepIndex;
                      const phase = config.wizardPhases[i];
                      const isNavigable = !isCurrent && (i < subStepIndex || completedPhases.includes(phase));
                      return isNavigable ? (
                        <button
                          key={i}
                          onClick={() => goToPhase(phase)}
                          className="w-6 h-[3px] rounded-sm bg-white/50 hover:bg-white/80 transition-all cursor-pointer"
                          aria-label={`Go to ${config.subSteps[i]}`}
                        />
                      ) : (
                        <div
                          key={i}
                          className={[
                            'w-6 h-[3px] rounded-sm transition-all',
                            isCurrent ? 'bg-white' : 'bg-white/25',
                          ].join(' ')}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
