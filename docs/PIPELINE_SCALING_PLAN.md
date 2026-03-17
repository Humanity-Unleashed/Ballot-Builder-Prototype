# Pipeline Scaling Plan: Strategy A — Close the Output-Writer Gap

> **Status:** Planned (not yet implemented)
> **Goal:** Eliminate the manual integration step so the pipeline produces drop-in TypeScript files
> **Estimated effort:** 1 day
> **Impact:** Cuts per-state integration from 1-3 hours of manual work to a quick review

---

## Problem Statement

The current 4-agent pipeline (discovery → research → scoring → output) works, but the output-writer produces files that don't match what the app actually imports. A human must spend 1-3 hours per state manually reshaping the output into app-format TypeScript. This is the #1 bottleneck for scaling to more states.

### What the output-writer currently produces

```
output/candidates.ts    — flat Candidate[] array, no Contest/Ballot wrappers, no axisEvidence
output/ballotMeasures.ts — flat BallotMeasure[] array, wrong type names
output/PIPELINE_SUMMARY.md
```

### What the app actually needs (per state)

```
src/server/data/ballot/{state}Data.ts  — Candidates grouped into Contests, wrapped in a Ballot, with axisEvidence
src/server/data/ballot/ids.ts          — New BALLOT_IDS, CONTEST_IDS, MEASURE_IDS entries
src/server/data/ballot/ballot.ts       — Import and register the new ballot
```

---

## Three Gaps to Close

### Gap 1: axisEvidence is lost in translation

**Current state:** The research JSON contains source URLs (in `scorecards[].url`, `campaignWebsite.statedPositions[].sourceUrl`, etc.). The scored JSON contains per-axis `sources` arrays with text descriptions. But the output-writer drops all of this — the final TypeScript has no `axisEvidence` field.

**What the app expects:**
```typescript
axisEvidence: {
  econ_safetynet: [
    { text: 'Medicaid expansion signing (2023)', url: 'https://governor.nc.gov/...' },
    { text: 'NC AFL-CIO endorsement', url: 'https://aflcionc.org/...' },
  ],
  climate_ambition: [
    { text: 'LCV lifetime score: 98%', url: 'https://scorecard.lcv.org/...' },
  ],
},
```

**Fix:** Update the output-writer agent to:
1. Read both the scored JSON and the research JSON for each candidate
2. For each scored axis, pull the `sources` array from the scored JSON
3. Match those sources back to URLs in the research JSON
4. Emit the `axisEvidence` field with `{ text, url? }[]` entries

### Gap 2: No Contest/Ballot/Measure structure

**Current state:** Output-writer produces a flat `Candidate[]` array. The app needs candidates grouped into `Contest` objects, measures as `Measure` objects, and everything wrapped in a `Ballot`.

**What the app expects:**
```typescript
import type { Candidate, Contest, Measure, Ballot } from '../../types';
import { BALLOT_IDS, CONTEST_IDS, MEASURE_IDS } from './ids';

const candidatesNCSenate: Candidate[] = [ /* ... */ ];
const candidatesNCHouse02: Candidate[] = [ /* ... */ ];

const ncSenateContest: Contest = {
  id: CONTEST_IDS.NC_US_SENATE,
  type: 'candidate',
  name: 'U.S. Senate',
  state: 'NC',
  candidates: candidatesNCSenate,
};

const voterIdMeasure: Measure = {
  id: MEASURE_IDS.NC_VOTER_ID,
  type: 'measure',
  /* ... full measure data ... */
};

export const northCarolinaBallot: Ballot = {
  id: BALLOT_IDS.NC_2026,
  electionDate: '2026-11-03T00:00:00.000Z',
  electionType: 'General Election',
  state: 'North Carolina',
  county: 'Statewide',
  items: [ncSenateContest, ncHouse02Contest, voterIdMeasure],
};
```

**Fix:** Update the output-writer to:
1. Use the discovery manifest to know which candidates belong to which contest
2. Generate `Contest` objects grouping candidates by race
3. Generate `Measure` objects from scored measure data
4. Generate the `Ballot` wrapper combining everything
5. Use correct import paths (`../../types` not `../types/ballot`)

### Gap 3: IDs and registration files not generated

**Current state:** After the output-writer finishes, a human must manually:
- Add entries to `ids.ts` (BALLOT_IDS, CONTEST_IDS, MEASURE_IDS)
- Add an import + registration in `ballot.ts`
- Make sure the `positions` field is populated (output-writer uses `keyPositions`, app uses `positions`)

**Fix:** Update the output-writer to also generate:
1. A snippet for `ids.ts` with the new constants (or a complete replacement file)
2. The import line and `ballots[]` entry for `ballot.ts`
3. Use `positions` as the field name (matching the `Candidate` type), not `keyPositions`

