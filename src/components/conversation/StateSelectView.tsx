'use client';

import React from 'react';
import { STATE_CONFIGS } from '@/components/demographics/DistrictSelector';

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
            Which state&apos;s ballot would you like to explore?
          </p>
        </div>

        {/* State cards */}
        <div className="grid grid-cols-2 gap-3">
          {STATE_CONFIGS.map((config) => (
            <button
              key={config.state}
              type="button"
              onClick={() => onStateSelected(config.state, config.ballotId)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-left transition-colors hover:border-brand-primary hover:bg-brand-primary-light"
            >
              <span className="block text-base font-semibold text-gray-800">
                {config.label}
              </span>
              <span className="block mt-1 text-xs leading-tight text-gray-500">
                {config.races.join(' · ')}
              </span>
            </button>
          ))}
        </div>

        {/* Demo note */}
        <p className="text-center text-xs text-gray-400">
          Demo mode — sample ballots with real candidate data
        </p>
      </div>
    </div>
  );
}
