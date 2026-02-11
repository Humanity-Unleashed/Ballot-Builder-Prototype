'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { BlueprintProvider } from '@/context/BlueprintContext';
import { FeedbackScreenProvider } from '@/context/FeedbackScreenContext';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import FeedbackButton from '@/components/feedback/FeedbackButton';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BlueprintProvider>
        <FeedbackScreenProvider>
          <AnalyticsProvider>
            {children}
            <FeedbackButton />
          </AnalyticsProvider>
        </FeedbackScreenProvider>
      </BlueprintProvider>
    </AuthProvider>
  );
}
