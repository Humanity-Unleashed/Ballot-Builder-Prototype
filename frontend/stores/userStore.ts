/**
 * User Store
 *
 * Zustand store for managing user state including:
 * - Selected persona
 * - Swipe responses from civic assessment
 * - Blueprint profile (computed from swipes)
 * - Onboarding state
 *
 * This store persists data locally using AsyncStorage.
 * Auth/user account data is not included (mocked in prototype).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Persona } from '../services/api';
import type {
  BlueprintProfile,
  DomainProfile,
  ProfileSource,
  LearningMode,
} from '../types/blueprintProfile';
import type { SwipeResponse } from '../types/civicAssessment';

// ===========================================
// Types
// ===========================================

export interface SwipeEvent {
  item_id: string;
  response: SwipeResponse;
  timestamp: string;
}

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

  // Onboarding actions
  completeOnboarding: () => void;
  completeAssessment: () => void;

  // Reset
  reset: () => void;
}

type UserStore = UserState & UserActions;

// ===========================================
// Initial State
// ===========================================

const initialState: UserState = {
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
