'use client';

import React, { useMemo } from 'react';
import {
  CheckSquare,
  Check,
  Info,
  LogIn,
  LogOut,
  Layers,
  ChevronRight,
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
import { useDemographicStore } from '@/stores/demographicStore';

/** Get the chip label for a completed display phase */
function getChipLabel(dp: DisplayPhase, selectedState?: string | null): string {
  if (dp === 'select-ballot') {
    // Show location instead of generic "Select Ballot"
    if (selectedState === 'TX') return 'Austin, TX';
    if (selectedState === 'MI') return 'Detroit, MI';
    if (selectedState === 'GA') return 'Atlanta, GA';
    if (selectedState === 'NC') return 'Raleigh, NC';
    return selectedState || 'Ballot';
  }
  if (dp === 'blueprint') return 'Blueprint';
  return 'Build';
}

/** Get the subtitle text for the current banner */
function getBannerSubtitle(dp: DisplayPhase, wizardPhase: WizardPhase): string {
  if (dp === 'blueprint') {
    const subIndex = getSubStepIndex(wizardPhase);
    const config = DISPLAY_PHASE_CONFIG[dp];
    const subLabel = config.subSteps[subIndex] || '';
    switch (subIndex) {
      case 0: return `${subLabel} \u2014 Tell us a bit about yourself`;
      case 1: return `${subLabel} \u2014 Share your perspective on key issues`;
      case 2: return `${subLabel} \u2014 Fine-tune your positions before building`;
      default: return '';
    }
  }
  if (dp === 'build') {
    if (wizardPhase === 'summary') return 'Review your completed ballot';
    return 'Review candidates and make your picks';
  }
  return '';
}

/** Number displayed on the badge (1 of 3, etc.) */
function getPhaseNumber(dp: DisplayPhase): number {
  return DISPLAY_PHASES.indexOf(dp) + 1;
}

export default function WizardNav() {
  const pathname = usePathname();
  const { user, isAnonymous, signInWithGoogle, logout } = useAuth();
  const currentPhase = useBallotStore(selectCurrentPhase);
  const completedPhases = useBallotStore(selectCompletedPhases);
  const goToPhase = useBallotStore((s) => s.goToPhase);
  const selectedState = useDemographicStore((s) => s.profile.selectedState);

  const currentDP = getDisplayPhase(currentPhase);
  const subStepIndex = getSubStepIndex(currentPhase);

  // Determine which display phases are completed, current, or future
  const phaseStates = useMemo(() => {
    const states: Record<DisplayPhase, 'completed' | 'current' | 'future' | 'paused'> = {
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

  // Completed chips (display phases before the current one that are done)
  const completedChips = DISPLAY_PHASES.filter((dp) => phaseStates[dp] === 'completed');

  // Find paused phases (phases that were started/completed but user navigated back)
  // e.g., if user is in blueprint but build was started, show build as paused
  const pausedChips = DISPLAY_PHASES.filter((dp) => {
    if (dp === currentDP) return false;
    if (phaseStates[dp] === 'completed') return false;
    // Has at least one sub-phase completed but isn't the current display phase
    const config = DISPLAY_PHASE_CONFIG[dp];
    return config.wizardPhases.some((wp) => completedPhases.includes(wp));
  });

  const handleChipClick = (dp: DisplayPhase) => {
    const config = DISPLAY_PHASE_CONFIG[dp];
    // Navigate to the last sub-phase of this display phase
    // For blueprint, go to profile-review; for build, go to ballot-item
    const lastCompleted = [...config.wizardPhases]
      .reverse()
      .find((wp) => completedPhases.includes(wp));
    if (lastCompleted) {
      goToPhase(lastCompleted);
    } else if (config.wizardPhases.length > 0) {
      goToPhase(config.wizardPhases[0]);
    }
  };

  // Count ballot progress for paused build chip
  const savedVotesCount = useBallotStore((s) => s.savedVotes.length);

  return (
    <nav className="sticky top-5 z-40 border-b border-gray-200 bg-white">
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

        {/* Chips + Banner area */}
        <div className="pb-2.5">
          {/* Completed chips row */}
          {(completedChips.length > 0 || pausedChips.length > 0) && (
            <div className="flex gap-1.5 flex-wrap mb-2">
              {completedChips.map((dp) => (
                <button
                  key={dp}
                  onClick={() => handleChipClick(dp)}
                  className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                  <Check className="h-2.5 w-2.5" />
                  {getChipLabel(dp, selectedState)}
                </button>
              ))}
              {pausedChips.map((dp) => (
                <button
                  key={dp}
                  onClick={() => handleChipClick(dp)}
                  className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                  </span>
                  {getChipLabel(dp, selectedState)}
                  {dp === 'build' && savedVotesCount > 0 && (
                    <span className="text-[10px] text-gray-400">({savedVotesCount})</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Current phase banner */}
          {currentDP !== 'select-ballot' && (
            <CurrentPhaseBanner
              displayPhase={currentDP}
              wizardPhase={currentPhase}
              subStepIndex={subStepIndex}
            />
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Current Phase Banner ──

function CurrentPhaseBanner({
  displayPhase,
  wizardPhase,
  subStepIndex,
}: {
  displayPhase: DisplayPhase;
  wizardPhase: WizardPhase;
  subStepIndex: number;
}) {
  const config = DISPLAY_PHASE_CONFIG[displayPhase];
  const subtitle = getBannerSubtitle(displayPhase, wizardPhase);
  const phaseNum = getPhaseNumber(displayPhase);

  const gradientClass =
    displayPhase === 'blueprint'
      ? 'from-[#8B7AAF] to-[#7B6A9F]'
      : 'from-blue-600 to-blue-700';

  const iconNode =
    displayPhase === 'blueprint' ? (
      <Layers className="h-4 w-4 text-white" />
    ) : (
      <CheckSquare className="h-4 w-4 text-white" />
    );

  return (
    <div
      className={`bg-gradient-to-r ${gradientClass} rounded-[14px] px-3.5 py-3 text-white`}
    >
      <div className="flex items-center gap-2">
        {iconNode}
        <span className="text-[13px] font-bold">{config.label}</span>
        <span className="flex-1" />
        <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
          {phaseNum} of 3
        </span>
      </div>
      {subtitle && (
        <p className="text-[11px] opacity-80 mt-1 ml-6">{subtitle}</p>
      )}
      {/* Sub-step dots for blueprint */}
      {config.subSteps.length > 0 && (
        <div className="flex gap-1 mt-2 ml-6">
          {config.subSteps.map((_, i) => (
            <div
              key={i}
              className={[
                'w-6 h-[3px] rounded-sm transition-all',
                i === subStepIndex
                  ? 'bg-white'
                  : i < subStepIndex
                    ? 'bg-white/50'
                    : 'bg-white/25',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
