/**
 * Blueprint Context
 *
 * Provides civic blueprint profile state and methods throughout the app.
 * Manages domain importance and axis stance values with persistence.
 *
 * @example
 * const { profile, updateAxisValue, updateImportance, resetAxisToLearned } = useBlueprint();
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import civicSpec from '../data/civic_axes_spec_v1.json';
import { scoreAxes, SwipeEvent, AxisScore } from '../utils/civicScoring';
import type { Spec } from '../types/civicAssessment';
import type {
  BlueprintProfile,
  DomainProfile,
  AxisProfile,
  ProfileSource,
  LearningMode,
} from '../types/blueprintProfile';

// ===========================================
// Constants
// ===========================================

const PROFILE_STORAGE_KEY = 'civic_blueprint_profile';
const SWIPES_STORAGE_KEY = 'civic_blueprint_swipes';
const PROFILE_VERSION = '1.0.0';

// ===========================================
// Types
// ===========================================

interface BlueprintContextType {
  /** Current profile data */
  profile: BlueprintProfile | null;
  /** Whether profile is loading */
  isLoading: boolean;
  /** The civic spec data */
  spec: Spec;
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
  recordSwipes: (newSwipes: SwipeEvent[]) => void;
  /** Initialize profile from swipes (e.g., after assessment) */
  initializeFromSwipes: (swipes: SwipeEvent[]) => void;
  /** Get axis score by ID */
  getAxisScore: (axisId: string) => AxisScore | null;
}

// ===========================================
// Context
// ===========================================

const BlueprintContext = createContext<BlueprintContextType | undefined>(undefined);

// ===========================================
// Helpers
// ===========================================

/**
 * Convert axis score [-1, 1] to slider value [0, 10]
 * 0 = poleA, 10 = poleB
 */
function scoreToSliderValue(score: number): number {
  // score -1 -> 0, score 0 -> 5, score +1 -> 10
  const value = 5 - 5 * score;
  return Math.round(Math.max(0, Math.min(10, value)));
}

/**
 * Convert slider value [0, 10] to score [-1, 1]
 */
function sliderValueToScore(value: number): number {
  return (5 - value) / 5;
}

/**
 * Create initial profile from spec with default values
 */
function createDefaultProfile(spec: Spec, userId: string): BlueprintProfile {
  const domains: DomainProfile[] = spec.domains.map(domain => ({
    domain_id: domain.id,
    importance: {
      value_0_10: 5,
      source: 'default' as ProfileSource,
      confidence_0_1: 0,
      last_updated_at: new Date().toISOString(),
    },
    axes: domain.axes.map(axisId => ({
      axis_id: axisId,
      value_0_10: 5,
      source: 'default' as ProfileSource,
      confidence_0_1: 0,
      locked: false,
      learning_mode: 'normal' as LearningMode,
      estimates: {
        learned_score: 0,
        learned_value_float: 5,
      },
      evidence: {
        n_items_answered: 0,
        n_unsure: 0,
        top_driver_item_ids: [],
      },
    })),
  }));

  return {
    profile_version: PROFILE_VERSION,
    user_id: userId,
    updated_at: new Date().toISOString(),
    domains,
  };
}

/**
 * Update profile from axis scores (from swipes)
 */
function updateProfileFromScores(
  profile: BlueprintProfile,
  scores: Record<string, AxisScore>
): BlueprintProfile {
  const updatedDomains = profile.domains.map(domain => ({
    ...domain,
    axes: domain.axes.map(axis => {
      const score = scores[axis.axis_id];
      if (!score || score.n_answered === 0) {
        return axis;
      }

      const learnedValueFloat = 5 - 5 * score.shrunk;
      let displayValue: number;

      // Apply learning mode
      if (axis.learning_mode === 'frozen') {
        displayValue = axis.value_0_10;
      } else if (axis.learning_mode === 'dampened' && axis.source === 'user_edited') {
        displayValue = Math.round(0.8 * axis.value_0_10 + 0.2 * learnedValueFloat);
      } else {
        displayValue = Math.round(learnedValueFloat);
      }

      return {
        ...axis,
        value_0_10: displayValue,
        confidence_0_1: score.confidence,
        source: axis.source === 'user_edited' ? axis.source : 'learned_from_swipes' as ProfileSource,
        estimates: {
          learned_score: score.shrunk,
          learned_value_float: learnedValueFloat,
        },
        evidence: {
          n_items_answered: score.n_answered,
          n_unsure: score.n_unsure,
          top_driver_item_ids: score.top_drivers.map(d => d.item_id),
        },
      };
    }),
  }));

  return {
    ...profile,
    updated_at: new Date().toISOString(),
    domains: updatedDomains,
  };
}

// ===========================================
// Provider
// ===========================================

