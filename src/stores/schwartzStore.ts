import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  schwartzApi,
  type SchwartzSpec,
  type SchwartzItemResponse,
  type SchwartzValueScore,
  type SchwartzDimensionScore,
  type BoosterSetMeta,
} from '../services/api';

/** Tracks which booster version the user completed */
interface CompletedBooster {
  id: string;
  version: number;
}

interface SchwartzState {
  _hasHydrated: boolean;
  spec: SchwartzSpec | null;
  isSpecLoading: boolean;
  specError: string | null;

  // Assessment state
  responses: SchwartzItemResponse[];
  hasCompletedAssessment: boolean;

  // Scores
  valueScores: SchwartzValueScore[];
  dimensionScores: SchwartzDimensionScore[];
  individualMean: number;

  // Booster state
  boosterResponses: Record<string, SchwartzItemResponse[]>; // keyed by boosterId
  completedBoosters: CompletedBooster[];
  dismissedBoosters: string[]; // booster IDs
}

interface SchwartzActions {
  loadSpec: () => Promise<void>;
  setSpec: (spec: SchwartzSpec) => void;

  recordResponse: (response: SchwartzItemResponse) => void;
  recordResponses: (responses: SchwartzItemResponse[]) => void;
  clearResponses: () => void;

  submitAndScore: () => Promise<void>;

  // Booster actions
  recordBoosterResponses: (boosterId: string, responses: SchwartzItemResponse[]) => void;
  completeBooster: (boosterId: string, version: number) => void;
  dismissBooster: (boosterId: string) => void;
  reScoreWithBoosters: () => Promise<void>;
  getPendingBoosters: (available: BoosterSetMeta[]) => BoosterSetMeta[];

  reset: () => void;
}

type SchwartzStore = SchwartzState & SchwartzActions;

const initialState: SchwartzState = {
  _hasHydrated: false,
  spec: null,
  isSpecLoading: false,
  specError: null,
  responses: [],
  hasCompletedAssessment: false,
  valueScores: [],
  dimensionScores: [],
  individualMean: 3,
  boosterResponses: {},
  completedBoosters: [],
  dismissedBoosters: [],
};

export const useSchwartzStore = create<SchwartzStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadSpec: async () => {
        const { spec } = get();
        if (spec) return;

        set({ isSpecLoading: true, specError: null });
        try {
          const fetchedSpec = await schwartzApi.getSpec();
          set({ spec: fetchedSpec, isSpecLoading: false });
        } catch (error) {
          console.error('Failed to load Schwartz spec:', error);
          set({
            isSpecLoading: false,
            specError: error instanceof Error ? error.message : 'Failed to load spec',
          });
        }
      },

      setSpec: (spec) => {
        set({ spec });
      },

      recordResponse: (response) => {
        set((state) => {
          // Replace existing response for same item or add new
          const existing = state.responses.findIndex((r) => r.item_id === response.item_id);
          if (existing >= 0) {
            const newResponses = [...state.responses];
            newResponses[existing] = response;
            return { responses: newResponses };
          }
          return { responses: [...state.responses, response] };
        });
      },

      recordResponses: (responses) => {
        set({ responses });
      },

      clearResponses: () => {
        set({
          responses: [],
          hasCompletedAssessment: false,
          valueScores: [],
          dimensionScores: [],
          individualMean: 3,
        });
      },

      submitAndScore: async () => {
        const { responses } = get();
        if (responses.length === 0) return;

        try {
          const result = await schwartzApi.scoreResponses(responses);
          set({
            valueScores: result.values,
            dimensionScores: result.dimensions,
            individualMean: result.individual_mean,
            hasCompletedAssessment: true,
          });
        } catch (error) {
          console.error('Failed to score responses:', error);
          throw error;
        }
      },

      recordBoosterResponses: (boosterId, responses) => {
        set((state) => ({
          boosterResponses: {
            ...state.boosterResponses,
            [boosterId]: responses,
          },
        }));
      },

      completeBooster: (boosterId, version) => {
        set((state) => {
          // Replace if same id exists (version upgrade), otherwise append
          const filtered = state.completedBoosters.filter((b) => b.id !== boosterId);
          return {
            completedBoosters: [...filtered, { id: boosterId, version }],
          };
        });
      },

      dismissBooster: (boosterId) => {
        set((state) => ({
          dismissedBoosters: state.dismissedBoosters.includes(boosterId)
            ? state.dismissedBoosters
            : [...state.dismissedBoosters, boosterId],
        }));
      },

      reScoreWithBoosters: async () => {
        const { responses, boosterResponses } = get();
        // Merge baseline + all booster responses
        const allResponses = [
          ...responses,
          ...Object.values(boosterResponses).flat(),
        ];
        if (allResponses.length === 0) return;

        try {
          const result = await schwartzApi.scoreResponses(allResponses);
          set({
            valueScores: result.values,
            dimensionScores: result.dimensions,
            individualMean: result.individual_mean,
          });
        } catch (error) {
          console.error('Failed to re-score with boosters:', error);
          throw error;
        }
      },

      getPendingBoosters: (available) => {
        const { completedBoosters, dismissedBoosters } = get();
        return available.filter((b) => {
          if (dismissedBoosters.includes(b.id)) return false;
          const completed = completedBoosters.find((c) => c.id === b.id);
          // Pending if never completed, or completed at older version
          return !completed || completed.version < b.version;
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'schwartz-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        responses: state.responses,
        hasCompletedAssessment: state.hasCompletedAssessment,
        valueScores: state.valueScores,
        dimensionScores: state.dimensionScores,
        individualMean: state.individualMean,
        boosterResponses: state.boosterResponses,
        completedBoosters: state.completedBoosters,
        dismissedBoosters: state.dismissedBoosters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);

// Selectors
export const selectHasHydrated = (state: SchwartzStore) => state._hasHydrated;
export const selectSpec = (state: SchwartzStore) => state.spec;
export const selectIsSpecLoading = (state: SchwartzStore) => state.isSpecLoading;
export const selectSpecError = (state: SchwartzStore) => state.specError;
export const selectResponses = (state: SchwartzStore) => state.responses;
export const selectHasCompletedAssessment = (state: SchwartzStore) => state.hasCompletedAssessment;
export const selectValueScores = (state: SchwartzStore) => state.valueScores;
export const selectDimensionScores = (state: SchwartzStore) => state.dimensionScores;
export const selectIndividualMean = (state: SchwartzStore) => state.individualMean;

// Helper to get a specific value score
export const selectValueScore = (valueId: string) => (state: SchwartzStore) =>
  state.valueScores.find((v) => v.value_id === valueId) ?? null;

// Helper to get a specific dimension score
export const selectDimensionScore = (dimensionId: string) => (state: SchwartzStore) =>
  state.dimensionScores.find((d) => d.dimension_id === dimensionId) ?? null;

// Convert ipsatized score to 0-100 for visualization
export function ipsatizedToPercent(ipsatized: number): number {
  const clamped = Math.max(-2, Math.min(2, ipsatized));
  return Math.round(((clamped + 2) / 4) * 100);
}

// Booster selectors
export const selectBoosterResponses = (state: SchwartzStore) => state.boosterResponses;
export const selectCompletedBoosters = (state: SchwartzStore) => state.completedBoosters;
export const selectDismissedBoosters = (state: SchwartzStore) => state.dismissedBoosters;

// Convert raw mean (1-5) to 0-100 for visualization
export function rawMeanToPercent(rawMean: number): number {
  const clamped = Math.max(1, Math.min(5, rawMean));
  return Math.round(((clamped - 1) / 4) * 100);
}
