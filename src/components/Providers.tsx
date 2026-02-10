'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { BlueprintProvider } from '@/context/BlueprintContext';
import { FeedbackScreenProvider } from '@/context/FeedbackScreenContext';
import FeedbackButton from '@/components/feedback/FeedbackButton';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BlueprintProvider>
        <FeedbackScreenProvider>
          {children}
          <FeedbackButton />
        </FeedbackScreenProvider>
      </BlueprintProvider>
    </AuthProvider>
  );
}
