# CLAUDE.md — Ballot Builder

> **For Claude Code:** This is the source of truth for the Ballot Builder / Values Blueprint project. It contains the conceptual model, key invariants, pointers to detailed research, and production implementation tasks. Read this file before making changes to values mapping, scoring, candidate comparison, or UI flow.

---

## Conceptual Model

### Three Flows

The system has three flows with different compute profiles. See `docs/THREE_FLOWS_OVERVIEW.md` for full details.

| Flow | Purpose | Runs when | Model |
|------|---------|-----------|-------|
| **1. Values Capture** | Discover user's policy preferences via adaptive assessment | Once per user | DeepInfra OSS (two-pass extraction) or deterministic (structured cards) |
| **2. Data Gathering** | Research candidates and ballot measures, score on 16 axes | Once per election per geography | Claude Sonnet (research) + Opus (scoring) |
| **3. Matching** | Compare user profile to candidate/measure positions | Every page load | None — pure client-side TypeScript math |

### The 16 Civic Axes

Users and candidates are both scored on 16 policy axes across 5 domains. Both structured card selection and NLP extraction produce values on the same 0–10 scale per axis. The matching formula uses weighted Euclidean distance.

| Domain | Axes |
|--------|------|
| Economic | `safety_net_breadth`, `public_investment`, `school_choice` |
| Healthcare | `coverage_model`, `cost_control`, `public_health` |
| Housing | `zoning_supply`, `affordability_tools`, `transit_priority` |
| Justice | `police_accountability`, `sentencing_goals`, `firearms_policy` |
| Climate | `ambition_level`, `energy_portfolio`, `permitting_speed` |
| Cross-cutting | `immigration_approach` |

Each axis has Pole A (score 0) and Pole B (score 10). See `src/server/data/civicAxes/` for full definitions and `src/data/sliderPositions.ts` for the 3–5 position cards per axis.

### Matching Formula

```
w_i = gw_i * cov_i * conf_i * estr_i
S   = SUM(w_i * A_i) / SUM(w_i)
A_i = 1 - |U_i - C_i| / 2
```

Where `U_i` = user score, `C_i` = candidate score, `conf_i` = confidence, `gw_i` = ballot-dynamic weight. Implemented in `src/lib/ballotHelpers.ts` — do not change the math without reading Research 07.

### User Assessment Pipeline

The hybrid assessment uses information-theoretic adaptive sequencing:

1. **Structured cards** (primary): User picks from 3–5 position cards per axis. Deterministic scoring.
2. **NLP escape hatch**: User speaks/types freely. Two-pass LLM extraction (response + signal extraction, run in parallel). Can extract signals across multiple axes from a single response.
3. **Adaptive stopping**: Shannon entropy tracks remaining uncertainty per axis. Assessment ends when total weighted entropy drops below threshold, typically after 5–10 questions instead of all 16.
4. **Blueprint profile**: Output is a `BlueprintProfile` with per-axis `value_0_10`, `confidence_0_1`, and `importance`.

### AI Chat (Ask AI)

The ballot-item AI assistant receives the user's Blueprint profile as context so it can answer questions about candidate alignment without re-asking the user's positions. The chat uses a two-pass architecture: Pass 1 generates a warm conversational response (temp 0.85), Pass 2 extracts structured value signals (temp 0.3, JSON mode). Both run in parallel.

---

## Research Index

Detailed research documents live in `research/`. **Read the relevant doc before modifying its area.**

| File | Area | Key content |
|------|------|-------------|
| `research/01_irt_calibration.md` | Psychometrics | IRT item calibration strategy, Graded Response Model |
| `research/02_adaptive_sequencing.md` | Assessment flow | Prior distributions, posterior updates, cross-axis correlation, EWIG axis selection, stopping criterion |
| `research/03_conversation_router.md` | NLP path | Entropy-routed conversation, multi-axis extraction, session state |
| `research/05_hybrid_flow.md` | Modality switching | Structured ↔ NLP switching triggers, conflict resolution, unified session state |
| `research/06_entropy_confidence.md` | Confidence scoring | Entropy-based confidence, structured vs NLP calibration, failure modes |
| `research/07_ballot_weighting.md` | Dynamic weights | Candidate spread measure, ballot-specific axis weights, adversarial robustness |
| `research/08_end_to_end_synthesis.md` | Full pipeline | Six-stage data flow, spec delta, implementation phases |

