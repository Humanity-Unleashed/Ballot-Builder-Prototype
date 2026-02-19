'use client';

import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Package,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { VoteAmericaStateRules } from '@/server/types/externalApis';

interface VoterInfo {
  registrationUrl?: string;
  absenteeBallotUrl?: string;
  pollingPlaceUrl?: string;
  stateRules?: VoteAmericaStateRules;
}

interface ElectionBannerProps {
  daysUntilElection: number;
  electionLabel: string;
  voterInfo?: VoterInfo | null;
}

const DEFAULT_REGISTRATION_URL = 'https://mvic.sos.state.mi.us/Voter/Index';
const DEFAULT_ABSENTEE_URL = 'https://mvic.sos.state.mi.us/AVApplication/Index';
const DEFAULT_POLLING_URL = 'https://mvic.sos.state.mi.us/Voter/Index';

export default function ElectionBanner({
  daysUntilElection,
  electionLabel,
  voterInfo,
}: ElectionBannerProps) {
  const [expanded, setExpanded] = useState(false);

  const registrationUrl = voterInfo?.registrationUrl ?? voterInfo?.stateRules?.voter_registration_url ?? DEFAULT_REGISTRATION_URL;
  const absenteeUrl = voterInfo?.absenteeBallotUrl ?? voterInfo?.stateRules?.absentee_ballot_url ?? DEFAULT_ABSENTEE_URL;
  const pollingUrl = voterInfo?.pollingPlaceUrl ?? voterInfo?.stateRules?.polling_place_url ?? DEFAULT_POLLING_URL;

  const registrationDeadline = voterInfo?.stateRules?.registration_deadline_online;
  const earlyVotingStarts = voterInfo?.stateRules?.early_voting_starts;

  // ── Collapsed state ──
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="mb-4 flex w-full items-center gap-2 rounded-[14px] bg-gradient-to-r from-blue-500 to-blue-700 px-3.5 py-3 text-left"
      >
        <Calendar className="h-4 w-4 flex-shrink-0 text-white" />
        <span className="flex-1 text-[13px] font-bold text-white">Election Day</span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
          {daysUntilElection} days
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-white/70" />
      </button>
    );
  }

  // ── Expanded state ──
  return (
    <div className="mb-4 overflow-hidden rounded-[14px] bg-gradient-to-r from-blue-500 to-blue-700">
      {/* Header */}
      <div className="flex items-center gap-2 px-3.5 py-3 text-white">
        <Calendar className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-[13px] font-bold">{electionLabel}</span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
          {daysUntilElection} days
        </span>
      </div>

      {/* Body */}
      <div className="bg-white px-3.5 py-1.5">
        {/* Voter Registration */}
        <div className="flex items-center gap-2.5 border-b border-gray-100 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-900">Voter Registration</div>
            <div className="text-[10px] text-gray-500">
              {registrationDeadline ? `Deadline: ${registrationDeadline}` : 'Last day to register'}
            </div>
          </div>
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600"
          >
            Check &rarr;
          </a>
        </div>

        {/* Mail-in Ballot */}
        <div className="flex items-center gap-2.5 border-b border-gray-100 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-900">Mail-in Ballot</div>
            <div className="text-[10px] text-gray-500">Request your mail ballot</div>
          </div>
          <a
            href={absenteeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-600"
          >
            Request &rarr;
          </a>
        </div>

        {/* Polling Place */}
        <div className="flex items-center gap-2.5 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
            <MapPin className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-900">Polling Place</div>
            <div className="text-[10px] text-gray-500">
              {earlyVotingStarts ? `Early voting: ${earlyVotingStarts}` : 'Find your voting location'}
            </div>
          </div>
          <a
            href={pollingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-600"
          >
            Find &rarr;
          </a>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setExpanded(false)}
        className="flex w-full items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-white/80"
      >
        <ChevronUp className="h-3 w-3" />
        Collapse
      </button>
    </div>
  );
}
