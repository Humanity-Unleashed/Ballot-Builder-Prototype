# Data Flow Guide - How Information Moves Through Ballot Builder

This guide explains how data flows through the app, from user input to final recommendations.

> **New to the project?** Start with [BEGINNER_TUTORIAL.md](BEGINNER_TUTORIAL.md) for a high-level overview before diving into the technical details here.

## Table of Contents
1. [Overview](#overview)
2. [User Journey with Data Flow](#user-journey-with-data-flow)
3. [Key Data Transformations](#key-data-transformations)
4. [State Management](#state-management)
5. [API Call Patterns](#api-call-patterns)

---

## Overview

Understanding data flow is crucial for knowing where to put your code and how different parts of the app connect.

**Simple rule:** Data flows DOWN, events flow UP
- **Data flows down** - from parent components to children (via props)
- **Events flow up** - from children to parents (via callbacks)

---

## User Journey with Data Flow

### 1. Intake Questionnaire Flow

```
User enters address: "123 Main St, Springfield, CA"
            ↓
Component: IntakeScreen.tsx
  - Stores in local state: setAddress("123 Main St...")
  - Validates input
            ↓
User clicks "Continue"
            ↓
Service: districtLookup.ts
  - Makes API call to address-to-district service
  - API call: POST /api/districts/lookup
    Body: { address: "123 Main St, Springfield, CA" }
            ↓
API Response:
{
  local: ["springfield-district-5"],
  county: "sangamon-county",
  state: "CA",
  congressional: "13",
  senate: "48"
}
            ↓
Service: userService.ts
  - Creates user profile
  - Saves to database
            ↓
Database: users table
{
  id: "uuid-123",
  address: "123 Main St...",
  districts: { ... },
  preferenceVector: [0, 0, 0, ...], // Initialized to zeros
  createdAt: "2026-01-09T10:30:00Z"
}
            ↓
Navigation: Navigate to CivicBlueprintScreen
```

**Key Files:**
- `src/screens/IntakeScreen.tsx` - UI
- `src/services/districtLookup.ts` - Address lookup
- `src/services/userService.ts` - User creation
- `src/models/User.ts` - User data structure

---

### 2. Civic Blueprint Builder Flow

```
Screen loads: CivicBlueprintScreen
            ↓
useEffect hook runs
            ↓
Service: statementGenerator.ts
  - Fetches user profile from database
  - User vector: [0, 0, 0, ...] (all zeros initially)
  - User districts: ["springfield-district-5", ...]
            ↓
AI Service: generateStatement()
  - Makes LLM API call
  - Prompt: "Generate a policy statement for a user in
            California, district 13, who hasn't answered
            any questions yet. Make it broad and accessible."
            ↓
LLM Response:
{
  statement: "Healthcare should be more affordable for everyone",
  category: "healthcare",
  specificity: "broad"
}
            ↓
Component: SwipeCard.tsx
  - Displays statement
  - User swipes RIGHT (agree)
            ↓
Event Handler: onSwipe('agree')
            ↓
Service: preferenceEngine.ts
  - Updates user vector
  - Old vector: [0, 0, 0, 0, 0, ...]
  - Statement vector: [0.8, 0.2, 0.1, 0.3, ...]
  - New vector: [0.8, 0.2, 0.1, 0.3, ...]
            ↓
Database: user_responses table
{
  userId: "uuid-123",
  statementId: "stmt-456",
  response: "agree",
  timestamp: "2026-01-09T10:35:00Z"
}
            ↓
Database: users table (update)
{
  id: "uuid-123",
  preferenceVector: [0.8, 0.2, 0.1, 0.3, ...], // Updated!
  responseCount: 1
}
            ↓
Generate next statement (adaptive)
  - AI now knows: User cares about healthcare
  - Next question: More specific healthcare question
            ↓
Display next SwipeCard
  - Process repeats
```

**Key Files:**
- `src/screens/CivicBlueprintScreen.tsx` - Main screen
- `src/components/SwipeCard.tsx` - Swipe UI
- `src/services/statementGenerator.ts` - AI question generation
- `src/services/preferenceEngine.ts` - Vector updates
- `src/utils/vectorOperations.ts` - Vector math

**Data Structures:**

```typescript
// Statement
{
  id: string;
  text: string;
  category: string;
  embedding: number[]; // Vector representation
}

// User Response
{
  userId: string;
  statementId: string;
  response: 'agree' | 'disagree';
  timestamp: Date;
}

// User Vector (simplified)
{
  healthcare: 0.8,      // Strong preference
  education: 0.2,       // Weak preference
  environment: 0.1,     // Very weak
  economy: 0.3,         // Moderate
  // ... 20+ more categories
}
```

---

### 3. Ballot Retrieval & Analysis Flow

```
Background Job (runs when ballot is published)
            ↓
Service: ballotRetrieval.ts
  - Fetches from Ballotpedia API
  - API call: GET /api/ballotpedia/elections/2026/california
            ↓
Ballotpedia Response:
{
  election_id: "2026-ca-general",
  items: [
    {
      type: "candidate",
      position: "Governor",
      candidates: [
        {
          name: "Jane Smith",
          party: "Democratic",
          positions: [...]
        },
        ...
      ]
    },
    {
      type: "measure",
      title: "Proposition 42",
      fullText: "Long legal text...",
      ...
    }
  ]
}
            ↓
Service: ballotParser.ts
  - Organizes data into our format
            ↓
For EACH ballot item:
            ↓
Service: aiSummarizer.ts
  - LLM API call
  - Prompt: "Summarize this ballot measure in simple language.
            Explain what Yes means and what No means."
            ↓
LLM Response:
{
  summary: "This measure would increase school funding...",
  yesOutcome: "Schools get more money",
  noOutcome: "Funding stays the same"
}
            ↓
For EACH candidate:
            ↓
Service: candidateAnalyzer.ts
  - Parse policy positions
  - Create candidate vector
            ↓
Candidate Processing:
{
  name: "Jane Smith",
  positions: [
    "Supports universal healthcare",
    "Wants to increase education funding",
    "Favors renewable energy"
  ]
}
            ↓
Convert to vector:
  - LLM creates embedding
  - [0.7, 0.4, 0.6, 0.2, ...] // Candidate's policy vector
            ↓
Database: ballot_items table
{
  id: "ballot-1",
  electionId: "2026-ca-general",
  type: "candidate",
  title: "Governor - Jane Smith",
  embedding: [0.7, 0.4, 0.6, ...],
  aiSummary: "Jane Smith supports...",
  cached: true // Won't regenerate for other users
}
            ↓
Database: ballot_embeddings table
{
  ballotItemId: "ballot-1",
  vector: [0.7, 0.4, 0.6, ...],
  generatedAt: "2026-01-09T08:00:00Z"
}
```

**Key Files:**
- `src/services/ballotRetrieval.ts` - API integration
- `src/services/ballotParser.ts` - Data transformation
- `src/services/aiSummarizer.ts` - AI summaries
- `src/services/candidateAnalyzer.ts` - Candidate processing
- `src/models/BallotItem.ts` - Data structure

**Important:** This happens ONCE per ballot item, then cached!

---

### 4. Matching & Recommendation Flow

```
User navigates to: BallotBrowserScreen
            ↓
Screen loads → useEffect runs
            ↓
Service: matchingEngine.ts
  - Fetches user vector from database
  - User vector: [0.8, 0.2, 0.1, 0.3, ...]
  - Fetches user's ballot items
            ↓
For EACH ballot item:
            ↓
Load from cache:
{
  id: "ballot-1",
  type: "candidate",
  title: "Governor - Jane Smith",
  embedding: [0.7, 0.4, 0.6, 0.2, ...]
}
            ↓
Calculate similarity:
utils/cosineSimilarity.ts
  cosineSimilarity(
    userVector: [0.8, 0.2, 0.1, 0.3, ...],
    candidateVector: [0.7, 0.4, 0.6, 0.2, ...]
  )
            ↓
Result: 0.87 (on scale of -1 to 1)
            ↓
Convert to confidence:
  similarity: 0.87
  confidence: ((0.87 + 1) / 2) * 100 = 93.5%
  rounded: 94%
            ↓
Generate recommendation:
{
  ballotItemId: "ballot-1",
  confidence: 94,
  recommendation: "Jane Smith",
  reasoning: "Based on your support for healthcare..."
}
            ↓
Repeat for all ballot items
            ↓
Sort by type and confidence
            ↓
Return to screen:
[
  {
    id: "ballot-1",
    title: "Governor",
    confidence: 94,
    recommendation: "Jane Smith"
  },
  {
    id: "ballot-2",
    title: "Proposition 42",
    confidence: 78,
    recommendation: "Yes"
  },
  {
    id: "ballot-3",
    title: "Measure A",
    confidence: 42,
    recommendation: null // Too low!
  }
]
            ↓
Component: BallotBrowserScreen
  - Displays list
  - Shows confidence gauges
  - Allows user interaction
```

**Key Files:**
- `src/screens/BallotBrowserScreen.tsx` - UI
- `src/services/matchingEngine.ts` - Core matching logic
- `src/utils/cosineSimilarity.ts` - Math
- `src/services/confidenceCalculator.ts` - Score calculation

---

### 5. AI Chatbot Flow

```
User taps on ballot item: "Proposition 42"
            ↓
Component: BallotItemDetailScreen
  - Shows full details
  - Chatbot button appears
            ↓
User taps chatbot button
            ↓
Component: AIChatbot opens
  - Knows current ballot item context
            ↓
User types: "What does this really mean for me?"
            ↓
Service: chatbotService.ts
  - Prepares context:
    {
      ballotItem: "Proposition 42: Education Funding",
      fullText: "Long ballot measure text...",
      aiSummary: "Increases school funding...",
      userPreferences: [0.8, 0.2, ...],
      userQuestion: "What does this really mean for me?"
    }
            ↓
RAG System:
  1. Retrieval - Get relevant info:
     - Ballot full text
     - AI summary
     - User's education-related preferences
     - User's district info
            ↓
  2. Augment - Build context:
     "The user has shown strong support for education
      funding (0.8 preference). This measure would
      increase school funding in their district..."
            ↓
  3. Generate - LLM API call:
     Prompt: "Answer the user's question using this context..."
            ↓
LLM Response:
"Based on your support for education, this measure
aligns with your values. In your district (Springfield),
this would provide an additional $2M annually to
local schools. However, it comes with a 0.5% sales
tax increase, which you might want to consider..."
            ↓
Component: AIChatbot
  - Displays response
  - Saves to conversation history
            ↓
Database: chat_messages
{
  userId: "uuid-123",
  ballotItemId: "ballot-2",
  question: "What does this really mean for me?",
  answer: "Based on your support...",
  timestamp: "2026-01-09T11:00:00Z"
}
```

**Key Files:**
- `src/components/AIChatbot.tsx` - UI
- `src/services/chatbotService.ts` - Chat logic
- `src/services/ragService.ts` - RAG implementation

---

## Key Data Transformations

### Transformation 1: Text → Vector

```
Input: "I support universal healthcare"
            ↓
Process: LLM embedding API
            ↓
Output: [0.82, 0.31, 0.15, ..., 0.09]
        ^     ^     ^          ^
        |     |     |          |
      health econ  env    foreign policy
```

**Why:** Computers can't compare text, but they can compare numbers!

### Transformation 2: Swipes → Preference Vector

```
Initial: [0, 0, 0, 0, 0]

Swipe RIGHT on "Support healthcare"
  Statement vector: [0.8, 0.1, 0.0, 0.2, 0.0]
  New user vector:  [0.8, 0.1, 0.0, 0.2, 0.0]

Swipe RIGHT on "Fund education"
  Statement vector: [0.1, 0.9, 0.0, 0.1, 0.0]
  Updated vector:   [0.7, 0.6, 0.0, 0.15, 0.0]
                     ^    ^
                     |    Both values now!
                  healthcare and education

Swipe LEFT on "Cut environmental regulations"
  Statement vector: [0.0, 0.0, -0.7, 0.1, 0.0]
  Updated vector:   [0.6, 0.5, 0.5, 0.1, 0.0]
                                ^
                            Swipe left = opposite!
```

**Algorithm:** Weighted average of all responses

### Transformation 3: Similarity → Confidence

```
Cosine Similarity (raw): 0.87
Scale: -1 to 1

Convert to 0-100%:
confidence = ((similarity + 1) / 2) * 100
           = ((0.87 + 1) / 2) * 100
           = (1.87 / 2) * 100
           = 0.935 * 100
           = 93.5%

Round: 94%
```

---

## State Management

### Local Component State (useState)

```typescript
// For UI-only state that doesn't need to be shared
const [isLoading, setIsLoading] = useState(false);
const [inputValue, setInputValue] = useState('');
```

**Use when:**
- State only matters to this component
- Doesn't need to persist
- Simple UI interactions

### Global App State (Context API or Redux)

```typescript
// For data shared across many components
const AppContext = createContext({
  user: null,
  ballot: null,
  preferences: []
});
```

**Use when:**
- Multiple components need the same data
- User authentication state
- Ballot data accessed from many screens

### Server State (React Query or SWR)

```typescript
// For data from APIs with caching
const { data, isLoading } = useQuery('ballot', fetchBallot);
```

**Use when:**
- Fetching from APIs
- Need automatic caching
- Want loading/error states handled

---

## API Call Patterns

### Pattern 1: Simple Fetch

```typescript
const fetchData = async () => {
  try {
    const response = await fetch('/api/ballot');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Pattern 2: With Loading State

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

### Pattern 3: With Caching

```typescript
const cache = new Map();

const fetchWithCache = async (key) => {
  // Check cache first
  if (cache.has(key)) {
    return cache.get(key);
  }

  // Fetch if not cached
  const data = await fetch(`/api/${key}`);
  const json = await data.json();

  // Store in cache
  cache.set(key, json);

  return json;
};
```

---

## Common Data Flow Mistakes

### ❌ Mistake 1: Prop Drilling

```typescript
// Passing data through many layers
<App>
  <Screen user={user}>
    <Container user={user}>
      <Component user={user}>
        <DeepChild user={user} />
      </Component>
    </Container>
  </Screen>
</App>
```

**✅ Solution:** Use Context or state management

```typescript
const UserContext = createContext();

// Top level
<UserContext.Provider value={user}>
  <App />
</UserContext.Provider>

// Deep child
const DeepChild = () => {
  const user = useContext(UserContext);
  // Use user directly!
};
```

### ❌ Mistake 2: Fetching Same Data Multiple Times

```typescript
// Each component fetches independently
const Screen1 = () => {
  const ballot = await fetchBallot(); // API call 1
};

const Screen2 = () => {
  const ballot = await fetchBallot(); // API call 2 (wasteful!)
};
```

**✅ Solution:** Fetch once, share via state

```typescript
// Fetch in parent, pass down
const App = () => {
  const [ballot, setBallot] = useState(null);

  useEffect(() => {
    fetchBallot().then(setBallot);
  }, []);

  return (
    <>
      <Screen1 ballot={ballot} />
      <Screen2 ballot={ballot} />
    </>
  );
};
```

### ❌ Mistake 3: Not Handling Loading States

```typescript
const Screen = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  return <View>{data.items.map(...)}</View>; // Error! data is null initially
};
```

**✅ Solution:** Always handle loading

```typescript
const Screen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return <Error />;

  return <View>{data.items.map(...)}</View>;
};
```

---

## Debugging Data Flow

### Technique 1: Console Logging

```typescript
const processData = (input) => {
  console.log('Input:', input);

  const transformed = transform(input);
  console.log('After transform:', transformed);

  const final = calculate(transformed);
  console.log('Final result:', final);

  return final;
};
```

### Technique 2: React DevTools

- Install React DevTools browser extension
- View component hierarchy
- Inspect props and state
- Track state changes

### Technique 3: Network Tab

- Open browser DevTools → Network tab
- See all API calls
- Check request/response data
- Identify slow or failing requests

---

## Summary

**Remember these key flows:**

1. **User Input** → Local State → API Call → Database
2. **Database** → API Response → Transform → Component State → UI
3. **User Action** → Event Handler → State Update → Re-render
4. **AI Processing** → Vector Creation → Similarity Calculation → Recommendation

**Best Practices:**

✅ One source of truth for each piece of data
✅ Cache expensive operations (AI calls!)
✅ Handle loading and error states
✅ Keep components simple - move logic to services
✅ Use TypeScript for type safety

---

*This guide will evolve as the app is built. Refer back to it when you're unsure where data comes from or where it should go!*
