'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface FeedbackScreenContextType {
  screenLabel: string;
  setScreenLabel: (label: string) => void;
}

const FeedbackScreenContext = createContext<FeedbackScreenContextType | undefined>(undefined);

export function FeedbackScreenProvider({ children }: { children: React.ReactNode }) {
  const [screenLabel, setScreenLabelState] = useState('');

  const setScreenLabel = useCallback((label: string) => {
    setScreenLabelState(label);
  }, []);

  return (
    <FeedbackScreenContext.Provider value={{ screenLabel, setScreenLabel }}>
      {children}
    </FeedbackScreenContext.Provider>
  );
}

export function useFeedbackScreen(): FeedbackScreenContextType {
  const context = useContext(FeedbackScreenContext);
  if (context === undefined) {
    throw new Error('useFeedbackScreen must be used within a FeedbackScreenProvider');
  }
  return context;
}
