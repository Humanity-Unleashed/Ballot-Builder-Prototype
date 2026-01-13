/**
 * Persona types for Ballot Builder
 * Adapted from ballot-builder-prototype schemas
 */

export type IncomeLevel = "low" | "medium" | "high";

export type Gender =
  | "male"
  | "female"
  | "nonbinary"
  | "other"
  | "prefer_not_to_say";

export interface Persona {
  id: string;
  name: string;
  county: string;
  city?: string;
  age: number;
  incomeLevel: IncomeLevel;
  gender: Gender;
  story: string;
}

export interface PersonaWithPreferences extends Persona {
  preferences?: UserPreference;
}

// Policy preference types
export type PolicyStance = "support" | "against" | "mixed" | "unknown";

export interface PreferenceItem {
  topicId: string;
  topicLabel: string;
  stance: PolicyStance;
  importance?: number; // 1-5
  intensity?: number; // -1 to 1 (-1 strongly oppose, +1 strongly support)
}

export interface UserPreference {
  personaId?: string;
  items: PreferenceItem[];
}