export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const spec = civicSpec as unknown as Spec;
  const [profile, setProfile] = useState<BlueprintProfile | null>(null);
  const [swipes, setSwipes] = useState<SwipeEvent[]>([]);
  const [axisScores, setAxisScores] = useState<Record<string, AxisScore>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load saved profile and swipes on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedProfile = await SecureStore.getItemAsync(PROFILE_STORAGE_KEY);
      const savedSwipes = await SecureStore.getItemAsync(SWIPES_STORAGE_KEY);

      if (savedSwipes) {
        const parsedSwipes = JSON.parse(savedSwipes) as SwipeEvent[];
        setSwipes(parsedSwipes);
        const scores = scoreAxes(spec, parsedSwipes);
        setAxisScores(scores);
      }

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        // Create default profile
        setProfile(createDefaultProfile(spec, 'prototype-user'));
      }
    } catch (error) {
      console.error('Failed to load blueprint data:', error);
      setProfile(createDefaultProfile(spec, 'prototype-user'));
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (newProfile: BlueprintProfile) => {
    try {
      await SecureStore.setItemAsync(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const saveSwipes = async (newSwipes: SwipeEvent[]) => {
    try {
      await SecureStore.setItemAsync(SWIPES_STORAGE_KEY, JSON.stringify(newSwipes));
    } catch (error) {
      console.error('Failed to save swipes:', error);
    }
  };

  const updateAxisValue = useCallback((axisId: string, value: number) => {
    if (!profile) return;

    const updatedProfile: BlueprintProfile = {
      ...profile,
      updated_at: new Date().toISOString(),
      domains: profile.domains.map(domain => ({
        ...domain,
        axes: domain.axes.map(axis =>
          axis.axis_id === axisId
            ? {
                ...axis,
                value_0_10: value,
                source: 'user_edited' as ProfileSource,
                learning_mode: axis.locked ? 'frozen' : 'dampened' as LearningMode,
              }
            : axis
        ),
      })),
    };

    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  }, [profile]);

  const updateImportance = useCallback((domainId: string, value: number) => {
    if (!profile) return;

    const updatedProfile: BlueprintProfile = {
      ...profile,
      updated_at: new Date().toISOString(),
      domains: profile.domains.map(domain =>
        domain.domain_id === domainId
          ? {
              ...domain,
              importance: {
                ...domain.importance,
                value_0_10: value,
                source: 'user_edited' as ProfileSource,
                last_updated_at: new Date().toISOString(),
              },
            }
          : domain
      ),
    };

    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  }, [profile]);

  const toggleAxisLock = useCallback((axisId: string) => {
    if (!profile) return;

    const updatedProfile: BlueprintProfile = {
      ...profile,
      updated_at: new Date().toISOString(),
      domains: profile.domains.map(domain => ({
        ...domain,
        axes: domain.axes.map(axis =>
          axis.axis_id === axisId
            ? {
                ...axis,
                locked: !axis.locked,
                learning_mode: !axis.locked
                  ? 'frozen'
                  : axis.source === 'user_edited'
                    ? 'dampened'
                    : 'normal',
              }
            : axis
        ),
      })),
    };

    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  }, [profile]);

  const resetAxisToLearned = useCallback((axisId: string) => {
    if (!profile) return;

    const updatedProfile: BlueprintProfile = {
      ...profile,
      updated_at: new Date().toISOString(),
      domains: profile.domains.map(domain => ({
        ...domain,
        axes: domain.axes.map(axis =>
          axis.axis_id === axisId
            ? {
                ...axis,
                value_0_10: Math.round(axis.estimates.learned_value_float),
                source: 'learned_from_swipes' as ProfileSource,
                locked: false,
                learning_mode: 'normal' as LearningMode,
              }
            : axis
        ),
      })),
    };

    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  }, [profile]);

  const recordSwipes = useCallback((newSwipes: SwipeEvent[]) => {
    const allSwipes = [...swipes, ...newSwipes];
    setSwipes(allSwipes);
    saveSwipes(allSwipes);

    const scores = scoreAxes(spec, allSwipes);
    setAxisScores(scores);

    if (profile) {
      const updatedProfile = updateProfileFromScores(profile, scores);
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
  }, [swipes, profile, spec]);

  const initializeFromSwipes = useCallback((newSwipes: SwipeEvent[]) => {
    setSwipes(newSwipes);
    saveSwipes(newSwipes);

    const scores = scoreAxes(spec, newSwipes);
    setAxisScores(scores);

    const baseProfile = profile || createDefaultProfile(spec, 'prototype-user');
    const updatedProfile = updateProfileFromScores(baseProfile, scores);
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  }, [profile, spec]);

  const getAxisScore = useCallback((axisId: string): AxisScore | null => {
    return axisScores[axisId] || null;
  }, [axisScores]);

  const value: BlueprintContextType = {
    profile,
    isLoading,
    spec,
    swipes,
    updateAxisValue,
    updateImportance,
    toggleAxisLock,
    resetAxisToLearned,
    recordSwipes,
    initializeFromSwipes,
    getAxisScore,
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
