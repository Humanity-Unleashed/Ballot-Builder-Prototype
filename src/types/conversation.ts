/**
 * Conversation Types
 *
 * Data contracts for the conversational ballot helper flow.
 * The LLM acts as a translator (natural language → axis value updates),
 * NOT as a recommender. The existing scoring engine produces recommendations.
 */

import type { PropositionRecommendation, CandidateMatch } from '@/lib/ballotHelpers';

// =============================================
// Value signals extracted by LLM
// =============================================

export interface ValueSignal {
  /** One of the 15 civic axis IDs */
  axisId: string;
  /** Where the user falls on this axis, 0-10 scale */
  direction: number;
  /** How confident the LLM is in this signal, 0-1 */
  confidence: number;
  /** How important this issue is to the user, 0-10 (inferred from enthusiasm) */
  importance: number;
  /** What the user said that produced this signal */
  source: string;
  /** LLM reasoning chain for how this signal was extracted */
  reasoning?: string;
  /** Ambiguities, partial coverage, or internal tensions detected */
  warnings?: string[];
  /** If this contradicts a prior signal, quote the prior evidence */
  conflictsWith?: string | null;
}

export interface TurnMeta {
  /** Axes with at least one signal this turn */
  axesCovered: string[];
  /** Domain axes with no signal yet */
  axesMissing: string[];
  /** True if any signal has warnings about contradictions */
  hasContradictions: boolean;
  /** How interpretable the user's message was overall, 0-1 */
  overallClarity: number;
}

// =============================================
// LLM structured response
// =============================================

export interface LLMTurnResult {
  /** Axis value signals extracted from the user's response */
  valueSignals: ValueSignal[];
  /** Whether the LLM thinks we have enough info to recommend */
  recommendation: {
    ready: boolean;
    needsFollowUp: boolean;
    followUpQuestion?: string;
  };
  /** The conversational response text to show the user */
  responseText: string;
  /** Classified user intent */
  userIntent: 'opinion' | 'question' | 'skip' | 'unclear';
}

// =============================================
// Chat messages
// =============================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  /** Which ballot item this message is about */
  ballotItemId?: string;
}

// =============================================
// Per-ballot-item conversation state
// =============================================

export type ItemStatus = 'pending' | 'discussing' | 'recommended' | 'voted' | 'skipped';

export interface BallotItemConversation {
  ballotItemId: string;
  status: ItemStatus;
  turnCount: number;
  messages: ConversationMessage[];
  recommendation?: PropositionRecommendation | CandidateMatch[];
  /** The user's confirmed vote choice */
  userVote?: string | null;
}

// =============================================
// Progressive profile (accumulated axis values)
// =============================================

export interface ProgressiveAxisValue {
  value: number;       // 0-10
  confidence: number;  // 0-1
  importance: number;  // 0-10, how much the user cares about this axis
  signalCount: number; // how many signals contributed
}

// =============================================
// Full conversation session
// =============================================

/** Domain IDs in assessment order */
export const DOMAIN_ORDER = ['econ', 'health', 'housing', 'justice', 'climate'] as const;
export type DomainId = typeof DOMAIN_ORDER[number];

/** Domain display names */
export const DOMAIN_LABELS: Record<DomainId, string> = {
  econ: 'Economic Policy',
  health: 'Healthcare',
  housing: 'Housing & Transit',
  justice: 'Justice & Safety',
  climate: 'Climate & Energy',
};

/** Domain → axis IDs mapping (matches civicAxesSpec.domains[].axes) */
export const DOMAIN_AXES: Record<DomainId, string[]> = {
  econ: ['econ_safetynet', 'econ_investment', 'econ_school_choice', 'econ_tax_structure'],
  health: ['health_coverage_model', 'health_cost_control', 'health_public_health'],
  housing: ['housing_supply_zoning', 'housing_affordability_tools', 'housing_transport_priority'],
  justice: ['justice_policing_accountability', 'justice_sentencing_goals', 'justice_firearms'],
  climate: ['climate_ambition', 'climate_energy_portfolio', 'climate_permitting'],
};

/** Given a set of relevant axis IDs, return only the domains that have at least one relevant axis */
export function getRelevantDomains(relevantAxes: string[]): DomainId[] {
  const axisSet = new Set(relevantAxes);
  return DOMAIN_ORDER.filter((domainId) =>
    DOMAIN_AXES[domainId].some((axisId) => axisSet.has(axisId))
  );
}

export interface ConversationSession {
  sessionId: string;
  ballotId: string;
  /** 'state-select' → 'demographics' → 'warmup' → 'ballot' */
  phase: 'state-select' | 'demographics' | 'warmup' | 'ballot';
  /** Accumulated axis values from conversation signals */
  profile: Record<string, ProgressiveAxisValue>;
  /** Warmup conversation messages (before ballot items) */
  warmupMessages: ConversationMessage[];
  /** How many warmup turns the user has completed */
  warmupTurnCount: number;
  /** Which domain (0-4) the warmup is currently exploring */
  currentDomainIndex: number;
  /** How many turns spent on the current domain */
  domainTurnCount: number;
  /** Ballot-relevant axis IDs (only these axes are explored in warmup) */
  relevantAxes: string[];
  /** Domains that have at least one relevant axis (determines warmup domain order) */
  relevantDomains: DomainId[];
  /** Per-item conversation state */
  items: Record<string, BallotItemConversation>;
  /** Ordered list of ballot item IDs */
  itemOrder: string[];
  /** Index into itemOrder */
  currentItemIndex: number;
  completedCount: number;
  totalCount: number;
}

// =============================================
// API request/response types
// =============================================

export interface ConversationTurnRequest {
  ballotItemId: string;
  userMessage: string;
  currentProfile: Record<string, ProgressiveAxisValue>;
  conversationHistory: ConversationMessage[];
  ballotItem: {
    id: string;
    type: 'proposition' | 'candidate_race';
    title: string;
    questionText: string;
    explanation: string;
    relevantAxes?: string[];
    yesAxisEffects?: Record<string, number>;
    candidates?: Array<{
      id: string;
      name: string;
      party?: string;
      profile: {
        stances: Record<string, number>;
        summary?: string;
      };
    }>;
  };
}

export interface ConversationTurnResponse {
  assistantMessage: ConversationMessage;
  valueSignals: ValueSignal[];
  recommendation?: PropositionRecommendation | CandidateMatch[];
  status: 'discussing' | 'recommended' | 'skipped';
  updatedProfile: Record<string, ProgressiveAxisValue>;
}
