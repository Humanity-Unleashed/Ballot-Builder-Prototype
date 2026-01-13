# Ballot Builder UI Overview

Visual guide to the current UI screens in the app.

## Current Navigation Structure

```
App Entry
    ↓
┌─────────────────────────┐
│  Authentication Flow     │
├─────────────────────────┤
│ - Login/Signup screens  │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│   Main App (Tabs)       │
├─────────────────────────┤
│ 1. Home                 │
│ 2. Blueprint            │ ← We're exploring this!
│ 3. Ballot               │
│ 4. Profile              │
│ 5. Prototype            │ ← Our working demo
└─────────────────────────┘
```

---

## Screen 1: Blueprint (Current - Placeholder)

**Location:** `app/(tabs)/blueprint.tsx`

**What it shows:**

```
┌─────────────────────────────────┐
│                                 │
│      Civic Blueprint            │
│  Swipe right to agree,          │
│  left to disagree               │
│                                 │
│  ┌───────────────────────┐     │
│  │                       │     │
│  │        🗳️             │     │
│  │                       │     │
│  │    Coming Soon        │     │
│  │                       │     │
│  │  The swipe interface  │     │
│  │  will appear here...  │     │
│  │                       │     │
│  └───────────────────────┘     │
│                                 │
│  ▭▭▭▭▭▭▭▭▯▯▯▯▯▯▯▯▯▯▯▯         │
│  0 of 50 statements             │
│                                 │
│  ┌─────────┐  ┌─────────┐     │
│  │👎 Disagree  │ 👍 Agree│     │
│  │ (disabled)  │(disabled)│     │
│  └─────────┘  └─────────┘     │
│                                 │
└─────────────────────────────────┘
```

**Status:** Placeholder only, buttons disabled

---

## Screen 2: Prototype (Working Demo)

**Location:** `app/(tabs)/prototype.tsx`

**What it shows:**

```
┌─────────────────────────────────┐
│                                 │
│  Build Your Civic Blueprint     │
│  ▓▓▓▓▓▓▓▓▓▓▯▯▯▯▯▯▯▯▯▯         │
│  5 of 20                        │
│                                 │
│  ┌───────────────────────┐     │
│  │ [Healthcare]          │     │
│  │                       │     │
│  │  Healthcare should    │     │
│  │  be more affordable   │     │
│  │  and accessible for   │     │
│  │  everyone             │     │
│  │                       │     │
│  │  👎 ← →  👍          │     │
│  └───────────────────────┘     │
│       ↑ Swipeable Card          │
│                                 │
│  ┌─────────┐  ┌─────────┐     │
│  │ ✕ Disagree  │ ✓ Agree │     │
│  └─────────┘  └─────────┘     │
│                                 │
└─────────────────────────────────┘
```

**Status:** ✅ Fully functional with:
- Real swipe gestures
- 20 policy statements
- Progress tracking
- Button alternatives

---

## Screen 3: Results (After Completing Prototype)

```
┌─────────────────────────────────┐
│  Your Ballot Recommendations    │
│  Based on 20 responses          │
│                                 │
│  ┌───────────────────────┐     │
│  │ Governor              │     │
│  │                       │     │
│  │ Recommended:          │     │
│  │ Jane Smith            │     │
│  │                       │     │
│  │      85%              │     │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▯▯▯   │     │
│  │  High confidence      │     │
│  │                       │     │
│  │ All Candidates:       │     │
│  │ • Jane Smith (D) 85%  │     │
│  │ • John Doe (R) 42%    │     │
│  │ • Sarah Johnson (I) 63% │   │
│  └───────────────────────┘     │
│                                 │
│  ┌───────────────────────┐     │
│  │ Prop 42: Education    │     │
│  │                       │     │
│  │ Recommendation: Yes   │     │
│  │                       │     │
│  │      72%              │     │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▯▯▯▯▯   │     │
│  │  Moderate confidence  │     │
│  │                       │     │
│  │ If Yes: Schools get   │     │
│  │ $500M annually...     │     │
│  └───────────────────────┘     │
│                                 │
└─────────────────────────────────┘
```

