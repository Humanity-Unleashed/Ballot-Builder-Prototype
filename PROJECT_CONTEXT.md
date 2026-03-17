# Ballot Builder - Project Context

> This document gives an AI agent (or human) everything needed to understand the Ballot Builder webapp. Paste it into a conversation to provide full project context.

## What This Is

Ballot Builder is a **voter decision-support tool** that helps people make informed ballot choices. It works in three steps:

1. **Civic Blueprint Assessment** - A 15-question slider quiz that maps the user onto 15 policy axes across 5 domains (economy, healthcare, housing, justice, climate). Produces a "BlueprintProfile" with confidence scores.
2. **Schwartz Values Assessment** - 10 pick-one vignette scenarios (based on psychology research) that measure relative priorities across 10 basic human values. Optional "booster" question sets deepen specific topics.
3. **Ballot Explorer** - Displays real ballot items (candidates + ballot measures) with personalized recommendations based on the user's profile. Shows match percentages, value-based framing, and demographic impact insights.

The app is a **working prototype** — authentication is mocked, data is static TypeScript (not a live database), and state persists in localStorage.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) with React 19 |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS v4** |
| Animation | **Framer Motion** |
| State | **Zustand** (persisted to localStorage) |
| HTTP Client | **Axios** |
| Database | **Neon PostgreSQL** via Prisma (used only for analytics + feedback) |
| Testing | **Vitest** (unit), **Playwright** (e2e) |
| Icons | **Lucide React** |
| Deployment | **Vercel** |

---

## Project Structure

```
Ballot-Builder-webapp/
├── docs/                          # Detailed documentation (4 files)
│   ├── ARCHITECTURE.md            # System architecture & layers
│   ├── ASSESSMENT_PIPELINE.md     # Scoring algorithms in detail
│   ├── API_ROUTES.md              # All API endpoints
│   └── GETTING_STARTED.md         # Dev setup & patterns
├── e2e/                           # Playwright E2E tests
├── mockups/                       # HTML design prototypes
├── prisma/                        # DB schema (FeedbackEntry, AnalyticsEvent)
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (app)/                 # Authenticated routes
│   │   │   ├── ballot/page.tsx    # Ballot explorer
│   │   │   └── blueprint/page.tsx # Blueprint assessment + results
│   │   ├── (auth)/                # Login/register (mocked)
│   │   ├── api/                   # ~50 API route handlers
│   │   └── page.tsx               # Welcome/landing page
│   ├── components/                # React components by feature
│   │   ├── ballot/                # 13 files - voting UI, recommendations, sliders
│   │   ├── blueprint/             # 12 files - assessment, results, fine-tuning, election banner
│   │   ├── schwartz/              # 9 files - vignettes, boosters, spider chart
│   │   ├── demographics/          # Demographic collection screen
│   │   ├── feedback/              # Floating feedback button
│   │   ├── analytics/             # Analytics session tracking
│   │   └── ui/                    # Button, Input, Modal, ProgressBar, PrototypeModal
│   ├── context/                   # React Contexts (Auth, Blueprint, FeedbackScreen)
│   ├── data/                      # Client-side static data (slider configs, impacts)
│   ├── hooks/                     # Custom hooks (useAnalytics)
│   ├── lib/                       # Client utilities
│   │   ├── archetypes.ts          # 8 civic archetypes + meta-dimensions
│   │   ├── ballotHelpers.ts       # Recommendation computation (pure functions)
│   │   ├── electionDate.ts        # Election day calculation + countdown utilities
│   │   ├── scoring.ts             # Client-side scoring utilities
│   │   └── ...
│   ├── server/                    # Server-side code
│   │   ├── data/                  # Static data sources
│   │   │   ├── ballot/            # Ballots, candidates, contests, measures
│   │   │   ├── civicAxes/         # 15-axis spec with 144 assessment items
│   │   │   └── schwartzValues/    # 10 values, 10 vignettes, boosters
│   │   └── services/              # Business logic
│   │       ├── schwartzService.ts # Schwartz scoring (ipsatization)
│   │       ├── civicAxesService.ts# Civic axes scoring (shrinkage)
│   │       ├── ballotService.ts   # Ballot data retrieval
│   │       └── ...
│   ├── services/
│   │   └── api.ts                 # Axios API client (all endpoints)
│   ├── stores/                    # Zustand stores (all localStorage-persisted)
│   │   ├── userStore.ts           # Blueprint profile, civic axes, swipes
│   │   ├── schwartzStore.ts       # Schwartz values, boosters
│   │   ├── ballotStore.ts         # Saved votes
│   │   └── demographicStore.ts    # User demographics
│   └── types/
│       ├── blueprintProfile.ts    # BlueprintProfile, AxisProfile, DomainProfile
│       └── civicAssessment.ts     # Spec, Axis, Item, SwipeResponse
└── package.json
```

