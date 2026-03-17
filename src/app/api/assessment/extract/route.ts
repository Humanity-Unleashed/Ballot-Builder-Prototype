/**
 * Multi-Axis Extraction API — Extracts value signals from free-form user
 * input, scanning all 17 civic axes (not just the current domain).
 *
 * Used by the hybrid assessment flow when a user switches to NLP mode
 * (voice or text) via the "None of these fit" escape hatch.
 *
 * Two-pass architecture:
 *   Pass 1: Signal extraction (structured JSON, low temperature)
 *   Pass 2: (optional future) Response generation for conversation continuity
 *
 * Reference: research/05_hybrid_flow.md Section 5.4
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ValueSignal } from '@/types/conversation';
import { AXIS_IDS } from '@/lib/correlationMatrix';
import { axisSliderConfigs } from '@/data/sliderPositions';
import { validateExtractionOutput, type RawExtractionOutput } from '@/server/services/signalValidation';

// ── DeepInfra config ──

const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
const DEEPINFRA_LLM_MODEL = process.env.DEEPINFRA_LLM_MODEL || 'openai/gpt-oss-120b';
const DEEPINFRA_CHAT_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';

// ── Request / Response types ──

interface ExtractRequest {
  /** The axis the user was asked about */
  askedAxis: string;
  /** The user's free-form input (voice transcript or typed text) */
  userInput: string;
  /** Axes already answered (don't extract primary signals for these) */
  answeredAxes?: string[];
  /** Current profile state for context */
  currentProfile?: Record<string, { value: number; confidence: number }>;
}

interface ExtractResponse {
  /** All extracted signals (primary + secondary + spillover candidates) */
  signals: ValueSignal[];
  /** Extraction metadata */
  meta: {
    askedAxis: string;
    axesCovered: string[];
    overallClarity: number;
  };
}

// ── LLM caller (same pattern as warmup route) ──

