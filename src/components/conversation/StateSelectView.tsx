'use client';

import React from 'react';
import { BALLOT_IDS } from '@/server/data/ballot/ids';

interface StateSelectViewProps {
  onStateSelected: (stateCode: string, ballotId: string) => void;
}

export default function StateSelectView({ onStateSelected }: StateSelectViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-gray-900">
            Welcome to Ballot Builder
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Explore a real ballot with scored candidates
          </p>
        </div>

        {/* Single ballot card */}
        <button
          type="button"
          onClick={() => onStateSelected('TX', BALLOT_IDS.TX_AUSTIN_2026)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-5 text-left transition-colors hover:border-brand-primary hover:bg-brand-primary-light"
        >
          <span className="block text-base font-semibold text-gray-800">
            Austin, Texas — November 2026
          </span>
          <span className="block mt-1 text-xs leading-tight text-gray-500">
            U.S. Senate · Governor · Attorney General · U.S. House TX-37 · Lt. Governor · Comptroller · Land Commissioner · Ag Commissioner · Railroad Commissioner
          </span>
        </button>

        {/* Demo note */}
        <p className="text-center text-xs text-gray-400">
          Demo mode — 9 contests, 21 candidates scored from real-world data
        </p>
      </div>
    </div>
  );
}
