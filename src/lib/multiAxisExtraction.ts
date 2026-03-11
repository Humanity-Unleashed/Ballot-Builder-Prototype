/**
 * Multi-Axis Extraction — Signal classification and confidence discounting
 * for NLP responses that may cover multiple civic axes.
 *
 * When a user provides voice/text input for axis X, their response frequently
 * contains signals for other axes. This module classifies each signal by
 * strength (primary / secondary / spillover) and applies appropriate
 * confidence discounts.
 *
 * Reference: research/05_hybrid_flow.md Section 5
 */

import type {
  ClassifiedSignal,
  SignalStrength,
  ExtractionSummary,
  MultiAxisExtractionResult,
  ConfirmationCard,
} from '@/types/hybridAssessment';
import type { ValueSignal } from '@/types/conversation';
import {
  entropyConfidenceNLP,
  computeHybridConfidence,
} from './entropyConfidence';

// ── Constants ──

/** Secondary signals are discounted by 15% — the user mentioned this
 *  topic but we weren't specifically asking. */
const SECONDARY_DISCOUNT = 0.85;

/** Spillover signals are discounted by 40% — these are statistical
 *  inferences, not direct statements. */
const SPILLOVER_DISCOUNT = 0.60;

/** Minimum LLM confidence for a non-primary signal to qualify as secondary. */
const SECONDARY_MIN_CONFIDENCE = 0.50;

/** Minimum source quote length for explicit mention check. */
const EXPLICIT_MENTION_MIN_LENGTH = 10;

// ── Signal classification ──

/**
 * Classify raw ValueSignal[] from LLM extraction into strength categories.
 *
 * - Primary: the axis we asked about (always exactly one)
 * - Secondary: user explicitly mentioned another topic with enough clarity
 * - Spillover: inferred from correlation, not directly stated
 */
export function classifySignals(
  askedAxis: string,
  rawSignals: ValueSignal[],
): ClassifiedSignal[] {
  return rawSignals.map((signal) => {
    let strength: SignalStrength;

    if (signal.axisId === askedAxis) {
      strength = 'primary';
    } else if (signal.confidence >= SECONDARY_MIN_CONFIDENCE && isExplicitMention(signal)) {
      strength = 'secondary';
    } else {
      strength = 'spillover';
    }

    // Compute entropy-hybrid confidence
    const entropyResult = entropyConfidenceNLP(signal.direction, signal.confidence);
    const hybridConf = computeHybridConfidence(
      entropyResult.confidence,
      signal.confidence,
      'nlp',
    );

    // Apply strength-based confidence discount
    const discountedConf = applyStrengthDiscount(hybridConf, strength);

    return {
      axisId: signal.axisId,
      strength,
      rawSignal: signal,
      entropyConfidence: entropyResult.confidence,
      hybridConfidence: discountedConf,
      userConfirmed: strength === 'primary', // primary is auto-confirmed
    };
  });
}

/**
 * Check if the signal comes from an explicit user statement (not just
 * statistical spillover). The LLM extraction includes a `source` quote;
 * if the source quote directly references the axis topic, it's explicit.
 */
export function isExplicitMention(signal: ValueSignal): boolean {
  return (
    signal.source.length >= EXPLICIT_MENTION_MIN_LENGTH &&
    !signal.source.startsWith('[implied')
  );
}

/**
 * Apply strength-based confidence discount.
 */
export function applyStrengthDiscount(
  confidence: number,
  strength: SignalStrength,
): number {
  switch (strength) {
    case 'primary':
      return confidence;
    case 'secondary':
      return confidence * SECONDARY_DISCOUNT;
    case 'spillover':
      return confidence * SPILLOVER_DISCOUNT;
  }
}

// ── Extraction result builder ──

/**
 * Build a full MultiAxisExtractionResult from classified signals.
 * Groups signals and produces a user-facing summary.
 */
export function buildExtractionResult(
  askedAxis: string,
  classified: ClassifiedSignal[],
  getPositionLabel: (axisId: string, score: number) => string,
): MultiAxisExtractionResult {
  const primary = classified.find((s) => s.strength === 'primary') ?? null;
  const secondarySignals = classified.filter((s) => s.strength === 'secondary');

  const summary: ExtractionSummary = {
    primary: primary
      ? {
          axisId: primary.axisId,
          positionLabel: getPositionLabel(primary.axisId, primary.rawSignal.direction),
          confidence: primary.hybridConfidence,
        }
      : null,
    secondary: secondarySignals.map((s) => ({
      axisId: s.axisId,
      positionLabel: getPositionLabel(s.axisId, s.rawSignal.direction),
      confidence: s.hybridConfidence,
    })),
    summaryText: buildSummaryText(primary, secondarySignals, getPositionLabel),
  };

  return {
    askedAxis,
    signals: classified,
    extractionSummary: summary,
  };
}

/**
 * Build a confirmation card from classified signals.
 * Returns null if there are no secondary signals to confirm.
 */
export function buildConfirmationCard(
  classified: ClassifiedSignal[],
  getPositionLabel: (axisId: string, score: number) => string,
): ConfirmationCard | null {
  const primary = classified.find((s) => s.strength === 'primary');
  if (!primary) return null;

  const secondarySignals = classified.filter((s) => s.strength === 'secondary');
  if (secondarySignals.length === 0) return null;

  return {
    primary: {
      axisId: primary.axisId,
      positionLabel: getPositionLabel(primary.axisId, primary.rawSignal.direction),
      score: primary.rawSignal.direction,
      locked: true,
    },
    secondary: secondarySignals.map((s) => ({
      axisId: s.axisId,
      positionLabel: getPositionLabel(s.axisId, s.rawSignal.direction),
      score: s.rawSignal.direction,
      checked: false, // unchecked by default — user must opt in
    })),
  };
}

// ── Helpers ──

function buildSummaryText(
  primary: ClassifiedSignal | null,
  secondary: ClassifiedSignal[],
  getPositionLabel: (axisId: string, score: number) => string,
): string {
  if (!primary) return 'We couldn\'t clearly identify your position.';

  const primaryLabel = getPositionLabel(primary.axisId, primary.rawSignal.direction);
  if (secondary.length === 0) {
    return `Got it — ${primaryLabel}.`;
  }

  const secondaryLabels = secondary
    .map((s) => getPositionLabel(s.axisId, s.rawSignal.direction))
    .join(', ');

  return `We picked up your view on ${primaryLabel}, and also noticed thoughts on: ${secondaryLabels}. Check the ones that sound right.`;
}
