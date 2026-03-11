/**
 * Modality Triggers — Card <-> NLP switch trigger evaluation.
 *
 * Implements the 7 triggers from Research 05 Section 2:
 *   T1: User taps "None of these fit" (S -> NLP, user_initiated)
 *   T2: Neutral selection with low importance (S -> NLP, confidence_triggered)
 *   T3: Repeated neutral selections (S -> NLP, engagement_triggered)
 *   T4: Axis with known card-format weakness (S -> NLP, axis_type_triggered)
 *   T5: User requests cards back (NLP -> S, user_initiated)
 *   T6: Vague or off-topic NLP response (NLP -> S, confidence_triggered)
 *   T7: Multi-turn NLP without convergence (NLP -> S, engagement_triggered)
 *
 * Reference: research/05_hybrid_flow.md Section 2
 */

import type { ModalityTrigger, TriggerContext } from '@/types/hybridAssessment';

// ── Trigger definitions ──

export const TRIGGERS: Record<string, ModalityTrigger> = {
  T1: {
    id: 'T1',
    direction: 'structured_to_nlp',
    source: 'user_initiated',
    signal: 'user_action === escape_hatch_tap',
    condition: 'Always fires on tap',
    action: 'Expand NLP input panel below the cards',
    dismissable: false,
  },
  T2: {
    id: 'T2',
    direction: 'structured_to_nlp',
    source: 'confidence_triggered',
    signal: 'neutral selection + fast dwell',
    condition: 'position=5.0, dwell<2000ms',
    action: 'Show "Tell us more" chip below selected card',
    dismissable: true,
  },
  T3: {
    id: 'T3',
    direction: 'structured_to_nlp',
    source: 'engagement_triggered',
    signal: 'consecutive_neutrals >= 2',
    condition: '2+ consecutive neutral selections',
    action: 'Offer mode switch to conversation',
    dismissable: true,
  },
  T4: {
    id: 'T4',
    direction: 'structured_to_nlp',
    source: 'axis_type_triggered',
    signal: 'axis_id in NUANCED_AXES',
    condition: 'Axis known to compress nuance in card format',
    action: 'Enhanced escape hatch prominence',
    dismissable: false, // visual-only, not a modal
  },
  T5: {
    id: 'T5',
    direction: 'nlp_to_structured',
    source: 'user_initiated',
    signal: 'user_action === show_cards',
    condition: 'User explicitly requests card options',
    action: 'Collapse NLP panel, re-display cards',
    dismissable: false,
  },
  T6: {
    id: 'T6',
    direction: 'nlp_to_structured',
    source: 'confidence_triggered',
    signal: 'vague NLP extraction',
    condition: 'confidence<0.30, direction in [3.5,6.5]',
    action: 'Show cards with "pick the closest" prompt',
    dismissable: true,
  },
  T7: {
    id: 'T7',
    direction: 'nlp_to_structured',
    source: 'engagement_triggered',
    signal: 'multi-turn NLP without convergence',
    condition: '3+ turns on axis, confidence<0.50',
    action: 'Transition to cards with partial signal highlighted',
    dismissable: true,
  },
};

// ── Nuanced axes (T4) ──

/** Axes where the 5-card format is known to compress too much nuance. */
export const NUANCED_AXES = new Set([
  'housing_supply_zoning',
  'climate_permitting',
  'justice_policing_accountability',
]);

// ── Trigger evaluation ──

/**
 * Evaluate all triggers in priority order and return the first match.
 *
 * Priority:
 * 1. User-initiated (T1, T5) — never override the user
 * 2. Confidence-triggered (T2, T6) — fire only if no user action
 * 3. Engagement-triggered (T3, T7) — fire only after pattern established
 *
 * T4 is returned separately via `isNuancedAxis()` since it's visual-only.
 */
export function evaluateTriggers(context: TriggerContext): ModalityTrigger | null {
  // Priority 1: User-initiated
  if (context.userAction === 'escape_hatch_tap') return TRIGGERS.T1;
  if (context.userAction === 'show_cards') return TRIGGERS.T5;

  // Priority 2: Confidence-triggered
  if (context.currentModality === 'structured') {
    if (isConfusedNeutral(context)) return TRIGGERS.T2;
  }
  if (context.currentModality === 'nlp') {
    if (isVagueNlpResponse(context)) return TRIGGERS.T6;
  }

  // Priority 3: Engagement-triggered
  if (context.consecutiveNeutrals >= 2) return TRIGGERS.T3;
  if (context.nlpTurnsOnCurrentAxis >= 3 && context.axisConfidence < 0.50) {
    return TRIGGERS.T7;
  }

  return null;
}

/**
 * Whether an axis should show enhanced NLP escape hatch (T4).
 * This is a visual hint, not a modal trigger.
 */
export function isNuancedAxis(axisId: string): boolean {
  return NUANCED_AXES.has(axisId);
}

// ── Internal helpers ──

/**
 * T2: User picked neutral (5.0) quickly, suggesting confusion rather
 * than genuine centrism.
 */
function isConfusedNeutral(ctx: TriggerContext): boolean {
  return (
    ctx.selectedPosition === 5.0 &&
    (ctx.dwellTimeMs ?? Infinity) < 2000 &&
    (ctx.importanceSelfReport === undefined || ctx.importanceSelfReport < 4)
  );
}

/**
 * T6: LLM could not extract a clear directional signal — low confidence
 * and direction near the midpoint.
 */
function isVagueNlpResponse(ctx: TriggerContext): boolean {
  if (!ctx.nlpExtractionResult) return false;
  const { confidence, direction } = ctx.nlpExtractionResult.primarySignal;
  return confidence < 0.30 && direction >= 3.5 && direction <= 6.5;
}
