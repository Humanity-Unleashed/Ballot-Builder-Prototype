# Prompt Harness & IO Schema for OSS Ballot Recommendation Model

> **Purpose:** Design document for the prompt harness that guides the open-source LLM (currently DeepInfra) to map open-ended user responses into structured axis scores. Includes input templates, output schemas, guardrails, and validation rules.
>
> **Status:** Design spec — not yet implemented. Produced by Claude as a reference for the team.
>
> **Existing system:** The warmup route (`/api/conversation/warmup/route.ts`) already uses a two-pass architecture: Pass 1 generates conversational responses, Pass 2 extracts structured value signals. Both use the same OSS model. This document upgrades Pass 2 and adds new template patterns.

---

## 1. High-Level Design Overview

The system uses a **two-pass architecture** where one LLM call generates a warm, natural response and a separate call extracts structured axis scores from the user's words. This document focuses on **Pass 2 (extraction)** — the structured prompt that tells the OSS model how to interpret messy human language and produce reliable `ValueSignal[]` output.

The core challenge: users say things like *"I think government should be a little bit more generous with safety nets, and no strings attached, of course — but people should try to help themselves first"* and the model needs to:
1. Identify which axis/axes this maps to (`econ_safetynet`)
2. Score the direction (this user leans toward pole A but with caveats → ~3.0 on the 0–10 scale)
3. Assess confidence (clear but internally contradictory → 0.5)
4. Infer importance (unprompted elaboration → 6–7)
5. Flag the tension between "no strings attached" and "help themselves first"

The harness achieves this through **detailed axis position references** (the 5 named positions per axis from `sliderPositions.ts`), **explicit scoring rubrics**, and **guardrail instructions** that handle ambiguity, contradictions, and messy language.

---

## 2. Front-End Harness Spec (Response Generation — Pass 1)

Pass 1 is responsible for the **conversational response** shown to the user. It does NOT produce JSON. The existing prompts in `buildResponseSystemPrompt()` and `buildOpenerSystemPrompt()` are already solid. Key principles to preserve:

### System Prompt Rules (already implemented, keep as-is)
- Sound like a thoughtful friend at a coffee shop, NOT a survey
- Ask about real-life scenarios and experiences, not abstract policy
- Keep responses to 2–3 sentences
- Never mention axes, scores, domains, or system internals
- Never use leading questions or either/or framings

### Additions for Response Generation

Add these rules to `buildResponseSystemPrompt()`:

```
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
```

---

## 3. Structured Output Schema (Signal Extraction — Pass 2)

### Current Schema (what the extraction prompt produces today)

```json
{
  "signals": [
    {
      "axisId": "econ_safetynet",
      "direction": 3.0,
      "confidence": 0.6,
      "importance": 7,
      "reasoning": "User said '...' → maps to position 1-2",
      "source": "brief quote"
    }
  ],
  "domainComplete": false
}
```

### Enriched Schema (proposed upgrade)