Additional docs in `docs/`:

| File | Content |
|------|---------|
| `docs/THREE_FLOWS_OVERVIEW.md` | Three flows architecture, data lifecycle |
| `docs/ARCHITECTURE.md` | System architecture overview |
| `docs/ASSESSMENT_PIPELINE.md` | Assessment pipeline details |
| `docs/CANDIDATE_SCORING_PROMPT.md` | Prompt design for candidate scoring |
| `docs/SCORING_METHODOLOGY.md` | Full scoring rubric (in `references/`) |

---

## Key Invariants (Never Break These)

1. **Assessment scoring algorithms are correct.** Do not modify `civicAxesService.ts`, `schwartzService.ts`, `src/lib/scoring.ts`, or the matching formula in `ballotHelpers.ts` without reading the relevant research doc first.
2. **Evidence floors.** Only score axes where evidence exists. Never fill gaps with neutral 5s — for users or candidates.
3. **Voting record > stated position.** When a candidate's votes contradict their campaign statements, the record wins. Flag the discrepancy.
4. **Confidence scales linearly into match scores.** Confidence errors propagate directly. See Research 06 §2 for failure modes.
5. **Blueprint profile seeds the AI chat.** The conversation store's profile must be initialized from the Blueprint assessment so the AI doesn't re-ask positions the user already provided.
6. **Unauthenticated flow must work.** Users can take the full assessment and view recommendations without signing up. Auth is only required to save results.
7. **The 17 axes and 5 domains are the canonical framework.** All user-facing values, candidate scores, and match computations go through this framework. Do not introduce parallel scoring systems.
8. **Official ballot text is sacred.** The `Measure.description` field and `BallotItem.questionText` (for measures) contain verbatim text from the election authority. Never alter, rephrase, fix punctuation, or simplify official ballot language. Use the `explanation` field for plain-language descriptions instead.

---

## Do/Don't Rules

### Values Mapping & NLP Extraction

- **DO** extract signals across multiple axes from a single NLP response (cross-domain capture).
- **DO** use the axis position reference (the 3–5 concrete positions per axis) to snap extracted values to meaningful positions. Avoid false precision.
- **DO** respect confidence hierarchy: direct statement > strong implication > weak implication > inference from background.
- **DON'T** fabricate scores for axes the user hasn't addressed. Leave them unscored with low confidence.
- **DON'T** re-ask the user about positions already captured in their Blueprint profile.

### Nuanced Issues (Guns, Abortion, Immigration, etc.)

- **DO** present these through the axis framework like any other topic. The axes are designed to capture the policy dimension, not the emotional valence.
- **DO** show tradeoffs with concrete, contextualized evidence — not abstract talking points.
- **DON'T** editorialize or add value judgments. The system presents alignment, not endorsements.
- **DON'T** assume positions correlate across axes (e.g., pro-gun ≠ anti-regulation on other axes).

### Tradeoff & Impact Presentation

- **DO** contextualize large numbers (e.g., "$50 billion" means nothing without "that's 2% of the federal budget" or "about $150 per taxpayer").
- **DO** attribute claims to sources. "According to CBO estimates..." not "This would cost..."
- **DON'T** present misleading tradeoff bullets that cherry-pick one side's framing.
- **DON'T** use scare language or euphemisms. Use neutral, descriptive language for policy effects.

### Candidate Comparison

- **DO** use the same axis framework for users and candidates — the match is a geometric comparison, not an editorial judgment.
- **DO** show per-axis breakdown with source attribution (interest group ratings, voting records, campaign statements).
- **DO** distinguish confidence tiers visually: HIGH (multiple independent sources), MEDIUM (one strong source), LOW (inference only).
- **DON'T** show match scores for axes with no candidate data — exclude them from the calculation.
- **DON'T** favor incumbents in scoring. They have more data (higher confidence), not higher scores.

---

## Context Management Protocol

### Before modifying values mapping, scoring, or recommendations:

1. Re-read the relevant section of this file.
2. Open and skim the linked `research/*.md` doc(s).
3. Summarize the key rules you must preserve before proposing changes.

### When you discover a new stable rule:

1. If it's a high-level invariant or do/don't, propose an update to this file.
2. If it's detailed research, put it in a `research/*.md` or `docs/*.md` file and add a pointer here.
3. Do not stuff detailed content directly into this file — keep it as an index + rules.

