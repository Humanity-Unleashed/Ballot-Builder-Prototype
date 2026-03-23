'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  ExternalLink,
  FileText,
  Printer,
  RefreshCw,
  Pencil,
  CheckCircle2,
  XCircle,
  User,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
} from 'lucide-react';
import type { BallotItem, Category, UserVote } from '@/lib/ballotHelpers';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import type { VoteAmericaStateRules } from '@/server/types/externalApis';
import { useDemographicStore } from '@/stores/demographicStore';

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

interface NextStepsCardProps {
  voterInfo?: VoterInfo | null;
  location?: LocationInfo | null;
  // Vote review data
  votes: UserVote[];
  ballotItems: BallotItem[];
  categories: Category[];
  onEditItem: (index: number) => void;
  onStartOver: () => void;
  onPrint: () => void;
}

const STATE_VOTER_DEFAULTS: Record<string, {
  location: string;
  registrationUrl: string;
  pollingUrl: string;
  absenteeUrl: string;
}> = {
  TX: {
    location: 'Austin, Texas',
    registrationUrl: 'https://teamrv-mvp.sos.texas.gov/MVP/mvp.do',
    pollingUrl: 'https://www.votetexas.gov/voting/where.html',
    absenteeUrl: 'https://www.votetexas.gov/voting/voting-by-mail.html',
  },
  MI: {
    location: 'Detroit, Michigan',
    registrationUrl: 'https://mvic.sos.state.mi.us/Voter/Index',
    pollingUrl: 'https://mvic.sos.state.mi.us/Voter/Index',
    absenteeUrl: 'https://mvic.sos.state.mi.us/AVApplication/Index',
  },
  GA: {
    location: 'Atlanta, Georgia',
    registrationUrl: 'https://mvp.sos.ga.gov/s/',
    pollingUrl: 'https://mvp.sos.ga.gov/s/',
    absenteeUrl: 'https://mvp.sos.ga.gov/s/',
  },
  NC: {
    location: 'Raleigh, North Carolina',
    registrationUrl: 'https://www.ncsbe.gov/registering/how-register',
    pollingUrl: 'https://vt.ncsbe.gov/PPLkup/',
    absenteeUrl: 'https://www.ncsbe.gov/voting/vote-mail',
  },
};

const FALLBACK_DEFAULTS = STATE_VOTER_DEFAULTS.TX;

const iconMap: Record<string, React.ElementType> = {
  'file-text': FileText,
  users: User,
};

function getVoteDisplay(vote: UserVote, item: BallotItem): string {
  if (item.type === 'proposition') return vote.choice === 'yes' ? 'YES' : 'NO';
  if (vote.choice === 'write_in') return `Write-in: ${vote.writeInName}`;
  const candidate = item.candidates?.find((c) => c.id === vote.choice);
  return candidate?.name || String(vote.choice);
}

function getVoteIcon(vote: UserVote, item: BallotItem) {
  if (item.type === 'proposition') return vote.choice === 'yes' ? CheckCircle2 : XCircle;
  return User;
}

function getVoteColor(vote: UserVote, item: BallotItem): string {
  if (item.type === 'proposition') return vote.choice === 'yes' ? 'text-success' : 'text-negative';
  return 'text-brand-primary';
}