```json
{
  "signals": [
    {
      "axisId": "econ_safetynet",
      "direction": 3.0,
      "confidence": 0.6,
      "importance": 7,
      "source": "government should be more generous with safety nets, no strings attached",
      "reasoning": "User explicitly supports broader, unconditional safety net → maps to position 1 ('Broad eligibility with some conditions') to position 0 ('Universal support programs'). However, also said 'people should try to help themselves first' which pushes toward position 2-3. Weighted toward pole A due to stronger emphasis on generosity.",
      "warnings": [
        "Internal tension: 'no strings attached' conflicts with 'help themselves first'. Score reflects the net lean but confidence is reduced."
      ],
      "conflictsWith": null
    }
  ],
  "meta": {
    "axesCovered": ["econ_safetynet"],
    "axesMissing": ["econ_investment", "econ_school_choice", "econ_tax_structure"],
    "hasContradictions": false,
    "overallClarity": 0.6
  },
  "domainComplete": false
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `signals[].axisId` | string | Yes | One of the 15 civic axis IDs |
| `signals[].direction` | number (0–10) | Yes | Position on axis. 0 = pole A, 10 = pole B, 5 = neutral |
| `signals[].confidence` | number (0–1) | Yes | How clearly the user expressed this. Hedging → low. |
| `signals[].importance` | number (0–10) | Yes | How much the user cares. Passion/repetition → high. |
| `signals[].source` | string | Yes | Direct quote from user's message supporting this signal |
| `signals[].reasoning` | string | Yes | Maps quote → axis position with explicit reference to the 5 named positions |
| `signals[].warnings` | string[] | No | Ambiguities, partial coverage, internal tensions |
| `signals[].conflictsWith` | string \| null | No | If this contradicts a prior signal, quote the prior evidence |
| `meta.axesCovered` | string[] | Yes | Axes with at least one signal this turn |
| `meta.axesMissing` | string[] | Yes | Domain axes with NO signal yet |
| `meta.hasContradictions` | boolean | Yes | True if any signal has warnings about contradictions |
| `meta.overallClarity` | number (0–1) | Yes | How interpretable the user's message was overall |
| `domainComplete` | boolean | Yes | Whether we have enough signals for this domain |

### Mapping to Existing Types

The enriched schema is a superset of the existing `ValueSignal` interface. The calling code extracts signals like this:

```typescript
// Existing ValueSignal extraction (unchanged)
const signals: ValueSignal[] = extraction.signals.map(s => ({
  axisId: s.axisId,
  direction: s.direction,
  confidence: s.confidence,
  importance: s.importance,
  source: s.source,
  reasoning: s.reasoning,
}));

// NEW: additional metadata for validation/debugging
const meta = extraction.meta; // log or store for analysis
```

---

## 4. OSS Model Input Templates

### Template A: "Extract & Score" (Primary — used every turn)

This is the upgraded version of the existing `buildExtractionSystemPrompt()`. It adds guardrails, contradiction detection, and the enriched output schema.

#### Full Prompt

```
You are a value signal extraction engine for a civic engagement app. Given a conversation between an assistant and a voter, extract structured axis signals from what the USER said (not the assistant).

═══════════════════════════════════════════
AXES TO EXTRACT
═══════════════════════════════════════════

{{FOR EACH AXIS IN CURRENT DOMAIN — filled from sliderPositions.ts}}

  AXIS: econ_safetynet ("Broader Safety Net" ↔ "More Conditional Safety Net")
  Question: Should government help be available to more people with fewer requirements?
  Positions:
    0: "Universal support programs" — Robust benefits available to all with minimal conditions
    2.5: "Broad eligibility with some conditions" — Wide access to assistance with basic requirements
    5: "Targeted programs with work incentives" — Benefits for those in need with participation requirements ← current US policy
    7.5: "Strict eligibility and conditions" — Aid limited to verified need with strong work requirements
    10: "Minimal safety net" — Limited government assistance, emphasize self-reliance

  AXIS: econ_investment ("More Public Investment" ↔ "Lower Taxes Less Spending")
  Question: Should we pay more in taxes to fund public services?
  Positions:
    0: "Major expansion of public services" — Significantly increase spending on schools, infrastructure
    2.5: "Targeted public investments" — Increase funding for high-priority community needs
    5: "Maintain current balance" — Keep existing service and tax levels ← current US policy
    7.5: "Reduce spending, lower taxes" — Cut programs to return money to taxpayers
    10: "Minimal government spending" — Dramatically reduce taxes and public programs

  {{...remaining domain axes...}}

{{/FOR EACH}}

═══════════════════════════════════════════
CURRENT PROFILE STATUS
═══════════════════════════════════════════

{{FOR EACH AXIS — filled from currentProfile}}
  econ_safetynet: value=3.2, confidence=0.55, importance=6.0 (2 signals so far)
  econ_investment: not yet discussed
  econ_school_choice: not yet discussed
  econ_tax_structure: not yet discussed
{{/FOR EACH}}

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
  "domainComplete": "boolean — true if 3+ turns OR user skipped OR most axes covered"
}

