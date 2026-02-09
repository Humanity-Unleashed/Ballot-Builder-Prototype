'use client';

import React, { useState, useCallback } from 'react';
import AssessmentQuestion from './AssessmentQuestion';
import type { SchwartzAssessmentItem, SchwartzItemResponse } from '@/services/api';

interface BoosterFlowProps {
  boosterId: string;
  title: string;
  items: SchwartzAssessmentItem[];
  onComplete: (boosterId: string, responses: SchwartzItemResponse[]) => void;
  onCancel: () => void;
}

export default function BoosterFlow({
  boosterId,
  title,
  items,
  onComplete,
  onCancel,
}: BoosterFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, 1 | 2 | 3 | 4 | 5>>(new Map());

  const currentItem = items[currentIndex];
  const currentValue = responses.get(currentItem.id) ?? null;

  const handleResponse = useCallback(
    (value: 1 | 2 | 3 | 4 | 5) => {
      setResponses((prev) => {
        const next = new Map(prev);
        next.set(currentItem.id, value);
        return next;
      });
    },
    [currentItem.id],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Last question — finalize
      const result: SchwartzItemResponse[] = items
        .map((item) => {
          const val = responses.get(item.id);
          return val ? { item_id: item.id, response: val } : null;
        })
        .filter((r): r is SchwartzItemResponse => r !== null);

      onComplete(boosterId, result);
    }
  }, [currentIndex, items, responses, boosterId, onComplete]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      onCancel();
    }
  }, [currentIndex, onCancel]);

  return (
    <div className="rounded-xl border border-violet-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-violet-50 px-4 py-3 border-b border-violet-100">
        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
          {title}
        </p>
      </div>

      {/* Reuse AssessmentQuestion */}
      <div className="[&>div]:min-h-0 [&>div]:bg-white">
        <AssessmentQuestion
          item={currentItem}
          currentIndex={currentIndex}
          totalItems={items.length}
          currentValue={currentValue}
          onResponse={handleResponse}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={true}
          isLast={currentIndex === items.length - 1}
        />
      </div>
    </div>
  );
}
