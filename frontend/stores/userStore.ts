/**
 * User Store
 *
 * Zustand store for managing user state including:
 * - Civic axes spec (fetched from backend)
 * - Selected persona
 * - Swipe responses from civic assessment
 * - Blueprint profile (computed from swipes)
 * - Onboarding state
 *
 * This store persists data locally using AsyncStorage.
 * Auth/user account data is not included (mocked in prototype).
 *
 * This is the single source of truth for blueprint/civic data.
 * The BlueprintContext wraps this store for backward compatibility.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { civicAxesApi, type Persona } from '../services/api';
import type {
  BlueprintProfile,
  DomainProfile,
  ProfileSource,
  LearningMode,
} from '../types/blueprintProfile';
import type { Spec, SwipeResponse } from '../types/civicAssessment';

// ===========================================
// Types
// ===========================================

export interface SwipeEvent {
  item_id: string;
  response: SwipeResponse;
  timestamp: string;
}

/** Input format for swipes (timestamp optional, will be added if missing) */
export type SwipeInput = {
  item_id: string;
  response: SwipeResponse;
  timestamp?: string;
};

export interface AxisScore {
  axis_id: string;
  raw_sum: number;
  n_answered: number;
  n_unsure: number;
  normalized: number;
  shrunk: number;
  confidence: number;
  top_drivers: string[];
}

interface UserState {
  // Civic Spec (not persisted - fetched from API)
  spec: Spec | null;
  isSpecLoading: boolean;
  specError: string | null;

  // Persona
  selectedPersona: Persona | null;

  // Civic Assessment
  swipes: SwipeEvent[];
  blueprintProfile: BlueprintProfile | null;
  axisScores: Record<string, AxisScore>;

  // Onboarding
  hasCompletedOnboarding: boolean;
  hasCompletedAssessment: boolean;
}

interface UserActions {
  // Spec actions
  loadSpec: () => Promise<void>;
  setSpec: (spec: Spec) => void;

  // Persona actions
  selectPersona: (persona: Persona) => void;
  clearPersona: () => void;

  // Swipe actions
  recordSwipe: (swipe: Omit<SwipeEvent, 'timestamp'>) => void;
  recordSwipes: (swipes: Omit<SwipeEvent, 'timestamp'>[]) => void;
  clearSwipes: () => void;

  // Blueprint actions
  setBlueprintProfile: (profile: BlueprintProfile) => void;
  updateAxisValue: (axisId: string, value: number) => void;
  updateDomainImportance: (domainId: string, value: number) => void;
  toggleAxisLock: (axisId: string) => void;
  resetAxisToLearned: (axisId: string) => void;
  setAxisScores: (scores: AxisScore[]) => void;
  initializeFromSwipes: (swipes: SwipeInput[]) => Promise<void>;
  getAxisScore: (axisId: string) => AxisScore | null;

  // Onboarding actions
  completeOnboarding: () => void;
  completeAssessment: () => void;

  // Reset
  reset: () => void;
}

type UserStore = UserState & UserActions;

// ===========================================
// Constants
// ===========================================

const PROFILE_VERSION = '1.0.0';

// ===========================================
// Helper Functions
// ===========================================

/**
 * Create an initial blueprint profile from the civic axes spec
 */