CRITICAL:
- Only extract signals where you have REAL EVIDENCE from the user's words
- Do NOT fill gaps with neutral 5s — absence of signal is correct when the user hasn't spoken on a topic
- You may extract 0 signals if the user's message contained no scorable content
- You may extract signals for multiple axes from a single message
```

#### What Is Boilerplate vs. Filled

| Section | Source |
|---------|--------|
| "AXES TO EXTRACT" block | Filled from `axisSliderConfigs` in `sliderPositions.ts`, filtered to current domain |
| "CURRENT PROFILE STATUS" | Filled from `currentProfile` parameter |
| Everything else | Fixed boilerplate |

---

### Template B: "Classify Stance" (Secondary — for low-confidence refinement)

Use case: After extraction, if any signal has confidence < 0.4, run this template to get a second opinion using discrete classification bins. This is more reliable for weaker models because it reduces the task to multiple-choice.

#### Full Prompt

```
You are a political stance classifier. Read the voter's quote and classify their position on the given policy axis. Output ONLY valid JSON.

═══════════════════════════════════════════
AXIS
═══════════════════════════════════════════

ID: econ_safetynet
Name: Government Support Programs

Pole A (score 0): "Broader Safety Net"
  Government should provide generous support programs (healthcare, unemployment, housing assistance) with minimal eligibility restrictions.

Pole B (score 10): "More Conditional Safety Net"
  Government assistance should be limited, targeted, and include work requirements or other conditions.

Reference positions:
  0.0 — Universal support programs (robust benefits, minimal conditions)
  2.5 — Broad eligibility with some conditions
  5.0 — Targeted programs with work incentives ← current US policy
  7.5 — Strict eligibility and conditions
  10.0 — Minimal safety net (emphasize self-reliance)

═══════════════════════════════════════════
VOTER QUOTE
═══════════════════════════════════════════

"I think government should be a little bit more generous with safety nets, and no strings attached, of course. But I also think people should try to help themselves first before relying on government."

═══════════════════════════════════════════
CLASSIFY
═══════════════════════════════════════════

Choose ONE classification:

STRONG_POLE_A (score 0-2):
  User clearly and unambiguously supports broader government programs with few conditions.

MODERATE_POLE_A (score 2-4):
  User leans toward more government support but expresses caveats or limits.

NEUTRAL (score 4-6):
  User is genuinely undecided, balanced between both sides, or unclear.

MODERATE_POLE_B (score 6-8):
  User leans toward conditional/limited programs but acknowledges some need for support.

STRONG_POLE_B (score 8-10):
  User clearly and unambiguously supports minimal government assistance with strict conditions.

═══════════════════════════════════════════
OUTPUT
═══════════════════════════════════════════

{
  "axisId": "econ_safetynet",
  "classification": "one of: STRONG_POLE_A, MODERATE_POLE_A, NEUTRAL, MODERATE_POLE_B, STRONG_POLE_B",
  "score": "number within the classification's range",
  "confidence": "0.0-1.0 — how clearly does the quote support this classification",
  "keyPhrase": "the most decisive phrase from the quote",
  "reasoning": "1-2 sentences explaining why this classification"
}

RULES:
- If the quote contains contradictory signals, classify as NEUTRAL with confidence below 0.3
- Consider ALL parts of the quote, not just the first sentence
- "No strings attached" and "help themselves first" are in tension — account for BOTH
```

#### Batched Version

For efficiency, classify multiple axes in one call:

```
Classify the voter's stance on each of the following axes. Output a JSON array.

AXIS 1: econ_safetynet
[...pole definitions and positions...]

AXIS 2: econ_tax_structure
[...pole definitions and positions...]

VOTER QUOTE: "..."

Output: [{ axisId, classification, score, confidence, keyPhrase, reasoning }, ...]
```

#### What Is Boilerplate vs. Filled

| Section | Source |
|---------|--------|
| Axis block (ID, poles, positions) | Filled from `axisSliderConfigs` |
| Voter Quote | Filled from the `source` field of the low-confidence signal |
| Classification bins, rules | Fixed boilerplate (always the same 5 bins) |

#### When to Use Template B

In the API route, after Template A extraction:

```typescript
// Pseudocode for calling Template B as a refinement step
const lowConfidenceSignals = extraction.signals.filter(s => s.confidence < 0.4);

