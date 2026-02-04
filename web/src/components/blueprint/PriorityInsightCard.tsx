'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PriorityInsightCardProps {
  priorities: string[];
}

export default function PriorityInsightCard({ priorities }: PriorityInsightCardProps) {
  return (
    <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
      <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600" />
      <p className="flex-1 text-sm leading-5 text-emerald-900">
        <strong className="font-bold">{priorities[0]}</strong> and{' '}
        <strong className="font-bold">{priorities[1]}</strong> are your top priorities
      </p>
    </div>
  );
}
