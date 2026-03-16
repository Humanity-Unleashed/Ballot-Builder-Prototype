'use client';

import React from 'react';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';

interface RefineOfferCardProps {
  axisName: string;
  subDimensionCount: number;
  /** The position title they selected on the main card */
  selectedPositionTitle: string;
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * Brief prompt shown after a card selection when the axis has
 * fine-tuning sub-dimensions. Offers the user a chance to refine
 * their answer with more specific questions.
 */
export default function RefineOfferCard({
  axisName,
  subDimensionCount,
  selectedPositionTitle,
  onAccept,
  onDecline,
}: RefineOfferCardProps) {
  return (
    <div className="mx-4 mt-4 max-w-lg w-full">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Selection summary */}
        <div className="mb-4 rounded-xl bg-brand-primary/[0.04] border border-brand-primary/20 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Your pick
          </p>
          <p className="text-[14px] font-semibold text-gray-900">
            {selectedPositionTitle}
          </p>
        </div>

        {/* Offer */}
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-brand-primary" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900">
              Want to be more specific?
            </p>
            <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">
              {axisName} has {subDimensionCount} sub-topic{subDimensionCount !== 1 ? 's' : ''} where
              your views might differ from the card you picked.
              This takes about {subDimensionCount * 10} seconds.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            No, move on
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-1.5"
          >
            Refine
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