if (lowConfidenceSignals.length > 0) {
  const classifications = await classifyStances(lowConfidenceSignals, axisConfigs);

  for (const cls of classifications) {
    const original = extraction.signals.find(s => s.axisId === cls.axisId);
    if (original && cls.confidence > original.confidence) {
      // Classification produced higher confidence — use it
      original.direction = cls.score;
      original.confidence = cls.confidence;
      original.reasoning += ` [Refined by classification: ${cls.classification}]`;
    }
  }
}
```

---

### Template C: "Summarize for Restatement" (Domain Transition)

Use case: When transitioning between domains, generate a plain-English summary of what the system understood. Shown to the user for confirmation.

```
You are summarizing a voter's positions for their review. Based on the profile data below, write a 2-3 sentence summary in plain English. Write in second person ("You...").

═══════════════════════════════════════════
DOMAIN: Economic Policy
═══════════════════════════════════════════

AXIS VALUES:
  Government Support Programs (econ_safetynet):
    Score: 3.2/10 (leans toward "Broader Safety Net")
    Confidence: 0.55
    Closest position: "Broad eligibility with some conditions"
    Key quote: "government should be more generous with safety nets"

  Taxes & Public Spending (econ_investment):
    Score: 4.0/10 (slightly leans toward "More Public Investment")
    Confidence: 0.40
    Closest position: "Targeted public investments"
    Key quote: "I'm fine with higher taxes if it means better services"

  Public Schools vs School Choice (econ_school_choice):
    Not discussed

  Tax Structure (econ_tax_structure):
    Not discussed

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════

{
  "summary": "2-3 sentence plain English summary of their positions in this domain. Use 'you' language. Mention what you're confident about and what wasn't discussed.",
  "axisSummaries": [
    {
      "axisId": "econ_safetynet",
      "oneLiner": "You support a broader safety net with fewer restrictions."
    }
  ]
}

RULES:
- Be warm and specific, not clinical
- Use their own words/framing where possible
- If confidence is low, hedge: "It seems like you lean toward..."
- If an axis wasn't discussed, say so: "We didn't get to talk about [topic]."
- Never evaluate or judge their positions
```

---

## 5. Guardrails & Validation Rules

### 5.1 Rules Embedded in the Extraction Prompt

These are included directly in Template A (see section 4 above):

1. **Never assume a position where the user has been silent.** No signal is emitted for undiscussed axes. Do NOT default to 5.
2. **Hedging reduces confidence, not score.** "I guess maybe more regulations" → direction toward pole A, confidence 0.2–0.4.
3. **Contradictions produce low-confidence signals with warnings.** Both leans are captured; the merging algorithm handles the weighted average.
4. **Double negatives require logical parsing.** "I don't think we shouldn't have..." = they support it.
5. **Source quotes must be the user's actual words.** Not paraphrased, not the assistant's words.
6. **Abstract values aren't scorable.** "I believe in fairness" → no signal until they connect it to policy.

### 5.2 Validation Rules (Server-Side — in the API Route)

Apply these checks AFTER parsing the LLM's JSON response:

```typescript
interface ValidationResult {
  valid: boolean;
  issues: string[];
  sanitizedSignals: ValueSignal[];
}

