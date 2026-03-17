/**
 * LLM Service — Interprets user responses against ballot item context.
 *
 * Uses a two-pass architecture matching the warmup route:
 *   Pass 1 (response): Warm conversational response, plain text
 *   Pass 2 (extraction): Structured value signal extraction, JSON mode
 *
 * The LLM is a TRANSLATOR: it converts natural language into axis value signals.
 * It does NOT recommend. The existing scoring engine handles recommendations.
 */

import type { LLMTurnResult, ConversationMessage } from '@/types/conversation';
import type { ProgressiveAxisValue } from '@/types/conversation';
import { axisSliderConfigs } from '@/data/sliderPositions';
import { validateExtractionOutput, type RawExtractionOutput } from '@/server/services/signalValidation';
import { getReferenceById, buildOfficeContextBlock } from '@/server/data/ballot/civicReferences';
import type { OfficeReference } from '@/server/types';

/** Axis definition shape matching what the turn route passes in */
export interface CivicAxis {
  id: string;
  name: string;
  description: string;
  poleA: { label: string };
  poleB: { label: string };
}

const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
const DEEPINFRA_LLM_MODEL = process.env.DEEPINFRA_LLM_MODEL || 'openai/gpt-oss-120b';
const DEEPINFRA_CHAT_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';

interface BallotItemContext {
  id: string;
  type: 'proposition' | 'candidate_race';
  title: string;
  questionText: string;
  explanation: string;
  relevantAxes?: string[];
  yesAxisEffects?: Record<string, number>;
  /** ID into civicReferences store — provides grounded office description for LLM context */
  officeRef?: string;
  candidates?: Array<{
    id: string;
    name: string;
    party?: string;
    profile: {
      stances: Record<string, number>;
      summary?: string;
    };
  }>;
}

