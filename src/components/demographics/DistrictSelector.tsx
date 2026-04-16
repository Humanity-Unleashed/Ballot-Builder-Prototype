'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

import { useDemographicStore } from '@/stores/demographicStore';
import { BALLOT_IDS } from '@/server/data/ballot/ids';

// ── Component ──

interface DistrictSelectorProps {
  showError?: boolean;
}

export default function DistrictSelector({ showError }: DistrictSelectorProps) {
  const profile = useDemographicStore((s) => s.profile);
  const setField = useDemographicStore((s) => s.setField);

  const isSelected = profile.selectedState === 'TX';

  const handleSelect = () => {
    if (isSelected) {
      // Deselect
      setField('selectedState', null);
      setField('selectedBallotId', null);
    } else {
      setField('selectedState', 'TX');
      setField('selectedBallotId', BALLOT_IDS.TX_AUSTIN_2026);
    }
  };

  return (
    <div className="space-y-3">
      {/* Demo disclaimer */}
      <div className="flex gap-3 rounded-xl bg-blue-50 border border-blue-200 p-3">
        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
        <p className="text-xs leading-relaxed text-blue-800">
          <strong>Demo ballot:</strong> This is a real ballot for Austin, TX (78721) in the
          November 2026 general election. All 9 contests, 1 ballot measure, and 21 candidates
          are scored from real-world data.
        </p>
      </div>

      {/* Single ballot selector */}
      <h3 className="text-sm font-semibold text-gray-700">
        Select your ballot
        {showError && !profile.selectedBallotId && (
          <span className="ml-2 text-xs font-normal text-red-500">Required</span>
        )}
      </h3>

      <button
        type="button"
        onClick={handleSelect}
        className={`w-full rounded-lg border px-4 py-4 text-left transition-colors ${
          isSelected
            ? 'border-brand-primary bg-brand-primary-light'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <span
          className={`block text-sm font-semibold ${
            isSelected ? 'text-brand-primary' : 'text-gray-700'
          }`}
        >
          Austin, Texas — November 2026
        </span>
        <span className="block mt-1 text-[11px] leading-tight text-gray-500">
          U.S. Senate · Governor · Attorney General · U.S. House TX-37 · Lt. Governor · Comptroller · Ag Commissioner · Railroad Commissioner
        </span>
      </button>
    </div>
  );
}
