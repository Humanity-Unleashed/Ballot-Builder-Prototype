import { NextRequest, NextResponse } from 'next/server';
import type { ConversationMessage, ProgressiveAxisValue, ValueSignal, TurnMeta } from '@/types/conversation';
import { DOMAIN_ORDER, DOMAIN_LABELS, DOMAIN_AXES } from '@/types/conversation';
import type { DomainId } from '@/types/conversation';
import { axisSliderConfigs } from '@/data/sliderPositions';
import { validateExtractionOutput, type RawExtractionOutput } from '@/server/services/signalValidation';

const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
const DEEPINFRA_LLM_MODEL = process.env.DEEPINFRA_LLM_MODEL || 'openai/gpt-oss-120b';
const DEEPINFRA_CHAT_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';

/** Compact ballot item description sent from the client */
interface BallotItemContext {
  id: string;
  type: 'proposition' | 'candidate_race';
  title: string;
  /** Short explanation or question text */
  summary: string;
  /** Axis IDs this item touches */
  relevantAxes: string[];
  /** For candidate races: candidate names */
  candidates?: string[];
}

interface WarmupRequest {
  userMessage: string;
  conversationHistory: ConversationMessage[];
  currentProfile: Record<string, ProgressiveAxisValue>;
  turnCount: number;
  currentDomainIndex: number;
  domainTurnCount: number;
  relevantAxes?: string[];
  /** Ballot items relevant to the current domain — used to ground conversation */
  ballotContext?: BallotItemContext[];
}

