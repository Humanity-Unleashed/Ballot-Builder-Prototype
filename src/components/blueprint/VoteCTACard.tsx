'use client';

import React from 'react';
import { CheckSquare, ArrowRight } from 'lucide-react';

interface VoteCTACardProps {
  onPress: () => void;
}

export default function VoteCTACard({ onPress }: VoteCTACardProps) {
  return (
    <button
      onClick={onPress}
      className="mt-1 mb-3 flex w-full items-center gap-3 rounded-2xl bg-gray-800 p-[18px] text-left transition-opacity hover:opacity-90 active:opacity-80"
    >
      <CheckSquare className="h-6 w-6 shrink-0 text-white" />
      <div className="flex-1">
        <span className="block text-base font-bold text-white">Make My Voting Plan</span>
        <span className="mt-0.5 block text-[13px] text-white/60">
          Match your blueprint to real candidates
        </span>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-white/70" />
    </button>
  );
}