### When something seems inconsistent:

1. Stop and explicitly note the inconsistency.
2. Propose a change to either the code/logic or the research/CLAUDE.md — not both silently.

### Prefer deterministic data over free-form domain knowledge when:

- Explaining what a government office/role does.
- Summarizing costs, tradeoffs, or policy implications.
- Describing candidate positions (use scored evidence, not general knowledge).

---

## Step 0: Understand the Current Repo

Before doing anything, familiarize yourself with the project structure:

1. Read `docs/ARCHITECTURE.md` for the full system overview.
2. Scan the key directories:
   - `src/server/data/` — Static TypeScript data that will eventually be replaced by live API calls
   - `src/server/services/` — Business logic (scoring, ballot retrieval)
   - `src/stores/` — Zustand stores (currently localStorage-persisted)
   - `src/lib/ballotHelpers.ts` — The recommendation engine (pure functions)
   - `src/lib/scoring.ts` — Client-side scoring utilities
   - `src/lib/archetypes.ts` — Archetype classification
   - `src/app/api/` — ~50 API route handlers
   - `prisma/` — Current schema (FeedbackEntry, AnalyticsEvent only)
   - `research/` — Detailed research documents (see Research Index above)
3. Run `npx tsc --noEmit` to confirm the project type-checks cleanly before making changes.
4. Run `npm test` to see current test coverage.

---

## Phase 1: Database Schema Expansion

### Context
The app currently uses Neon PostgreSQL via Prisma, but only for analytics and feedback. All user data lives in localStorage via Zustand stores (`userStore.ts`, `schwartzStore.ts`, `ballotStore.ts`, `demographicStore.ts`). We need to expand the DB to be the system of record while keeping localStorage as a fast local cache.

### Task 1.1: Expand Prisma Schema

Add these models to `prisma/schema.prisma`:

```prisma
model User {
  id              String          @id @default(cuid())
  email           String          @unique
  authProviderId  String          @unique @map("auth_provider_id")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  profile         UserProfile?
  savedBallots    SavedBallot[]
  feedback        FeedbackEntry[]

  @@map("users")
}

model UserProfile {
  id                String   @id @default(cuid())
  userId            String   @unique @map("user_id")
  blueprintProfile  Json     @map("blueprint_profile")    // BlueprintProfile type
  schwartzValues    Json?    @map("schwartz_values")       // Schwartz scores
  demographics      Json?    @map("demographics")          // Age, location, etc.
  updatedAt         DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model BallotCache {
  id            String   @id @default(cuid())
  districtHash  String   @map("district_hash")   // Hash of address/district combo
  electionDate  String   @map("election_date")   // YYYY-MM-DD
  rawBallot     Json     @map("raw_ballot")       // Full API response
  fetchedAt     DateTime @default(now()) @map("fetched_at")

  @@unique([districtHash, electionDate])
  @@index([districtHash])
  @@map("ballot_cache")
}

model CandidateScore {
  id              String   @id @default(cuid())
  candidateId     String   @map("candidate_id")     // External ID from Ballotpedia
  candidateName   String   @map("candidate_name")
  raceId          String   @map("race_id")
  axisId          String   @map("axis_id")           // One of the 16 civic axis IDs
  score           Float                               // 0-10 scale
  confidence      Float                               // 0-1 scale
  evidenceSource  String   @map("evidence_source")   // "vote_smart", "voting_record", "llm_analysis"
  evidenceDetail  String?  @map("evidence_detail")   // Human-readable explanation
  scoredAt        DateTime @default(now()) @map("scored_at")

  @@unique([candidateId, axisId])
  @@index([raceId])
  @@map("candidate_scores")
}

model SavedBallot {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  electionId  String   @map("election_id")
  votes       Json                               // { contestId: candidateId, measureId: "yes"/"no" }
  savedAt     DateTime @default(now()) @map("saved_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, electionId])
  @@map("saved_ballots")
}
```

**Important:** Do NOT remove the existing `FeedbackEntry` and `AnalyticsEvent` models. Add to them.

After updating the schema, run:
```bash
npx prisma migrate dev --name add-production-models
npx prisma generate
```

### Task 1.2: Create Sync Layer Between Zustand and DB

The Zustand stores should continue working for immediate UI responsiveness, but sync to the DB when a user is authenticated. Create a new file:

