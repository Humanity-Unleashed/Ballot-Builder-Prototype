# Architecture Overview

This document describes the architecture of the Ballot Builder Next.js application.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Application                       │
├─────────────────────────────────────────────────────────────────┤
│  Browser (Client)                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   React     │  │   Zustand   │  │ localStorage│              │
│  │ Components  │◀▶│   Stores    │◀▶│ Persistence │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                 │
│  │ Axios Client│ ──────────────────────────────────────┐        │
│  └─────────────┘                                        │        │
├─────────────────────────────────────────────────────────┼────────┤
│  Server (Next.js API Routes)                            ▼        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    /api/* Route Handlers                     ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        ││
│  │  │ ballot   │ │civic-axes│ │ schwartz │ │candidates│  ...   ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        ││
│  └─────────────────────────────────────────────────────────────┘│
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Services Layer                          ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         ││
│  │  │ballotService │ │civicAxesSvc  │ │schwartzSvc   │   ...   ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘         ││
│  └─────────────────────────────────────────────────────────────┘│
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Data Layer (TypeScript)                   ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        ││
│  │  │ ballot/  │ │civicAxes/│ │ personas/│ │schwartz/ │        ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### Client Layer

#### React Components (`src/components/`)

UI components organized by feature:
- `ballot/` - Ballot browsing (CandidateCard, BallotNavigator, etc.)
- `blueprint/` - Assessment flow (AssessmentView, BlueprintView, sliders)
- `schwartz/` - Schwartz values assessment
- `layout/` - Layout components (TopNav)
- `ui/` - Reusable primitives (Button, Input, Modal)

#### Zustand Stores (`src/stores/`)

Client-side state management with localStorage persistence:

**userStore.ts**
- Civic axes specification (loaded from API)
- User's swipe responses
- Blueprint profile (domain importance, axis values, confidence)
- Axis scores (calculated from API)
- Completion flags

**schwartzStore.ts**
- Schwartz values specification
- User responses to value items
- Ipsatized scores and dimension scores

**ballotStore.ts**
- User's vote selections per ballot item
- Persistent across sessions

**demographicStore.ts**
- User demographic information

**feedbackStore.ts**
- Feedback draft state

All stores implement hydration handling to prevent flash of default content.

#### Context Providers (`src/context/`)

**AuthContext** - Re-exports `useAuth()` from `src/lib/auth-client.ts` (better-auth with Google OAuth + anonymous sessions)
**BlueprintContext** - Blueprint assessment workflow coordination
**FeedbackScreenContext** - Tracks which screen the user is on for contextual feedback collection

### API Layer (`src/app/api/`)

Next.js API routes organized by domain:

| Route Group | Endpoints | Purpose |
|-------------|-----------|---------|
| `/api/analytics/*` | 1 | Event tracking and logging |
| `/api/assessment/*` | 5 | Assessment session management |
| `/api/auth/*` | 1 | better-auth catch-all handler (Google OAuth, anonymous) |
| `/api/ballot/*` | 7 | Ballot data (ballots, contests, measures, zipcode lookup) |
| `/api/blueprint/*` | 5 | Blueprint statements and areas |
| `/api/candidates/*` | 4 | Candidate information and context |
| `/api/civic-axes/*` | 11 | Civic axes spec, items, scoring |
| `/api/contests/*` | 3 | Contest details |
| `/api/feedback/*` | 1 | User feedback collection (mirrored to Google Sheets) |
| `/api/fine-tuning/*` | 4 | Fine-tuning session management |
| `/api/measures/*` | 2 | Ballot measure details |
| `/api/personas/*` | 3 | Test personas (dev tool) |
| `/api/schwartz-values/*` | 4 | Schwartz values spec, scoring, and boosters |

**Total: 53 API route handlers across 13 domains.**

### Services Layer (`src/server/services/`)

Business logic separated from route handlers:

| Service | Responsibility |
|---------|----------------|
| `analyticsService` | Analytics event logging to Postgres |
| `assessmentService` | Session management, progress tracking |
| `ballotService` | Ballot data retrieval, filtering |
| `ballotTransformer` | Ballot data transformation between formats |
| `blueprintService` | Statement generation, area management |
| `civicAxesService` | Axis scoring algorithm (shrinkage estimation) |
| `externalApis` | External API clients (Google Civic, Ballotpedia, VoteAmerica) |
| `feedbackService` | User feedback handling + Google Sheets sync |
| `fineTuningService` | Fine-tuning session state |
| `fvapClient` | Federal Voting Assistance Program client |
| `liveBallotService` | Live ballot retrieval via external APIs |
| `schwartzService` | Schwartz values scoring (ipsatization) |

### Data Layer (`src/server/data/`)

Static data stored as TypeScript modules:

```
data/
├── ballot/
│   ├── ballot.ts         # Sample ballots by county
│   ├── candidates.ts     # Candidate definitions
│   ├── candidateContext.ts # Quotes, records, sources
│   ├── contests.ts       # Contest definitions
│   ├── measures.ts       # Ballot measures
│   └── index.ts          # Exports
├── civicAxes/
│   ├── spec.ts           # Full civic axes specification
│   └── index.ts          # Data access + scoring
├── personas/
│   ├── personas.ts       # Test user personas
│   └── preferences.ts    # Persona policy preferences
├── schwartzValues/
│   ├── spec.ts           # Schwartz values specification
│   └── index.ts          # Exports
├── statements.ts         # Policy statements
└── policyTopics.ts       # Policy topic definitions
```

## Authentication

Authentication is handled by [better-auth](https://www.better-auth.com/) with the following configuration:

- **Server config**: `src/lib/auth.ts` — Prisma adapter, Google OAuth provider, anonymous plugin
- **Client hook**: `src/lib/auth-client.ts` — exports `useAuth()` with `signInWithGoogle()`, `signInAnonymously()`, `logout()`
- **API route**: `src/app/api/auth/[...all]/route.ts` — catch-all handler for better-auth
- **Database models**: `User`, `Account`, `Session`, `Verification` (managed by better-auth)

Users can take the assessment without signing up (anonymous mode). Auth is required for persisting profiles to the database.

## Database Schema (Prisma)

The project uses [Neon Postgres](https://neon.tech) via Prisma ORM. Connection uses PgBouncer for pooling.

### Application Models

| Model | Purpose |
|-------|---------|
| `AnalyticsEvent` | Custom event tracking (sessionId, eventType, screen, properties JSON) |
| `FeedbackEntry` | User feedback submissions (screen, message, optional email) |
| `BallotCache` | Cached ballot data from external APIs (districtHash + electionDate) |
| `VoterInfoCache` | Cached voter registration/deadline info by state |
| `ZipcodeLookup` | Cached zipcode-to-district mappings with lat/lng |

### Auth Models (managed by better-auth)

| Model | Purpose |
|-------|---------|
| `User` | User identity (email, image, isAnonymous) |
| `Account` | OAuth provider details |
| `Session` | Active sessions with tokens |
| `Verification` | Email verification records |

## Data Models

### Civic Axes Hierarchy

```
Spec
└── Domains (5)
    ├── econ - Economic Opportunity & Taxes
    ├── health - Healthcare & Public Health
    ├── housing - Housing & Local Growth
    ├── justice - Public Safety & Justice
    └── climate - Climate, Energy & Environment
        └── Axes (3 per domain = 15 total)
            └── Items (assessment statements)
```

### Blueprint Profile

```typescript
BlueprintProfile {
  profile_version: string
  user_id: string
  updated_at: string
  domains: DomainProfile[] {
    domain_id: string
    importance: number (0-10)
    axes: AxisProfile[] {
      axis_id: string
      value_0_10: number
      source: 'learned_from_swipes' | 'user_edited' | 'default'
      confidence_0_1: number
      locked: boolean
      learning_mode: 'normal' | 'dampened' | 'frozen'
      evidence: {
        n_items_answered: number
        n_unsure: number
        top_driver_item_ids: string[]
      }
    }
  }
}
```

## Request Flow Example

```
1. User drags slider on axis "econ_safetynet"
   │
2. Component calls userStore.setAxisValue()
   │
3. Zustand updates state + persists to localStorage
   │
4. On assessment complete, POST /api/civic-axes/score
   │
5. API route calls civicAxesService.scoreResponses()
   │
6. Service applies scoring algorithm (shrinkage, normalization)
   │
7. Returns AxisScore[] with confidence values
   │
8. Client updates blueprintProfile with scores
   │
9. UI re-renders with updated values
```

## Key Design Decisions

### Full-Stack Next.js
All API routes are colocated with the frontend, eliminating the need for a separate backend service.

### Zustand over Context
Chosen for simpler state updates, built-in persistence middleware, and better devtools support.

### localStorage Persistence
User profile persists across sessions without requiring authentication for the prototype phase.

### TypeScript Data Layer
Static data stored as TypeScript for type safety and IDE support. Can be migrated to a database when needed.

### Hydration Handling
Stores track `_hasHydrated` flag to prevent flash of default content before localStorage loads.

### Analytics

Event tracking uses a dual approach:
- **Vercel Web Analytics** (`@vercel/analytics`) — automatic page view and visitor tracking
- **Custom analytics** — `AnalyticsEvent` records in Postgres for detailed behavioral tracking (screen views, assessment progress, feature usage)

The analytics provider is mounted in the root layout (`src/app/layout.tsx`), and the custom hook (`src/hooks/useAnalytics.ts`) provides `trackEvent()` for components.
