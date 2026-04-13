'use client';

import React from 'react';
import { BlueprintProvider } from '@/context/BlueprintContext';
import { FeedbackScreenProvider } from '@/context/FeedbackScreenContext';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BlueprintProvider>
      <FeedbackScreenProvider>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </FeedbackScreenProvider>
    </BlueprintProvider>
  );
}
