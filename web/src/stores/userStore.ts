import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { civicAxesApi, type Persona } from '../services/api';
import { getSliderConfig } from '../data/sliderPositions';
import type {
  BlueprintProfile,
  DomainProfile,
  ProfileSource,
  LearningMode,
} from '../types/blueprintProfile';
import type { Spec, SwipeResponse } from '../types/civicAssessment';

export interface SwipeEvent {
  item_id: string;
  response: SwipeResponse;
  timestamp: string;
}

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
  spec: Spec | null;
  isSpecLoading: boolean;
  specError: string | null;
  selectedPersona: Persona | null;
  swipes: SwipeEvent[];
  blueprintProfile: BlueprintProfile | null;
  axisScores: Record<string, AxisScore>;
  hasCompletedOnboarding: boolean;
  hasCompletedAssessment: boolean;
}

interface UserActions {
  loadSpec: () => Promise<void>;
  setSpec: (spec: Spec) => void;
  selectPersona: (persona: Persona) => void;
  clearPersona: () => void;
  recordSwipe: (swipe: Omit<SwipeEvent, 'timestamp'>) => void;
  recordSwipes: (swipes: Omit<SwipeEvent, 'timestamp'>[]) => void;
  clearSwipes: () => void;
  setBlueprintProfile: (profile: BlueprintProfile | null) => void;
  updateAxisValue: (axisId: string, value: number) => void;
  updateAxisImportance: (axisId: string, importance: number) => void;
  updateDomainImportance: (domainId: string, value: number) => void;
  toggleAxisLock: (axisId: string) => void;
  resetAxisToLearned: (axisId: string) => void;
  setAxisScores: (scores: AxisScore[]) => void;
  initializeFromSwipes: (swipes: SwipeInput[]) => Promise<void>;
  applySliderValues: (responses: Record<string, number>, importances: Record<string, number>) => void;
  getAxisScore: (axisId: string) => AxisScore | null;
  completeOnboarding: () => void;
  completeAssessment: () => void;
  reset: () => void;
}

type UserStore = UserState & UserActions;

const PROFILE_VERSION = '1.0.0';

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

      const learnedValueFloat = 5 - 5 * score.shrunk;
      let displayValue: number;

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

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadSpec: async () => {
        const { spec } = get();
        if (spec) return;

        set({ isSpecLoading: true, specError: null });
        try {
          const fetchedSpec = await civicAxesApi.getSpec();
          set({ spec: fetchedSpec, isSpecLoading: false });

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

      selectPersona: (persona) => {
        set({ selectedPersona: persona });
      },

      clearPersona: () => {
        set({ selectedPersona: null });
      },

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

      updateAxisImportance: (axisId, importance) => {
        const { blueprintProfile } = get();
        if (!blueprintProfile) return;

        const updatedDomains = blueprintProfile.domains.map((domain) => ({
          ...domain,
          axes: domain.axes.map((axis) =>
            axis.axis_id === axisId
              ? { ...axis, importance }
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

        const swipesWithTimestamps: SwipeEvent[] = newSwipes.map((s) => ({
          item_id: s.item_id,
          response: s.response,
          timestamp: s.timestamp ?? new Date().toISOString(),
        }));

        set({ swipes: swipesWithTimestamps });

        try {
          const apiSwipes = newSwipes.map((s) => ({
            item_id: s.item_id,
            response: s.response,
          }));

          const { scores } = await civicAxesApi.scoreResponses(apiSwipes);

          const scoresMap: Record<string, AxisScore> = {};
          for (const score of scores) {
            scoresMap[score.axis_id] = score;
          }
          set({ axisScores: scoresMap });

          const { spec } = get();
          if (spec) {
            const baseProfile = createDefaultProfile(spec, 'prototype-user');
            const updatedProfile = updateProfileFromScores(baseProfile, scores);
            set({ blueprintProfile: updatedProfile, hasCompletedAssessment: true });
          }
        } catch (error) {
          console.error('Failed to initialize from swipes:', error);
        }
      },

      applySliderValues: (responses, importances) => {
        const { blueprintProfile } = get();
        if (!blueprintProfile) return;

        const updatedDomains = blueprintProfile.domains.map((domain) => {
          const updatedAxes = domain.axes.map((axis) => {
            const sliderPos = responses[axis.axis_id];
            if (sliderPos === undefined) return axis;

            const config = getSliderConfig(axis.axis_id);
            const totalPositions = config ? config.positions.length : 5;
            const value = Math.round((sliderPos / (totalPositions - 1)) * 10);
            const imp = importances[axis.axis_id];

            return {
              ...axis,
              value_0_10: value,
              source: 'learned_from_swipes' as ProfileSource,
              learning_mode: 'normal' as LearningMode,
              ...(imp !== undefined ? { importance: imp } : {}),
            };
          });

          // Derive domain importance from average of its axes' importances
          const axisImps = updatedAxes
            .map((a) => a.importance)
            .filter((v): v is number => v !== undefined);
          const domainImp = axisImps.length > 0
            ? Math.round(axisImps.reduce((s, v) => s + v, 0) / axisImps.length)
            : domain.importance.value_0_10;

          return {
            ...domain,
            importance: {
              ...domain.importance,
              value_0_10: domainImp,
              source: 'learned_from_swipes' as ProfileSource,
              last_updated_at: new Date().toISOString(),
            },
            axes: updatedAxes,
          };
        });

        set({
          blueprintProfile: {
            ...blueprintProfile,
            updated_at: new Date().toISOString(),
            domains: updatedDomains,
          },
        });
      },

      getAxisScore: (axisId) => {
        const { axisScores } = get();
        return axisScores[axisId] ?? null;
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      completeAssessment: () => {
        set({ hasCompletedAssessment: true });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
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

export const selectSpec = (state: UserStore) => state.spec;
export const selectIsSpecLoading = (state: UserStore) => state.isSpecLoading;
export const selectSpecError = (state: UserStore) => state.specError;
export const selectPersona = (state: UserStore) => state.selectedPersona;
export const selectSwipes = (state: UserStore) => state.swipes;
export const selectBlueprintProfile = (state: UserStore) => state.blueprintProfile;
export const selectAxisScores = (state: UserStore) => state.axisScores;
export const selectHasCompletedOnboarding = (state: UserStore) => state.hasCompletedOnboarding;
export const selectHasCompletedAssessment = (state: UserStore) => state.hasCompletedAssessment;

export const selectAxisScore = (axisId: string) => (state: UserStore) =>
  state.axisScores[axisId] ?? null;

export const selectAxisProfile = (axisId: string) => (state: UserStore) => {
  if (!state.blueprintProfile) return null;
  for (const domain of state.blueprintProfile.domains) {
    const axis = domain.axes.find((a) => a.axis_id === axisId);
    if (axis) return axis;
  }
  return null;
};

export const selectDomainProfile = (domainId: string) => (state: UserStore) => {
  if (!state.blueprintProfile) return null;
  return state.blueprintProfile.domains.find((d) => d.domain_id === domainId) ?? null;
};
