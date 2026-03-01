'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
      <p className="text-xs leading-relaxed text-amber-800">
        <strong>Demo ballot</strong> — these races combine candidates across
        primaries for testing. The real version will load your actual ballot
        based on your address.
      </p>
    </div>
  );
}
