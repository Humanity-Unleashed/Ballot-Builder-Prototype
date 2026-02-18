'use client';

import { MapPin, Mail, ExternalLink } from 'lucide-react';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

const STEPS = [
  {
    id: 'polling_place',
    icon: MapPin,
    label: 'Find your polling place',
    subtitle: 'Michigan Voter Information Center',
    href: 'https://mvic.sos.state.mi.us/Voter/Index',
  },
  {
    id: 'mail_in_ballot',
    icon: Mail,
    label: 'Request a mail-in ballot',
    subtitle: 'Michigan absentee ballot application',
    href: 'https://mvic.sos.state.mi.us/AVApplication/Index',
  },
] as const;

export default function NextStepsCard() {
  const { track } = useAnalyticsContext();

  return (
    <div className="px-4 animate-fade-in-up">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
        Next Steps
      </h2>
      <div className="space-y-3">
        {STEPS.map((step) => {
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
  );
}
