'use client';

import React, { useState } from 'react';
import {
  Info,
  Lock,
  MessageCircle,
  Mail,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { BallotItem, Category, UserVote } from '@/lib/ballotHelpers';
import type { VoteAmericaStateRules } from '@/server/types/externalApis';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import Confetti from './Confetti';
import CelebrationHeader from './CelebrationHeader';
import ImpactCard from './ImpactCard';
import PostCompletionSurvey from './PostCompletionSurvey';
import NextStepsCard from './NextStepsCard';
import SquadInviteCard from './SquadInviteCard';

interface VoterInfo {
  registrationUrl?: string;
  absenteeBallotUrl?: string;
  pollingPlaceUrl?: string;
  stateRules?: VoteAmericaStateRules;
}

interface LocationInfo {
  state: string;
  stateName: string;
  city?: string;
}

interface BallotSummaryProps {
  votes: UserVote[];
  ballotItems: BallotItem[];
  categories: Category[];
  onEditItem: (index: number) => void;
  onStartOver: () => void;
  onPrint: () => void;
  voterInfo?: VoterInfo | null;
  location?: LocationInfo | null;
  sessionMinutes?: number;
  archetypeName?: string;
  archetypeEmoji?: string;
}

const SHARE_URL = 'https://ballotbuilder.org';

// ── Inline Share Block ──

function ShareInviteBlock({
  racesCount,
  sessionMinutes,
  archetypeName,
  archetypeEmoji,
}: {
  racesCount: number;
  sessionMinutes?: number;
  archetypeName?: string;
  archetypeEmoji?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const { track } = useAnalyticsContext();

  // Build personalized share message
  const parts: string[] = [];
  if (racesCount && sessionMinutes) {
    parts.push(`I just prepped ${racesCount} races in ${sessionMinutes} minutes on Ballot Builder.`);
  } else {
    parts.push('I just prepped my ballot on Ballot Builder.');
  }
  if (archetypeName && archetypeEmoji) {
    parts.push(`My civic style: ${archetypeEmoji} ${archetypeName}.`);
  }
  parts.push(`It walks you through every race on your ballot. Try it: ${SHARE_URL}`);
  const shareMessage = parts.join(' ');

  const handleText = () => {
    track('click', { element: 'share_text_friend' });
    window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_self');
  };
  const handleEmail = () => {
    track('click', { element: 'share_email_friend' });
    window.open(`mailto:?subject=${encodeURIComponent('Check out Ballot Builder')}&body=${encodeURIComponent(shareMessage)}`, '_self');
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      track('click', { element: 'share_copy_link' });
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <div className="mx-4 space-y-3">
      {/* Section heading */}
      <h2 className="text-[15px] font-bold text-gray-900">Help others vote their values</h2>

      {/* Privacy one-liner */}
      <div className="flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <p className="text-[12px] text-gray-500">
          Your ballot choices and personal views are never shared — not with friends, not with squad members, not with anyone.
        </p>
      </div>

      {/* CTA 1: General invite */}
      <div className="rounded-xl border border-border-default bg-white p-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl">📤</span>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-gray-900">Help someone else prep</p>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Send a friend the link to Ballot Builder. They&apos;ll get their own personalized ballot in minutes.
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={handleText}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
          >
            <MessageCircle className="h-4 w-4" />
            Text
          </button>
          <button
            onClick={handleEmail}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-border-default bg-white hover:bg-gray-50 transition-colors text-gray-900 text-sm font-semibold"
          >
            {copied ? (
              <><Check className="h-4 w-4 text-success" /> Copied!</>
            ) : (
              <><Copy className="h-4 w-4" /> Copy</>
            )}
          </button>
        </div>
      </div>

      {/* CTA 2: Squad invite */}
      <SquadInviteCard />

      {/* Privacy detail — expandable */}
      <button
        onClick={() => setPrivacyOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Lock className="h-3 w-3" />
        <span>What can squad members see?</span>
        {privacyOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {privacyOpen && (
        <div className="bg-gray-50 rounded-xl p-3.5 text-[12px] text-gray-500 leading-relaxed">
          Squad members can see whether you&apos;ve created an account, checked your registration,
          completed your ballot prep, and voted. They cannot see your assessment answers, your
          policy positions, your match scores, or who you voted for. You can leave a squad at
          any time — no one is notified.
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

export default function BallotSummary({
  votes,
  ballotItems,
  categories,
  onEditItem,
  onStartOver,
  onPrint,
  voterInfo,
  location,
  sessionMinutes,
  archetypeName,
  archetypeEmoji,
}: BallotSummaryProps) {
  const { track } = useAnalyticsContext();
  const [surveyDone, setSurveyDone] = useState(false);
  const racesCount = ballotItems.filter((i) => i.type === 'candidate_race').length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Confetti />

      {/* 1. Celebration header */}
      <CelebrationHeader />

      {/* 2. Impact card — research-backed context */}
      <div className="pt-4">
        <ImpactCard ballotItems={ballotItems} sessionMinutes={sessionMinutes} />
      </div>

      {/* 3. Survey — auto-expanded, shown while engagement is high */}
      {!surveyDone && (
        <div className="pt-5 px-4">
          <PostCompletionSurvey onComplete={() => setSurveyDone(true)} />
        </div>
      )}

      {/* 4. Sharing & invite block */}
      <div className="pt-5">
        <ShareInviteBlock
          racesCount={racesCount}
          sessionMinutes={sessionMinutes}
          archetypeName={archetypeName}
          archetypeEmoji={archetypeEmoji}
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-0 pt-5 pb-6 space-y-5">
        {/* 5. Get ready to vote — review, print, polling, mail-in */}
        <NextStepsCard
          voterInfo={voterInfo}
          location={location}
          votes={votes}
          ballotItems={ballotItems}
          categories={categories}
          onEditItem={onEditItem}
          onStartOver={onStartOver}
          onPrint={onPrint}
        />

        {/* Disclaimer */}
        <div className="mx-4 flex items-start gap-2.5 bg-gray-100 p-3.5 rounded-xl mb-10">
          <Info className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="flex-1 text-[13px] text-gray-500 leading-[19px]">
            This is a preview of your selections. Take this to your polling place or use it as a
            reference when completing your official ballot.
          </p>
        </div>
      </div>
    </div>
  );
}
