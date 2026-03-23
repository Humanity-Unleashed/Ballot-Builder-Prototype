'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  User,
  MinusCircle,
  Pencil,
  Printer,
  RefreshCw,
  Info,
  FileText,
  Users,
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

// Map category icon strings to lucide components
const iconMap: Record<string, React.ElementType> = {
  'file-text': FileText,
  users: Users,
};

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
      <div className="rounded-xl border border-gray-200 bg-white p-4">
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
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-900 text-sm font-semibold"
          >
            {copied ? (
              <><Check className="h-4 w-4 text-green-500" /> Copied!</>
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

// ── Survey Soft Ask ──

function SurveySoftAsk({ onComplete }: { onComplete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { track } = useAnalyticsContext();

  if (expanded) {
    return <PostCompletionSurvey onComplete={onComplete} />;
  }

  return (
    <div className="mx-4 rounded-2xl border border-gray-200 bg-white px-5 py-5 text-center">
      <p className="text-[15px] font-bold text-gray-900 mb-1">Help us make this better</p>
      <p className="text-[13px] text-gray-500 mb-4">
        We&apos;re building this for everyone. Your honest take helps us get it right.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => {
            track('click', { element: 'survey_expand' });
            setExpanded(true);
          }}
          className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
        >
          Give quick feedback
        </button>
        <button
          onClick={() => {
            track('click', { element: 'survey_skip_softask' });
            onComplete();
          }}
          className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-500 text-sm font-semibold"
        >
          Skip
        </button>
      </div>
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
  const [reviewOpen, setReviewOpen] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);
  const votedCount = votes.length;
  const skippedCount = ballotItems.length - votedCount;

  const getVoteDisplay = (vote: UserVote, item: BallotItem) => {
    if (item.type === 'proposition') {
      return vote.choice === 'yes' ? 'YES' : 'NO';
    }
    if (vote.choice === 'write_in') {
      return `Write-in: ${vote.writeInName}`;
    }
    const candidate = item.candidates?.find((c) => c.id === vote.choice);
    return candidate?.name || String(vote.choice);
  };

  const getVoteIcon = (vote: UserVote, item: BallotItem) => {
    if (item.type === 'proposition') {
      return vote.choice === 'yes' ? CheckCircle2 : XCircle;
    }
    return User;
  };

  const getVoteColor = (vote: UserVote, item: BallotItem) => {
    if (item.type === 'proposition') {
      return vote.choice === 'yes' ? 'text-success' : 'text-negative';
    }
    return 'text-brand-primary';
  };

  // Group items by category
  const groupedItems = categories
    .map((cat) => ({
      category: cat,
      items: ballotItems
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0);

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

      {/* 3. Sharing & invite block — strike while the iron is hot */}
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
        {/* 4. Vote review — collapsed by default */}
        <div className="px-4">
          <button
            onClick={() => {
              setReviewOpen((prev) => !prev);
              track('click', { element: 'toggle_review', open: !reviewOpen });
            }}
            className="w-full flex items-center justify-between py-3 text-sm font-semibold text-text-secondary"
          >
            <span>
              Review your selections ({votedCount} voted{skippedCount > 0 ? `, ${skippedCount} skipped` : ''})
            </span>
            {reviewOpen ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </button>

          {reviewOpen && (
            <div className="space-y-5 animate-fade-in-up">
              {groupedItems.map(({ category, items }) => {
                const CategoryIcon = iconMap[category.icon] || FileText;

                return (
                  <div key={category.id}>
                    {/* Category badge */}
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <CategoryIcon className="h-4 w-4" style={{ color: category.color }} />
                      <span className="text-sm font-semibold" style={{ color: category.color }}>
                        {category.name}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {items.map(({ item, index }) => {
                        const vote = votes.find((v) => v.itemId === item.id);
                        const isSkipped = !vote;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center bg-white rounded-xl p-3.5 border border-gray-200"
                          >
                            <div className="flex-1 space-y-1.5">
                              <p className="text-[15px] font-semibold text-gray-900 leading-5">
                                {item.title}
                              </p>
                              {isSkipped ? (
                                <div className="flex items-center gap-1.5">
                                  <MinusCircle className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-400 italic">Skipped</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  {React.createElement(getVoteIcon(vote, item), {
                                    className: `h-[18px] w-[18px] ${getVoteColor(vote, item)}`,
                                  })}
                                  <span className={`text-sm font-bold ${getVoteColor(vote, item)}`}>
                                    {getVoteDisplay(vote, item)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Edit button */}
                            <button
                              onClick={() => onEditItem(index)}
                              className="ml-3 w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center hover:bg-brand-primary/20 transition-colors"
                            >
                              <Pencil className="h-[18px] w-[18px] text-brand-primary" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Demoted action links */}
              <div className="flex items-center justify-center gap-4 pt-2 pb-1">
                <button
                  onClick={() => {
                    track('click', { element: 'print_ballot', votedCount, skippedCount });
                    onPrint();
                  }}
                  className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-primary transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Print Ballot
                </button>
                <span className="text-text-muted">|</span>
                <button
                  onClick={() => {
                    track('click', { element: 'start_over' });
                    onStartOver();
                  }}
                  className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-primary transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Survey — soft ask, collapsed by default */}
        {!surveyDone && (
          <SurveySoftAsk onComplete={() => setSurveyDone(true)} />
        )}

        {/* 6. Next steps */}
        <NextStepsCard voterInfo={voterInfo} location={location} />

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
