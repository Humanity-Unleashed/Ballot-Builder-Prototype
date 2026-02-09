'use client';

import React from 'react';
import { Sparkles, X } from 'lucide-react';
import type { BoosterSetMeta } from '@/services/api';

interface BoosterBannerProps {
  booster: BoosterSetMeta;
  onStart: () => void;
  onDismiss: () => void;
}

export default function BoosterBanner({ booster, onStart, onDismiss }: BoosterBannerProps) {
  return (
    <div className="relative rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 shadow-sm">
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 text-amber-400 hover:text-amber-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Sparkles className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">{booster.title}</p>
          <p className="mt-1 text-xs text-amber-700">
            {booster.description}
          </p>
          <button
            onClick={onStart}
            className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            Answer {booster.itemCount} Questions
          </button>
        </div>
      </div>
    </div>
  );
}
