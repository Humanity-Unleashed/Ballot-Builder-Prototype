/**
 * Hybrid Assessment Types — Unified type definitions for the
 * structured + NLP modality-switching assessment flow.
 *
 * Both modalities produce interchangeable UserValueRecord objects.
 * The downstream scoring engine never sees which modality produced a record.
 *
 * Reference: research/05_hybrid_flow.md Section 4
 */

import type { ValueSignal } from './conversation';

// ── Modality ──

export type InputModality = 'structured' | 'nlp' | 'imputed';

// ── Modality switching ──

export type ModalitySwitchDirection = 'structured_to_nlp' | 'nlp_to_structured';

export type TriggerSource =
  | 'user_initiated'
  | 'confidence_triggered'
  | 'axis_type_triggered'
  | 'engagement_triggered';

export interface ModalityTrigger {
  id: string;
  direction: ModalitySwitchDirection;
  source: TriggerSource;
  /** The measurable signal that fires this trigger */
  signal: string;
  /** Threshold or condition for the signal */
  condition: string;
  /** What the system does when the trigger fires */
  action: string;
  /** Whether the user can override (dismiss) this trigger */
  dismissable: boolean;
}

export interface ModalitySwitch {
  from: InputModality;
  to: InputModality;
  triggerId: string; // T1-T7
  turnNumber: number;
  /** Confidence at the time of switch (for the 'from' modality) */
  confidenceAtSwitch: number;
}

// ── Per-axis modality tracking ──

export interface ModalityRecord {
  /** Which modality produced this axis's current best record */
  modality: InputModality;
  /** If NLP, how many voice/text turns contributed */
  nlpTurnCount: number;
  /** If structured, the raw card selection (0-10 scale) */
  structuredSelection?: number;
  /** If the user switched modalities on this axis, log the history */
  switchHistory: ModalitySwitch[];
}

export interface AxisConfidenceByModality {
  /** Confidence from the structured card selection, if any */
  structuredConfidence: number | null;
  /** Confidence from NLP extraction, if any */
  nlpConfidence: number | null;
  /** Confidence from cross-axis imputation, if any */
  imputedConfidence: number | null;
  /** The merged/final confidence used in the matching formula */
  mergedConfidence: number;
}

// ── Signal classification ──

export type SignalStrength = 'primary' | 'secondary' | 'spillover';

export interface ClassifiedSignal {
  axisId: string;
  strength: SignalStrength;
  /** ValueSignal from LLM extraction */
  rawSignal: ValueSignal;
  /** Entropy-based confidence after processing */
  entropyConfidence: number;
  /** Hybrid confidence (entropy + heuristic blend) */
  hybridConfidence: number;
  /** Whether the user has confirmed this signal */
  userConfirmed: boolean;
}

// ── Multi-axis extraction result ──

export interface MultiAxisExtractionResult {
  /** The axis the question was about */
  askedAxis: string;
  /** All extracted signals, classified by strength */
  signals: ClassifiedSignal[];
  /** Summary for the user confirmation UI */
  extractionSummary: ExtractionSummary;
}

export interface ExtractionSummary {
  primary: { axisId: string; positionLabel: string; confidence: number } | null;
  secondary: Array<{ axisId: string; positionLabel: string; confidence: number }>;
  /** Plain-language summary for the user */
  summaryText: string;
}

// ── Confirmation card ──

export interface ConfirmationCard {
  primary: {
    axisId: string;
    positionLabel: string;
    score: number;
    locked: true;
  };
  secondary: Array<{
    axisId: string;
    positionLabel: string;
    score: number;
    checked: boolean;
  }>;
}

// ── Unified user value record ──

export interface UserValueRecord {
  axisId: string;
  /** Position on the 0-10 scale */
  score: number;
  /** Normalized position on the -1 to +1 scale (for matching formula) */
  scoreNormalized: number;
  /** Entropy-hybrid confidence (0-1) */
  confidence: number;
  /** Coverage status for the matching formula */
  coverageStatus: 'answered' | 'imputed' | 'uncovered';
  isImputed: boolean;
  imputationSource?: string[];