**`src/lib/syncProfile.ts`**

This module should:
- Export an `async function syncProfileToDb(userId: string, profile: BlueprintProfile)` that upserts to `UserProfile`
- Export an `async function loadProfileFromDb(userId: string): BlueprintProfile | null` that loads from DB
- Be called from the Zustand store's `set` actions (debounced, not on every keystroke)
- Handle the unauthenticated case gracefully (just use localStorage, no DB calls)

Look at how the existing stores in `src/stores/` handle the `_hasHydrated` pattern — the sync layer should integrate with that.

---

## Phase 2: Authentication

### Context
Auth is currently mocked in `src/app/(auth)/` and `src/context/`. We're using Clerk for the MVP.

### Task 2.1: Install and Configure Clerk

```bash
npm install @clerk/nextjs
```

Clerk requires these environment variables in `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/blueprint
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/blueprint
```

### Task 2.2: Replace Mocked Auth

1. Wrap the root layout (`src/app/layout.tsx`) with `<ClerkProvider>`.
2. Replace the mocked `(auth)` route group with Clerk's `<SignIn />` and `<SignUp />` components.
3. Protect the `(app)` route group using Clerk's `middleware.ts` — see Clerk's Next.js App Router docs.
4. Replace the mocked `AuthContext` in `src/context/` with Clerk's `useUser()` and `useAuth()` hooks.
5. On first sign-in, create a `User` record in the DB (use Clerk webhooks or a post-auth check).

**Do NOT break the unauthenticated flow.** Users should still be able to take the Blueprint Assessment without signing up. Auth should only be required to *save* results and access the Ballot Explorer.

---

## Phase 3: Address-to-Ballot Pipeline

### Context
The app currently loads ballot data from static TS files in `src/server/data/ballot/`. We need to replace this with a pipeline: User address → Google Civic API → Ballotpedia API → cached ballot.

### Decided APIs (do not change these selections):

| API | Purpose | Auth | Base URL |
|-----|---------|------|----------|
| **Google Civic Information API** | Address → districts, polling places, elected officials | API key (free, 25K/day) | `https://www.googleapis.com/civicinfo/v2/` |
| **Ballotpedia API** | Full ballot: candidates, measures, elections by geography | API key (paid, single-state MI) | `https://api4.ballotpedia.org/` |
| **VoteAmerica Civic Data API** | Voter registration rules, deadlines, ID requirements by state | None (free, nonprofit) | `https://api.voteamerica.org/` |

### Task 3.1: Create API Client Module

Create **`src/server/services/externalApis.ts`** with typed client functions:

```typescript
// Google Civic: address → voter info
export async function getVoterInfo(address: string): Promise<GoogleVoterInfoResponse> { ... }

// Google Civic: address → representatives
export async function getRepresentatives(address: string): Promise<GoogleRepresentativesResponse> { ... }

// Ballotpedia: lat/long + election date → full ballot
export async function getBallotByPoint(lat: number, long: number, electionDate: string): Promise<BallotpediaBallotResponse> { ... }

// VoteAmerica: state → registration rules
export async function getVotingRules(stateCode: string): Promise<VoteAmericaRulesResponse> { ... }
```

Use Axios (already a project dependency). Store API keys in environment variables:
```
GOOGLE_CIVIC_API_KEY=...
BALLOTPEDIA_API_KEY=...
```

### Task 3.2: Create Ballot Retrieval Service

Create **`src/server/services/liveBallotService.ts`** to replace the static `ballotService.ts`:

1. Accept a user address string.
2. Call Google Civic to resolve to lat/long and district IDs.
3. Hash the district+election combination and check `BallotCache` table.
4. If cache miss (or stale > 24 hours), call Ballotpedia `/elections_by_point`.
5. Transform the Ballotpedia response into the existing internal types used by `src/server/data/ballot/` (candidates, contests, measures). **Match the existing type interfaces** so downstream components don't need changes.
6. Cache the result in `BallotCache`.
7. Return the ballot data.

**Key principle:** The output types of `liveBallotService.ts` must match what the static data currently provides. Check the types in `src/types/` and the shapes consumed by `src/components/ballot/`. This way the UI layer doesn't know or care whether data is static or live.

### Task 3.3: Replace Election Banner Prototype Modals

