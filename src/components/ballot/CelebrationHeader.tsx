'use client';

import { PartyPopper } from 'lucide-react';
import {
  getNextElectionDay,
  daysUntil,
  formatElectionDate,
} from '@/lib/electionDate';

export default function CelebrationHeader() {
  const electionDay = getNextElectionDay();
  const days = daysUntil(electionDay);
  const dateStr = formatElectionDate(electionDay);

  return (
    <div className="flex flex-col items-center text-center px-4 pt-6 pb-2 animate-celebrate-in">
      <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mb-4">
        <PartyPopper className="h-8 w-8 text-success" />
      </div>

      <h1 className="text-[22px] font-extrabold text-text-primary leading-7 mb-1">
        You&apos;re ready for Election Day!
      </h1>

      <p className="text-sm text-text-secondary">
        {dateStr} &middot; {days} day{days !== 1 ? 's' : ''} away
      </p>
    </div>
  );
}
