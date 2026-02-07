# Ballot Builder

A Next.js application that helps users make informed voting decisions through personalized policy alignment matching. Users complete a civic values assessment to build their "Civic Blueprint," which is then used to provide personalized ballot recommendations.

## Features

- **Civic Blueprint Assessment**: Slider-based questionnaire across 15 policy axes grouped into 5 domains
- **Schwartz Values Assessment**: Personal values assessment based on the Schwartz theory of basic human values
- **Ballot Explorer**: Browse ballot items with personalized recommendations based on your civic profile
- **Value-Based Recommendations**: Match candidates and measures to your policy preferences

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS v4
- **State Management**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS + PostCSS
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Main application routes
│   │   ├── ballot/         # Ballot explorer
│   │   └── blueprint/      # Blueprint assessment & viewer
│   ├── (auth)/             # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── api/                # API routes (45+ endpoints)
│   │   ├── assessment/     # Assessment session management
│   │   ├── ballot/         # Ballot data endpoints
│   │   ├── blueprint/      # Blueprint endpoints
│   │   ├── candidates/     # Candidate information
│   │   ├── civic-axes/     # Civic axes specification & scoring
│   │   ├── contests/       # Contest endpoints
│   │   ├── fine-tuning/    # Fine-tuning session management
│   │   ├── measures/       # Ballot measure endpoints
│   │   ├── personas/       # Test persona endpoints
│   │   └── schwartz-values/# Schwartz values assessment
│   ├── globals.css         # Global styles + Tailwind
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ballot/             # Ballot browsing components
│   ├── blueprint/          # Assessment & blueprint components
│   ├── layout/             # Layout components (TopNav)
│   ├── schwartz/           # Schwartz assessment components
│   └── ui/                 # Reusable UI components
├── context/                # React Context providers
│   ├── AuthContext.tsx     # Authentication state
│   └── BlueprintContext.tsx# Blueprint workflow state
├── data/                   # Static data files
│   ├── fineTuningPositions.ts
│   └── sliderPositions.ts  # Slider position configurations
├── lib/                    # Client-side utilities
│   ├── adaptiveSelection.ts
│   ├── archetypes.ts       # Archetype classification
│   ├── ballotHelpers.ts    # Ballot processing
│   ├── blueprintHelpers.ts
│   ├── blueprintInsights.ts
│   ├── scoring.ts          # Scoring calculations
│   └── valueFraming.ts     # Value-based language
├── server/                 # Server-side code
│   ├── data/               # Data sources
│   │   ├── ballot/         # Ballot, candidates, contests, measures
│   │   ├── civicAxes/      # Civic axes specification
│   │   ├── personas/       # Test personas
│   │   └── schwartzValues/ # Schwartz values spec
│   ├── services/           # Business logic
│   └── utils/              # Server utilities
├── services/               # API client
│   └── api.ts              # Axios client with interceptors
├── stores/                 # Zustand stores
│   ├── schwartzStore.ts    # Schwartz assessment state
│   └── userStore.ts        # User profile & civic assessment state
└── types/                  # TypeScript type definitions
    ├── blueprintProfile.ts
    └── civicAssessment.ts
```

## Documentation

See the [docs](./docs) folder for detailed documentation:

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Assessment Pipeline](./docs/ASSESSMENT_PIPELINE.md)
- [API Routes Reference](./docs/API_ROUTES.md)
- [Getting Started Guide](./docs/GETTING_STARTED.md)

## Key Concepts

### Civic Blueprint

A user's political profile consisting of:
- **5 Domains**: Economic, Healthcare, Housing, Justice, Climate
- **15 Axes**: 3 policy spectrums per domain (e.g., "Safety Net Breadth", "Coverage Model")
- **Axis Values**: 0-10 scale representing stance between two policy poles
- **Confidence Scores**: Based on number of assessment items answered

### Schwartz Values

Personal values assessment using the Portrait Values Questionnaire:
- **10 Value Types**: Power, Achievement, Hedonism, Stimulation, Self-Direction, Universalism, Benevolence, Tradition, Conformity, Security
- **4 Higher-Order Dimensions**: Self-Enhancement vs Self-Transcendence, Openness vs Conservation
- **Ipsatized Scoring**: Scores relative to individual's mean rating

### Archetypes

Users are classified into one of 8 archetypes based on three meta-dimensions derived from their civic axes:
- **Responsibility Orientation**: Community-led ↔ Individual-led
- **Change Tempo**: Change-seeking ↔ Stability-seeking
- **Governance Style**: Rules & standards ↔ Flexibility & choice

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

See `.env.example` for available configuration options.

## License

Private - All rights reserved
