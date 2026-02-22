'use client';

import { MapPin, Mail, ExternalLink } from 'lucide-react';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

const SAMPLE_LOCATIONS = [
  { name: 'Riverside Community Center', address: '425 Elm Street' },
  { name: 'Lincoln Elementary School', address: '1200 Oak Avenue' },
  { name: 'Maplewood Public Library', address: '88 Birch Lane' },
];

const ACTION_LINKS = [
  {
    id: 'polling_place',
    icon: MapPin,
    label: 'Find your polling place',
    subtitle: 'Look up by your address',
    href: 'https://mvic.sos.state.mi.us/Voter/Index',
  },
  {
    id: 'mail_in_ballot',
    icon: Mail,
    label: 'Request a mail-in ballot',
    subtitle: 'Apply for an absentee ballot',
    href: 'https://mvic.sos.state.mi.us/AVApplication/Index',
  },
] as const;

export default function NextStepsCard() {
  const { track } = useAnalyticsContext();

  return (
    <div className="px-4 animate-fade-in-up space-y-6">
      {/* Nearby Polling Places (preview) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Nearby Polling Places
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
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Take Action
        </h2>
        <div className="space-y-3">
          {ACTION_LINKS.map((step) => {
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
