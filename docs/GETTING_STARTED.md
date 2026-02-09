# Getting Started

A guide to understanding and working with the Ballot Builder codebase.

## Prerequisites

- Node.js 20+
- npm
- Code editor (VS Code recommended)

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd Ballot-Builder-Prototype
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

## Project Overview

Ballot Builder helps users make informed voting decisions through:

1. **Civic Blueprint Assessment** - A questionnaire that maps user preferences across 15 policy axes
2. **Schwartz Values Assessment** - Personal values assessment based on psychology research
3. **Ballot Explorer** - Browse candidates and measures with personalized recommendations

## Directory Structure

```
src/
├── app/           # Next.js pages and API routes
├── components/    # React components
├── context/       # React Context providers
├── data/          # Static client-side data
├── lib/           # Client utilities
├── server/        # Server-side code (data, services)
├── services/      # API client
├── stores/        # Zustand state management
└── types/         # TypeScript definitions
```

## Key Concepts

### Civic Axes

The core of the assessment system. Users position themselves on 15 policy spectrums:

- Each axis has two poles (e.g., "Broader Safety Net" ↔ "Conditional Safety Net")
- Axes are grouped into 5 domains (Economic, Healthcare, Housing, Justice, Climate)
- User positions are scored with confidence levels

### Blueprint Profile

The data structure storing a user's civic profile:
- Domain importance (which issues matter most)
- Axis values (0-10 stance on each spectrum)
- Confidence scores (based on evidence)

### Zustand Stores

State is managed with Zustand and persisted to localStorage:

```typescript
// Access user store
import { useUserStore } from '@/stores/userStore';

const { blueprintProfile, setAxisValue } = useUserStore();
```

## Development Workflow

### Adding a New Component

1. Create component in appropriate folder:
   ```
   src/components/[feature]/MyComponent.tsx
   ```

2. Use TypeScript interfaces for props:
   ```typescript
   interface MyComponentProps {
     title: string;
     onAction: () => void;
   }

   export function MyComponent({ title, onAction }: MyComponentProps) {
     return <div onClick={onAction}>{title}</div>;
   }
   ```

3. Use Tailwind for styling:
   ```typescript
   <div className="p-4 bg-white rounded-lg shadow">
   ```

### Adding an API Route

1. Create route file:
   ```
   src/app/api/[feature]/route.ts
   ```

2. Export HTTP method handlers:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';

   export async function GET(request: NextRequest) {
     const data = await fetchData();
     return NextResponse.json(data);
   }

   export async function POST(request: NextRequest) {
     const body = await request.json();
     const result = await processData(body);
     return NextResponse.json(result);
   }
   ```

3. Use services for business logic:
   ```typescript
   import { myService } from '@/server/services/myService';

   export async function GET() {
     const data = myService.getData();
     return NextResponse.json(data);
   }
   ```

### Working with State

**Reading state:**
```typescript
const blueprintProfile = useUserStore(state => state.blueprintProfile);
```

**Updating state:**
```typescript
const setAxisValue = useUserStore(state => state.setAxisValue);
setAxisValue('econ_safetynet', 7);
```

**Hydration handling:**
```typescript
const hasHydrated = useUserStore(state => state._hasHydrated);

if (!hasHydrated) {
  return <Loading />;
}
```

## Common Tasks

### Run Linting

```bash
npm run lint
```

### Build for Production

```bash
npm run build
npm run start
```

### Add a Dependency

```bash
npm install package-name
npm install --save-dev package-name  # dev dependency
```

## Styling

We use Tailwind CSS v4. Key patterns:

### Layout
```typescript
<div className="flex flex-col gap-4">
<div className="grid grid-cols-2 gap-4">
```

### Spacing
```typescript
<div className="p-4 m-2">      // padding, margin
<div className="px-4 py-2">    // horizontal, vertical
```

### Colors
```typescript
<div className="bg-white text-gray-900">
<div className="bg-brand-purple">  // custom brand color
```

### Responsive
```typescript
<div className="text-sm md:text-base lg:text-lg">
```

## Debugging

### React DevTools
Install the React DevTools browser extension to inspect component hierarchy and state.

### Network Tab
Use browser DevTools Network tab to inspect API calls.

### Console Logging
```typescript
console.log('Debug:', variable);
console.table(arrayOfObjects);
```

### Zustand DevTools
Zustand state can be inspected via Redux DevTools extension.

## Testing

```bash
npm test              # Run tests
npm test -- --watch   # Watch mode
```

## Deployment

The app is designed to deploy on Vercel:

```bash
npm run build   # Verify build works
# Push to GitHub, connect to Vercel
```

## Getting Help

1. Check existing code for patterns
2. Read the [Architecture](./ARCHITECTURE.md) doc
3. Check [API Routes](./API_ROUTES.md) for endpoint details
4. Review [Assessment Pipeline](./ASSESSMENT_PIPELINE.md) for scoring logic

## Common Gotchas

### Hydration Mismatch
If you see hydration errors, ensure components that depend on localStorage wait for hydration:

```typescript
const hasHydrated = useUserStore(state => state._hasHydrated);
if (!hasHydrated) return null;
```

### API Route Params
Dynamic route params use the `params` prop:

```typescript
// src/app/api/items/[itemId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const { itemId } = params;
}
```

### Client vs Server Components
By default, components in `app/` are Server Components. Add `'use client'` directive for client-side interactivity:

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  // ...
}
```