---

## User Flow

```
Welcome Page (/)
      │
      ▼
Blueprint Assessment (/blueprint)
   State machine: intro → demographics → assessment → results
      │
      │  15 slider questions (one per policy axis)
      │  Each slider: 5 positions from Pole A ↔ Pole B
      │  Converts to synthetic swipe responses for scoring
      │
      ▼
Blueprint Results
   - Election countdown banner (collapsible, with voter reg/mail ballot/polling links)
   - 15 axis scores (0-10 scale with confidence)
   - 3 meta-dimensions (responsibility, change tempo, governance style)
   - Archetype classification (1 of 8 animal archetypes)
   - Optional: fine-tune individual axes
      │
      ▼
Ballot Explorer (/ballot)
   - Sequential cards: contests (candidates) then measures
   - Candidate match % based on axis alignment
   - Measure YES/NO recommendations with confidence
   - Demographic impact insights
   - All votes saved to localStorage
```

---

## Core Data Models

### Civic Axes (15 policy spectrums)

5 domains × 3 axes each = 15 axes. 144 assessment items total.

| Domain | Axes |
|--------|------|
| Economic | safety net breadth, public investment, school choice |
| Healthcare | coverage model, cost control, public health approach |
| Housing | zoning/supply, affordability tools, transit priority |
| Justice | police accountability, sentencing goals, firearms policy |
| Climate | ambition level, energy portfolio, permitting speed |

Each axis has two poles (e.g., "Broader Safety Net" ↔ "Conditional Safety Net"). User stance maps to 0-10 where 5 = center.

### BlueprintProfile

```typescript
BlueprintProfile {
  domains: DomainProfile[] {
    domain_id: string
    importance: { value_0_10, source, confidence_0_1 }
    axes: AxisProfile[] {
      axis_id: string
      value_0_10: number       // 0=poleA, 5=center, 10=poleB
      confidence_0_1: number   // Based on evidence
      source: 'learned_from_swipes' | 'user_edited' | 'default'
      locked: boolean          // User can freeze an axis
    }
  }
}
```

### Schwartz Values (10 basic human values)

Organized in a circumplex with 4 higher-order dimensions:
- **Self-Transcendence**: Universalism (Fairness & Equality), Benevolence (Helping Others)
- **Self-Enhancement**: Power (Influence & Leadership), Achievement (Personal Success)
- **Openness to Change**: Self-Direction (Independence), Stimulation (New Experiences), Hedonism (Enjoying Life)
- **Conservation**: Tradition, Conformity (Respect for Rules), Security (Safety & Stability)

Assessed via 10 pick-one vignettes (civic scenarios like budget allocation, immigration policy). Each option maps to one or more values.

### Archetype System

3 meta-dimensions derived from the 15 axes:
- **Responsibility Orientation**: Community-led ↔ Individual-led
- **Change Tempo**: Change-seeking ↔ Stability-seeking
- **Governance Style**: Rules & standards ↔ Flexibility & choice

8 archetypes (Caring Koala, Independent Stallion, Thoughtful Owl, Pragmatic Fox, Steady Turtle, Agile Panther, Principled Elephant, Loyal Retriever) classified by Euclidean distance in this 3D space.

---

## Key Scoring Algorithms