---

## Implementation Plan

### Step 1: Update output-writer agent definition

Rewrite `.claude/agents/output-writer.md` to produce the app-native format. Key changes:

- **Template change:** Instead of a flat `Candidate[]`, generate a full `{state}Data.ts` file with Contest/Measure/Ballot wrappers
- **Input change:** Read both `scored/*.json` AND `research/*.json` (for URLs)
- **Type alignment:** Use the exact field names from `src/server/types/index.ts`:
  - `positions` (not `keyPositions`)
  - `profileSummary` ✓ (already correct)
  - `axisStances` ✓ (already correct)
  - `valueStances` ✓ (already correct)
  - `axisEvidence` (new — must be generated)
- **Import paths:** `../../types` (not `../types/ballot`)
- **ID constants:** Reference `BALLOT_IDS.XX`, `CONTEST_IDS.XX`, `MEASURE_IDS.XX`

### Step 2: Add IDs generation

The output-writer should produce an `output/ids-snippet.ts` file:

```typescript
// Add these to src/server/data/ballot/ids.ts

// In BALLOT_IDS:
NC_2026: 'nc-2026-general',

// In CONTEST_IDS:
NC_US_SENATE: 'NC-US-SENATE-2026',
NC_HOUSE_02: 'NC-02-US-HOUSE-2026',

// In MEASURE_IDS:
NC_VOTER_ID: 'nc-2026-voter-id-amendment',
```

### Step 3: Add ballot registration snippet

The output-writer should produce an `output/ballot-registration.ts` snippet:

```typescript
// Add to src/server/data/ballot/ballot.ts

import { northCarolinaBallot } from './northCarolinaData';

// Add to ballots[]:
northCarolinaBallot,
```

### Step 4: Validate with existing states

Test the updated output-writer against one existing state (e.g., NC) by:
1. Running it against the existing scored data
2. Comparing its output to the manually-written `northCarolinaData.ts`
3. Confirming `npx tsc --noEmit` passes with the generated file

---

## After Strategy A: What's Next

### Strategy B: Programmatic Scoring Engine (CLAUDE.md Phase 4)

Replace the Opus scorer agent for candidates with structured data sources:

| Data Source | API | Covers | Axes |
|---|---|---|---|
| Interest group ratings | Vote Smart API | Incumbents with ratings | Most axes |
| Voting records | ProPublica (federal), Open States (state) | Legislators | High-signal axes |
| Campaign finance | OpenSecrets / FEC | All candidates | Indirect signals |

This cuts the most expensive step (Opus scoring at ~$1-2/candidate) by 60-80%. Claude would only score first-time candidates and local races without structured data.

### Strategy C: Pipeline-as-a-Service

Queue-based architecture for fully automated pipeline runs:

```
Election calendar trigger
    → Discovery job (per race)
    → Research jobs (per candidate, parallel)
    → Scoring jobs (API-first, Claude fallback)
    → Output generation
    → Human review dashboard
    → One-click publish to app
```

This requires Strategies A and B to be solid first.

---

## Current Pipeline Cost Estimates

| Component | Per Candidate | Per State (avg 15 candidates) |
|---|---|---|
| Discovery (Sonnet) | — | ~$1 |
| Research (Sonnet) | ~$0.15-0.50 | ~$5 |
| Scoring (Opus) | ~$0.50-1.50 | ~$15 |
| Output (Sonnet) | — | ~$1 |
| **Total (agent costs)** | **~$0.65-2.00** | **~$22** |
| Manual integration | — | **1-3 hours human time** |

After Strategy A, the "manual integration" row drops to ~15 minutes of review.

After Strategy B, the "Scoring" row drops by 60-80% for states with incumbents.

---

## File Reference

| File | Role |
|---|---|
| `.claude/agents/output-writer.md` | Agent definition to update |
| `.claude/agents/discovery.md` | Produces manifests (no changes needed) |
| `.claude/agents/researcher.md` | Produces research JSONs (no changes needed) |
| `.claude/agents/scorer.md` | Produces scored JSONs (no changes needed) |
| `src/server/types/index.ts` | Canonical `Candidate`, `Contest`, `Measure`, `Ballot` types |
| `src/server/data/ballot/ids.ts` | ID constants |
| `src/server/data/ballot/ballot.ts` | Ballot registry |
| `src/server/data/ballot/{state}Data.ts` | Per-state data files (target output format) |
| `references/SCORING_METHODOLOGY.md` | Scoring rubric (used by scorer agent) |
| `references/SCHWARTZ_VALUES.md` | Value definitions (used by scorer agent) |