export default function NextStepsCard({
  voterInfo,
  location,
  votes,
  ballotItems,
  categories,
  onEditItem,
  onStartOver,
  onPrint,
}: NextStepsCardProps) {
  const { track } = useAnalyticsContext();
  const [reviewOpen, setReviewOpen] = useState(false);
  const selectedState = useDemographicStore((s) => s.profile.selectedState);
  const stateDefaults = (selectedState && STATE_VOTER_DEFAULTS[selectedState]) || FALLBACK_DEFAULTS;

  const locationLabel = location
    ? (location.city ? `${location.city}, ${location.stateName}` : location.stateName)
    : stateDefaults.location;

  const registrationUrl = voterInfo?.registrationUrl ?? voterInfo?.stateRules?.voter_registration_url ?? stateDefaults.registrationUrl;
  const pollingUrl = voterInfo?.pollingPlaceUrl ?? voterInfo?.stateRules?.polling_place_url ?? stateDefaults.pollingUrl;
  const absenteeUrl = voterInfo?.absenteeBallotUrl ?? voterInfo?.stateRules?.absentee_ballot_url ?? stateDefaults.absenteeUrl;

  const votedCount = votes.length;
  const skippedCount = ballotItems.length - votedCount;

  const groupedItems = categories
    .map((cat) => ({
      category: cat,
      items: ballotItems
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-4 rounded-2xl border border-border-default bg-white overflow-hidden">
      {/* Card title */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-[15px] font-bold text-gray-900">Get ready to vote</h2>
        <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="h-3 w-3" />
          {locationLabel}
        </p>
      </div>

      {/* ── Step 1: Review & print your ballot ── */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => {
            setReviewOpen((prev) => !prev);
            track('click', { element: 'toggle_review', open: !reviewOpen });
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-brand-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-semibold text-gray-800">Review your selections</p>
            <p className="text-[12px] text-gray-400">
              {votedCount} voted{skippedCount > 0 ? `, ${skippedCount} skipped` : ''}
            </p>
          </div>
          {reviewOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
          )}
        </button>

        {reviewOpen && (
          <div className="px-4 pb-3 space-y-4 animate-fade-in-up">
            {groupedItems.map(({ category, items }) => {
              const CategoryIcon = iconMap[category.icon] || FileText;
              return (
                <div key={category.id}>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <CategoryIcon className="h-3.5 w-3.5" style={{ color: category.color }} />
                    <span className="text-[12px] font-semibold" style={{ color: category.color }}>
                      {category.name}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {items.map(({ item, index }) => {
                      const vote = votes.find((v) => v.itemId === item.id);
                      const isSkipped = !vote;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center bg-gray-50 rounded-lg p-2.5 border border-gray-100"
                        >
                          <div className="flex-1 space-y-0.5">
                            <p className="text-[13px] font-semibold text-gray-900 leading-5">
                              {item.title}
                            </p>
                            {isSkipped ? (
                              <div className="flex items-center gap-1.5">
                                <MinusCircle className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-[12px] text-gray-400 italic">Skipped</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {React.createElement(getVoteIcon(vote, item), {
                                  className: `h-4 w-4 ${getVoteColor(vote, item)}`,
                                })}
                                <span className={`text-[12px] font-bold ${getVoteColor(vote, item)}`}>
                                  {getVoteDisplay(vote, item)}
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => onEditItem(index)}
                            className="ml-2 w-7 h-7 rounded-full bg-white flex items-center justify-center border border-border-default hover:bg-brand-primary/10 transition-colors"
                          >
                            <Pencil className="h-3 w-3 text-brand-primary" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Print / Start Over — always visible */}
        <div className="flex items-center border-t border-gray-100">
          <button
            onClick={() => {
              track('click', { element: 'print_ballot', votedCount, skippedCount });
              onPrint();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold text-brand-primary hover:bg-brand-primary/5 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Ballot
          </button>
          <div className="w-px h-5 bg-gray-100" />
          <button
            onClick={() => {
              track('click', { element: 'start_over' });
              onStartOver();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Start Over
          </button>
        </div>
      </div>

      {/* ── Step 2: Check voter registration ── */}
      <a
        href={registrationUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('click', { element: 'next_step_voter_registration' })}
        className="flex items-center gap-3 px-4 py-3.5 border-t border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
          <ClipboardCheck className="h-4 w-4 text-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800 leading-5">Check voter registration</p>
          <p className="text-[12px] text-gray-400">Confirm you&apos;re registered to vote</p>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
      </a>

      {/* ── Step 3: Find your polling place ── */}
      <a
        href={pollingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('click', { element: 'next_step_polling_place' })}
        className="flex items-center gap-3 px-4 py-3.5 border-t border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
          <MapPin className="h-4 w-4 text-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800 leading-5">Find your polling place</p>
          <p className="text-[12px] text-gray-400">{locationLabel}</p>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
      </a>

      {/* ── Step 3: Request mail-in ballot ── */}
      <a
        href={absenteeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('click', { element: 'next_step_mail_in_ballot' })}
        className="flex items-center gap-3 px-4 py-3.5 border-t border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
          <Mail className="h-4 w-4 text-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800 leading-5">Request a mail-in ballot</p>
          <p className="text-[12px] text-gray-400">Apply for an absentee ballot</p>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
      </a>
    </div>
  );
}
