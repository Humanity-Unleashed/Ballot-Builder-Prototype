# Ballot Builder - Implementation Status

**Last Updated:** January 16, 2026
**Current Branch:** `prototype/backend`
**Status:** Prototype Phase

---

## Overview

This document tracks what has been implemented, what's needed for a minimum viable prototype, and what's planned for future iterations.

> **Quick Links:**
> - [What's Working Now](#whats-working-now)
> - [Prototype Next Steps](#prototype-next-steps)
> - [Future Roadmap](#future-roadmap)

---

## Terminology

| Term | Meaning |
|------|---------|
| **Civic Blueprint** | The user's political profile - their stance on various policy axes |
| **Civic Assessment** | The swipe-based questionnaire that builds the Civic Blueprint |
| **Civic Axes** | The 12 policy dimensions used to measure political stance (e.g., "Economic Freedom", "Social Welfare") |
| **Assessment Items** | The 97 statements users swipe on during the Civic Assessment |
| **Blueprint Profile** | The data structure storing a user's Civic Blueprint |

> **Note on PRD terminology:** The PRD refers to "Policy Statements" (50 items across 10 categories). The implementation evolved this into "Civic Axes" (97 items across 12 axes grouped into 4 domains). Same concept, improved structure.

---

## What's Working Now

### Frontend (React Native + Expo)

#### Screens
| Screen | File | Status | Notes |
|--------|------|--------|-------|
| Welcome/Splash | `app/index.tsx` | ✅ Complete | Entry point with navigation |
| Login | `app/(auth)/login.tsx` | ✅ UI Complete | Auth bypassed in prototype |
| Register | `app/(auth)/register.tsx` | ✅ UI Complete | Auth bypassed in prototype |
| Home Dashboard | `app/(tabs)/home.tsx` | ✅ Complete | Progress cards, navigation |
| Civic Assessment | `app/(tabs)/civic-assessment.tsx` | ✅ Complete | Swipe questionnaire that builds Civic Blueprint |
| Civic Blueprint Viewer | `app/(tabs)/blueprint.tsx` | ✅ Basic | View/edit axes and domains (advanced visualizations planned for Phase 2) |
| Ballot Browser | `app/(tabs)/ballot.tsx` | ⚠️ Skeleton | Hardcoded data, no item details |
| Persona Selection | `app/(tabs)/persona-selection.tsx` | ✅ Complete | Test user selection (dev tool) |
| Profile/Settings | `app/(tabs)/profile.tsx` | ⚠️ Partial | Basic layout only |

#### Components
| Component | Status | Notes |
|-----------|--------|-------|
| SwipeCard | ✅ Complete | Gesture-based with animations |
| BlueprintSlider | ✅ Complete | Discrete 0-10 slider |
| ConfidenceGauge | ✅ Complete | Visual progress indicator |
| EvidenceDrawer | ✅ Complete | Shows scoring rationale |
| PersonaCard | ✅ Complete | Persona display |
| Button | ✅ Complete | Primary/outline variants |
| Input | ✅ Complete | Text input with styling |

#### State Management
| Context | Status | Notes |
|---------|--------|-------|
| AuthContext | ⚠️ Prototype Mode | Bypasses auth, creates mock user |
| BlueprintContext | ✅ Complete | Full profile management, scoring |

#### Services
| Service | Status | Notes |
|---------|--------|-------|
| API Client | ✅ Complete | Axios with token refresh interceptor |
| authApi | ✅ Complete | register, login, logout, getCurrentUser |
| blueprintApi | ✅ Complete | statements, responses, progress |
| civicAxesApi | ✅ Complete | Full civic axes API integration |

### Backend (Express + TypeScript)

#### API Routes
| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api` | ✅ Complete | API info and endpoint list |
| **Civic Axes** | | |
| `GET /api/civic-axes/spec` | ✅ Complete | Full specification |
| `GET /api/civic-axes/summary` | ✅ Complete | Spec metadata |
| `GET /api/civic-axes/domains` | ✅ Complete | All domains |
| `GET /api/civic-axes/domains/:id` | ✅ Complete | Domain with axes |
| `GET /api/civic-axes/axes` | ✅ Complete | All axes |
| `GET /api/civic-axes/axes/:id` | ✅ Complete | Single axis |
| `GET /api/civic-axes/items` | ✅ Complete | Filterable items |
| `GET /api/civic-axes/items/:id` | ✅ Complete | Single item |
| `GET /api/civic-axes/session` | ✅ Complete | Balanced session selection |
| `POST /api/civic-axes/score` | ✅ Complete | Score responses |
| `GET /api/civic-axes/tags` | ✅ Complete | All tags |
| `GET /api/civic-axes/response-scale` | ✅ Complete | Response mapping |
| **Personas** | | |
| `GET /api/personas` | ✅ Complete | List test personas |
| `GET /api/personas/:id` | ✅ Complete | Single persona |
| `GET /api/personas/:id/preferences` | ✅ Complete | Persona preferences |
| **Blueprint** | | |
| `GET /api/blueprint/statements` | ✅ Complete | Policy statements |
| `GET /api/blueprint/statements/:area` | ✅ Complete | Statements by area |
| `GET /api/blueprint/areas` | ✅ Complete | Issue areas |
| `GET /api/blueprint/start` | ✅ Complete | Starting statement |
| `GET /api/blueprint/next` | ✅ Complete | Adaptive next statement |
| **Ballot** | | |
| `GET /api/ballot` | ✅ Complete | Get default ballot |
| `GET /api/ballot/summary` | ✅ Complete | Overall data summary |
| `GET /api/ballot/all` | ✅ Complete | List all ballots |
| `GET /api/ballot/:ballotId` | ✅ Complete | Get specific ballot |
| `GET /api/ballot/:ballotId/summary` | ✅ Complete | Ballot summary stats |
| `GET /api/ballot/:ballotId/contests` | ✅ Complete | Contests from ballot |
| `GET /api/ballot/:ballotId/measures` | ✅ Complete | Measures from ballot |
| `GET /api/ballot/:ballotId/items/:itemId` | ✅ Complete | Specific ballot item |
| **Contests** | | |
| `GET /api/contests` | ✅ Complete | List all contests |
| `GET /api/contests/:contestId` | ✅ Complete | Contest with candidates |
| `GET /api/contests/:contestId/candidates` | ✅ Complete | Candidates for contest |
| **Measures** | | |
| `GET /api/measures` | ✅ Complete | List all measures |
| `GET /api/measures/:measureId` | ✅ Complete | Specific measure |
| **Candidates** | | |
| `GET /api/candidates` | ✅ Complete | List candidates (?contestId=) |
| `GET /api/candidates/:candidateId` | ✅ Complete | Candidate with context |
| `GET /api/candidates/:candidateId/context` | ✅ Complete | Context records (?topicId=) |
| `GET /api/candidates/:candidateId/sources` | ✅ Complete | Source references |

#### Data Storage
| Type | Status | Notes |
|------|--------|-------|
| Civic Axes Spec | ✅ TypeScript | `civicAxes/civic_axes_spec_v1.json` (97 items) |
| Policy Statements | ✅ TypeScript | `statements.ts` |
| Adaptive Flow | ✅ TypeScript | `adaptiveFlow.ts` |
| Test Personas | ✅ TypeScript | `personas/personas.ts` (4 personas) |
| **Ballot Data** | ✅ TypeScript | `ballot/` module |
| - Ballots | ✅ TypeScript | `ballot/ballot.ts` (sample ballots by county) |
| - Contests | ✅ TypeScript | `ballot/contests.ts` (Governor, State Senate) |
| - Measures | ✅ TypeScript | `ballot/measures.ts` (propositions) |
| - Candidates | ✅ TypeScript | `ballot/candidates.ts` (5 candidates) |
| - Candidate Context | ✅ TypeScript | `ballot/candidateContext.ts` (quotes, records, sources) |
| - Policy Topics | ✅ TypeScript | `policyTopics.ts` (housing, economy, climate, etc.) |

#### Architecture
| Component | Status | Notes |
|-----------|--------|-------|
| Express server | ✅ Complete | With middleware stack |
| Route/Controller/Service layers | ✅ Complete | Clean separation |
| Input validation | ✅ Complete | express-validator |
| Error handling | ✅ Complete | Global error handler |
| Logging | ✅ Complete | Winston + Morgan |
| Security | ✅ Complete | Helmet, CORS, rate limiting |

### Scoring Algorithm
| Feature | Status | Notes |
|---------|--------|-------|
| Axis scoring | ✅ Complete | Weighted by response strength |
| Shrinkage factor | ✅ Complete | Pulls toward neutral with few responses |
| Normalization | ✅ Complete | -10 to +10 scale |
| Confidence calculation | ✅ Complete | Based on response count |
| Cosine similarity | ✅ Complete | In frontend utils |

---

## What's NOT Working / Missing

### Critical Gaps
| Feature | Status | Impact |
|---------|--------|--------|
| Database | ❌ Not connected | No data persistence |
| User authentication | ⚠️ Bypassed | No real user accounts |
| User data persistence | ❌ Missing | Profiles lost on refresh |
| Frontend ballot integration | ⚠️ Not connected | API exists, frontend uses hardcoded data |
| Ballot item details | ❌ Missing | Can't view/select items |
| Ballot-user matching | ❌ Missing | No recommendations |

### Database (Designed but not connected)
A Prisma schema exists at `backend/_database/prisma/schema.prisma` with tables for:
- Users, RefreshTokens, UserProfiles
- UserDistricts, PolicyStatements, UserResponses
- UserConfidenceAreas, Elections, BallotItems
- Candidates, UserBallotSelections

**Status:** Schema designed, PostgreSQL not connected.

---

## Prototype Next Steps

These are the minimum requirements to have a demonstrable end-to-end prototype:

### ✅ COMPLETED: Ballot API (Priority 2)

The backend ballot API is now fully implemented:
- `GET /api/ballot` - Default ballot, list all, by ID
- `GET /api/contests` - List contests, by ID, with candidates
- `GET /api/measures` - List measures, by ID
- `GET /api/candidates` - List candidates, by ID, with context/sources

**Data available:** Sample ballot with Governor + State Senate contests, 5 candidates with context records (quotes, voting records, sources), and ballot measures.

---

### Priority 1: Frontend Ballot Integration

**Goal:** Connect frontend to ballot API and display real data

| Task | Complexity | Notes |
|------|------------|-------|
| Add ballot API to frontend `api.ts` | Easy | ballotApi module |
| Update `ballot.tsx` to fetch from API | Easy | Replace hardcoded data |
| Add loading/error states | Easy | Standard pattern |

**Files to modify:**
- `frontend/services/api.ts` (add ballotApi)
- `frontend/app/(tabs)/ballot.tsx` (fetch from API)

### Priority 2: Ballot Item Detail Screen

**Goal:** User can navigate from ballot list → item detail → make selection

| Task | Complexity | Notes |
|------|------------|-------|
| Create BallotItemDetail screen | Medium | Show candidate/measure info |
| Create CandidateCard component | Medium | Display candidate with context |
| Create MeasureCard component | Medium | Display measure with Yes/No explanation |
| Add navigation from ballot list | Easy | TouchableOpacity → router.push |
| Implement selection UI | Medium | Radio buttons for candidates, Yes/No for measures |

**Files to create:**
- `app/(tabs)/ballot/[itemId].tsx` (new)
- `components/CandidateCard.tsx` (new)
- `components/MeasureCard.tsx` (new)

### Priority 3: Ballot Selection State

**Goal:** Track and persist user's ballot selections

| Task | Complexity | Notes |
|------|------------|-------|
| Create BallotContext | Medium | Similar to BlueprintContext |
| Store selections in context | Easy | Map of itemId → selection |
| Show selection status on list | Easy | Update icons based on selection |
| Persist to SecureStore | Easy | Same pattern as blueprint |

**Files to create:**
- `context/BallotContext.tsx` (new)

### Priority 4: Basic Matching Display

**Goal:** Show confidence scores on ballot items using existing scoring

| Task | Complexity | Notes |
|------|------------|-------|
| Add policy topic mappings to candidates | Medium | Map candidate context to civic axes |
| Create matching calculation | Medium | Compare user blueprint to candidate positions |
| Display confidence on ballot items | Easy | ConfidenceGauge component exists |
| Add "Why this match?" explanation | Medium | Similar to EvidenceDrawer |

### Priority 5: Persist Blueprint to Backend

**Goal:** Save user's blueprint profile to backend (still in-memory, but API-driven)

| Task | Complexity | Notes |
|------|------------|-------|
| Create blueprint save endpoint | Medium | `POST /api/blueprint/profile` |
| Create blueprint load endpoint | Easy | `GET /api/blueprint/profile/:userId` |
| Update BlueprintContext to sync | Medium | Save on changes, load on init |
| Add user ID tracking | Easy | Generate UUID on first visit |

---

## Future Roadmap

### Iteration 1: Data Persistence

**Goal:** Real database with user accounts

#### Database Setup
| Task | Notes |
|------|-------|
| Set up PostgreSQL (local Docker or cloud) | Use existing docker-compose or Supabase/Neon |
| Connect Prisma to database | Update `schema.prisma` datasource |
| Run migrations | `npx prisma migrate dev` |
| Update services to use Prisma | Replace JSON file reads with DB queries |

#### User Persistence
| Task | Notes |
|------|-------|
| Implement user creation | Hash passwords, store in DB |
| Implement user lookup | By email for login |
| Store user profiles | Preference vectors, settings |
| Store user responses | Assessment answers |
| Store ballot selections | User's choices |

### Iteration 2: Authentication

**Goal:** Secure user accounts with JWT

#### Backend Auth
| Task | Notes |
|------|-------|
| Create `/api/auth/register` | Validate email, hash password, create user |
| Create `/api/auth/login` | Verify credentials, issue tokens |
| Create `/api/auth/refresh` | Refresh token rotation |
| Create `/api/auth/logout` | Invalidate refresh token |
| Add auth middleware | Verify JWT on protected routes |

#### Frontend Auth
| Task | Notes |
|------|-------|
| Remove prototype bypass | Delete `PROTOTYPE_MODE` logic |
| Implement real login flow | Call auth API, store tokens |
| Handle token expiration | Refresh or redirect to login |
| Protect routes | Redirect unauthenticated users |

### Iteration 3: District Lookup

**Goal:** Convert address to electoral districts

#### Address Entry
| Task | Notes |
|------|-------|
| Create district entry screen | State dropdown, address input |
| Add address validation | Basic format checking |
| Store user address | In user profile |

#### District API Integration (Choose One)
| Option | Pros | Cons |
|--------|------|------|
| Manual entry | No API needed, works now | User burden |
| Census Geocoder | Free, official | Complex setup |
| Google Civic API | Comprehensive | May be deprecated |
| Cicero API | Reliable | Paid service |

#### Implementation
| Task | Notes |
|------|-------|
| Create district lookup service | Abstract API choice |
| Create `/api/districts/lookup` | Accept address, return districts |
| Store user districts | Link to user profile |
| Filter ballot by district | Only show relevant items |

### Iteration 4: Real Ballot Data

**Goal:** Integrate with Ballotpedia or similar

#### Ballotpedia Integration
| Task | Notes |
|------|-------|
| Contact Ballotpedia | data@ballotpedia.org for API access |
| Build API client | Handle auth, rate limits |
| Create ingestion pipeline | Transform to our schema |
| Cache ballot data | Don't re-fetch constantly |
| Build admin ingestion UI | Trigger imports |

#### Ballot Matching
| Task | Notes |
|------|-------|
| Generate candidate embeddings | From policy positions |
| Generate measure embeddings | From text content |
| Implement matching algorithm | Cosine similarity exists |
| Create recommendation explanations | "Because you support X..." |

### Iteration 5: AI Features

**Goal:** LLM-powered summaries and chat

#### LLM Integration
| Task | Notes |
|------|-------|
| Set up LLM provider | Deep Infra, Novita, or OpenAI |
| Create LLM service abstraction | Provider-agnostic interface |
| Implement caching layer | Don't regenerate summaries |
| Add cost tracking | Monitor token usage |

#### AI Summaries
| Task | Notes |
|------|-------|
| Generate ballot measure summaries | Plain language explanations |
| Generate candidate summaries | Policy positions, background |
| Generate Yes/No outcome explanations | What happens if... |
| Review/approval workflow | Human verification option |

#### AI Chatbot
| Task | Notes |
|------|-------|
| Build RAG infrastructure | Index ballot data |
| Create chat service | Context-aware responses |
| Build chat UI | Floating button, message panel |
| Add source citations | Link to original data |

### Iteration 6: Polish & Scale

**Goal:** Production-ready application

| Feature | Notes |
|---------|-------|
| Push notifications | Election reminders |
| PDF export | Printable ballot guide |
| Poll locator | Find voting location |
| Offline support | Cache critical data |
| Performance optimization | Lazy loading, caching |
| Analytics | Track user behavior |
| A/B testing | Experiment framework |

---

## Architecture Decisions

### Current (Prototype)
```
┌─────────────────┐     ┌─────────────────┐
│  React Native   │────▶│  Express API    │
│  (Expo)         │     │  (TypeScript)   │
└─────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  SecureStore    │     │  JSON Files     │
│  (local only)   │     │  (in-memory)    │
└─────────────────┘     └─────────────────┘
```

### Target (Production)
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Native   │────▶│  Express API    │────▶│  PostgreSQL     │
│  (Expo)         │     │  (TypeScript)   │     │  (Prisma ORM)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       ▼                       │
        │               ┌─────────────────┐            │
        │               │  Redis Cache    │            │
        │               └─────────────────┘            │
        │                       │
        │                       ▼
        │               ┌─────────────────┐     ┌─────────────────┐
        │               │  LLM Service    │────▶│  Vector DB      │
        │               │  (Deep Infra)   │     │  (Qdrant)       │
        │               └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│  Push Service   │     │  External APIs  │
│  (FCM/APNs)     │     │  (Ballotpedia)  │
└─────────────────┘     └─────────────────┘
```

---

## File Reference

### Key Frontend Files
```
frontend/
├── app/
│   ├── (tabs)/
│   │   ├── civic-assessment.tsx   # Swipe assessment flow
│   │   ├── blueprint.tsx          # Profile viewer/editor
│   │   ├── ballot.tsx             # Ballot browser (skeleton)
│   │   └── home.tsx               # Dashboard
│   └── (auth)/
│       ├── login.tsx              # Login form
│       └── register.tsx           # Registration form
├── context/
│   ├── AuthContext.tsx            # Auth state (prototype mode)
│   └── BlueprintContext.tsx       # Blueprint profile state
├── components/
│   ├── SwipeCard.tsx              # Gesture-based card
│   ├── BlueprintSlider.tsx        # 0-10 slider
│   └── ConfidenceGauge.tsx        # Progress indicator
├── services/
│   └── api.ts                     # Axios client + API modules
└── utils/
    └── scoring.ts                 # Cosine similarity, confidence
```

### Key Backend Files
```
backend/
├── src/
│   ├── index.ts                   # Express app setup
│   ├── routes/
│   │   ├── index.ts               # Route aggregation
│   │   ├── civicAxes.ts           # Civic axes routes
│   │   ├── blueprint.ts           # Blueprint routes
│   │   ├── ballot.ts              # Ballot routes
│   │   ├── contests.ts            # Contest routes
│   │   ├── measures.ts            # Measure routes
│   │   ├── candidates.ts          # Candidate routes
│   │   └── personas.ts            # Persona routes
│   ├── controllers/
│   │   ├── civicAxesController.ts # Civic axes handlers
│   │   ├── blueprintController.ts # Blueprint handlers
│   │   ├── ballotController.ts    # Ballot/contest/measure/candidate handlers
│   │   └── personaController.ts   # Persona handlers
│   ├── services/
│   │   ├── civicAxesService.ts    # Civic axes business logic
│   │   ├── blueprintService.ts    # Blueprint business logic
│   │   └── ballotService.ts       # Ballot business logic
│   └── data/
│       ├── civicAxes/
│       │   ├── index.ts           # Data access + scoring
│       │   └── civic_axes_spec_v1.json
│       ├── ballot/
│       │   ├── index.ts           # Ballot data exports
│       │   ├── ballot.ts          # Sample ballots
│       │   ├── contests.ts        # Contest definitions
│       │   ├── measures.ts        # Measure definitions
│       │   ├── candidates.ts      # Candidate definitions
│       │   └── candidateContext.ts # Quotes, records, sources
│       ├── statements.ts
│       ├── policyTopics.ts        # Policy topic definitions
│       └── personas/
│           └── personas.ts
└── _database/
    └── prisma/
        └── schema.prisma          # Database schema (not connected)
```

---

## Quick Start for Contributors

### Running the Prototype
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npx expo start
```

### Current Prototype Flow
1. App opens → Welcome screen
2. "Get Started" → Bypasses auth → Home dashboard
3. "Start Assessment" → Civic Assessment swipe flow
4. Complete assessment → View Civic Blueprint
5. Can edit axis values and domain importance
6. Ballot tab shows skeleton (not functional)

### What You Can Demo
- Complete Civic Assessment (swipe through 15 questions)
- View calculated axis scores with confidence
- Edit Civic Blueprint manually
- View evidence for why axes were scored
- Switch between test personas

---

*This document should be updated as implementation progresses.*
