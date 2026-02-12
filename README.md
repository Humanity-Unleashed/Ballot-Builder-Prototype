# Ballot Builder

A Next.js application that helps users make informed voting decisions through personalized policy alignment matching. Users complete a civic values assessment to build their "Civic Blueprint," which is then used to provide personalized ballot recommendations.

## Features

- **Civic Blueprint Assessment**: Slider-based questionnaire across 15 policy axes grouped into 5 domains (Economic, Healthcare, Housing, Justice, Climate)
- **Schwartz Values Assessment**: Personal values assessment based on the Schwartz theory of basic human values, with booster vignettes for deeper profiling
- **Ballot Explorer**: Browse ballot items with personalized recommendations based on your civic profile
- **Vote Tracking**: Persistent ballot vote selections stored locally via Zustand
- **Demographic Impact**: See how ballot measures affect different demographic groups
- **Fine-Tuning**: Adjust your blueprint axes after completing the assessment
- **Archetype Classification**: Get classified into one of 8 civic archetypes based on your profile
- **Analytics & Feedback**: Built-in event tracking and user feedback collection backed by a Neon Postgres database

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS v4, Framer Motion
- **State Management**: Zustand with localStorage persistence
- **Database**: Neon Postgres (via Prisma ORM)
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone git@github.com:Humanity-Unleashed/Ballot-Builder-Prototype.git
cd Ballot-Builder-Prototype

# Install dependencies
npm install

# Pull environment variables from Vercel (see below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

The project uses Vercel-managed environment variables for database connections and secrets. To pull them to your local machine:

1. **Install the Vercel CLI** (if you haven't already):
   ```bash
   npm i -g vercel
   ```

2. **Link your local project** to the Vercel project (first time only):
   ```bash
   vercel link
   ```
   Select the **Humanity-Unleashed** team and the **ballot-builder-prototype** project when prompted.

3. **Pull environment variables** to a local `.env.local` file:
   ```bash
   vercel env pull .env.local
   ```

This will create a `.env.local` file with all the required variables including `DATABASE_URL` and `DIRECT_URL` for the Neon Postgres database.

> **Note:** Never commit `.env.local` to git — it contains secrets. See `.env.example` for a reference of all available variables.

### Database

The project uses [Neon Postgres](https://neon.tech) as the database (connected via Prisma ORM). It stores analytics events and user feedback.

**View the database:**
Open the Neon Console to browse tables, run queries, and inspect analytics/feedback data:

> **[Neon Console — Ballot Builder Database](https://console.neon.tech/app/projects/wandering-hall-89025086/branches/br-broad-breeze-ait03zw9/tables)**

**View feedback:**
Feedback entries are automatically mirrored to a Google Sheet for easy browsing:

> **[Google Sheet — Feedback Entries](https://docs.google.com/spreadsheets/d/1Ade9LhD3BSFkrdGANjHJqs8PA2j2GyOtD4U8yMckYcM/edit?gid=0#gid=0)**

**Database commands:**

```bash
npm run db:generate       # Regenerate Prisma client
npm run db:push           # Push schema changes to the database
npm run db:migrate:dev    # Create and apply a new migration
npm run db:migrate:deploy # Apply pending migrations (production)
npm run db:studio         # Open Prisma Studio (visual DB browser)
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint issues

# Testing
npm run test             # Run unit tests in watch mode
npm run test:run         # Run unit tests once
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with interactive UI

# Database (see above)
npm run db:generate
npm run db:push
npm run db:migrate:dev
npm run db:studio
```

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (app)/                  # Main application routes
│   │   ├── ballot/             # Ballot explorer
│   │   └── blueprint/          # Blueprint assessment & viewer
│   ├── (auth)/                 # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── api/                    # API routes (48+ endpoints)
│   │   ├── analytics/          # Analytics event tracking
│   │   ├── assessment/         # Assessment session management
│   │   ├── ballot/             # Ballot data endpoints
│   │   ├── blueprint/          # Blueprint endpoints
│   │   ├── candidates/         # Candidate information
│   │   ├── civic-axes/         # Civic axes specification & scoring
│   │   ├── contests/           # Contest endpoints
│   │   ├── feedback/           # User feedback collection
│   │   ├── fine-tuning/        # Fine-tuning session management
│   │   ├── measures/           # Ballot measure endpoints
│   │   ├── personas/           # Test persona endpoints
│   │   └── schwartz-values/    # Schwartz values assessment
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                 # React components
│   ├── analytics/              # Analytics provider
│   ├── ballot/                 # Ballot browsing & voting
│   ├── blueprint/              # Assessment & blueprint views
│   ├── demographics/           # Demographic impact screens
│   ├── feedback/               # Feedback collection button
│   ├── layout/                 # Layout components (TopNav)
│   ├── schwartz/               # Schwartz assessment & boosters
│   └── ui/                     # Reusable UI primitives
├── context/                    # React Context providers
├── data/                       # Static data files
├── hooks/                      # Custom hooks (analytics, etc.)
├── lib/                        # Client-side utilities
├── server/                     # Server-side code
│   ├── data/                   # Data sources (ballot, civic axes, etc.)
│   └── services/               # Business logic & DB services
├── services/                   # API client (Axios)
├── stores/                     # Zustand stores (user, schwartz, ballot, etc.)
└── types/                      # TypeScript type definitions
prisma/
└── schema.prisma               # Database schema (AnalyticsEvent, FeedbackEntry)
e2e/                            # Playwright E2E tests
```

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
- **Booster Vignettes**: Follow-up scenarios for deeper value profiling

### Archetypes

Users are classified into one of 8 archetypes based on three meta-dimensions derived from their civic axes:
- **Responsibility Orientation**: Community-led ↔ Individual-led
- **Change Tempo**: Change-seeking ↔ Stability-seeking
- **Governance Style**: Rules & standards ↔ Flexibility & choice

## Documentation

See the [docs](./docs) folder for detailed documentation:

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Assessment Pipeline](./docs/ASSESSMENT_PIPELINE.md)
- [API Routes Reference](./docs/API_ROUTES.md)
- [Getting Started Guide](./docs/GETTING_STARTED.md)

## License

Private - All rights reserved
