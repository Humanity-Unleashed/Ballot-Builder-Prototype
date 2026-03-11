/**
 * Signal Validation — shared validation for LLM extraction output.
 *
 * Applied server-side AFTER parsing the LLM's JSON response in both
 * the warmup and ballot turn routes.
 *
 * Rules from PROMPT_HARNESS.md Section 5.2.
 */

import type { ValueSignal } from '@/types/conversation';

/** Raw signal shape coming from the LLM (superset of ValueSignal) */
export interface RawExtractionSignal {
  axisId: unknown;
  direction: unknown;
  confidence: unknown;
  importance: unknown;
  source: unknown;
  reasoning: unknown;
  warnings?: unknown;
  conflictsWith?: unknown;
}

export interface RawExtractionOutput {
  signals: RawExtractionSignal[];
  meta?: {
    axesCovered?: string[];
    axesMissing?: string[];
    hasContradictions?: boolean;
    overallClarity?: number;
  };
  domainComplete?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  sanitizedSignals: ValueSignal[];
}

export function validateExtractionOutput(
  extraction: RawExtractionOutput,
  userMessage: string,
  validAxisIds: Set<string>
): ValidationResult {
  const issues: string[] = [];
  const sanitizedSignals: ValueSignal[] = [];

  for (const signal of extraction.signals || []) {
    // 1. Reject unknown axis IDs
    const axisId = String(signal.axisId || '');
    if (!validAxisIds.has(axisId)) {
      issues.push(`Unknown axis: ${axisId}`);
      continue;
    }

    // 2. Clamp values to valid ranges
    let direction = Math.max(0, Math.min(10, Number(signal.direction) || 5));
    let confidence = Math.max(0, Math.min(1, Number(signal.confidence) || 0.5));
    const importance = Math.max(0, Math.min(10, Number(signal.importance) || 5));

    // 3. Check source quote exists in user message (fuzzy — first 20 chars)
    const sourceStr = String(signal.source || '');
    const sourceSnippet = sourceStr.toLowerCase().slice(0, 20);
    const sourceInMessage = sourceSnippet.length > 0 && userMessage.toLowerCase().includes(sourceSnippet);
    if (!sourceInMessage && sourceStr.length > 0) {
      issues.push(`${axisId}: source quote not found in user message`);
      // Still include the signal but reduce confidence
      confidence = Math.min(confidence, 0.3);
    }

    // 4. High-confidence signals need substantive reasoning
    const reasoning = signal.reasoning ? String(signal.reasoning) : undefined;
    if (confidence > 0.7 && (!reasoning || reasoning.length < 20)) {
      issues.push(`${axisId}: high confidence (${confidence.toFixed(2)}) but thin reasoning`);
    }

    // 5. Reject exact-5 scores with high confidence (likely a default, not real interpretation)
    if (direction === 5 && confidence > 0.6) {
      issues.push(`${axisId}: suspicious neutral score (5.0) with high confidence`);
      confidence = 0.3; // Demote
    }

    // Parse optional enriched fields
    const warnings = Array.isArray(signal.warnings)
      ? signal.warnings.filter((w): w is string => typeof w === 'string')
      : undefined;
    const conflictsWith = typeof signal.conflictsWith === 'string' ? signal.conflictsWith : null;

    sanitizedSignals.push({
      axisId,
      direction,
      confidence,
      importance,
      source: sourceStr,
      reasoning,
      warnings: warnings && warnings.length > 0 ? warnings : undefined,
      conflictsWith: conflictsWith || undefined,
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    sanitizedSignals,
  };
}
