# Next.js Migration Plan

**Created:** January 27, 2026
**Status:** Proposal
**Target:** Web-only Prototype

---

## Executive Summary

This document outlines the migration plan for converting the current React Native + Express architecture to a unified Next.js application. This migration consolidates the frontend and backend into a single codebase while maintaining all existing functionality.

### Current vs Target Architecture

| Aspect | Current | Target |
|--------|---------|--------|
| Frontend | React Native + Expo | Next.js (React) |
| Backend | Express.js | Next.js API Routes |
| Database | PostgreSQL + Redis + Qdrant | PostgreSQL + Redis + Qdrant (unchanged) |
| ORM | Prisma | Prisma (unchanged) |
| Deployment | Docker (2 services) | Single Next.js app |
| Platform | iOS, Android, Web | Web only |

### Key Benefits

- **Unified Codebase**: No more frontend/backend separation
- **Simplified Development**: Single dev server, shared types
- **Server Components**: Direct database access in components (no API overhead)
- **Better SEO**: Server-side rendering out of the box
- **Easier Deployment**: Single application to deploy
- **Built-in Analytics**: Vercel Analytics or easy third-party integration

### What Stays the Same

- PostgreSQL database with Prisma ORM
- Redis caching layer
- Qdrant vector database
- Core business logic and algorithms
- Authentication flow (JWT-based)
- ML services architecture

---

## Phase 1: Project Setup & Infrastructure

**Goal**: Set up Next.js project with proper configuration

### 1.1 Initialize Next.js Project

```bash
# Create new Next.js app in the repository
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir

# Resulting structure:
Ballot-Builder/
├── web/                    # New Next.js app
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities, Prisma client
│   ├── package.json
│   └── next.config.js
├── frontend/              # Keep temporarily for reference
├── backend/               # Keep temporarily for reference
└── ml-services/           # Unchanged
```

### 1.2 Configure Prisma

```bash
# Move Prisma to web app
cp -r backend/_database/prisma web/prisma

# Install dependencies
cd web
npm install @prisma/client
npm install -D prisma
```

Create `web/src/lib/db.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 1.3 Environment Configuration

Create `web/.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ballot_builder"

# Redis
REDIS_URL="redis://localhost:6379"

# Qdrant
QDRANT_URL="http://localhost:6333"

# Auth
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Analytics (choose one)
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### 1.4 Docker Compose Update

Update `docker-compose.yml` to include Next.js:
```yaml
services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ballot_builder
      - REDIS_URL=redis://redis:6379
      - QDRANT_URL=http://qdrant:6333
    depends_on:
      - db
      - redis
      - qdrant

  # Keep existing db, redis, qdrant services unchanged
```

---

## Phase 2: API Routes Migration

**Goal**: Convert Express routes to Next.js API routes

### 2.1 Route Mapping

| Express Route | Next.js API Route |
|---------------|-------------------|
| `GET /api/civic-axes/spec` | `app/api/civic-axes/spec/route.ts` |
| `GET /api/civic-axes/domains` | `app/api/civic-axes/domains/route.ts` |
| `POST /api/civic-axes/score` | `app/api/civic-axes/score/route.ts` |
| `GET /api/blueprint/statements` | `app/api/blueprint/statements/route.ts` |
| `POST /api/blueprint/response` | `app/api/blueprint/response/route.ts` |
| `GET /api/ballot` | `app/api/ballot/route.ts` |
| `GET /api/ballot/:id` | `app/api/ballot/[id]/route.ts` |
| `GET /api/candidates` | `app/api/candidates/route.ts` |
| `GET /api/candidates/:id` | `app/api/candidates/[id]/route.ts` |
| `POST /api/auth/login` | `app/api/auth/login/route.ts` |
| `POST /api/auth/register` | `app/api/auth/register/route.ts` |
| `POST /api/fine-tuning/submit` | `app/api/fine-tuning/submit/route.ts` |

### 2.2 Example Route Conversion

