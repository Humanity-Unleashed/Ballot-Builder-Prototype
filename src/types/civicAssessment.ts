export type GovernmentLevel = 'local' | 'state' | 'national' | 'international' | 'general';

export type SwipeResponse =
  | 'strong_disagree'
  | 'disagree'
  | 'agree'
  | 'strong_agree'
  | 'unsure';

export interface AxisPole {
  label: string;
  interpretation: string;
}

export interface Axis {
  id: string;
  domain_id: string;
  name: string;
  description: string;
  poleA: AxisPole;
  poleB: AxisPole;
  recommended_cards_per_session: number;
}

export interface Domain {
  id: string;
  name: string;
  why: string;
  axes: string[];
  ballot_mapping_examples: Record<string, string[]>;
}

export interface Item {
  id: string;
  text: string;
  axis_keys: Record<string, 1 | -1>;
  level: GovernmentLevel;
  tags: string[];
  tradeoff: string | null;
}

export interface Spec {
  spec_version: string;
  generated_at_utc: string;
  app: { name: string; notes: string[] };
  response_scale: Record<SwipeResponse, number>;
  scoring: {
    axis_range: [number, number];
    normalize_by_max: boolean;
    shrinkage_k: number;
    unsure_treatment: string;
    confidence_heuristic: string;
  };
  domains: Domain[];
  axes: Axis[];
  items: Item[];
}