interface WarmupResponse {
  assistantMessage: ConversationMessage;
  valueSignals: ValueSignal[];
  updatedProfile: Record<string, ProgressiveAxisValue>;
  domainComplete: boolean;
  readyForBallot: boolean;
  meta?: TurnMeta;
  domainSummary?: {
    summary: string;
    axisSummaries: Array<{ axisId: string; oneLiner: string }>;
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mergeSignals(
  profile: Record<string, ProgressiveAxisValue>,
  signals: ValueSignal[]
): Record<string, ProgressiveAxisValue> {
  const updated = { ...profile };
  for (const signal of signals) {
    const existing = updated[signal.axisId];
    const importance = signal.importance ?? 5;
    if (existing) {
      const totalWeight = existing.confidence * existing.signalCount + signal.confidence;
      const newValue = totalWeight > 0
        ? (existing.value * existing.confidence * existing.signalCount + signal.direction * signal.confidence) / totalWeight
        : signal.direction;
      const newImportance = (existing.importance * existing.signalCount + importance) / (existing.signalCount + 1);
      updated[signal.axisId] = {
        value: Math.max(0, Math.min(10, Math.round(newValue * 10) / 10)),
        confidence: Math.min(1, (existing.confidence + signal.confidence) / 2),
        importance: Math.max(0, Math.min(10, Math.round(newImportance * 10) / 10)),
        signalCount: existing.signalCount + 1,
      };
    } else {
      updated[signal.axisId] = {
        value: signal.direction,
        confidence: signal.confidence,
        importance,
        signalCount: 1,
      };
    }
  }
  return updated;
}

/** Call the LLM with given messages and config */
async function callLLM(
  systemPrompt: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: { temperature?: number; jsonMode?: boolean; maxTokens?: number } = {}
): Promise<string> {
  const { temperature = 0.7, jsonMode = false, maxTokens = 600 } = options;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...chatHistory,
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
    console.error('LLM error:', response.status, errorText);
    throw new Error(`LLM API error: ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content ?? '';
}

/**
 * Build slider position reference for the extraction LLM.
 * Shows the 5 policy positions per axis so it can map user responses to precise values.
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

/** Get the axis IDs for this domain, filtered to only ballot-relevant ones */
function getRelevantDomainAxes(domainId: DomainId, relevantAxes?: string[]): string[] {
  const domainAxes = DOMAIN_AXES[domainId] || [];
  if (!relevantAxes || relevantAxes.length === 0) return domainAxes;
  const relevant = new Set(relevantAxes);
  return domainAxes.filter((id) => relevant.has(id));
}

// ============================================================
// System prompts for the two-pass architecture
// ============================================================

/** Pass 1: Response generation — warm, scenario-based, NO policy jargon */
function buildResponseSystemPrompt(
  domainId: DomainId,
  domainIndex: number,
  domainTurnCount: number,
  relevantDomainCount: number,
  currentProfile: Record<string, ProgressiveAxisValue>,
  axisIds: string[],
  ballotContext?: BallotItemContext[]
): string {
  const domainLabel = DOMAIN_LABELS[domainId];

  // Which axes already have signals?
  const coveredAxes = axisIds.filter((id) => currentProfile[id]?.confidence > 0.2);
  const uncoveredCount = axisIds.length - coveredAxes.length;

  const ballotBlock = buildBallotContextBlock(ballotContext);

  return `You are a friendly, curious conversation partner helping someone figure out what matters to them before they vote. You're exploring the topic area of "${domainLabel}" (topic ${domainIndex + 1} of ${relevantDomainCount}).
${ballotBlock}

STYLE RULES:
- Sound like a thoughtful friend at a coffee shop, NOT a survey or quiz
- Ask about real-life scenarios and experiences, not abstract policy positions
- Use everyday language — no policy jargon, no "government should" framing
- Keep responses to 2-3 sentences max
- React warmly to what they said, then ask something new
- NEVER mention axes, scores, domains, assessments, or any internal system
- You can naturally reference ballot items to make the conversation feel relevant, but don't quiz them on how they'll vote

ACKNOWLEDGMENT RULES:
- When the user gives a detailed, specific answer, acknowledge it briefly:
  "That's a really thoughtful point." / "I can see you've thought about this."
- When the user hedges or seems unsure, normalize it:
  "A lot of people feel pulled in both directions on that."
- When the user wants to skip, respect it immediately:
  "No problem — not every issue has to be a priority for you."
- Never over-praise. One brief sentence of acknowledgment, then move on.

SKIP DETECTION:
- If user says "skip", "next", "I don't care", "doesn't matter", "whatever",
  "I don't know enough about this" — acknowledge and move to the next topic.
- Do NOT try to re-engage or ask "are you sure?"

NEUTRALITY — CRITICAL:
- Never frame a question with an assumed answer: "Don't you think X?"
- Never use emotionally loaded terms asymmetrically: "generous programs" vs "handouts"
- Never present one option as default: "Most people think X. What do you think?"
- When providing examples, give one from each direction

GOOD question examples:
- "If your neighbor lost their job tomorrow, what kind of help do you think should be there for them?"
- "When you think about your kids' school, what would you change first?"
- "How do you feel when you hear about a new housing development going up near you?"
- "Your ballot actually has a measure about clean energy standards — before we get to that, what's your gut feeling about where our energy should come from?"

BAD question examples (NEVER do these):
- "Should benefits be broader or more conditional?" ← too abstract, sounds like a survey
- "Do you prefer government intervention or market solutions?" ← policy jargon
- "On a scale of..." ← literally a survey
- "How will you vote on Proposition 3?" ← too direct, we're exploring values not votes

${domainTurnCount === 0 ? `This is the OPENING question for "${domainLabel}". Start with something warm and relatable. You have ${axisIds.length} topics to touch on in this area.` : ''}
${domainTurnCount === 1 ? `Good conversation so far. You still have ${uncoveredCount} topic(s) to explore. Naturally transition to a new angle.` : ''}
${domainTurnCount >= 2 ? `This is turn ${domainTurnCount + 1}. Wrap up this topic area with a warm transition. Keep it brief.` : ''}

Respond with ONLY your conversational message — plain text, no JSON, no formatting.`;
}

/** Pass 2: Signal extraction — Template A from PROMPT_HARNESS.md */
function buildExtractionSystemPrompt(
  axisIds: string[],
  currentProfile: Record<string, ProgressiveAxisValue>,
  domainTurnCount: number
): string {
  const axisPositionRef = buildAxisPositionReference(axisIds);

  const profileStatus = axisIds.map((id) => {
    const val = currentProfile[id];
    if (!val) return `  ${id}: not yet discussed`;
    return `  ${id}: value=${val.value.toFixed(1)}, confidence=${val.confidence.toFixed(2)}, importance=${val.importance.toFixed(1)} (${val.signalCount} signals so far)`;
  }).join('\n');

  return `You are a value signal extraction engine for a civic engagement app. Given a conversation between an assistant and a voter, extract structured axis signals from what the USER said (not the assistant).

═══════════════════════════════════════════
AXES TO EXTRACT
═══════════════════════════════════════════

${axisPositionRef}

═══════════════════════════════════════════
CURRENT PROFILE STATUS
═══════════════════════════════════════════

${profileStatus}

═══════════════════════════════════════════
EXTRACTION RULES
═══════════════════════════════════════════

SCORING:
- Map user statements to the named positions above. Use the 0-10 scale where each named position is a reference point.
- Between-position scores are fine (e.g., 1.5 between "Universal" and "Broad eligibility").
- ALWAYS reference which named position(s) the user's view maps to in your reasoning.

CONFIDENCE (0-1):
- 0.7-0.9: User stated a clear, unambiguous preference ("I absolutely think everyone should have healthcare")
- 0.4-0.6: User expressed a general sentiment but with hedging or caveats ("I guess maybe we should do more")
- 0.1-0.3: User touched on the topic but was vague or contradictory. Still extract the lean direction.
- Do NOT extract a signal if confidence would be below 0.1. Skip that axis.

IMPORTANCE (0-10):
- 8-10: User volunteered this topic unprompted, spoke passionately, used strong language, or repeated the point
- 5-7: User engaged meaningfully when asked about it
- 2-4: User gave a brief, casual response
- 0-1: User indicated they don't care ("whatever", "doesn't matter")

SOURCE QUOTES:
- MUST be the user's actual words, not paraphrased
- Include enough context to justify the signal (typically 5-20 words)
- If the user said it across multiple sentences, use the most decisive phrase

═══════════════════════════════════════════
HANDLING DIFFICULT INPUTS
═══════════════════════════════════════════

HEDGING ("I guess maybe...", "probably...", "sort of..."):
- Reduce CONFIDENCE, not direction. The hedge tells you they're unsure, not that they're neutral.
- Example: "I guess maybe the government should do more" → direction 3 (leans pole A), confidence 0.3

DOUBLE NEGATIVES ("I don't think we shouldn't have..."):
- Parse the logical meaning. "I don't think we shouldn't have a safety net" = they support a safety net.
- Set confidence 0.4-0.6 (the complex phrasing suggests uncertainty).

CONTRADICTIONS within the same message:
- Extract BOTH leans as a single signal at the midpoint with LOW confidence.
- Add a warning explaining the tension.
- Example: "I want lower taxes but also better schools"
  → econ_investment: direction 6 (slight lean toward lower taxes/spending), confidence 0.3
  → warning: "User wants both lower taxes and better public services — inherent tension"

CONTRADICTIONS with prior signals:
- Still extract the new signal. Set conflictsWith to quote the prior evidence.
- The merging algorithm will handle the weighted average.

ABSTRACT VALUES without policy specifics:
- "I believe in fairness" / "freedom is important" — too vague for any single axis.
- Do NOT extract a signal. Note in meta that the response was not policy-specific.

SKIP / DISENGAGEMENT:
- "I don't care" / "skip" / "whatever" → Extract zero signals.
- Set domainComplete: true if the user wants to move on.

NEUTRALITY — CRITICAL:
- In reasoning, describe the user's position without evaluating it:
  GOOD: "User supports broader safety net programs"
  BAD: "User has a compassionate view of social policy"
  BAD: "User naively supports unlimited government spending"

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════

Respond with valid JSON:
{
  "signals": [
    {
      "axisId": "string (one of the axis IDs above)",
      "direction": "number 0-10",
      "confidence": "number 0-1",
      "importance": "number 0-10",
      "source": "direct quote from user",
      "reasoning": "explain: quote → which named position(s) → score. REQUIRED.",
      "warnings": ["optional array of ambiguity/tension notes"],
      "conflictsWith": "quote from prior evidence if contradicting, else null"
    }
  ],
  "meta": {
    "axesCovered": ["axis IDs that have signals"],
    "axesMissing": ["axis IDs in this domain with no signal yet"],
    "hasContradictions": false,
    "overallClarity": "0-1, how interpretable was the user's message"
  },
  "domainComplete": ${domainTurnCount >= 2 ? 'true' : '"boolean — true if most axes covered OR user skipped"'}
}

CRITICAL:
- Only extract signals where you have REAL EVIDENCE from the user's words
- Do NOT fill gaps with neutral 5s — absence of signal is correct when the user hasn't spoken on a topic
- You may extract 0 signals if the user's message contained no scorable content
- You may extract signals for multiple axes from a single message`;
}

/** Template B: Classify Stance — for low-confidence signal refinement */
function buildClassifyStancePrompt(
  signals: ValueSignal[],
  axisIds: string[]
): string {
  const axisBlocks = signals.map((signal) => {
    const config = axisSliderConfigs[signal.axisId];
    if (!config) return '';

    const positions = config.positions.map((p, i) => {
      const value = (i / (config.positions.length - 1)) * 10;
      const marker = p.isCurrentPolicy ? ' ← current US policy' : '';
      return `  ${value.toFixed(1)} — ${p.title} (${p.description})${marker}`;
    }).join('\n');

    return `AXIS: ${signal.axisId}
Name: ${config.question}

Pole A (score 0): "${config.poleALabel.replace(/\n/g, ' ')}"
Pole B (score 10): "${config.poleBLabel.replace(/\n/g, ' ')}"

Reference positions:
${positions}

VOTER QUOTE: "${signal.source}"`;
  }).filter(Boolean).join('\n\n---\n\n');

  return `You are a political stance classifier. Read the voter's quote(s) and classify their position on each given policy axis. Output ONLY valid JSON.

${axisBlocks}

═══════════════════════════════════════════
CLASSIFY EACH AXIS
═══════════════════════════════════════════

For each axis, choose ONE classification:

STRONG_POLE_A (score 0-2):
  User clearly and unambiguously supports the Pole A position.

MODERATE_POLE_A (score 2-4):
  User leans toward Pole A but expresses caveats or limits.

NEUTRAL (score 4-6):
  User is genuinely undecided, balanced between both sides, or unclear.

MODERATE_POLE_B (score 6-8):
  User leans toward Pole B but acknowledges some need for the other side.

STRONG_POLE_B (score 8-10):
  User clearly and unambiguously supports the Pole B position.

═══════════════════════════════════════════
OUTPUT
═══════════════════════════════════════════

Respond with a JSON array:
[
  {
    "axisId": "string",
    "classification": "one of: STRONG_POLE_A, MODERATE_POLE_A, NEUTRAL, MODERATE_POLE_B, STRONG_POLE_B",
    "score": "number within the classification's range",
    "confidence": "0.0-1.0 — how clearly does the quote support this classification",
    "keyPhrase": "the most decisive phrase from the quote",
    "reasoning": "1-2 sentences explaining why this classification"
  }
]

RULES:
- If the quote contains contradictory signals, classify as NEUTRAL with confidence below 0.3
- Consider ALL parts of the quote, not just the first sentence`;
}

/** Template C: Summarize for Restatement — domain transition summary */
function buildSummaryPrompt(
  domainId: DomainId,
  profile: Record<string, ProgressiveAxisValue>,
  axisIds: string[]
): string {
  const domainLabel = DOMAIN_LABELS[domainId];

  const axisDetails = axisIds.map((id) => {
    const config = axisSliderConfigs[id];
    if (!config) return '';

    const val = profile[id];
    if (!val) return `  ${config.question} (${id}):\n    Not discussed`;

    // Find closest position
    const posIndex = Math.round((val.value / 10) * (config.positions.length - 1));
    const closestPosition = config.positions[Math.min(posIndex, config.positions.length - 1)];
    const leanLabel = val.value < 5
      ? `leans toward "${config.poleALabel.replace(/\n/g, ' ')}"`
      : val.value > 5
        ? `leans toward "${config.poleBLabel.replace(/\n/g, ' ')}"`
        : 'neutral';

    return `  ${config.question} (${id}):
    Score: ${val.value.toFixed(1)}/10 (${leanLabel})
    Confidence: ${val.confidence.toFixed(2)}
    Closest position: "${closestPosition.title}"`;
  }).join('\n\n');

  return `You are summarizing a voter's positions for their review. Based on the profile data below, write a 2-3 sentence summary in plain English. Write in second person ("You...").

═══════════════════════════════════════════
DOMAIN: ${domainLabel}
═══════════════════════════════════════════

AXIS VALUES:
${axisDetails}

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════

{
  "summary": "2-3 sentence plain English summary of their positions in this domain. Use 'you' language. Mention what you're confident about and what wasn't discussed.",
  "axisSummaries": [
    {
      "axisId": "string",
      "oneLiner": "You support/lean toward..."
    }
  ]
}

RULES:
- Be warm and specific, not clinical
- Use their own words/framing where possible
- If confidence is low, hedge: "It seems like you lean toward..."
- If an axis wasn't discussed, say so: "We didn't get to talk about [topic]."
- Never evaluate or judge their positions`;
}

/** Build a human-readable description of ballot items for a domain */
function buildBallotContextBlock(ballotContext?: BallotItemContext[]): string {
  if (!ballotContext || ballotContext.length === 0) return '';

  const lines = ballotContext.map((item) => {
    if (item.type === 'proposition') {
      return `  - Ballot measure: "${item.title}" — ${item.summary}`;
    }
    const candidateList = item.candidates?.join(', ') || 'candidates TBD';
    return `  - Race: ${item.title} (${candidateList}) — ${item.summary}`;
  });

  return `
BALLOT CONTEXT — These items are on the voter's actual ballot in this topic area:
${lines.join('\n')}

Use this to make your questions feel relevant. You can reference these items naturally
(e.g., "Your ballot has a measure about clean energy..." or "There's a race for state
senate on your ballot — what issues would matter most to you in that kind of race?").
Do NOT quiz them about specific candidates or ask how they'll vote. Instead, use the
ballot items as conversation starters to understand their underlying values.`;
}

/** Opener prompt — generates the first question for a domain */
function buildOpenerSystemPrompt(
  domainId: DomainId,
  domainIndex: number,
  relevantDomainCount: number,
  axisIds: string[],
  ballotContext?: BallotItemContext[]
): string {
  const domainLabel = DOMAIN_LABELS[domainId];

  // Give the LLM a sense of the topics without leaking axis IDs
  const topicHints: Record<DomainId, string> = {
    econ: 'jobs, safety nets, education, taxes',
    health: 'health insurance, medical costs, public health rules',
    housing: 'neighborhoods, housing costs, getting around town',
    justice: 'policing, courts, gun policy',
    climate: 'energy, environment, building permits',
  };

  const isFirst = domainIndex === 0;
  const ballotBlock = buildBallotContextBlock(ballotContext);

  return `You are a friendly, curious conversation partner helping someone figure out what matters to them before they vote.

${isFirst
    ? `Start the conversation with a warm greeting. You're going to chat about ${relevantDomainCount} topic areas to understand their values. Begin with "${domainLabel}" (covering themes like: ${topicHints[domainId]}).`
    : `You're transitioning to a new topic: "${domainLabel}" (covering themes like: ${topicHints[domainId]}). Briefly acknowledge the shift and ask your opening question.`
}
${ballotBlock}

RULES:
- Sound like a thoughtful friend, NOT a survey
- Ask about a real-life scenario or experience — something specific and relatable
- Use everyday language — no policy jargon
- Keep it to 2-3 sentences
- NEVER mention axes, scores, domains, or the system
- Don't give options or either-or framings — ask open-ended questions
- When referencing ballot items, keep it casual and brief — don't read out the full measure title
- Focus on understanding their VALUES, not getting their vote on specific items

Respond with ONLY your message — plain text, no JSON.`;
}

// ============================================================
// Route handler
// ============================================================

export async function POST(req: NextRequest) {
  if (!DEEPINFRA_API_KEY) {
    return NextResponse.json({ error: 'DEEPINFRA_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const body = (await req.json()) as WarmupRequest;
    const domainIndex = body.currentDomainIndex ?? 0;
    const domainTurnCount = body.domainTurnCount ?? 0;
    const isOpener = !body.userMessage;

    const domainId = DOMAIN_ORDER[domainIndex];
    const axisIds = getRelevantDomainAxes(domainId, body.relevantAxes);

    // Determine how many relevant domains there are
    const relevantAxesSet = new Set(body.relevantAxes ?? []);
    const relevantDomainCount = body.relevantAxes?.length
      ? DOMAIN_ORDER.filter((d) => DOMAIN_AXES[d].some((a) => relevantAxesSet.has(a))).length
      : DOMAIN_ORDER.length;

    // Build chat history for LLM calls
    const chatHistory = (body.conversationHistory || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Filter ballot context to items relevant to the current domain
    const domainBallotContext = (body.ballotContext ?? []).filter((item) =>
      item.relevantAxes.some((a) => axisIds.includes(a))
    );

    // ---- OPENER MODE: no user message, just generate an opening question ----
    if (isOpener) {
      const openerPrompt = buildOpenerSystemPrompt(domainId, domainIndex, relevantDomainCount, axisIds, domainBallotContext);
      const openerText = await callLLM(openerPrompt, chatHistory, { temperature: 0.85 });

      const assistantMessage: ConversationMessage = {
        id: generateId(),
        role: 'assistant',
        content: openerText.trim() || "I'd love to hear what's on your mind — what issues matter most to you?",
        timestamp: new Date().toISOString(),
      };

      const resp: WarmupResponse = {
        assistantMessage,
        valueSignals: [],
        updatedProfile: body.currentProfile || {},
        domainComplete: false,
        readyForBallot: false,
      };

      return NextResponse.json(resp);
    }

    // ---- CONVERSATION MODE: two-pass architecture ----
    // Both passes run in parallel for latency efficiency

    const responsePrompt = buildResponseSystemPrompt(
      domainId, domainIndex, domainTurnCount, relevantDomainCount,
      body.currentProfile || {}, axisIds, domainBallotContext
    );

    const extractionPrompt = buildExtractionSystemPrompt(
      axisIds, body.currentProfile || {}, domainTurnCount
    );

    // Add the current user message to history for both passes
    const fullHistory = [
      ...chatHistory,
      { role: 'user' as const, content: body.userMessage },
    ];

    const [responseText, extractionJson] = await Promise.all([
      // Pass 1: Response generation (warm, conversational)
      callLLM(responsePrompt, fullHistory, { temperature: 0.85, jsonMode: false, maxTokens: 400 }),
      // Pass 2: Signal extraction (precise, structured — Template A)
      callLLM(extractionPrompt, fullHistory, { temperature: 0.3, jsonMode: true, maxTokens: 600 }),
    ]);

    // Parse extraction result
    let extraction: RawExtractionOutput;
    try {
      extraction = JSON.parse(extractionJson);
    } catch {
      extraction = { signals: [], domainComplete: false };
    }

    // Validate and sanitize signals using shared validation
    const validAxes = new Set(axisIds);
    const { sanitizedSignals: signals, issues } = validateExtractionOutput(
      extraction, body.userMessage, validAxes
    );

    if (issues.length > 0) {
      console.warn('[warmup] Extraction validation issues:', issues);
    }

    // ---- Template B: Classify Stance refinement for low-confidence signals ----
    const lowConfidenceSignals = signals.filter((s) => s.confidence < 0.4 && s.source.length > 0);
    if (lowConfidenceSignals.length > 0) {
      try {
        const classifyPrompt = buildClassifyStancePrompt(lowConfidenceSignals, axisIds);
        const classifyJson = await callLLM(classifyPrompt, [], {
          temperature: 0.2, jsonMode: true, maxTokens: 300,
        });

        const classifications: Array<{
          axisId: string;
          classification: string;
          score: number;
          confidence: number;
        }> = JSON.parse(classifyJson);

        const classArray = Array.isArray(classifications) ? classifications : [];
        for (const cls of classArray) {
          const original = signals.find((s) => s.axisId === cls.axisId);
          if (original && typeof cls.confidence === 'number' && cls.confidence > original.confidence) {
            original.direction = Math.max(0, Math.min(10, Number(cls.score) || original.direction));
            original.confidence = Math.max(0, Math.min(1, cls.confidence));
            original.reasoning = (original.reasoning || '') + ` [Refined by classification: ${cls.classification}]`;
          }
        }
      } catch (e) {
        console.warn('[warmup] Template B refinement failed, using original signals:', e);
      }
    }

    const updatedProfile = mergeSignals(body.currentProfile || {}, signals);

    // Build TurnMeta from extraction or reconstruct
    const coveredAxes = extraction.meta?.axesCovered
      ?? signals.map((s) => s.axisId);
    const missingAxes = extraction.meta?.axesMissing
      ?? axisIds.filter((id) => !updatedProfile[id] || updatedProfile[id].confidence <= 0.2);
    const meta: TurnMeta = {
      axesCovered: [...new Set(coveredAxes)],
      axesMissing: missingAxes,
      hasContradictions: extraction.meta?.hasContradictions
        ?? signals.some((s) => s.warnings && s.warnings.length > 0),
      overallClarity: extraction.meta?.overallClarity ?? (signals.length > 0 ? 0.5 : 0.2),
    };

    // Domain is complete if extraction says so OR we've had 3+ turns
    const domainComplete = extraction.domainComplete || domainTurnCount >= 2;

    // ---- Template C: Domain Summary at domain transitions ----
    let domainSummary: WarmupResponse['domainSummary'];
    if (domainComplete) {
      try {
        const summaryPrompt = buildSummaryPrompt(domainId, updatedProfile, axisIds);
        const summaryJson = await callLLM(summaryPrompt, [], {
          temperature: 0.7, jsonMode: true, maxTokens: 400,
        });
        const parsed = JSON.parse(summaryJson);
        if (parsed.summary && Array.isArray(parsed.axisSummaries)) {
          domainSummary = {
            summary: String(parsed.summary),
            axisSummaries: parsed.axisSummaries.map((a: { axisId: string; oneLiner: string }) => ({
              axisId: String(a.axisId || ''),
              oneLiner: String(a.oneLiner || ''),
            })),
          };
        }
      } catch (e) {
        console.warn('[warmup] Template C summary failed:', e);
      }
    }

    // Check if this is the last relevant domain
    const relevantDomains = body.relevantAxes?.length
      ? DOMAIN_ORDER.filter((d) => DOMAIN_AXES[d].some((a) => relevantAxesSet.has(a)))
      : [...DOMAIN_ORDER];
    const currentRelevantIdx = relevantDomains.indexOf(domainId);
    const isLastRelevantDomain = currentRelevantIdx >= relevantDomains.length - 1;
    const readyForBallot = domainComplete && isLastRelevantDomain;

    const assistantMessage: ConversationMessage = {
      id: generateId(),
      role: 'assistant',
      content: responseText.trim() || "Got it. Let's keep going.",
      timestamp: new Date().toISOString(),
    };

    const resp: WarmupResponse = {
      assistantMessage,
      valueSignals: signals,
      updatedProfile,
      domainComplete,
      readyForBallot,
      meta,
      domainSummary,
    };

    return NextResponse.json(resp);
  } catch (error) {
    console.error('Warmup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process warmup' },
      { status: 500 }
    );
  }
}
