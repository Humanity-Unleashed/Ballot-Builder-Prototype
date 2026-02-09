'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import type { SwipeEvent, SwipeInput, AxisScore } from '../stores/userStore';
import type { Spec } from '../types/civicAssessment';
import type { BlueprintProfile } from '../types/blueprintProfile';

interface BlueprintContextType {
  profile: BlueprintProfile | null;
  isLoading: boolean;
  spec: Spec | null;
  swipes: SwipeEvent[];
  updateAxisValue: (axisId: string, value: number) => void;
  updateImportance: (domainId: string, value: number) => void;
  updateAxisImportance: (axisId: string, value: number) => void;
  toggleAxisLock: (axisId: string) => void;
  resetAxisToLearned: (axisId: string) => void;
  recordSwipes: (newSwipes: SwipeInput[]) => void;
  initializeFromSwipes: (swipes: SwipeInput[]) => Promise<void>;
  applySliderValues: (responses: Record<string, number>, importances: Record<string, number>) => void;
  getAxisScore: (axisId: string) => AxisScore | null;
}

const BlueprintContext = createContext<BlueprintContextType | undefined>(undefined);

export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const store = useUserStore();
  const { loadSpec } = store;

  useEffect(() => {
    loadSpec();
  }, [loadSpec]);

  const value: BlueprintContextType = {
    profile: store.blueprintProfile,
    isLoading: store.isSpecLoading,
    spec: store.spec,
    swipes: store.swipes,
    updateAxisValue: store.updateAxisValue,
    updateImportance: store.updateDomainImportance,
    updateAxisImportance: store.updateAxisImportance,
    toggleAxisLock: store.toggleAxisLock,
    resetAxisToLearned: store.resetAxisToLearned,
    recordSwipes: (newSwipes) => {
      store.recordSwipes(newSwipes.map(s => ({ item_id: s.item_id, response: s.response })));
    },
    initializeFromSwipes: store.initializeFromSwipes,
    applySliderValues: store.applySliderValues,
    getAxisScore: store.getAxisScore,
  };

  return <BlueprintContext.Provider value={value}>{children}</BlueprintContext.Provider>;
}

export function useBlueprint(): BlueprintContextType {
  const context = useContext(BlueprintContext);
  if (context === undefined) {
    throw new Error('useBlueprint must be used within a BlueprintProvider');
  }
  return context;
}