In `src/components/blueprint/ElectionBanner.tsx`:
- Replace the "Coming Soon" `PrototypeModal` links with real URLs.
- For Michigan specifically:
  - Voter registration check: `https://mvic.sos.state.mi.us/Voter/Index`
  - Absentee ballot application: `https://mvic.sos.state.mi.us/AVApplication/Index`
  - Polling place finder: `https://mvic.sos.state.mi.us/Voter/Index` (same portal)
- Use VoteAmerica API to fetch Michigan-specific deadlines and display them in the banner.
- The `electionDate.ts` utility already calculates the next election date — keep using it.

---

## Phase 4: Candidate Scoring Engine

### Context
This is the core IP of the product. Currently `src/lib/ballotHelpers.ts` has `computeCandidateMatches()` and `computePropositionRecommendation()` that work against static data. We need to populate `CandidateScore` records from real sources.

### The 16 Civic Axes (from `src/server/data/civicAxes/`)

Reference the actual axis IDs and poles from the existing spec. The axes are organized as 5 domains × 3-4 axes:

| Domain | Axis | Pole A (score 0) | Pole B (score 10) |
|--------|------|-------------------|---------------------|
| Economic | safety_net_breadth | Broader Safety Net | Conditional Safety Net |
| Economic | public_investment | More Public Investment | Less Public Investment |
| Economic | school_choice | Traditional Public Schools | More School Choice |
| Healthcare | coverage_model | Universal/Single-Payer | Market-Based Coverage |
| Healthcare | cost_control | Government Price Controls | Market Competition |
| Healthcare | public_health | Collective Mandates | Individual Choice |
| Housing | zoning_supply | Loosen Zoning / More Supply | Preserve Local Zoning |
| Housing | affordability_tools | Government Subsidies | Market Solutions |
| Housing | transit_priority | Public Transit Investment | Car-Centric Infrastructure |
| Justice | police_accountability | More Oversight / Reform | Back the Blue / Status Quo |
| Justice | sentencing_goals | Rehabilitation Focus | Punishment / Deterrence |
| Justice | firearms_policy | More Gun Regulations | Protect Gun Rights |
| Climate | ambition_level | Aggressive Climate Action | Gradual / No Climate Policy |
| Climate | energy_portfolio | Renewables Priority | All-of-the-Above / Fossil |
| Climate | permitting_speed | Faster Green Permitting | Standard Review Process |

### Task 4.1: Interest Group Rating Mapper

Create **`src/server/services/candidateScoring.ts`**

This is the primary scoring mechanism. Interest group ratings are aggregated expert judgments — they're the highest-signal data available.

Define a mapping configuration:

```typescript
// Each entry maps an interest group to one or more axes
const INTEREST_GROUP_AXIS_MAP: GroupAxisMapping[] = [
  // Climate domain
  { groupName: "League of Conservation Voters", axisId: "ambition_level", direction: "poleA", weight: 1.0 },
  { groupName: "Sierra Club", axisId: "energy_portfolio", direction: "poleA", weight: 0.8 },

  // Justice domain
  { groupName: "NRA", axisId: "firearms_policy", direction: "poleB", weight: 1.0 },
  { groupName: "Brady Campaign", axisId: "firearms_policy", direction: "poleA", weight: 1.0 },
  { groupName: "ACLU", axisId: "police_accountability", direction: "poleA", weight: 0.7 },
  { groupName: "Fraternal Order of Police", axisId: "police_accountability", direction: "poleB", weight: 0.8 },

  // Economic domain
  { groupName: "Chamber of Commerce", axisId: "public_investment", direction: "poleB", weight: 0.8 },
  { groupName: "AFL-CIO", axisId: "public_investment", direction: "poleA", weight: 0.8 },
  { groupName: "National Education Association", axisId: "school_choice", direction: "poleA", weight: 0.9 },
  { groupName: "American Federation for Children", axisId: "school_choice", direction: "poleB", weight: 0.9 },

  // Healthcare domain
  { groupName: "Physicians for a National Health Program", axisId: "coverage_model", direction: "poleA", weight: 0.9 },

  // ... expand to ~30-50 groups total
];
```

The scoring function:
1. For a given candidate, fetch all available interest group ratings (from Vote Smart API or pre-loaded data).
2. For each axis, find all matching groups in the mapping.
3. Convert each rating (typically 0-100%) to the 0-10 axis scale, respecting the `direction`.
4. Weighted average across all available groups for that axis.
5. Confidence = (number of groups with ratings for this axis) / (total mapped groups for this axis).
6. Store result in `CandidateScore` table with `evidenceSource: "vote_smart"` and `evidenceDetail` listing the specific ratings.