**Status:** ✅ Working in prototype

---

## Screen 4: Persona Selection

**Location:** `app/persona-selection.tsx`

```
┌─────────────────────────────────┐
│  Choose Your Voter Profile      │
│  Select a persona that best     │
│  represents your situation...   │
│                                 │
│  ┌───────────────────────┐     │
│  │ 👨‍💼 Young Professional   │     │
│  │                       │     │
│  │ Early career, urban,  │     │
│  │ concerned about...    │     │
│  └───────────────────────┘     │
│                                 │
│  ┌───────────────────────┐     │
│  │ 👩‍🏫 Educator            │     │
│  │                       │     │
│  │ Teacher focusing on   │     │
│  │ education funding...  │     │
│  └───────────────────────┘     │
│                                 │
│  ┌───────────────────────┐     │
│  │ 🏡 Small Business Owner │    │
│  │                       │     │
│  │ Concerned with local  │     │
│  │ economy and...        │     │
│  └───────────────────────┘     │
│                                 │
│  [Continue as Selected]        │
│                                 │
└─────────────────────────────────┘
```

**Status:** ✅ Functional UI (needs backend integration)

---

## Comparison: Blueprint vs Prototype

### Current Blueprint Tab (Placeholder)
```
❌ Disabled buttons
❌ No actual cards
❌ No swipe functionality
❌ Just a "Coming Soon" message
```

### Working Prototype Tab
```
✅ Swipeable cards
✅ Real gestures
✅ 20 statements with data
✅ Progress tracking
✅ Results with confidence scores
✅ Full flow from start to finish
```

---

## What You'll See When You Open It

### Step 1: Login/Auth Screen
The app starts with authentication. For testing, you can:
- Skip auth (if bypass is configured)
- Or create a test account

### Step 2: Tab Navigation
Bottom navigation with 5 tabs:
1. **Home** 🏠
2. **Blueprint** 📄 ← Empty placeholder
3. **Ballot** 🗳️
4. **Profile** 👤
5. **Prototype** 🧪 ← Working demo!

### Step 3: Test the Prototype
Tap the "Prototype" tab (flask icon) to see the working version!

---

## Visual Design Notes

### Color Scheme
- Primary Blue: `#3B82F6` / `#007AFF`
- Teal Accent: `#3AAFA9`
- Green (Agree): `#34C759`
- Red (Disagree): `#FF3B30`
- Orange (Moderate): `#FF9500`

### Typography
- Headers: 24-28px bold
- Body: 14-16px regular
- Small text: 12-14px

### Card Design
- White background
- Rounded corners (12-20px)
- Subtle shadows
- Minimum 56px touch targets

---

## Next Steps for Blueprint UI

### Option A: Copy Prototype → Blueprint
Replace the placeholder with our working SwipeCard:
- Use same components
- Same data structure
- Same flow

### Option B: Enhanced Blueprint
Add new features:
- Real-time political compass
- Category-based organization
- Adaptive difficulty
- Explanation popups

### Option C: Hybrid Approach
Start with prototype code, then add:
- Better animations
- More polish
- Additional features

---

## How to Test

1. **Start the server:**
   ```bash
   cd frontend
   npm start
   ```

2. **Open in browser:**
   - Press 'w' for web
   - Or go to http://localhost:8081

3. **Navigate:**
   - Tap "Prototype" tab at bottom
   - Start swiping!

4. **Compare:**
   - Tap "Blueprint" tab to see placeholder
   - Notice the difference

---

## Files to Check

### Current Screens:
- `app/(tabs)/blueprint.tsx` - Placeholder
- `app/(tabs)/prototype.tsx` - Working demo
- `app/persona-selection.tsx` - Persona picker

### Components:
- `components/SwipeCard.tsx` - Our swipeable card
- `components/ConfidenceGauge.tsx` - Confidence meter
- `components/PersonaCard.tsx` - Persona selection cards

### Data:
- `data/statements.json` - 20 policy statements
- `data/ballot.json` - 5 ballot items

---

The server should be running now! Open your browser and check it out! 🚀