/** Call the LLM with given messages and config */
async function callLLM(
  systemPrompt: string,
  chatMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options: { temperature?: number; jsonMode?: boolean; maxTokens?: number } = {}
): Promise<string> {
  const { temperature = 0.7, jsonMode = false, maxTokens = 600 } = options;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...chatMessages,
  ];

  const body: Record<string, unknown> = {
    model: DEEPINFRA_LLM_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(DEEPINFRA_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DeepInfra LLM error:', response.status, errorText);
    throw new Error(`LLM API error: ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content ?? '';
}

/**
 * Build slider position reference for ballot item axes.
 */
function buildAxisPositionReference(axisIds: string[]): string {
  return axisIds.map((axisId) => {
    const config = axisSliderConfigs[axisId];
    if (!config) return '';

    const positions = config.positions.map((p, i) => {
      // Use exact decimal values (0, 2.5, 5, 7.5, 10) — must match snapping positions
      const value = (i / (config.positions.length - 1)) * 10;
      const label = Number.isInteger(value) ? value.toString() : value.toFixed(1);
      const marker = p.isCurrentPolicy ? ' ← current US policy' : '';
      return `    ${label}: "${p.title}" — ${p.description}${marker}`;
    }).join('\n');

    return `  AXIS: ${axisId} ("${config.poleALabel.replace(/\n/g, ' ')}" ↔ "${config.poleBLabel.replace(/\n/g, ' ')}")
  Question: ${config.question}
  Score 0 = strongest "${config.poleALabel.replace(/\n/g, ' ')}". Score 10 = strongest "${config.poleBLabel.replace(/\n/g, ' ')}". Score 0 is a VALID score, not "no opinion".
  Positions (use these EXACT scores):
${positions}`;
  }).filter(Boolean).join('\n\n');
}

/** Build ballot item context block for prompts */
function buildBallotItemContext(
  ballotItem: BallotItemContext,
  axisDefinitions: CivicAxis[]
): string {
  if (ballotItem.type === 'proposition') {
    const effects = ballotItem.yesAxisEffects || {};
    const effectsStr = Object.entries(effects)
      .map(([axisId, effect]) => {
        const axis = axisDefinitions.find((a) => a.id === axisId);
        return axis ? `  - ${axis.name}: YES pushes toward ${effect < 0 ? axis.poleA.label : axis.poleB.label} (effect: ${effect})` : null;
      })
      .filter(Boolean)
      .join('\n');

    return `BALLOT MEASURE: "${ballotItem.title}"
Question: ${ballotItem.questionText}
Explanation: ${ballotItem.explanation}
Effects of voting YES:
${effectsStr || '  (no axis effects mapped)'}`;
  }

  // Inject grounded office reference if available
  let officeBlock = '';
  if (ballotItem.officeRef) {
    const ref = getReferenceById(ballotItem.officeRef);
    if (ref && ref.type === 'role') {
      officeBlock = `\n\n${buildOfficeContextBlock(ref as OfficeReference)}\n`;
    }
  }

  const candidateInfo = (ballotItem.candidates || [])
    .map((c) => {
      const stances = Object.entries(c.profile.stances)
        .map(([axisId, value]) => {
          const axis = axisDefinitions.find((a) => a.id === axisId);
          return axis ? `    ${axis.name}: ${value}/10` : null;
        })
        .filter(Boolean)
        .join('\n');
      return `  - ${c.name}${c.party ? ` (${c.party})` : ''}${c.profile.summary ? `\n    Summary: ${c.profile.summary}` : ''}
    Positions:\n${stances || '    (no position data)'}`;
    })
    .join('\n');

  return `CANDIDATE RACE: "${ballotItem.title}"
${ballotItem.questionText}
${ballotItem.explanation}${officeBlock}
Candidates:
${candidateInfo || '  (no candidates)'}`;
}

/** Pass 1: Response generation — conversational, no JSON */
function buildResponsePrompt(
  ballotItem: BallotItemContext,
  axisDefinitions: CivicAxis[],
  mode: 'drawer' | 'standalone' = 'standalone',
  focusedCandidateId?: string,
): string {
  const itemContext = buildBallotItemContext(ballotItem, axisDefinitions);

  // In drawer mode, add focused candidate context if available
  let focusedContext = '';
  if (focusedCandidateId && ballotItem.candidates) {
    const focused = ballotItem.candidates.find((c) => c.id === focusedCandidateId);
    if (focused) {
      focusedContext = `\nThe voter is currently looking at ${focused.name}${focused.party ? ` (${focused.party})` : ''}. Prioritize answering questions about this candidate, but answer about others if asked.\n`;
    }
  }

  if (mode === 'drawer') {
    return `You are a friendly, nonpartisan civic assistant. The voter tapped "Ask AI" while viewing a ballot item — they already see the candidates and match scores. Your job is to ANSWER their questions, not to probe or interview them.

${itemContext}
${focusedContext}
ROLE:
- You are a search agent and explainer — answer what the voter asks
- Be direct and informative. Lead with the answer, then add context if helpful
- Keep responses to 2-3 sentences unless the question warrants more detail
- If they ask about a candidate's position, cite specific evidence (voting records, ratings, statements)
- If they ask "why is this my best match?", explain the axis-level alignment
- If they ask about a topic, give a balanced, sourced explanation

DO NOT:
- Ask follow-up questions unless the user's question is genuinely ambiguous
- Probe the user about their own values or beliefs
- End your response with a question (unless clarifying what they meant)
- Ask "How do you feel about that?" or "What matters to you?" — they already told you during the assessment
- Try to extract more value signals — the voter is here for information, not assessment

SKIP DETECTION:
- If user says "skip", "next", "doesn't matter" — acknowledge and move on immediately.

NEUTRALITY — CRITICAL:
- Never recommend how to vote
- Never frame with assumed answers or emotionally loaded terms
- When explaining differences, present both sides fairly
- Attribute claims to sources: "According to their voting record..." not "They believe..."

Respond with ONLY your conversational message — plain text, no JSON, no formatting.`;
  }

  return `You are a friendly, nonpartisan civic assistant helping a voter think through a ballot item. Your job is to help them articulate what matters to them.

${itemContext}

STYLE RULES:
- Keep responses conversational, brief (2-3 sentences max), and friendly
- Ask about real-life impact, not abstract policy
- Never reveal axis IDs, scores, or system internals
- NEVER recommend how to vote — just help them think through it
- If the user's response is unclear, ask a targeted follow-up
- Ask at most ONE follow-up question per response

ACKNOWLEDGMENT RULES:
- When the user gives a detailed, specific answer, acknowledge it briefly:
  "That's a really thoughtful point." / "I can see you've thought about this."
- When the user hedges or seems unsure, normalize it:
  "A lot of people feel pulled in both directions on that."
- When the user wants to skip, respect it immediately:
  "No problem — we can move on to the next item."
- Never over-praise. One brief sentence of acknowledgment, then move on.

SKIP DETECTION:
- If user says "skip", "next", "I don't care", "doesn't matter", "whatever" — acknowledge and move on.
- Do NOT try to re-engage or ask "are you sure?"

NEUTRALITY — CRITICAL:
- Never frame a question with an assumed answer: "Don't you think X?"
- Never use emotionally loaded terms asymmetrically: "generous programs" vs "handouts"
- Never present one option as default: "Most people think X. What do you think?"
- When providing examples, give one from each direction

Respond with ONLY your conversational message — plain text, no JSON, no formatting.`;
}

/** Pass 2: Extraction — Template A adapted for ballot items */
function buildExtractionPrompt(
  ballotItem: BallotItemContext,
  axisDefinitions: CivicAxis[],
  currentProfile: Record<string, ProgressiveAxisValue>
): string {
  const relevantAxes = ballotItem.relevantAxes || [];
  const axisPositionRef = buildAxisPositionReference(relevantAxes);

  const itemContext = buildBallotItemContext(ballotItem, axisDefinitions);

  const profileStatus = relevantAxes.map((id) => {
    const val = currentProfile[id];
    if (!val) return `  ${id}: no data yet`;
    return `  ${id}: value=${val.value.toFixed(1)}, confidence=${val.confidence.toFixed(2)}`;
  }).join('\n');

  return `You are a value signal extraction engine for a civic engagement app. Given a conversation between an assistant and a voter about a specific ballot item, extract structured axis signals from what the USER said (not the assistant).

═══════════════════════════════════════════
BALLOT ITEM CONTEXT
═══════════════════════════════════════════

${itemContext}

═══════════════════════════════════════════
AXES TO EXTRACT
═══════════════════════════════════════════

${axisPositionRef || '(No axis position references available)'}

═══════════════════════════════════════════
CURRENT PROFILE STATUS
═══════════════════════════════════════════

${profileStatus || '(No profile data yet)'}

═══════════════════════════════════════════
EXTRACTION RULES
═══════════════════════════════════════════

SCORING:
- Map user statements to the named positions above. Use the 0-10 scale where each named position is a reference point.
- Between-position scores are fine (e.g., 1.5 between positions).
- ALWAYS reference which named position(s) the user's view maps to in your reasoning.
- Only emit signals for axes relevant to this ballot item.

CONFIDENCE (0-1):
- 0.7-0.9: Clear, unambiguous preference
- 0.4-0.6: General sentiment with hedging or caveats
- 0.1-0.3: Vague or contradictory, but with a detectable lean
- Do NOT extract if confidence would be below 0.1.

IMPORTANCE (0-10):
- 8-10: Passionate, unprompted, strong language
- 5-7: Engaged meaningfully when asked
- 2-4: Brief, casual response
- 0-1: Indicated they don't care

SOURCE QUOTES:
- MUST be the user's actual words, not paraphrased

HANDLING DIFFICULT INPUTS:
- Hedging → reduce CONFIDENCE, not direction
- Contradictions → midpoint with LOW confidence, add warning
- Abstract values → do NOT extract a signal
- Skip/disengagement → extract zero signals

NEUTRALITY — CRITICAL:
- In reasoning, describe the user's position without evaluating it

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════

Also classify the user's intent and determine if we have enough to recommend.

Respond with valid JSON:
{
  "valueSignals": [
    {
      "axisId": "string",
      "direction": "number 0-10",
      "confidence": "number 0-1",
      "importance": "number 0-10",
      "source": "direct quote from user",
      "reasoning": "explain: quote → which named position(s) → score. REQUIRED.",
      "warnings": ["optional array of ambiguity/tension notes"],
      "conflictsWith": "quote from prior evidence if contradicting, else null"
    }
  ],
  "recommendation": {
    "ready": "boolean — true if user has expressed enough to recommend",
    "needsFollowUp": "boolean — true if a follow-up would help",
    "followUpQuestion": "optional follow-up question"
  },
  "userIntent": "one of: opinion, question, skip, unclear",
  "meta": {
    "axesCovered": ["axis IDs with signals"],
    "axesMissing": ["relevant axes with no signal"],
    "hasContradictions": false,
    "overallClarity": "0-1"
  }
}

CRITICAL:
- Only extract signals where you have REAL EVIDENCE from the user's words
- Do NOT fill gaps with neutral 5s
- You may extract 0 signals if no scorable content`;
}

export async function interpretBallotResponse(
  ballotItem: BallotItemContext,
  messages: ConversationMessage[],
  currentProfile: Record<string, ProgressiveAxisValue>,
  axisDefinitions: CivicAxis[],
  options?: { mode?: 'drawer' | 'standalone'; focusedCandidateId?: string },
): Promise<LLMTurnResult> {
  if (!DEEPINFRA_API_KEY) {
    throw new Error('DEEPINFRA_API_KEY is not configured');
  }

  const chatMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const responsePrompt = buildResponsePrompt(ballotItem, axisDefinitions, options?.mode, options?.focusedCandidateId);
  const extractionPrompt = buildExtractionPrompt(ballotItem, axisDefinitions, currentProfile);

  // Two-pass architecture: run response and extraction in parallel
  const [responseText, extractionJson] = await Promise.all([
    // Pass 1: Response generation (warm, conversational)
    callLLM(responsePrompt, chatMessages, { temperature: 0.85, jsonMode: false, maxTokens: 400 }),
    // Pass 2: Signal extraction (precise, structured — Template A)
    callLLM(extractionPrompt, chatMessages, { temperature: 0.3, jsonMode: true, maxTokens: 600 }),
  ]);

  // Parse extraction result
  let extraction: RawExtractionOutput & {
    recommendation?: { ready?: boolean; needsFollowUp?: boolean; followUpQuestion?: string };
    userIntent?: string;
    valueSignals?: unknown[];
  };
  try {
    extraction = JSON.parse(extractionJson);
  } catch {
    console.error('Failed to parse LLM extraction JSON:', extractionJson);
    return {
      valueSignals: [],
      recommendation: { ready: false, needsFollowUp: false },
      responseText: responseText.trim() || "I heard you. Let me process that — could you tell me a bit more about what matters to you on this issue?",
      userIntent: 'unclear',
    };
  }

  // The extraction may use "signals" (Template A format) or "valueSignals" (legacy format)
  const rawSignals = extraction.signals || extraction.valueSignals || [];
  extraction.signals = rawSignals as RawExtractionOutput['signals'];

  // Validate using shared validation
  const validAxes = new Set(ballotItem.relevantAxes || []);
  const userMessage = messages.filter((m) => m.role === 'user').pop()?.content || '';
  const { sanitizedSignals, issues } = validateExtractionOutput(extraction, userMessage, validAxes);

  if (issues.length > 0) {
    console.warn('[ballot-turn] Extraction validation issues:', issues);
  }

  // Parse recommendation
  const recommendation = {
    ready: Boolean(extraction.recommendation?.ready),
    needsFollowUp: Boolean(extraction.recommendation?.needsFollowUp),
    followUpQuestion: extraction.recommendation?.followUpQuestion
      ? String(extraction.recommendation.followUpQuestion)
      : undefined,
  };

  // Parse user intent
  const validIntents = ['opinion', 'question', 'skip', 'unclear'] as const;
  const userIntent = validIntents.includes(extraction.userIntent as typeof validIntents[number])
    ? extraction.userIntent as typeof validIntents[number]
    : 'unclear';

  return {
    valueSignals: sanitizedSignals,
    recommendation,
    responseText: responseText.trim() || 'I understand. Let me think about that.',
    userIntent,
  };
}