### Task 4.2: Voting Record Analyzer

Secondary scoring mechanism. Works best for incumbents with legislative voting histories.

Data sources:
- Federal: ProPublica Congress API (`https://api.propublica.org/congress/v1/`) — free, API key required
- State: Open States API (`https://v3.openstates.org/`) — free, API key required

Approach:
1. Maintain a curated list of "key bills" classified by axis (stored as a config file or DB table).
2. For each candidate with a legislative record, check their votes on classified bills.
3. Each YES/NO vote on a classified bill becomes a binary signal for that axis.
4. Aggregate signals per axis. Confidence = number of classified votes / minimum needed (e.g., 3).

This is more labor-intensive to set up (you must manually classify bills), but produces very reliable scores. Start with ~50-100 key bills for Michigan federal and state races.

### Task 4.3: Integrate Scores into Existing Match Computation

The existing `computeCandidateMatches()` in `src/lib/ballotHelpers.ts` expects candidate position data in a certain shape. Adapt it to:

1. Accept `CandidateScore[]` from the database instead of static data.
2. Use the existing Euclidean distance match formula (already implemented — don't change the math).
3. Weight each axis's contribution by the `confidence` score — low-confidence axes should contribute less to the overall match percentage.
4. Return evidence alongside the match score so the UI can show "Why this match?"

### Task 4.4: Evidence Component

Create **`src/components/ballot/MatchEvidence.tsx`**

For each candidate match, show a collapsible panel with:
- Per-axis breakdown (which axes aligned, which diverged)
- Source attribution for each axis score:
  - Tier 1: "Rated 92% by League of Conservation Voters" (link to Vote Smart)
  - Tier 2: "Voted YES on HB 1234 — Michigan Clean Energy Standard" (link to bill)
  - Tier 3: "Based on campaign website position" (link to source, lower visual confidence)
- Confidence indicator per axis (e.g., filled dots or a subtle bar)

---

## Phase 5: Michigan Launch Checklist

Before going live, verify:

- [ ] Address entry flow works for 20+ Michigan addresses across different districts
- [ ] Every Michigan Congressional race returns candidates with scores
- [ ] Gubernatorial race (Benson vs. James vs. Duggan) displays correctly with the independent candidate handled properly
- [ ] All ballot measures cached and retrievable display YES/NO recommendations
- [ ] Election Banner shows correct Michigan deadlines (verify against `mvic.sos.state.mi.us`)
- [ ] Auth flow: anonymous assessment → sign up → data persists
- [ ] Mobile responsive (many voters will use this at the polls)
- [ ] Accessibility pass (screen reader, keyboard navigation, color contrast)
- [ ] Scoring bias audit: have politically diverse reviewers check top-of-ballot race recommendations for systematic partisan lean

---

## Environment Variables Needed

```env
# Database (existing)
DATABASE_URL=postgresql://...

# Auth (new)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# External APIs (new)
GOOGLE_CIVIC_API_KEY=...
BALLOTPEDIA_API_KEY=...
VOTE_SMART_API_KEY=...
PROPUBLICA_API_KEY=...
OPENSTATES_API_KEY=...
```

---

## What NOT to Change

- **Assessment logic**: The Civic Blueprint Assessment (slider quiz → shrinkage scoring) and Schwartz Values Assessment (vignettes → ipsatization) are working correctly. Don't modify `civicAxesService.ts` or `schwartzService.ts` scoring algorithms.
- **Archetype system**: The 9 archetypes and 3 meta-dimensions are working. Don't touch `archetypes.ts`.
- **Client-side scoring utilities**: `src/lib/scoring.ts` handles the user-side math. Changes should only be needed on the *candidate data input* side, not the scoring math itself.
- **UI component structure**: The `ballot/`, `blueprint/`, and `schwartz/` component directories are well-organized. Add to them, don't restructure.

---

## Research & Scoring Pipeline

> This section defines the agentic pipeline for researching real-world candidates and ballot measures, scoring them against the Ballot Builder frameworks, and producing TypeScript data files. The pipeline uses subagents defined in `.claude/agents/` and reference docs in `references/`.

### How to invoke this pipeline

Users will say things like:
- "Score Michigan U.S. Senate 2026"
- "Research all candidates in Michigan Senate District 38"
- "Build ballot data for the November 2026 Michigan general election"
- "Score [any race or ballot measure]"

### Pipeline workflow

Work through these phases in order. Use subagents for phases 2–4 so work can run in parallel.

#### Phase A: Clarify scope (do this yourself, no subagent needed)

Before starting, confirm:
1. **State and race** — What specific contest(s) to score? Be precise: "Michigan U.S. Senate 2026" vs. "all Michigan 2026 races" are very different scopes.
2. **Election cycle** — Primary, general, or both?
3. **Output format** — Default is TypeScript (`candidates.ts` + `ballotMeasures.ts`). Confirm if user wants something different.

If the request is already clear, skip asking and proceed.

#### Phase B: Discovery

Spawn the `discovery` subagent with:
```
Discover all candidates and ballot measures for: [RACE/LOCATION]
Election: [PRIMARY/GENERAL/BOTH] on [DATE]
Output a JSON manifest to: discovery-manifest.json
```

Wait for the manifest before proceeding. Review it — check for obvious gaps (e.g., major candidates missing, wrong district).

#### Phase C: Research (run in parallel)

For each candidate in the manifest, spawn a `researcher` subagent:
```
Research candidate: [NAME], [PARTY], running for [OFFICE]
Contest ID: [ID from manifest]
Save evidence file to: research/[slug].json
```

For ballot measures, spawn a `researcher` subagent:
```
Research ballot measure: [NAME/NUMBER]
State: [STATE], Election: [DATE]
Save evidence file to: research/measure-[slug].json
```

Run these in parallel — don't wait for one to finish before starting the next.

#### Phase D: Scoring

Once all research files exist, spawn a `scorer` subagent for each:
```
Score candidate using evidence file: research/[slug].json
Scoring methodology: references/SCORING_METHODOLOGY.md
Save scores to: scored/[slug].json
```

Again, run in parallel.

#### Phase E: Output

Once all scored files exist, spawn the `output-writer` subagent:
```
Generate TypeScript output from all files in scored/
Contest manifest: discovery-manifest.json
Write to: output/candidates.ts and output/ballotMeasures.ts
```

#### Phase F: Review summary

After the pipeline completes, print a summary:
- Candidates scored (with confidence levels)
- Ballot measures scored
- Any gaps or low-confidence warnings
- Files written

### Pipeline principles

**Evidence floors**: Only score axes where evidence exists. Don't fill gaps with neutral 5s.

**Voting record > stated position**: When they conflict, the vote wins. Flag the discrepancy in notes.

**Confidence levels**: HIGH = multiple independent sources. MEDIUM = one strong source. LOW = inference from background/biography only.

**First-time candidates**: Will have fewer scored axes. That's correct — don't fabricate scores to fill them out.

**Flag controversial nuances**: If a candidate's stated 2026 position conflicts with their prior record (e.g., Rogers on abortion), note this explicitly in the evidence JSON so the scorer can surface it.

### Pipeline file structure

```
ballot-builder-agent/
├── discovery-manifest.json          ← produced by discovery agent
├── research/
│   ├── [candidate-slug].json        ← raw evidence per candidate
│   └── measure-[slug].json          ← raw evidence per measure
├── scored/
│   ├── [candidate-slug].json        ← scored output per candidate
│   └── measure-[slug].json          ← scored output per measure
├── output/
│   ├── candidates.ts                ← final TypeScript
│   └── ballotMeasures.ts            ← final TypeScript
└── references/
    ├── SCORING_METHODOLOGY.md       ← full scoring rubric
    └── SCHWARTZ_VALUES.md           ← value definitions and scoring guide
```

### Pipeline subagents (defined in `.claude/agents/`)

| Agent | File | Model | Purpose |
|-------|------|-------|---------|
| `discovery` | `.claude/agents/discovery.md` | sonnet | Builds candidate/measure manifest from web research |
| `researcher` | `.claude/agents/researcher.md` | sonnet | Gathers raw evidence for one candidate or measure |
| `scorer` | `.claude/agents/scorer.md` | opus | Applies scoring methodology to evidence → scored JSON |
| `output-writer` | `.claude/agents/output-writer.md` | sonnet | Converts scored JSON → TypeScript data files |
