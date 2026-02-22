'use client';

import React from 'react';
import { User } from 'lucide-react';
import type { PersonalImpact } from '@/lib/ballotHelpers';

const EFFECT_DOT_COLOR: Record<PersonalImpact['effect'], string> = {
  benefit: 'bg-green-500',
  concern: 'bg-amber-500',
  mixed: 'bg-brand-primary',
  context: 'bg-gray-400',
};

interface PersonalImpactSectionProps {
  impacts: PersonalImpact[];
}

export default function PersonalImpactSection({ impacts }: PersonalImpactSectionProps) {
  if (impacts.length === 0) return null;

  return (
    <div className="rounded-xl bg-brand-primary-surface border border-brand-primary-light overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-brand-primary-light">
        <User className="h-4 w-4 text-brand-primary shrink-0" />
        <span className="text-[13px] font-semibold text-brand-primary leading-[18px]">
          How this could affect you
        </span>
      </div>

      <div className="p-3 space-y-2">
        {impacts.map((impact, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex items-start gap-2">
              <div
                className={`w-2 h-2 rounded-full mt-[5px] shrink-0 ${EFFECT_DOT_COLOR[impact.effect]}`}
              />
              <span className="text-[13px] text-gray-700 leading-[18px] flex-1">
                {impact.headline}
              </span>
            </div>
            {impact.detail && (
              <p className="text-[12px] text-gray-500 leading-[17px] ml-4">
                {impact.detail}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