**Before (Express)** - `backend/src/routes/civicAxes.ts`:
```typescript
router.get('/spec', async (req, res) => {
  try {
    const spec = await civicAxesService.getSpec();
    res.json(spec);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spec' });
  }
});
```

**After (Next.js)** - `web/src/app/api/civic-axes/spec/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getCivicAxesSpec } from '@/lib/services/civic-axes'

export async function GET() {
  try {
    const spec = await getCivicAxesSpec()
    return NextResponse.json(spec)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch spec' },
      { status: 500 }
    )
  }
}
```

### 2.3 Middleware Migration

Create `web/src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rate limiting (use upstash/ratelimit for production)
  // Auth token validation
  // CORS headers (if needed for external access)

  const response = NextResponse.next()

  // Security headers (replaces Helmet)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

### 2.4 Services Layer

Move business logic to `web/src/lib/services/`:
```
web/src/lib/services/
├── civic-axes.ts      # From backend/src/services/civicAxesService.ts
├── blueprint.ts       # From backend/src/services/blueprintService.ts
├── ballot.ts          # From backend/src/services/ballotService.ts
├── candidates.ts      # From backend/src/services/candidatesService.ts
├── auth.ts            # From backend/src/services/authService.ts
└── fine-tuning.ts     # From backend/src/services/fineTuningService.ts
```

---

## Phase 3: Frontend Migration

**Goal**: Convert React Native components to React/Next.js components

### 3.1 Component Mapping Strategy

| React Native | React/Next.js |
|--------------|---------------|
| `<View>` | `<div>` |
| `<Text>` | `<p>`, `<span>`, `<h1>`, etc. |
| `<TouchableOpacity>` | `<button>` |
| `<ScrollView>` | `<div>` with overflow |
| `<FlatList>` | Array.map() or virtualization library |
| `<Image>` | `<Image>` from next/image |
| `<TextInput>` | `<input>` |
| StyleSheet.create() | Tailwind CSS classes |

### 3.2 Page Structure

```
web/src/app/
├── page.tsx                      # Landing/Welcome (from app/index.tsx)
├── layout.tsx                    # Root layout with providers
├── (auth)/
│   ├── login/page.tsx           # From app/(auth)/login.tsx
│   └── register/page.tsx        # From app/(auth)/register.tsx
├── (app)/
│   ├── layout.tsx               # App layout with navigation
│   ├── home/page.tsx            # Dashboard (from app/(tabs)/home.tsx)
│   ├── assessment/page.tsx      # Civic Assessment (from app/(tabs)/civic-assessment.tsx)
│   ├── blueprint/page.tsx       # Blueprint viewer (from app/(tabs)/blueprint.tsx)
│   ├── ballot/page.tsx          # Ballot browser (from app/(tabs)/ballot.tsx)
│   └── profile/page.tsx         # Profile/Settings (from app/(tabs)/profile.tsx)
└── api/                         # API routes (Phase 2)
```

### 3.3 Example Component Conversion

**Before (React Native)** - `frontend/components/PolicyCard.tsx`:
```tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function PolicyCard({ title, description, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#666' },
});
```

**After (Next.js + Tailwind)** - `web/src/components/PolicyCard.tsx`:
```tsx
interface PolicyCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export function PolicyCard({ title, description, onClick }: PolicyCardProps) {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white rounded-lg text-left hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}
```

### 3.4 State Management

Keep Zustand (it works with Next.js):
```typescript
// web/src/stores/userStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  blueprintProfile: BlueprintProfile | null
  axisScores: AxisScores | null
  setProfile: (profile: BlueprintProfile) => void
  setScores: (scores: AxisScores) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      blueprintProfile: null,
      axisScores: null,
      setProfile: (profile) => set({ blueprintProfile: profile }),
      setScores: (scores) => set({ axisScores: scores }),
    }),
    { name: 'user-storage' }
  )
)
```

### 3.5 Swipe Functionality

Replace React Native gesture handling with web alternatives:

**Option A: Framer Motion**
```tsx
import { motion, useMotionValue, useTransform } from 'framer-motion'

