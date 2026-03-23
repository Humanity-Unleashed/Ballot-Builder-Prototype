'use client';

import { MapPin, Mail, ExternalLink } from 'lucide-react';
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
}

const SAMPLE_LOCATIONS = [
  { name: 'Riverside Community Center', address: '425 Elm Street' },
  { name: 'Lincoln Elementary School', address: '1200 Oak Avenue' },
  { name: 'Maplewood Public Library', address: '88 Birch Lane' },
];

/** Per-state default voter info URLs */
const STATE_VOTER_DEFAULTS: Record<string, {
  location: string;
  pollingUrl: string;
  absenteeUrl: string;
}> = {
  TX: {
    location: 'Austin, Texas',
    pollingUrl: 'https://www.votetexas.gov/voting/where.html',
    absenteeUrl: 'https://www.votetexas.gov/voting/voting-by-mail.html',
  },
  MI: {
    location: 'Detroit, Michigan',
    pollingUrl: 'https://mvic.sos.state.mi.us/Voter/Index',
    absenteeUrl: 'https://mvic.sos.state.mi.us/AVApplication/Index',
  },
  GA: {
    location: 'Atlanta, Georgia',
    pollingUrl: 'https://mvp.sos.ga.gov/s/',
    absenteeUrl: 'https://mvp.sos.ga.gov/s/',
  },
  NC: {
    location: 'Raleigh, North Carolina',
    pollingUrl: 'https://vt.ncsbe.gov/PPLkup/',
    absenteeUrl: 'https://www.ncsbe.gov/voting/vote-mail',
  },
};

const FALLBACK_DEFAULTS = STATE_VOTER_DEFAULTS.TX;

export default function NextStepsCard({ voterInfo, location }: NextStepsCardProps) {
  const { track } = useAnalyticsContext();
  const selectedState = useDemographicStore((s) => s.profile.selectedState);
  const stateDefaults = (selectedState && STATE_VOTER_DEFAULTS[selectedState]) || FALLBACK_DEFAULTS;

  const locationLabel = location
    ? (location.city ? `${location.city}, ${location.stateName}` : location.stateName)
    : stateDefaults.location;

  const pollingUrl = voterInfo?.pollingPlaceUrl ?? voterInfo?.stateRules?.polling_place_url ?? stateDefaults.pollingUrl;
  const absenteeUrl = voterInfo?.absenteeBallotUrl ?? voterInfo?.stateRules?.absentee_ballot_url ?? stateDefaults.absenteeUrl;

  return (
    <div className="mx-4 rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Section header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-[15px] font-bold text-gray-900">Get ready to vote</h2>
        <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="h-3 w-3" />
          Showing info for {locationLabel}
        </p>
      </div>

      {/* Polling places */}
      <div className="px-4 pb-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          Nearby polling places
          <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] normal-case tracking-normal">
            Preview
          </span>
        </p>
        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
          {SAMPLE_LOCATIONS.map((loc) => (
            <div key={loc.name} className="flex items-center gap-3 px-3.5 py-2.5">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 leading-5">
                  {loc.name}
                </p>
                <p className="text-[12px] text-gray-400">{loc.address}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Find your polling place — right under the list */}
        <a
          href={pollingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('click', { element: 'next_step_polling_place' })}
          className="flex items-center gap-2 mt-2 px-1 text-[13px] font-semibold text-brand-primary hover:underline"
        >
          <MapPin className="h-3.5 w-3.5" />
          Find your actual polling place
          <ExternalLink className="h-3 w-3" />
        </a>
        <p className="text-[11px] text-gray-400 italic mt-1 px-1">
          In the full version, we&apos;ll show real locations based on your address.
        </p>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gray-100" />

      {/* Mail-in ballot */}
      <a
        href={absenteeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('click', { element: 'next_step_mail_in_ballot' })}
        className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
          <Mail className="h-4 w-4 text-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800 leading-5">
            Request a mail-in ballot
          </p>
          <p className="text-[12px] text-gray-400">Apply for an absentee ballot</p>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
      </a>
    </div>
  );
}
