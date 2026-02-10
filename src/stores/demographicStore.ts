import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Value types ──

export type HouseholdIncome =
  | 'under_25k'
  | '25k_50k'
  | '50k_75k'
  | '75k_100k'
  | '100k_150k'
  | '150k_200k'
  | 'over_200k'
  | 'prefer_not_to_say';

export type HousingSituation =
  | 'own_home'
  | 'rent'
  | 'live_with_family'
  | 'unhoused'
  | 'other';

export type AgeRange =
  | '18_24'
  | '25_34'
  | '35_44'
  | '45_54'
  | '55_64'
  | '65_plus';

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'self_employed'
  | 'unemployed'
  | 'student'
  | 'retired'
  | 'homemaker'
  | 'other';

export type Dependents =
  | 'none'
  | 'one'
  | 'two'
  | 'three_plus';

export type EducationLevel =
  | 'high_school'
  | 'some_college'
  | 'bachelors'
  | 'graduate'
  | 'other';

export type HealthInsurance =
  | 'employer'
  | 'marketplace'
  | 'medicare'
  | 'medicaid'
  | 'military_va'
  | 'uninsured'
  | 'other';

export type VeteranStatus =
  | 'veteran'
  | 'not_veteran'
  | 'prefer_not_to_say';

// ── Profile interface ──

export interface DemographicProfile {
  householdIncome: HouseholdIncome | null;
  housingSituation: HousingSituation | null;
  ageRange: AgeRange | null;
  employmentType: EmploymentType | null;
  dependents: Dependents | null;
  educationLevel: EducationLevel | null;
  healthInsurance: HealthInsurance | null;
  zipCode: string;
  veteranStatus: VeteranStatus | null;
}

// ── Store types ──

interface DemographicState {
  _hasHydrated: boolean;
  profile: DemographicProfile;
  hasCompletedDemographics: boolean;
  wasSkipped: boolean;
  completedAt: string | null;
}

interface DemographicActions {
  setField: <K extends keyof DemographicProfile>(field: K, value: DemographicProfile[K]) => void;
  submitProfile: () => void;
  skipProfile: () => void;
  reset: () => void;
}

type DemographicStore = DemographicState & DemographicActions;

const initialProfile: DemographicProfile = {
  householdIncome: null,
  housingSituation: null,
  ageRange: null,
  employmentType: null,
  dependents: null,
  educationLevel: null,
  healthInsurance: null,
  zipCode: '',
  veteranStatus: null,
};

const initialState: DemographicState = {
  _hasHydrated: false,
  profile: { ...initialProfile },
  hasCompletedDemographics: false,
  wasSkipped: false,
  completedAt: null,
};

export const useDemographicStore = create<DemographicStore>()(
  persist(
    (set) => ({
      ...initialState,

      setField: (field, value) => {
        set((state) => ({
          profile: { ...state.profile, [field]: value },
        }));
      },

      submitProfile: () => {
        set({
          hasCompletedDemographics: true,
          wasSkipped: false,
          completedAt: new Date().toISOString(),
        });
      },

      skipProfile: () => {
        set({
          hasCompletedDemographics: true,
          wasSkipped: true,
          completedAt: new Date().toISOString(),
        });
      },

      reset: () => {
        set({
          profile: { ...initialProfile },
          hasCompletedDemographics: false,
          wasSkipped: false,
          completedAt: null,
        });
      },
    }),
    {
      name: 'demographic-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        hasCompletedDemographics: state.hasCompletedDemographics,
        wasSkipped: state.wasSkipped,
        completedAt: state.completedAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    },
  ),
);