function validateExtractionOutput(
  extraction: ExtractionOutput,
  userMessage: string,
  validAxisIds: Set<string>
): ValidationResult {
  const issues: string[] = [];
  const sanitizedSignals: ValueSignal[] = [];

  for (const signal of extraction.signals) {
    // 1. Reject unknown axis IDs
    if (!validAxisIds.has(signal.axisId)) {
      issues.push(`Unknown axis: ${signal.axisId}`);
      continue;
    }

    // 2. Clamp values to valid ranges
    const direction = Math.max(0, Math.min(10, Number(signal.direction) || 5));
    const confidence = Math.max(0, Math.min(1, Number(signal.confidence) || 0.5));
    const importance = Math.max(0, Math.min(10, Number(signal.importance) || 5));

    // 3. Check source quote exists in user message (fuzzy)
    const sourceInMessage = userMessage.toLowerCase().includes(
      signal.source?.toLowerCase().slice(0, 20) || ''
    );
    if (!sourceInMessage && signal.source) {
      issues.push(`${signal.axisId}: source quote not found in user message`);
      // Still include the signal but reduce confidence
      signal.confidence = Math.min(confidence, 0.3);
    }

    // 4. High-confidence signals need substantive reasoning
    if (confidence > 0.7 && (!signal.reasoning || signal.reasoning.length < 20)) {
      issues.push(`${signal.axisId}: high confidence (${confidence}) but thin reasoning`);
    }

    // 5. Reject exact-5 scores with high confidence (likely a default, not real interpretation)
    if (direction === 5 && confidence > 0.6) {
      issues.push(`${signal.axisId}: suspicious neutral score (5.0) with high confidence`);
      signal.confidence = 0.3; // Demote
    }

    sanitizedSignals.push({
      axisId: signal.axisId,
      direction,
      confidence: signal.confidence,
      importance,
      source: String(signal.source || ''),
      reasoning: signal.reasoning,
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    sanitizedSignals,
  };
}
```

### 5.3 Neutrality Rules (for both Pass 1 and Pass 2)

These should be included in both the response and extraction system prompts:

```
NEUTRALITY — CRITICAL:
- Never frame a question with an assumed answer: "Don't you think X?"
- Never use emotionally loaded terms asymmetrically: "generous programs" vs "handouts"
- Never present one option as default: "Most people think X. What do you think?"
- When providing examples, give one from each direction
- In reasoning, describe the user's position without evaluating it:
  GOOD: "User supports broader safety net programs"
  BAD: "User has a compassionate view of social policy"
  BAD: "User naively supports unlimited government spending"
```

### 5.4 Coverage Tracking

The `meta.axesMissing` field tracks which axes haven't been discussed yet. The calling code uses this to:

1. **Guide follow-up questions** (Pass 1): the response prompt gets a hint about which topics to naturally explore next
2. **Determine domain completion**: A domain is "complete enough" when either:
   - All axes have at least one signal with confidence > 0.2, OR
   - 3+ conversation turns have occurred in this domain, OR
   - The user explicitly skipped

This is already partially implemented via the `coveredAxes`/`uncoveredCount` logic in `buildResponseSystemPrompt()`. The enriched schema formalizes it.

---

## 6. Implementation Mapping

### Where Each Template Is Used

| Template | Route | When | Current Code Location |
|----------|-------|------|----------------------|
| **A: Extract & Score** | `/api/conversation/warmup` | Every user turn during warmup | `buildExtractionSystemPrompt()` in `warmup/route.ts` |
| **A: Extract & Score** | `/api/conversation/turn` | Every user turn during ballot phase | `buildSystemPrompt()` in `llmService.ts` (needs upgrade to two-pass) |
| **B: Classify Stance** | Both routes | After extraction, when signals have confidence < 0.4 | New — not yet implemented |
| **C: Summarize** | `/api/conversation/warmup` | At domain transitions (when `domainComplete` is true) | New — not yet implemented |

### Changes Required to Implement

1. **`warmup/route.ts`**: Replace `buildExtractionSystemPrompt()` body with Template A. Add Template B call for low-confidence refinement. Add Template C call at domain transitions.

2. **`llmService.ts`**: Refactor `interpretBallotResponse()` to use two-pass architecture (matching warmup), using Template A for extraction. Currently it's single-pass.

3. **`conversation.ts` types**: Add `warnings`, `conflictsWith` to `ValueSignal`. Add a `TurnMeta` interface for the meta fields.

4. **`turn/route.ts`**: Add validation layer using the rules from section 5.2.

5. **`warmup/route.ts`**: Add validation layer (same rules).

---

## 7. Example Walkthrough

### User says:
> "I think government should be a little bit more generous with safety nets, and no strings attached, of course. But I also think people should try to help themselves first before relying on government."

### Template A produces:

```json
{
  "signals": [
    {
      "axisId": "econ_safetynet",
      "direction": 3.0,
      "confidence": 0.5,
      "importance": 7,
      "source": "government should be more generous with safety nets, no strings attached",
      "reasoning": "User supports broader safety net ('more generous', 'no strings attached') → maps between position 0 ('Universal support') and position 2.5 ('Broad eligibility'). However, 'people should try to help themselves first' introduces a self-reliance caveat that pulls toward position 5 ('Targeted programs with work incentives'). Net lean: ~3.0, between 'Broad eligibility' and 'Targeted programs'. Confidence reduced due to internal tension.",
      "warnings": [
        "Internal tension: 'no strings attached' (position 0-1) conflicts with 'help themselves first' (position 5-7). Score 3.0 reflects the net lean toward broader support, weighted by the stronger emphasis on generosity."
      ],
      "conflictsWith": null
    }
  ],
  "meta": {
    "axesCovered": ["econ_safetynet"],
    "axesMissing": ["econ_investment", "econ_school_choice", "econ_tax_structure"],
    "hasContradictions": false,
    "overallClarity": 0.6
  },
  "domainComplete": false
}
```

### Since confidence is 0.5 (> 0.4), Template B is NOT triggered.

### If confidence had been 0.3, Template B would produce:

```json
{
  "axisId": "econ_safetynet",
  "classification": "MODERATE_POLE_A",
  "score": 3.5,
  "confidence": 0.5,
  "keyPhrase": "more generous with safety nets, no strings attached",
  "reasoning": "User's primary emphasis is on generous, unconditional support (MODERATE_POLE_A). The self-reliance caveat is secondary — introduced as an afterthought with 'but'. Overall lean is toward broader support with some caveats."
}
```

---

## 8. Temperature and Model Configuration

| Template | Temperature | JSON Mode | Max Tokens | Rationale |
|----------|-------------|-----------|------------|-----------|
| A: Extract & Score | 0.3 | Yes | 600 | Low temp for consistent, precise extraction |
| B: Classify Stance | 0.2 | Yes | 300 | Very low temp — classification should be deterministic |
| C: Summarize | 0.7 | Yes | 400 | Slightly higher for natural language summaries |
| Pass 1: Response | 0.85 | No | 400 | High temp for varied, natural conversation |

---

## 9. Open Questions for the Team

1. **Threshold for Template B refinement**: Currently proposed at confidence < 0.4. Should this be configurable? Lower threshold = fewer refinement calls but more low-confidence signals pass through.

2. **Restatement frequency**: Template C at every domain transition (4-5 times per session)? Or only when confidence is low across the domain?

3. **Contradiction handling in the profile**: Currently contradictions are absorbed by the weighted average in `mergeSignals()`. Should we track them separately so the UI can surface "You seem to have mixed feelings about X"?

4. **Model upgrade**: The current default `openai/gpt-oss-120b` should be evaluated against Llama 4 Maverick for extraction quality. The templates are model-agnostic but Maverick may handle the guardrail instructions more reliably.

---

## Appendix A: Model Tier Cost Analysis

Estimated costs per conversation (~15 turns × 2 passes):

| Model | Input $/M | Output $/M | Est. cost/conversation | Notes |
|-------|-----------|------------|----------------------|-------|
| Current (`gpt-oss-120b`) | ~$0.30 | ~$0.60 | ~$0.03 | DeepInfra hosted, current default |
| Llama 4 Maverick (DeepInfra) | $0.15 | $0.60 | ~$0.02 | Cheaper, evaluate extraction quality |
| Qwen3-235B (DeepInfra) | $1.50 | $0.60 | ~$0.06 | Larger model, likely better guardrail adherence |
| Claude Haiku 4.5 | $1.00 | $5.00 | ~$0.08 | Anthropic API, strong instruction following |
| Claude Sonnet 4.6 | $3.00 | $15.00 | ~$0.50 | Overkill for extraction, reserve for scoring |

**Note:** Claude API is billed separately from Claude Max subscription. The templates in this document are model-agnostic — switching models requires only changing the API endpoint and model ID in `llmService.ts`, not the prompt templates themselves.
