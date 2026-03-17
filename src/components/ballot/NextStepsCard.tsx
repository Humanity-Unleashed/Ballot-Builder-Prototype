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

  const actionLinks = [
    {
      id: 'polling_place',
      icon: MapPin,
      label: 'Find your polling place',
      subtitle: 'Look up by your address',
      href: pollingUrl,
    },
    {
      id: 'mail_in_ballot',
      icon: Mail,
      label: 'Request a mail-in ballot',
      subtitle: 'Apply for an absentee ballot',
      href: absenteeUrl,
    },
  ];

  return (
    <div className="px-4 animate-fade-in-up space-y-6">
      {/* Nearby Polling Places (preview) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-text-secondary">
            Nearby polling places
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-primary/10 text-brand-primary">
            Preview
          </span>
        </div>
        <div className="bg-white rounded-xl border border-border-default divide-y divide-border-default">
          {SAMPLE_LOCATIONS.map((loc) => (
            <div key={loc.name} className="flex items-center gap-3 px-4 py-3">
              <MapPin className="h-4 w-4 text-text-muted shrink-0" />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-text-primary leading-5">
                  {loc.name}
                </p>
                <p className="text-xs text-text-muted">{loc.address}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted italic mt-2 px-1">
          In the full version, we&apos;ll show real locations based on your address
        </p>
      </div>

      {/* Take Action links */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary">
          Take action
        </h2>
        <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Showing info for {locationLabel}
        </p>
        <div className="space-y-3">
          {actionLinks.map((step) => {
            const Icon = step.icon;
            return (
              <a
                key={step.id}
                href={step.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('click', { element: `next_step_${step.id}` })}
                className="flex items-center gap-3 bg-white rounded-xl p-4 border border-border-default hover:border-brand-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-brand-primary-light flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-text-primary leading-5">
                    {step.label}
                  </p>
                  <p className="text-xs text-text-muted truncate">{step.subtitle}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-text-muted shrink-0" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
