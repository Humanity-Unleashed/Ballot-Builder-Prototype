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

        {/* Address input (coming soon) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-400">
              Enter your address
            </label>
            <span className="text-xs font-medium text-brand-primary bg-brand-primary-light px-2 py-0.5 rounded-full">
              Coming soon
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              disabled
              placeholder="123 Main St, City, State"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400 placeholder-gray-300 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-400">
            In the full version, we&apos;ll look up your exact ballot based on your address.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">Try the demo</span>
          <div className="flex-1 h-px bg-gray-200" />
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
          Demo mode — 9 contests, 1 ballot measure, 21 candidates scored from real-world data
        </p>
      </div>
    </div>
  );
}
