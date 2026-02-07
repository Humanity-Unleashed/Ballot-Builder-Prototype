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

Both stores implement hydration handling to prevent flash of default content.

#### Context Providers (`src/context/`)

**AuthContext** - Authentication state (prototype mode returns mock user)
**BlueprintContext** - Blueprint assessment workflow coordination

### API Layer (`src/app/api/`)

Next.js API routes organized by domain:

| Route Group | Purpose |
|-------------|---------|
| `/api/assessment/*` | Assessment session management |
| `/api/ballot/*` | Ballot data (ballots, contests, measures) |
| `/api/blueprint/*` | Blueprint statements and areas |
| `/api/candidates/*` | Candidate information and context |
| `/api/civic-axes/*` | Civic axes spec, items, scoring |
| `/api/contests/*` | Contest details |
| `/api/fine-tuning/*` | Fine-tuning session management |
| `/api/measures/*` | Ballot measure details |
| `/api/personas/*` | Test personas (dev tool) |
| `/api/schwartz-values/*` | Schwartz values spec and scoring |

### Services Layer (`src/server/services/`)

Business logic separated from route handlers:

| Service | Responsibility |
|---------|----------------|
| `assessmentService` | Session management, progress tracking |
| `ballotService` | Ballot data retrieval, filtering |
| `blueprintService` | Statement generation, area management |
| `civicAxesService` | Axis scoring algorithm, item selection |
| `fineTuningService` | Fine-tuning session state |
| `schwartzService` | Schwartz values scoring |

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
