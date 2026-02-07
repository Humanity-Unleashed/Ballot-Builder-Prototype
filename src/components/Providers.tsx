'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { BlueprintProvider } from '@/context/BlueprintContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BlueprintProvider>{children}</BlueprintProvider>
    </AuthProvider>
  );
}