function SwipeCard({ statement, onSwipe }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])

  return (
    <motion.div
      drag="x"
      style={{ x, rotate }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipe('agree')
        if (info.offset.x < -100) onSwipe('disagree')
      }}
    >
      {statement.text}
    </motion.div>
  )
}
```

**Option B: react-tinder-card**
```tsx
import TinderCard from 'react-tinder-card'

function SwipeCard({ statement, onSwipe }) {
  return (
    <TinderCard onSwipe={(dir) => onSwipe(dir === 'right' ? 'agree' : 'disagree')}>
      <div className="card">{statement.text}</div>
    </TinderCard>
  )
}
```

---

## Phase 4: Authentication Migration

**Goal**: Implement authentication in Next.js

### 4.1 Option A: NextAuth.js (Recommended)

```bash
npm install next-auth @auth/prisma-adapter
```

Create `web/src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email }
        })

        if (user && bcrypt.compareSync(credentials?.password || '', user.password)) {
          return { id: user.id, email: user.email, name: user.name }
        }
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  }
})

export { handler as GET, handler as POST }
```

### 4.2 Option B: Keep Current JWT Implementation

Port existing JWT logic to Next.js API routes and use cookies instead of localStorage for better security.

---

## Phase 5: Analytics Integration

**Goal**: Add analytics for user behavior tracking

### 5.1 PostHog Setup (Recommended)

```bash
npm install posthog-js
```

Create `web/src/lib/posthog.ts`:
```typescript
import posthog from 'posthog-js'

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // We'll handle this manually
    })
  }
}

