'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import { getNextElectionDay, daysUntil } from '@/lib/electionDate';

const AVATARS = [
  { initials: 'MS', bg: 'bg-brand-primary/20', text: 'text-brand-primary' },
  { initials: 'JK', bg: 'bg-green-100', text: 'text-green-700' },
  { initials: 'LR', bg: 'bg-orange-100', text: 'text-orange-700' },
  { initials: 'DP', bg: 'bg-purple-100', text: 'text-purple-700' },
];

export default function SquadInviteCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { track } = useAnalyticsContext();
  const days = daysUntil(getNextElectionDay());

  return (
    <>
      <div className="px-4 animate-fade-in-up">
        <div className="bg-white rounded-2xl border border-border-default p-6 text-center">
          {/* Avatar row */}
          <div className="flex justify-center -space-x-3 mb-4">
            {AVATARS.map((a) => (
              <div
                key={a.initials}
                className={`w-11 h-11 rounded-full ${a.bg} border-2 border-white flex items-center justify-center ${a.text} font-bold text-sm`}
              >
                {a.initials}
              </div>
            ))}
            <div className="w-11 h-11 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-text-muted text-lg">
              +
            </div>
          </div>

          <h3 className="text-lg font-bold text-text-primary mb-1">
            Get your people ballot-ready
          </h3>
          <p className="text-sm text-text-secondary mb-1">
            Election Day is <span className="font-semibold text-text-primary">{days} day{days !== 1 ? 's' : ''}</span> away.
            Create a Voting Squad and prep together.
          </p>
          <p className="text-xs text-text-muted mb-5">
            Members can see completion &mdash; never what you chose.
          </p>

          <button
            onClick={() => {
              track('click', { element: 'create_voting_squad' });
              setModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors"
          >
            <Users className="h-5 w-5 text-white" />
            <span className="text-[15px] font-bold text-white">Create a Voting Squad</span>
          </button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Coming Soon">
        <p className="text-sm text-text-secondary mb-5">
          Voting Squads are coming soon! We&apos;ll let you know when this feature is ready.
        </p>
        <button
          onClick={() => setModalOpen(false)}
          className="w-full py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition-colors"
        >
          Got it
        </button>
      </Modal>
    </>
  );
}