function createDefaultProfile(spec: Spec, userId: string): BlueprintProfile {
  const domains: DomainProfile[] = spec.domains.map((domain) => ({
    domain_id: domain.id,
    importance: {
      value_0_10: 5,
      source: 'default' as ProfileSource,
      confidence_0_1: 0,
      last_updated_at: new Date().toISOString(),
    },
    axes: domain.axes.map((axisId) => ({
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
 * Update a blueprint profile with axis scores from the backend
 */
function updateProfileFromScores(
  profile: BlueprintProfile,
  scores: AxisScore[]
): BlueprintProfile {
  const scoresMap: Record<string, AxisScore> = {};
  for (const score of scores) {
    scoresMap[score.axis_id] = score;
  }

  const updatedDomains = profile.domains.map((domain) => ({
    ...domain,
    axes: domain.axes.map((axis) => {
      const score = scoresMap[axis.axis_id];
      if (!score || score.n_answered === 0) {
        return axis;
      }

      // Map shrunk score from [-1, 1] to [0, 10]
      // shrunk = -1 means full poleA, +1 means full poleB
      // We want: -1 -> 0, 0 -> 5, +1 -> 10
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
        source:
          axis.source === 'user_edited'
            ? axis.source
            : ('learned_from_swipes' as ProfileSource),
        estimates: {
          learned_score: score.shrunk,
          learned_value_float: learnedValueFloat,
        },
        evidence: {
          n_items_answered: score.n_answered,
          n_unsure: score.n_unsure,
          top_driver_item_ids: score.top_drivers,
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
// Initial State
// ===========================================

const initialState: UserState = {
  spec: null,
  isSpecLoading: false,
  specError: null,
  selectedPersona: null,
  swipes: [],
  blueprintProfile: null,
  axisScores: {},
  hasCompletedOnboarding: false,
  hasCompletedAssessment: false,
};

// ===========================================
// Store
// ===========================================

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // =========================================
      // Spec Actions
      // =========================================

      loadSpec: async () => {
        const { spec } = get();
        // Don't reload if we already have the spec
        if (spec) return;

        set({ isSpecLoading: true, specError: null });
        try {
          const fetchedSpec = await civicAxesApi.getSpec();
          set({ spec: fetchedSpec, isSpecLoading: false });

          // Initialize default profile if we don't have one
          const { blueprintProfile } = get();
          if (!blueprintProfile) {
            set({ blueprintProfile: createDefaultProfile(fetchedSpec, 'prototype-user') });
          }
        } catch (error) {
          console.error('Failed to load civic axes spec:', error);
          set({
            isSpecLoading: false,
            specError: error instanceof Error ? error.message : 'Failed to load spec',
          });
        }
      },

      setSpec: (spec) => {
        set({ spec });
      },

      // =========================================
      // Persona Actions
      // =========================================

      selectPersona: (persona) => {
        set({ selectedPersona: persona });
      },

      clearPersona: () => {
        set({ selectedPersona: null });
      },

      // =========================================
      // Swipe Actions
      // =========================================

      recordSwipe: (swipe) => {
        const swipeWithTimestamp: SwipeEvent = {
          ...swipe,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          swipes: [...state.swipes, swipeWithTimestamp],
        }));
      },

      recordSwipes: (swipes) => {
        const swipesWithTimestamp: SwipeEvent[] = swipes.map((swipe) => ({
          ...swipe,
          timestamp: new Date().toISOString(),
        }));
        set((state) => ({
          swipes: [...state.swipes, ...swipesWithTimestamp],
        }));
      },

      clearSwipes: () => {
        set({ swipes: [], axisScores: {} });
      },

      // =========================================
      // Blueprint Actions
      // =========================================

      setBlueprintProfile: (profile) => {
        set({ blueprintProfile: profile });
      },

      updateAxisValue: (axisId, value) => {
        const { blueprintProfile } = get();
        if (!blueprintProfile) return;

        const updatedDomains = blueprintProfile.domains.map((domain) => ({
          ...domain,
          axes: domain.axes.map((axis) =>
            axis.axis_id === axisId
              ? {
                  ...axis,
                  value_0_10: value,
                  source: 'user_edited' as ProfileSource,
                  learning_mode: axis.locked
                    ? 'frozen'
                    : ('dampened' as LearningMode),
                }
              : axis
          ),
        }));

        set({
          blueprintProfile: {
            ...blueprintProfile,
            updated_at: new Date().toISOString(),
            domains: updatedDomains,
          },
        });
      },

      updateDomainImportance: (domainId, value) => {
        const { blueprintProfile } = get();
        if (!blueprintProfile) return;

        const updatedDomains = blueprintProfile.domains.map((domain) =>
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
        );

        set({
          blueprintProfile: {
            ...blueprintProfile,
            updated_at: new Date().toISOString(),
            domains: updatedDomains,
          },
        });
      },

      toggleAxisLock: (axisId) => {
        const { blueprintProfile } = get();
        if (!blueprintProfile) return;

        const updatedDomains = blueprintProfile.domains.map((domain) => ({
          ...domain,
          axes: domain.axes.map((axis) =>
            axis.axis_id === axisId
              ? {
                  ...axis,
                  locked: !axis.locked,
                  learning_mode: !axis.locked
                    ? 'frozen'
                    : axis.source === 'user_edited'
                      ? 'dampened'
                      : ('normal' as LearningMode),
                }
              : axis
          ),
        }));

        set({
          blueprintProfile: {
            ...blueprintProfile,
            updated_at: new Date().toISOString(),
            domains: updatedDomains,
          },
        });
      },

      resetAxisToLearned: (axisId) => {
        const { blueprintProfile } = get();
        if (!blueprintProfile) return;

        const updatedDomains = blueprintProfile.domains.map((domain) => ({
          ...domain,
          axes: domain.axes.map((axis) =>
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
        }));

        set({
          blueprintProfile: {
            ...blueprintProfile,
            updated_at: new Date().toISOString(),
            domains: updatedDomains,
          },
        });
      },

      setAxisScores: (scores) => {
        const scoresMap: Record<string, AxisScore> = {};
        for (const score of scores) {
          scoresMap[score.axis_id] = score;
        }
        set({ axisScores: scoresMap });
      },

      initializeFromSwipes: async (newSwipes) => {
        if (newSwipes.length === 0) {
          set({ swipes: [] });
          return;
        }

        // Add timestamps to swipes if missing
        const swipesWithTimestamps: SwipeEvent[] = newSwipes.map((s) => ({
          item_id: s.item_id,
          response: s.response,
          timestamp: s.timestamp ?? new Date().toISOString(),
        }));

        // Replace swipes (not append) for fresh initialization
        set({ swipes: swipesWithTimestamps });

        try {
          // Convert to the format expected by the API (no timestamp needed)
          const apiSwipes = newSwipes.map((s) => ({
            item_id: s.item_id,
            response: s.response,
          }));

          // Score using backend API
          const { scores } = await civicAxesApi.scoreResponses(apiSwipes);

          // Update axis scores
          const scoresMap: Record<string, AxisScore> = {};
          for (const score of scores) {
            scoresMap[score.axis_id] = score;
          }
          set({ axisScores: scoresMap });

          // Update or create profile
          const { blueprintProfile, spec } = get();
          if (spec) {
            const baseProfile = blueprintProfile ?? createDefaultProfile(spec, 'prototype-user');
            const updatedProfile = updateProfileFromScores(baseProfile, scores);
            set({ blueprintProfile: updatedProfile, hasCompletedAssessment: true });
          }
        } catch (error) {
          console.error('Failed to initialize from swipes:', error);
        }
      },

      getAxisScore: (axisId) => {
        const { axisScores } = get();
        return axisScores[axisId] ?? null;
      },

      // =========================================
      // Onboarding Actions
      // =========================================

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      completeAssessment: () => {
        set({ hasCompletedAssessment: true });
      },

      // =========================================
      // Reset
      // =========================================

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        selectedPersona: state.selectedPersona,
        swipes: state.swipes,
        blueprintProfile: state.blueprintProfile,
        axisScores: state.axisScores,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasCompletedAssessment: state.hasCompletedAssessment,
      }),
    }
  )
);

// ===========================================
// Selectors (for convenience)
// ===========================================

export const selectSpec = (state: UserStore) => state.spec;
export const selectIsSpecLoading = (state: UserStore) => state.isSpecLoading;
export const selectSpecError = (state: UserStore) => state.specError;
export const selectPersona = (state: UserStore) => state.selectedPersona;
export const selectSwipes = (state: UserStore) => state.swipes;
export const selectBlueprintProfile = (state: UserStore) => state.blueprintProfile;
export const selectAxisScores = (state: UserStore) => state.axisScores;
export const selectHasCompletedOnboarding = (state: UserStore) => state.hasCompletedOnboarding;
export const selectHasCompletedAssessment = (state: UserStore) => state.hasCompletedAssessment;

// Get a specific axis score
export const selectAxisScore = (axisId: string) => (state: UserStore) =>
  state.axisScores[axisId] ?? null;

// Get axis profile by ID
export const selectAxisProfile = (axisId: string) => (state: UserStore) => {
  if (!state.blueprintProfile) return null;
  for (const domain of state.blueprintProfile.domains) {
    const axis = domain.axes.find((a) => a.axis_id === axisId);
    if (axis) return axis;
  }
  return null;
};

// Get domain profile by ID
export const selectDomainProfile = (domainId: string) => (state: UserStore) => {
  if (!state.blueprintProfile) return null;
  return state.blueprintProfile.domains.find((d) => d.domain_id === domainId) ?? null;
};