### Civic Axes Scoring

Per axis: `normalized = rawSum / maxPossible` (range [-1, +1]), then shrinkage pulls toward zero with limited evidence:

```
shrunk = normalized × (n_answered / (n_answered + 6))
confidence = n_answered / (n_answered + 6)
value_0_10 = round((1 - shrunk) × 5)
```

### Schwartz Values Scoring

Uses **ipsatization** — scores are relative to the individual's mean rating to remove response bias:

```
ipsatized_score = raw_mean_for_value - individual_mean_across_all_values
```

Vignette responses are expanded: selected option = synthetic score of 5, non-selected options = 1. Booster items (Likert scale) merge in additively.

### Ballot Recommendations

`computePropositionRecommendation()` and `computeCandidateMatches()` in `src/lib/ballotHelpers.ts` calculate weighted alignment between user's axis values and each ballot item's policy positions.

---

## API Architecture

All endpoints live in `src/app/api/`. Key groups:

| Group | Purpose | Key Endpoints |
|-------|---------|---------------|
| `/api/civic-axes/*` | Spec, items, scoring | `GET /spec`, `POST /score` |
| `/api/schwartz-values/*` | Values spec, vignettes, scoring, boosters | `GET /spec`, `POST /score`, `GET /boosters` |
| `/api/ballot/*` | Ballot data | `GET /`, `GET /:id/contests`, `GET /:id/measures` |
| `/api/candidates/*` | Candidate info + context | `GET /:id`, `GET /:id/context` |
| `/api/blueprint/*` | Statement generation | `POST /start`, `GET /next` |
| `/api/assessment/*` | Session management | `POST /start`, `POST /:id/answer` |
| `/api/feedback/` | User feedback → DB + Google Sheets | `POST /` |
| `/api/analytics/` | Event tracking → DB | `POST /` |

Full reference: `docs/API_ROUTES.md`

---

## State Management

Four Zustand stores, all persisted to localStorage:

| Store | Key State | File |
|-------|-----------|------|
| `userStore` | BlueprintProfile, civic axes spec, swipes, completion flags | `src/stores/userStore.ts` |
| `schwartzStore` | Schwartz spec, vignette responses, value scores, booster state | `src/stores/schwartzStore.ts` |
| `ballotStore` | Saved votes, current ballot index | `src/stores/ballotStore.ts` |
| `demographicStore` | Age, location, income, gender + impacts | `src/stores/demographicStore.ts` |

All stores implement `_hasHydrated` flag to prevent flash of default content before localStorage loads.

---

## Recent Feature: Election Banner

A collapsible election countdown banner on the Blueprint results page:
- Calculates days until next US general election (first Tuesday after first Monday in November)
- Shows voter registration check, mail-in ballot request, and polling place finder links
- Links currently show a "Coming Soon" prototype modal (`PrototypeModal` component)
- Utility functions in `src/lib/electionDate.ts`
- Banner component: `src/components/blueprint/ElectionBanner.tsx`

---

## Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type checking (silent = success)
npm test             # Vitest unit tests
npx playwright test  # E2E tests
```

---

## Key Design Decisions

- **Full-stack Next.js**: API routes colocated with frontend, no separate backend
- **Static TypeScript data layer**: All ballot/assessment data is TS modules (type-safe, no DB needed for prototype)
- **localStorage persistence**: Users resume sessions without auth
- **Ipsatization for values**: Removes individual response bias, shows relative priorities
- **Shrinkage for axes**: Prevents overconfident scores with limited evidence
- **Synthetic swipes**: Slider positions converted to swipe events for consistent scoring pipeline

---

## Detailed Documentation

For deeper dives, see the `docs/` directory:
- `docs/ARCHITECTURE.md` — System layers, data flow diagrams, design decisions
- `docs/ASSESSMENT_PIPELINE.md` — Step-by-step scoring algorithms, meta-dimensions, archetypes
- `docs/API_ROUTES.md` — Every endpoint with request/response examples
- `docs/GETTING_STARTED.md` — Dev setup, coding patterns, common gotchas
