# CLAUDE.md — Ballot Builder Production Implementation Brief

> **For Claude Code:** This document is the single source of truth for turning the Ballot Builder prototype into a production application. Read this file, then explore the repo to understand the current state before making changes.
>
> **What this document IS:** Pre-researched decisions, concrete implementation tasks, and architectural guidance tied to this specific codebase.
>
> **What this document is NOT:** A research prompt. All API selection, pricing analysis, and launch strategy decisions are already made. Do not re-research these — execute against them.

---

## Step 0: Understand the Current Repo

Before doing anything, familiarize yourself with the project structure:

1. Read the docs in `docs/` — especially `ARCHITECTURE.md` for the full system overview.
2. Scan the key directories:
   - `src/server/data/` — Static TypeScript data that will eventually be replaced by live API calls
   - `src/server/services/` — Business logic (scoring, ballot retrieval)
   - `src/stores/` — Zustand stores (currently localStorage-persisted)
   - `src/lib/ballotHelpers.ts` — The recommendation engine (pure functions)
   - `src/lib/scoring.ts` — Client-side scoring utilities
   - `src/lib/archetypes.ts` — Archetype classification
   - `src/components/blueprint/ElectionBanner.tsx` — Currently shows "Coming Soon" modals
   - `src/components/ui/PrototypeModal.tsx` — The placeholder modal to eventually remove
   - `src/app/api/` — 53 API route handlers across 13 domains
   - `prisma/` — Current schema (AnalyticsEvent, FeedbackEntry, BallotCache, VoterInfoCache, ZipcodeLookup + better-auth models)
3. Run `npx tsc --noEmit` to confirm the project type-checks cleanly before making changes.
4. Run `npm test` to see current test coverage.

---

## Phase 1: Database Schema Expansion

### Context
The app uses Neon PostgreSQL via Prisma for analytics, feedback, ballot caching, voter info caching, and zipcode lookups. Auth models (User, Account, Session, Verification) are managed by better-auth. All user *profile* data still lives in localStorage via Zustand stores (`userStore.ts`, `schwartzStore.ts`, `ballotStore.ts`, `demographicStore.ts`). We need to expand the DB to be the system of record for user profiles while keeping localStorage as a fast local cache.

### Task 1.1: Expand Prisma Schema

Add these new models to `prisma/schema.prisma` (the existing models — `AnalyticsEvent`, `FeedbackEntry`, `BallotCache`, `VoterInfoCache`, `ZipcodeLookup`, and better-auth models — should remain untouched):

```prisma
model UserProfile {
  id                String   @id @default(cuid())
  userId            String   @unique @map("user_id")
  blueprintProfile  Json     @map("blueprint_profile")    // BlueprintProfile type
  schwartzValues    Json?    @map("schwartz_values")       // Schwartz scores
  demographics      Json?    @map("demographics")          // Age, location, etc.
  updatedAt         DateTime @updatedAt @map("updated_at")

  user user @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model CandidateScore {
  id              String   @id @default(cuid())
  candidateId     String   @map("candidate_id")     // External ID from Ballotpedia
  candidateName   String   @map("candidate_name")
  raceId          String   @map("race_id")
  axisId          String   @map("axis_id")           // One of the 15 civic axis IDs
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

  user user @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, electionId])
  @@map("saved_ballots")
}
```

**Note:** The `user` model is managed by better-auth. Add the `UserProfile` and `SavedBallot` relations to it.

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

## Phase 2: Authentication — DONE

### Current State (Completed)

Authentication is implemented using **better-auth** (not Clerk as originally planned):

- **Server config**: `src/lib/auth.ts` — Prisma adapter, Google OAuth, anonymous plugin
- **Client hook**: `src/lib/auth-client.ts` — `useAuth()` with `signInWithGoogle()`, `signInAnonymously()`, `logout()`
- **API route**: `src/app/api/auth/[...all]/route.ts` — catch-all handler
- **Auth pages**: `src/app/(auth)/login/` and `register/` redirect to root (auth handled via better-auth flows)
- **Context**: `src/context/AuthContext.tsx` re-exports `useAuth()` from auth-client

Users can take the assessment without signing up (anonymous mode). The `user` model is managed by better-auth with `User`, `Account`, `Session`, and `Verification` tables.

### Remaining Task 2.1: Profile Persistence on Auth

When a user signs in (from anonymous or OAuth), their localStorage profile should sync to the database. This ties into Phase 1's sync layer (Task 1.2).

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

### Task 3.1: Expand API Client Module

The file **`src/server/services/externalApis.ts`** already exists with initial client functions. Expand it with:

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

### Task 3.2: Expand Ballot Retrieval Service

The file **`src/server/services/liveBallotService.ts`** already exists with initial scaffolding. Expand it to fully replace the static `ballotService.ts`:

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

### The 15 Civic Axes (from `src/server/data/civicAxes/`)

Reference the actual axis IDs and poles from the existing spec. The axes are organized as 5 domains × 3 axes:

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

See `.env.example` for the full list. Variables marked with (existing) are already configured in Vercel.

```env
# Database (existing)
DATABASE_URL=postgresql://...?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://...?sslmode=require

# Auth (existing — better-auth)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Google Sheets — feedback mirroring (existing)
GOOGLE_SHEETS_CLIENT_EMAIL=...
GOOGLE_SHEETS_PRIVATE_KEY=...
GOOGLE_SHEETS_SPREADSHEET_ID=...

# External APIs (needed for Phase 3+)
GOOGLE_CIVIC_API_KEY=...
BALLOTPEDIA_API_KEY=...
VOTE_SMART_API_KEY=...
PROPUBLICA_API_KEY=...
OPENSTATES_API_KEY=...
```

---

## What NOT to Change

- **Assessment logic**: The Civic Blueprint Assessment (slider quiz → shrinkage scoring) and Schwartz Values Assessment (vignettes → ipsatization) are working correctly. Don't modify `civicAxesService.ts` or `schwartzService.ts` scoring algorithms.
- **Archetype system**: The 8 archetypes and 3 meta-dimensions are working. Don't touch `archetypes.ts`.
- **Client-side scoring utilities**: `src/lib/scoring.ts` handles the user-side math. Changes should only be needed on the *candidate data input* side, not the scoring math itself.
- **UI component structure**: The `ballot/`, `blueprint/`, and `schwartz/` component directories are well-organized. Add to them, don't restructure.