  // --- Provenance (informational, not used in matching) ---
  sourceModality: InputModality;
  /** If structured: which card position was selected */
  cardPosition?: number;
  /** If NLP: the user's verbatim input */
  nlpSourceText?: string;
  /** If NLP: the LLM's reasoning chain */
  nlpReasoning?: string;
  /** If NLP: which signal strength classification */
  signalStrength?: SignalStrength;
  /** Timestamp of the record */
  recordedAt: number;
}

// ── Per-axis state ──

export type CoverageStatus = 'uncovered' | 'soft_only' | 'partial' | 'covered';

export interface HybridAxisState {
  axisId: string;

  // --- Posterior (21-bin from Research 06) ---
  posterior: number[];   // length 21
  entropy: number;
  pointEstimate: number;

  // --- Modality tracking ---
  modalityRecord: ModalityRecord;
  confidenceByModality: AxisConfidenceByModality;

  // --- Records ---
  /** The current best UserValueRecord for this axis */
  currentRecord: UserValueRecord | null;
  /** All signals ever received for this axis (audit trail) */
  signalHistory: ClassifiedSignal[];

  // --- Coverage ---
  coverageStatus: CoverageStatus;
  importance: number | null;

  // --- Evidence ---
  evidenceQuotes: string[];
}

// ── Full hybrid session state ──

export interface HybridAssessmentSession {
  sessionId: string;

  // --- Global session fields ---
  /** Total user interactions (card selections + NLP turns) */
  interactionCount: number;
  /** Maximum allowed interactions before forced completion */
  maxInteractions: number; // default: 20
  /** Current modality preference (what the user sees next by default) */
  defaultModality: 'structured' | 'nlp';

  // --- Per-axis state ---
  axes: Record<string, HybridAxisState>;

  // --- Sequencing ---
  /** Ordered list of axes to present (from adaptive sequencer) */
  questionQueue: string[];
  /** Index into questionQueue */
  currentQuestionIndex: number;
  /** Axes that have been answered (directly or via multi-axis NLP) */
  answeredAxes: string[];
  /** Axes confirmed by user (subset of answeredAxes) */
  confirmedAxes: string[];
  /** Axes skipped explicitly by the user */
  skippedAxes: string[];

  // --- Modality history ---
  /** Chronological log of all modality switches */
  modalitySwitchLog: ModalitySwitch[];
  /** How many times the user has used NLP (for engagement tracking) */
  totalNlpInteractions: number;
  /** How many times the user has used structured (for engagement tracking) */
  totalStructuredInteractions: number;
  /** Running count of consecutive neutral structured selections */
  consecutiveNeutrals: number;

  // --- Pending multi-axis signals ---
  /** Secondary signals from NLP that await user confirmation */
  pendingSecondarySignals: ClassifiedSignal[];

  // --- Session-level entropy ---
  sessionEntropy: number;
  estimatedRemainingInteractions: number;
  readyForMatching: boolean;
}

// ── Trigger evaluation context ──

export interface TriggerContext {
  currentModality: 'structured' | 'nlp';
  userAction?: 'escape_hatch_tap' | 'show_cards' | null;
  selectedPosition?: number;
  dwellTimeMs?: number;
  importanceSelfReport?: number;
  consecutiveNeutrals: number;
  nlpTurnsOnCurrentAxis: number;
  axisConfidence: number;
  axisId: string;
  nlpExtractionResult?: {
    primarySignal: { confidence: number; direction: number };
  } | null;
}

// ── Contradiction resolution ──

export type ContradictionStrategy = 'pick_structured' | 'pick_nlp' | 'bimodal' | 'new_response';

export interface ContradictionResolution {
  strategy: ContradictionStrategy;
  /** If 'new_response', the new NLP input text */
  newInput?: string;
}

// ── Stopping decision ──

export interface HybridStoppingDecision {
  shouldStop: boolean;
  reason: 'minimum_not_reached' | 'max_interactions' | 'all_answered' | 'entropy_floor' | 'marginal_gain_low' | 'continue';
  interactionCount: number;
  sessionEntropy: number;
  entropyFraction: number;
}
