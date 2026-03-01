'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

import { useDemographicStore } from '@/stores/demographicStore';
import type { DemoState } from '@/stores/demographicStore';
import { BALLOT_IDS } from '@/server/data/ballot/ids';

// ── State → Ballot mapping ──

interface StateBallotConfig {
  state: DemoState;
  label: string;
  ballotId: string;
  races: string[];
}

const STATE_CONFIGS: StateBallotConfig[] = [
  {
    state: 'GA',
    label: 'Georgia',
    ballotId: BALLOT_IDS.GA_2026,
    races: ['U.S. Senate', 'Governor', 'U.S. House GA-06', '1 ballot measure'],
  },
  {
    state: 'MI',
    label: 'Michigan',
    ballotId: BALLOT_IDS.MI_UP_2026,
    races: ['U.S. Senate', 'State Senate D38', '2 ballot measures'],
  },
  {
    state: 'NC',
    label: 'North Carolina',
    ballotId: BALLOT_IDS.NC_2026,
    races: ['U.S. Senate (6 candidates)'],
  },
  {
    state: 'TX',
    label: 'Texas',
    ballotId: BALLOT_IDS.TX_2026,
    races: ['U.S. Senate', 'Governor', 'Attorney General', 'U.S. House TX-34', 'U.S. House TX-28'],
  },
];

// ── Component ──

interface DistrictSelectorProps {
  showError?: boolean;
}

export default function DistrictSelector({ showError }: DistrictSelectorProps) {
  const profile = useDemographicStore((s) => s.profile);
  const setField = useDemographicStore((s) => s.setField);

  const handleSelect = (config: StateBallotConfig) => {
    if (profile.selectedState === config.state) {
      // Deselect
      setField('selectedState', null);
      setField('selectedBallotId', null);
    } else {
      setField('selectedState', config.state);
      setField('selectedBallotId', config.ballotId);
    }
  };

  return (
    <div className="space-y-3">
      {/* Demo disclaimer */}
      <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">
          <strong>Demo mode:</strong> Choose a state to explore its sample ballot.
          Candidates from different primaries may appear together. The real version
          will load your actual ballot based on your address.
        </p>
      </div>

      {/* State selector */}
      <h3 className="text-sm font-semibold text-gray-700">
        Choose a state to explore
        {showError && !profile.selectedBallotId && (
          <span className="ml-2 text-xs font-normal text-red-500">Required</span>
        )}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {STATE_CONFIGS.map((config) => {
          const selected = profile.selectedState === config.state;
          return (
            <button
              key={config.state}
              type="button"
              onClick={() => handleSelect(config)}
              className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                selected
                  ? 'border-brand-primary bg-brand-primary-light'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span
                className={`block text-sm font-semibold ${
                  selected ? 'text-brand-primary' : 'text-gray-700'
                }`}
              >
                {config.label}
              </span>
              <span className="block mt-0.5 text-[11px] leading-tight text-gray-500">
                {config.races.join(' · ')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