async function callLLM(
  systemPrompt: string,
  userMessage: string,
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const { temperature = 0.3, maxTokens = 800 } = options;

  const response = await fetch(DEEPINFRA_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPINFRA_LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DeepInfra LLM error:', response.status, errorText);
    throw new Error(`LLM API error: ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content ?? '';
}

// ── Prompt builder ──

/**
 * Build the multi-axis extraction prompt.
 *
 * Unlike the warmup extraction (which scans only the current domain),
 * this scans ALL 17 axes — the asked axis as PRIMARY, and any other
 * axis the user explicitly mentions as SECONDARY.
 */
function buildMultiAxisExtractionPrompt(
  askedAxis: string,
  answeredAxes: Set<string>,
  currentProfile?: Record<string, { value: number; confidence: number }>,
): string {
  // Build the asked axis reference (detailed, with all 5 positions)
  const askedAxisRef = buildAxisPositionReference(askedAxis);

  // Build secondary axis hints (lighter — just pole labels, no full positions)
  const secondaryHints = AXIS_IDS
    .filter((id) => id !== askedAxis)
    .map((id) => {
      const config = axisSliderConfigs[id];
      if (!config) return null;
      const status = answeredAxes.has(id)
        ? '(already answered)'
        : currentProfile?.[id]
          ? `(current: ${currentProfile[id].value.toFixed(1)}, conf: ${currentProfile[id].confidence.toFixed(2)})`
          : '(not yet discussed)';
      return `  - ${id}: "${config.poleALabel.replace(/\n/g, ' ')}" vs "${config.poleBLabel.replace(/\n/g, ' ')}" ${status}`;
    })
    .filter(Boolean)
    .join('\n');

  return `You are a value signal extraction engine for a civic engagement app. The user was asked about a specific policy topic and gave a free-form response. Your job is to extract structured signals.

═══════════════════════════════════════════
PRIMARY AXIS (the one we asked about)
═══════════════════════════════════════════

${askedAxisRef}

═══════════════════════════════════════════
SECONDARY AXES (scan for EXPLICIT mentions only)
═══════════════════════════════════════════

${secondaryHints}

═══════════════════════════════════════════
EXTRACTION RULES
═══════════════════════════════════════════

PRIMARY SIGNAL (the asked axis):
- ALWAYS extract a signal for the asked axis (${askedAxis}) if the user said anything relevant
- Map their position to the 0-10 scale using the EXACT reference positions above (0, 2.5, 5, 7.5, 10)
- Score 0 means STRONG Pole A. Score 10 means STRONG Pole B. Score 5 means genuinely neutral.
- This is the signal we care most about — be thorough

SECONDARY SIGNALS (other axes):
- ONLY extract if the user DIRECTLY and EXPLICITLY stated a position on another topic
- The user must have used words that clearly reference the topic — not just correlation
- Examples of explicit: "and we should invest in public transit" → housing_transport_priority
- Examples of NOT explicit: user supports safety nets, you infer they support healthcare → NO
- Set the source field to the user's exact words that triggered the secondary signal
- If the source starts with "[implied" or you're inferring from correlation, do NOT include it

CONFIDENCE (0-1):
- 0.7-0.9: Clear, unambiguous preference
- 0.4-0.6: General sentiment with hedging
- 0.1-0.3: Vague but detectable lean
- Do NOT extract if confidence would be below 0.1

IMPORTANCE (0-10):
- 8-10: Passionate, strong language
- 5-7: Engaged meaningfully
- 2-4: Brief mention
- 0-1: Doesn't care

SOURCE QUOTES:
- MUST be the user's actual words, not paraphrased
- For secondary signals, the quote must directly reference that topic

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════

Respond with valid JSON:
{
  "signals": [
    {
      "axisId": "string — axis ID",
      "direction": "number 0-10",
      "confidence": "number 0-1",
      "importance": "number 0-10",
      "source": "direct quote from user",
      "reasoning": "explain: quote → position → score. REQUIRED.",
      "warnings": ["optional ambiguity notes"],
      "conflictsWith": "null or quote from prior evidence"
    }
  ],
  "meta": {
    "axesCovered": ["axis IDs with signals"],
    "overallClarity": "0-1"
  }
}

CRITICAL:
- The FIRST signal MUST be for the asked axis (${askedAxis}) — it is the PRIMARY signal
- Additional signals are SECONDARY — only include with explicit user statements
- Do NOT include spillover/correlation-based signals — those are handled by the math engine
- Do NOT fill gaps with neutral 5s
- You may extract 0 secondary signals — that is fine and expected for most responses`;
}

/**
 * Build detailed position reference for a single axis.
 */
function buildAxisPositionReference(axisId: string): string {
  const config = axisSliderConfigs[axisId];
  if (!config) return `AXIS: ${axisId} (no position reference available)`;

  const positions = config.positions
    .map((p, i) => {
      // Use exact decimal values (0, 2.5, 5, 7.5, 10) — must match snapping positions
      const value = (i / (config.positions.length - 1)) * 10;
      const label = Number.isInteger(value) ? value.toString() : value.toFixed(1);
      const marker = p.isCurrentPolicy ? ' ← current US policy' : '';
      return `    ${label}: "${p.title}" — ${p.description}${marker}`;
    })
    .join('\n');

  return `AXIS: ${axisId}
Question: ${config.question}
Pole A (score 0 = strongest "${config.poleALabel.replace(/\n/g, ' ')}"): score 0
Pole B (score 10 = strongest "${config.poleBLabel.replace(/\n/g, ' ')}"): score 10
Positions (use these EXACT scores):
${positions}

IMPORTANT: Score 0 is a VALID score meaning the user strongly holds the Pole A position. Do NOT treat 0 as "no opinion".`;
}

// ── Route handler ──

export async function POST(req: NextRequest) {
  if (!DEEPINFRA_API_KEY) {
    return NextResponse.json(
      { error: 'DEEPINFRA_API_KEY is not configured' },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json()) as ExtractRequest;

    if (!body.askedAxis || !body.userInput) {
      return NextResponse.json(
        { error: 'askedAxis and userInput are required' },
        { status: 400 },
      );
    }

    // Validate asked axis
    if (!AXIS_IDS.includes(body.askedAxis as typeof AXIS_IDS[number])) {
      return NextResponse.json(
        { error: `Unknown axis: ${body.askedAxis}` },
        { status: 400 },
      );
    }

    const answeredSet = new Set(body.answeredAxes ?? []);

    // Build extraction prompt
    const systemPrompt = buildMultiAxisExtractionPrompt(
      body.askedAxis,
      answeredSet,
      body.currentProfile,
    );

    // Call LLM
    const extractionJson = await callLLM(systemPrompt, body.userInput, {
      temperature: 0.3,
      maxTokens: 800,
    });

    // Parse
    console.log('[extract] Asked axis:', body.askedAxis, '| User input:', body.userInput.slice(0, 120));
    console.log('[extract] Raw LLM response:', extractionJson.slice(0, 500));
    let extraction: RawExtractionOutput & { meta?: { overallClarity?: number } };
    try {
      extraction = JSON.parse(extractionJson);
    } catch {
      console.error('[extract] Failed to parse LLM JSON:', extractionJson);
      return NextResponse.json(
        {
          signals: [],
          meta: { askedAxis: body.askedAxis, axesCovered: [], overallClarity: 0 },
        } satisfies ExtractResponse,
      );
    }

    // Validate signals — allow all 17 axes, not just a domain subset
    const allAxisIds = new Set(AXIS_IDS as readonly string[]);
    const { sanitizedSignals, issues } = validateExtractionOutput(
      extraction,
      body.userInput,
      allAxisIds,
    );

    if (issues.length > 0) {
      console.warn('[extract] Validation issues:', issues);
    }

    // Log sanitized signals for debugging
    for (const s of sanitizedSignals) {
      console.log(`[extract] Signal: ${s.axisId} direction=${s.direction} confidence=${s.confidence} source="${s.source?.slice(0, 60)}"`);
    }

    // Ensure primary signal is first
    const sorted = [...sanitizedSignals].sort((a, b) => {
      if (a.axisId === body.askedAxis) return -1;
      if (b.axisId === body.askedAxis) return 1;
      return 0;
    });

    const resp: ExtractResponse = {
      signals: sorted,
      meta: {
        askedAxis: body.askedAxis,
        axesCovered: sorted.map((s) => s.axisId),
        overallClarity: extraction.meta?.overallClarity ?? (sorted.length > 0 ? 0.5 : 0.2),
      },
    };

    return NextResponse.json(resp);
  } catch (error) {
    console.error('[extract] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 },
    );
  }
}
