/**
 * Blueprint Context
 *
 * Provides civic blueprint profile state and methods throughout the app.
 * This is a thin wrapper around the userStore for backward compatibility.
 *
 * NEW CODE SHOULD USE: useUserStore() directly from '@/stores'
 *
 * @example
 * // Legacy (still works):
 * const { profile, updateAxisValue, initializeFromSwipes } = useBlueprint();
 *
 * // Preferred (new code):
 * const { blueprintProfile, updateAxisValue, initializeFromSwipes } = useUserStore();
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import type { SwipeEvent, SwipeInput, AxisScore } from '../stores/userStore';
import type { Spec } from '../types/civicAssessment';
import type { BlueprintProfile } from '../types/blueprintProfile';

// ===========================================
// Types
// ===========================================

interface BlueprintContextType {
  /** Current profile data */
  profile: BlueprintProfile | null;
  /** Whether profile/spec is loading */
  isLoading: boolean;
  /** The civic spec data (null while loading) */
  spec: Spec | null;
  /** Recorded swipes for scoring */
  swipes: SwipeEvent[];
  /** Update an axis stance value */
  updateAxisValue: (axisId: string, value: number) => void;
  /** Update domain importance */
  updateImportance: (domainId: string, value: number) => void;
  /** Toggle axis lock */
  toggleAxisLock: (axisId: string) => void;
  /** Reset axis to learned value */
  resetAxisToLearned: (axisId: string) => void;
  /** Record swipes and recalculate profile */
  recordSwipes: (newSwipes: SwipeInput[]) => void;
  /** Initialize profile from swipes (e.g., after assessment) */
  initializeFromSwipes: (swipes: SwipeInput[]) => void;
  /** Get axis score by ID */
  getAxisScore: (axisId: string) => AxisScore | null;
}

// ===========================================
// Context
// ===========================================

const BlueprintContext = createContext<BlueprintContextType | undefined>(undefined);

// ===========================================
// Provider
// ===========================================

export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const store = useUserStore();

  // Load spec on mount
  useEffect(() => {
    store.loadSpec();
  }, []);

  // Map store state to context interface for backward compatibility
  const value: BlueprintContextType = {
    profile: store.blueprintProfile,
    isLoading: store.isSpecLoading,
    spec: store.spec,
    swipes: store.swipes,
    updateAxisValue: store.updateAxisValue,
    updateImportance: store.updateDomainImportance,
    toggleAxisLock: store.toggleAxisLock,
    resetAxisToLearned: store.resetAxisToLearned,
    recordSwipes: (newSwipes) => {
      // Record swipes and trigger scoring
      store.recordSwipes(newSwipes.map(s => ({ item_id: s.item_id, response: s.response })));
    },
    initializeFromSwipes: store.initializeFromSwipes,
    getAxisScore: store.getAxisScore,
  };

  return <BlueprintContext.Provider value={value}>{children}</BlueprintContext.Provider>;
}

// ===========================================
// Hook
// ===========================================

export function useBlueprint(): BlueprintContextType {
  const context = useContext(BlueprintContext);
  if (context === undefined) {
    throw new Error('useBlueprint must be used within a BlueprintProvider');
  }
  return context;
}
