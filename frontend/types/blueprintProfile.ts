/**
 * Blueprint Profile Types
 *
 * TypeScript interfaces for the "Your Civic Blueprint" profile storage.
 * Based on the civic blueprint UI spec.
 */

export type ProfileSource = 'learned_from_swipes' | 'user_edited' | 'default';
export type LearningMode = 'normal' | 'dampened' | 'frozen';

export interface AxisEvidence {
  n_items_answered: number;
  n_unsure: number;
  top_driver_item_ids: string[];
}

export interface AxisEstimates {
  /** Raw learned score from swipes, range [-1, 1] */
  learned_score: number;
  /** Mapped to 0-10 scale as float before rounding */
  learned_value_float: number;
}

export interface AxisProfile {
  axis_id: string;
  /** Displayed value, 0-10 discrete */
  value_0_10: number;
  /** Where this value came from */
  source: ProfileSource;
  /** Confidence level 0-1 */
  confidence_0_1: number;
  /** Whether user has locked this axis */
  locked: boolean;
  /** How future swipes affect this value */
  learning_mode: LearningMode;
  /** Raw estimates from swipes */
  estimates: AxisEstimates;
  /** Evidence for transparency */
  evidence: AxisEvidence;
  /** Importance/priority for this specific axis, 0-10 (defaults to 5 if not set) */
  importance?: number;
}

export interface DomainImportance {
  /** Importance value 0-10 */
  value_0_10: number;
  /** Where this value came from */
  source: ProfileSource;
  /** Confidence level 0-1 */
  confidence_0_1: number;
  /** Last time this was updated */
  last_updated_at: string;
}

export interface DomainProfile {
  domain_id: string;
  importance: DomainImportance;
  axes: AxisProfile[];
}

export interface BlueprintProfile {
  profile_version: string;
  user_id: string;
  updated_at: string;
  domains: DomainProfile[];
}

// Slider descriptor bands for UI labels
export interface DescriptorBand {
  min: number;
  max: number;
  label: string;
}

export const STANCE_BANDS: DescriptorBand[] = [
  { min: 0, max: 2, label: 'Strongly' },
  { min: 3, max: 4, label: 'Leaning' },
  { min: 5, max: 5, label: 'Mixed / depends' },
  { min: 6, max: 7, label: 'Leaning' },
  { min: 8, max: 10, label: 'Strongly' },
];

export const IMPORTANCE_BANDS: DescriptorBand[] = [
  { min: 0, max: 0, label: 'Not a priority' },
  { min: 1, max: 2, label: 'Low priority' },
  { min: 3, max: 4, label: 'Minor factor' },
  { min: 5, max: 6, label: 'Important' },
  { min: 7, max: 8, label: 'Very important' },
  { min: 9, max: 10, label: 'Top priority' },
];

export function getImportanceLabel(value: number): string {
  const band = IMPORTANCE_BANDS.find(b => value >= b.min && value <= b.max);
  return band?.label ?? '';
}

export function getStanceLabel(value: number, poleALabel: string, poleBLabel: string): string {
  if (value <= 2) return poleALabel;
  if (value <= 4) return `Leaning ${poleALabel}`;
  if (value === 5) return 'Mixed / depends';
  if (value <= 7) return `Leaning ${poleBLabel}`;
  return poleBLabel;
}
