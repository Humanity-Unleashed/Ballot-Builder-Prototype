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
    //    Use nullish coalescing (??) not logical OR (||) — 0 is a valid direction score!
    const rawDirection = Number(signal.direction);
    let direction = Math.max(0, Math.min(10, Number.isFinite(rawDirection) ? rawDirection : 5));
    const rawConfidence = Number(signal.confidence);
    let confidence = Math.max(0, Math.min(1, Number.isFinite(rawConfidence) ? rawConfidence : 0.5));
    const rawImportance = Number(signal.importance);
    const importance = Math.max(0, Math.min(10, Number.isFinite(rawImportance) ? rawImportance : 5));

    // 3. Check source quote exists in user message (check multiple segments)
    const sourceStr = String(signal.source || '');
    const userLower = userMessage.toLowerCase();
    const sourceLower = sourceStr.toLowerCase();
    // Check overlapping 4-word windows from the source quote
    const sourceWords = sourceLower.split(/\s+/).filter(Boolean);
    let sourceInMessage = false;
    if (sourceWords.length >= 3) {
      for (let i = 0; i <= sourceWords.length - 3; i++) {
        const window = sourceWords.slice(i, i + 3).join(' ');
        if (userLower.includes(window)) {
          sourceInMessage = true;
          break;
        }
      }
    } else if (sourceLower.length > 0) {
      sourceInMessage = userLower.includes(sourceLower);
    }
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

    // 5. Near-neutral scores (3.5-6.5) with high confidence — likely vague/centrist
    //    response that the LLM overrated. Demote confidence.
    //    Research 06 Failure Mode B: "confident but vague"
    if (direction >= 3.5 && direction <= 6.5 && confidence > 0.6) {
      issues.push(`${axisId}: near-neutral score (${direction.toFixed(1)}) with high confidence — demoting`);
      confidence = 0.3;
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
