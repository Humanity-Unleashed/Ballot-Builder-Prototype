'use client';

import { PartyPopper } from 'lucide-react';
import type { BallotItem } from '@/lib/ballotHelpers';
import {
  getNextElectionDay,
  daysUntil,
  formatElectionDate,
} from '@/lib/electionDate';

interface CelebrationHeaderProps {
  ballotItems: BallotItem[];
  sessionMinutes?: number;
}

export default function CelebrationHeader({ ballotItems, sessionMinutes }: CelebrationHeaderProps) {
  const electionDay = getNextElectionDay();
  const days = daysUntil(electionDay);
  const dateStr = formatElectionDate(electionDay);

  const races = ballotItems.filter((i) => i.type === 'candidate_race').length;
  const measures = ballotItems.filter((i) => i.type === 'proposition').length;

  return (
    <div className="flex flex-col items-center text-center px-4 pt-6 pb-2 animate-celebrate-in">
      <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mb-4">
        <PartyPopper className="h-8 w-8 text-success" />
      </div>

      <h1 className="text-[22px] font-extrabold text-text-primary leading-7 mb-1">
        You&apos;re ready for Election Day!
      </h1>

      <p className="text-sm text-text-secondary mb-4">
        {dateStr} &middot; {days} day{days !== 1 ? 's' : ''} away
      </p>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-border-default p-5 animate-fade-in-up">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-primary">{races}</p>
            <p className="text-xs text-text-secondary mt-1">Races reviewed</p>
          </div>
          <div className="w-px h-12 bg-border-default" />
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-primary">{measures}</p>
            <p className="text-xs text-text-secondary mt-1">Ballot measures</p>
          </div>
          {sessionMinutes != null && sessionMinutes > 0 && (
            <>
              <div className="w-px h-12 bg-border-default" />
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-primary">{sessionMinutes}</p>
                <p className="text-xs text-text-secondary mt-1">Minutes spent</p>
              </div>
            </>
          )}
        </div>
        {sessionMinutes != null && sessionMinutes > 0 && (
          <p className="text-[13px] text-text-secondary mt-3 pt-3 border-t border-border-default text-center">
            You just prepped your entire ballot in {sessionMinutes} minute{sessionMinutes !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