export { posthog }
```

Create `web/src/components/PostHogProvider.tsx`:
```typescript
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { initPostHog, posthog } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (pathname) {
      posthog.capture('$pageview', { path: pathname })
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
```

### 5.2 Track Custom Events

```typescript
// Track assessment completion
posthog.capture('assessment_completed', {
  questions_answered: 97,
  completion_time_seconds: 450,
})

// Track ballot interaction
posthog.capture('ballot_viewed', {
  ballot_id: 'xyz',
  contests_count: 12,
})

// Track fine-tuning
posthog.capture('fine_tuning_submitted', {
  axis: 'economic_freedom',
  adjustments_made: 3,
})
```

### 5.3 Key Metrics to Track

| Event | Properties | Purpose |
|-------|------------|---------|
| `assessment_started` | `persona_id` | Funnel entry |
| `statement_swiped` | `statement_id`, `direction`, `time_spent` | Engagement |
| `assessment_completed` | `total_time`, `skip_count` | Completion rate |
| `blueprint_viewed` | `axes_expanded[]` | Feature usage |
| `ballot_selection_made` | `contest_id`, `candidate_id` | Core action |
| `fine_tuning_opened` | `axis_id` | Advanced usage |

---

## Phase 6: Testing & Quality Assurance

### 6.1 Testing Strategy

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D playwright  # For E2E tests
```

**Unit Tests**: `web/src/__tests__/`
```typescript
// Test services
describe('CivicAxesService', () => {
  it('calculates axis scores correctly', async () => {
    const responses = [{ statementId: '1', value: 0.8 }]
    const scores = await calculateAxisScores(responses)
    expect(scores.economicFreedom).toBeCloseTo(0.65)
  })
})
```

**E2E Tests**: `web/e2e/`
```typescript
// Test user flows
test('complete assessment flow', async ({ page }) => {
  await page.goto('/assessment')

  // Swipe through statements
  for (let i = 0; i < 10; i++) {
    await page.locator('.swipe-card').swipe('right')
  }

  await expect(page.locator('.progress')).toContainText('10/97')
})
```

### 6.2 API Route Testing

```typescript
import { GET } from '@/app/api/civic-axes/spec/route'

describe('GET /api/civic-axes/spec', () => {
  it('returns civic axes specification', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.domains).toHaveLength(4)
    expect(data.axes).toHaveLength(12)
  })
})
```

---

## Phase 7: Deployment

### 7.1 Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd web
vercel
```

**Environment Variables** (set in Vercel dashboard):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `QDRANT_URL` - Qdrant endpoint
- `JWT_SECRET` - Auth secret
- `NEXT_PUBLIC_POSTHOG_KEY` - Analytics key

### 7.2 Self-Hosted (Docker)

Create `web/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Migration Checklist

### Phase 1: Setup
- [ ] Initialize Next.js project
- [ ] Configure Prisma
- [ ] Set up environment variables
- [ ] Update Docker Compose

### Phase 2: API Routes
- [ ] Migrate `/api/civic-axes/*` routes
- [ ] Migrate `/api/blueprint/*` routes
- [ ] Migrate `/api/ballot/*` routes
- [ ] Migrate `/api/candidates/*` routes
- [ ] Migrate `/api/auth/*` routes
- [ ] Migrate `/api/fine-tuning/*` routes
- [ ] Set up middleware (rate limiting, security headers)
- [ ] Test all API endpoints

### Phase 3: Frontend
- [ ] Create page structure
- [ ] Convert Welcome/Landing page
- [ ] Convert Login/Register pages
- [ ] Convert Home Dashboard
- [ ] Convert Civic Assessment (with swipe)
- [ ] Convert Blueprint Viewer
- [ ] Convert Ballot Browser
- [ ] Convert Profile page
- [ ] Migrate Zustand stores
- [ ] Test all user flows

### Phase 4: Authentication
- [ ] Set up NextAuth.js or port JWT system
- [ ] Configure protected routes
- [ ] Test auth flows

### Phase 5: Analytics
- [ ] Set up PostHog/Plausible
- [ ] Add page view tracking
- [ ] Add custom event tracking
- [ ] Create analytics dashboard

### Phase 6: Testing
- [ ] Write unit tests for services
- [ ] Write API route tests
- [ ] Write E2E tests for critical flows
- [ ] Performance testing

### Phase 7: Deployment
- [ ] Configure Vercel/hosting
- [ ] Set up environment variables
- [ ] Deploy staging environment
- [ ] Test in staging
- [ ] Deploy production
- [ ] Verify analytics collection

### Cleanup
- [ ] Archive `frontend/` folder
- [ ] Archive `backend/` folder
- [ ] Update README
- [ ] Update documentation

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Data loss during migration** | Keep PostgreSQL database unchanged; only app layer migrates |
| **Feature regression** | Maintain feature parity checklist; comprehensive E2E tests |
| **Performance degradation** | Benchmark before/after; use Server Components for data-heavy pages |
| **Auth issues** | Run both systems in parallel during transition |
| **Swipe UX degradation** | Test multiple swipe libraries; ensure mobile web works well |

---

## Timeline Estimate

| Phase | Description |
|-------|-------------|
| Phase 1 | Project setup & infrastructure |
| Phase 2 | API routes migration |
| Phase 3 | Frontend component migration |
| Phase 4 | Authentication setup |
| Phase 5 | Analytics integration |
| Phase 6 | Testing & QA |
| Phase 7 | Deployment |

**Note**: Phases 2 and 3 can be worked on in parallel by different team members.

---

## Post-Migration Benefits

Once complete, you'll have:

1. **Single Codebase**: All code in `web/` folder
2. **Shared Types**: TypeScript types used across frontend and API
3. **Server Components**: Database queries directly in components where appropriate
4. **Better DX**: One `npm run dev` starts everything
5. **Analytics Ready**: Full user behavior tracking
6. **SEO Friendly**: Server-rendered pages for public content
7. **Easier Deploys**: Single deployment target
8. **Cost Savings**: One hosting service instead of two

---

## Questions to Resolve Before Starting

1. **Domain**: What domain will the web app be hosted on?
2. **Analytics Provider**: PostHog, Plausible, or another?
3. **Hosting**: Vercel, self-hosted, or other cloud provider?
4. **Auth Strategy**: NextAuth.js or keep current JWT?
5. **Swipe Library**: Framer Motion or react-tinder-card?
6. **Timeline**: What's the target completion date?
