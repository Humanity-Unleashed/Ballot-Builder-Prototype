/**
 * Conflict Resolution — Cross-modality contradiction handling.
 *
 * When an axis receives scores from both structured and NLP modalities,
 * this module merges them using confidence-weighted averaging with
 * recency bonuses and user-agency overrides.
 *
 * Contradictions (score gap > 3.0) are flagged for user resolution
 * rather than silently merged.
 *
 * Reference: research/05_hybrid_flow.md Section 6
 */

import type {
  UserValueRecord,
  ModalitySwitch,
  ContradictionResolution,
  HybridAxisState,
} from '@/types/hybridAssessment';
import {
  bimodalPosterior,
  entropyConfidenceFromPosterior,
} from './entropyConfidence';

// ── Constants ──

/** Score gap threshold for contradiction detection (on 0-10 scale). */
const CONTRADICTION_SCORE_GAP = 3.0;

/** Recency bonus for the more recent record. */
const RECENCY_BONUS = 0.05;

/** Maximum confidence for a contradictory merged result. */
const CONTRADICTION_MAX_CONFIDENCE = 0.40;

// ── Contradiction detection ──

/**
 * Check if two records for the same axis are contradictory.
 */
export function isContradiction(
  recordA: UserValueRecord,
  recordB: UserValueRecord,
): boolean {
  return Math.abs(recordA.score - recordB.score) > CONTRADICTION_SCORE_GAP;
}

// ── Merge ──

export interface MergeInput {
  structured: UserValueRecord | null;
  nlp: UserValueRecord | null;
}

/**
 * Merge axis records from structured and NLP modalities.
 *
 * The merge rule follows three principles:
 * 1. Recency: The most recent record gets a temporal bonus.
 * 2. Confidence: Higher confidence records contribute more.
 * 3. User agency: If the user explicitly switched modalities (T1 or T5),
 *    the destination modality's record takes full precedence.
 */
export function mergeAxisRecords(
  input: MergeInput,
  switchHistory: ModalitySwitch[],
): UserValueRecord {
  const { structured, nlp } = input;

  // Case 1: Only one modality has a record
  if (!structured && nlp) return nlp;
  if (structured && !nlp) return structured;
  if (!structured && !nlp) {
    throw new Error('Cannot merge: no records for either modality');
  }

  const s = structured!;
  const n = nlp!;

  // Case 2: User explicitly switched TO one modality (T1 or T5)
  const lastSwitch = switchHistory.length > 0
    ? switchHistory[switchHistory.length - 1]
    : null;

  if (lastSwitch) {
    if (lastSwitch.triggerId === 'T1' && lastSwitch.to === 'nlp') {
      return n; // User switched away from cards — NLP wins
    }
    if (lastSwitch.triggerId === 'T5' && lastSwitch.to === 'structured') {
      return s; // User switched back to cards — structured wins
    }
  }

  // Case 3: No explicit user-driven switch. Check for contradiction first.
  const scoreGap = Math.abs(s.score - n.score);
  const isContradictory = scoreGap > CONTRADICTION_SCORE_GAP;

  // Confidence-weighted average with recency bonus
  const sWeight = s.confidence + (s.recordedAt > n.recordedAt ? RECENCY_BONUS : 0);
  const nWeight = n.confidence + (n.recordedAt > s.recordedAt ? RECENCY_BONUS : 0);
  const totalWeight = sWeight + nWeight;

  if (totalWeight === 0) {
    // Both have zero confidence — use whichever is more recent
    return s.recordedAt > n.recordedAt ? s : n;
  }

  const mergedScore = (s.score * sWeight + n.score * nWeight) / totalWeight;
  const mergedScoreNormalized = (mergedScore - 5.0) / 5.0;

  // Confidence: take the maximum (more informative record dominates)
  const mergedConfidence = Math.max(s.confidence, n.confidence);

  // For contradictions, cap confidence to reflect genuine uncertainty
  const finalConfidence = isContradictory
    ? Math.min(mergedConfidence * 0.5, CONTRADICTION_MAX_CONFIDENCE)
    : mergedConfidence;

  return {
    axisId: s.axisId,
    score: mergedScore,
    scoreNormalized: mergedScoreNormalized,
    confidence: finalConfidence,
    coverageStatus: 'answered',
    isImputed: false,
    sourceModality: finalConfidence === s.confidence ? 'structured' : 'nlp',
    cardPosition: s.cardPosition,
    nlpSourceText: n.nlpSourceText,
    nlpReasoning: n.nlpReasoning,
    recordedAt: Math.max(s.recordedAt, n.recordedAt),
  };
}

// ── Contradiction resolution ──

/**
 * Resolve a detected contradiction based on user choice.
 *
 * @throws Error if strategy is 'new_response' — caller must handle via NLP extraction.
 */
export function resolveContradiction(
  axis: HybridAxisState,
  structuredRecord: UserValueRecord,
  nlpRecord: UserValueRecord,
  resolution: ContradictionResolution,
): UserValueRecord {
  switch (resolution.strategy) {
    case 'pick_structured':
      return structuredRecord;

    case 'pick_nlp':
      return nlpRecord;

    case 'bimodal': {
      // Use bimodal posterior from Research 06
      const posterior = bimodalPosterior(
        { direction: structuredRecord.score, confidence: structuredRecord.confidence },
        { direction: nlpRecord.score, confidence: nlpRecord.confidence },
      );
      const entropyResult = entropyConfidenceFromPosterior(posterior);
      return {
        axisId: axis.axisId,
        score: entropyResult.posteriorMean,
        scoreNormalized: (entropyResult.posteriorMean - 5.0) / 5.0,
        confidence: entropyResult.confidence,
        coverageStatus: 'answered',
        isImputed: false,
        sourceModality: 'nlp', // bimodal is a hybrid result
        recordedAt: Date.now(),
      };
    }

    case 'new_response':
      throw new Error(
        'new_response must be handled by the caller via NLP extraction',
      );
  }
}
