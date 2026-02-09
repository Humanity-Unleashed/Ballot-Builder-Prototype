'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { BlueprintProvider } from '@/context/BlueprintContext';
import FeedbackButton from '@/components/feedback/FeedbackButton';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BlueprintProvider>
        {children}
        <FeedbackButton />
      </BlueprintProvider>
    </AuthProvider>
  );
}
