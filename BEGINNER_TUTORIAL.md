# Ballot Builder - Beginner's Tutorial 🗳️

Welcome to Ballot Builder! This tutorial will help you understand how the app works and how to contribute, even if you're new to coding.

## Table of Contents
1. [What is Ballot Builder?](#what-is-ballot-builder)
2. [The Big Picture - How Everything Fits Together](#the-big-picture)
3. [Understanding the App Flow](#understanding-the-app-flow)
4. [Key Concepts Explained Simply](#key-concepts-explained-simply)
5. [The Tech Stack (What We're Building With)](#the-tech-stack)
6. [Project Structure](#project-structure)
7. [Development Phases - What to Build First](#development-phases)
8. [How to Contribute](#how-to-contribute)
9. [Common Tasks & Examples](#common-tasks--examples)
10. [Resources & Learning Materials](#resources--learning-materials)

---

## What is Ballot Builder?

Ballot Builder is like a "voting assistant app" that helps people make informed decisions when voting. Think of it as:

- **Tinder for politics** - Users swipe on policy statements to build their preferences
- **Netflix recommendations for voting** - The app suggests candidates/measures that match your values
- **Your voting study buddy** - It explains complex ballot language in simple terms

### The Core Problem We're Solving
Voting is complicated! Ballots can have dozens of items, and understanding what each candidate stands for or what a measure actually does takes hours of research. Most people don't have that time.

### Our Solution
1. Learn what the user cares about (through fun swipe interactions)
2. Get their ballot information
3. Match them with candidates/measures that align with their values
4. Explain everything in simple language

---

## The Big Picture - How Everything Fits Together

```
┌─────────────────────────────────────────────────────┐
│  1. USER STARTS APP                                 │
│     "I want help with my ballot"                    │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  2. INTAKE QUESTIONNAIRE                            │
│     - Where do you live? (to get your ballot)       │
│     - Quick questions about basic preferences       │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  3. CIVIC BLUEPRINT BUILDER (The Fun Part!)         │
│     - Swipe right if you agree with a statement     │
│     - Swipe left if you disagree                    │
│     - App learns your political values              │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  4. BALLOT RETRIEVAL                                │
│     - App fetches your actual ballot                │
│     - Gets info about all candidates & measures     │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  5. MATCHING & RECOMMENDATIONS                      │
│     - Compare your values to each ballot item       │
│     - Calculate confidence scores                   │
│     - Generate explanations                         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  6. BALLOT BROWSER                                  │
│     - User reviews recommendations                  │
│     - Makes final decisions                         │
│     - Can export to take to polls                   │
└─────────────────────────────────────────────────────┘
```

---

## Understanding the App Flow

Let's walk through what happens when someone uses Ballot Builder:

### Step 1: Getting Started (Intake)
**What the user sees:**
- Simple form asking for their address
- 5-10 basic questions like "Do you think healthcare should be more accessible?"

**What's happening behind the scenes:**
- App looks up which electoral districts they're in (city, county, state, federal)
- Creates a "user profile" in the database
- Stores their initial answers as a "preference vector" (basically a list of numbers representing their views)

**Files involved:** (will be created)
- `src/screens/IntakeScreen.tsx` - The form UI
- `src/services/districtLookup.ts` - Finds user's districts
- `src/models/User.ts` - User data structure

---

### Step 2: Building Your Civic Blueprint (The Swipe Feature)
**What the user sees:**
- Cards with policy statements like "The government should invest more in renewable energy"
- Swipe right to agree, left to disagree
- Progress bar showing how many questions they've answered

**What's happening behind the scenes:**
- AI generates personalized questions based on:
  - What they already answered
  - Issues relevant to their area
  - Topics they haven't covered yet
- Each swipe updates their "preference vector"
- App gets smarter about what questions to ask next

**Files involved:** (will be created)
- `src/screens/CivicBlueprintScreen.tsx` - The swipe UI
- `src/components/SwipeCard.tsx` - Individual card component
- `src/services/statementGenerator.ts` - Generates questions using AI
- `src/services/preferenceEngine.ts` - Updates user's preference vector

**Key Concept: The Preference Vector**
Imagine your political views as coordinates on a map:
- Position on healthcare (0 to 100)
- Position on environment (0 to 100)
- Position on economy (0 to 100)
- etc.

Each swipe adjusts these coordinates. That's your "preference vector"!

---

### Step 3: Getting Your Ballot
**What the user sees:**
- Notification: "Your ballot is ready!"
- Maybe nothing - this happens automatically

**What's happening behind the scenes:**
- App contacts Ballotpedia API with user's district info
- Downloads all ballot items (candidates, measures, propositions)
- AI analyzes each item and creates simple explanations
- Stores everything in database (cached so we don't repeat this work)

**Files involved:** (will be created)
- `src/services/ballotRetrieval.ts` - Gets ballot data
- `src/services/ballotParser.ts` - Organizes the data
- `src/services/aiSummarizer.ts` - Creates simple explanations
- `src/models/BallotItem.ts` - Ballot data structure

---

### Step 4: Matching You with Candidates/Measures
**What the user sees:**
- Nothing yet - this is preparation

**What's happening behind the scenes:**
This is where the magic happens! The app:
1. Compares your preference vector to each candidate's policy positions
2. Uses "cosine similarity" (a math formula) to calculate how well you match
3. Generates a confidence score (0-100%)
4. Creates explanations: "This candidate aligns 85% with your civic blueprint because..."

**Files involved:** (will be created)
- `src/services/matchingEngine.ts` - Does the comparison
- `src/utils/cosineSimilarity.ts` - The math function
- `src/services/confidenceCalculator.ts` - Calculates scores

**Key Concept: Cosine Similarity**
Imagine two arrows:
- One arrow represents your political views
- Another represents a candidate's views

If the arrows point in the same direction = high match
If they point opposite ways = low match
The math measures the angle between them!

---

### Step 5: Reviewing Your Ballot
**What the user sees:**
- List of all ballot items
- Each has a confidence score: "85% match"
- Simple explanations of what each measure does
- Can tap to see more details or ask questions

**What's happening behind the scenes:**
- Displays pre-calculated recommendations
- Tracks which items user has reviewed
- Updates completion status
- Allows user to override recommendations

**Files involved:** (will be created)
- `src/screens/BallotBrowserScreen.tsx` - Main ballot view
- `src/components/BallotItem.tsx` - Individual item card
- `src/components/ConfidenceGauge.tsx` - Shows the match percentage
- `src/components/AIChatbot.tsx` - Answers user questions

---

### Step 6: Taking It to the Polls
**What the user sees:**
- "Export to PDF" button
- Printable guide with all their decisions
- Optional: Map to polling location

**What's happening behind the scenes:**
- Generates PDF with all selections
- Includes confidence scores and notes
- Formats for easy printing

**Files involved:** (will be created)
- `src/services/pdfExporter.ts` - Creates the PDF
- `src/screens/PollLocatorScreen.tsx` - Shows polling place

---

## Key Concepts Explained Simply

### 1. Vectors & Embeddings
**Simple explanation:** Converting text/opinions into numbers so computers can compare them.

**Example:**
- "I support renewable energy" might become: `[0.8, 0.3, 0.1, ...]`
- "I oppose fossil fuel subsidies" might become: `[0.7, 0.2, 0.15, ...]`
- These are similar! The computer can "see" that.

### 2. AI/LLM (Large Language Model)
**Simple explanation:** A smart computer program that can:
- Generate human-like text
- Understand and summarize complex documents
- Answer questions

**In our app:**
- Generates policy questions
- Explains ballot measures in simple language
- Powers the chatbot

**We use:** GPT-4 models through providers like Deep Infra (cheaper than OpenAI)

### 3. RAG (Retrieval-Augmented Generation)
**Simple explanation:** Making AI smarter by giving it access to specific information.

**In our app:**
When user asks: "What does Measure 42 do?"
1. App looks up Measure 42 text from database (Retrieval)
2. Sends it to AI along with the question (Augmented)
3. AI generates answer using that specific info (Generation)

### 4. Caching
**Simple explanation:** Saving work to avoid doing it again.

**Example:**
- First user in California: AI explains Proposition 1 (costs money)
- Second user in California: We already have that explanation! (free)
- We store (cache) explanations and reuse them

### 5. Cosine Similarity
**Simple explanation:** A way to measure how similar two sets of preferences are.

**The math:**
```javascript
// Don't worry if this looks confusing!
// It's just comparing two lists of numbers
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

**Result:** A number between -1 and 1
- 1 = perfect match
- 0 = no relation
- -1 = complete opposite

---

## The Tech Stack

Here's what we're building with and why:

### Frontend (What users see)
- **React Native** - Build for iOS and Android at the same time
  - Why: Write once, deploy everywhere
  - Beginner friendly: If you know JavaScript, you can learn this!

### Backend (The server/brain)
- **Node.js + Express** OR **Python + FastAPI** (TBD)
  - Why: Fast, popular, lots of resources for learning
  - Handles: API requests, AI calls, data processing

### Database
- **PostgreSQL** - Stores user data, ballots, responses
  - Why: Reliable, handles complex data well

- **Pinecone or Qdrant** - Stores vectors for fast similarity search
  - Why: Specialized for the kind of matching we're doing

### AI Services
- **Deep Infra or Novita** - Cheap access to powerful AI models
  - Models: GPT-4-20B (for most tasks)
  - Why: Same quality as OpenAI but much cheaper

### APIs We'll Use
1. **Ballotpedia API** - Gets ballot data
2. **Address-to-District API** - Converts addresses to voting districts
3. **Voting Information Project** - Poll location finder

---

## Project Structure

Here's how the code will be organized:

```
Ballot-Builder/
├── src/
│   ├── screens/              # Full-page views
│   │   ├── IntakeScreen.tsx
│   │   ├── CivicBlueprintScreen.tsx
│   │   ├── BallotBrowserScreen.tsx
│   │   └── PollLocatorScreen.tsx
│   │
│   ├── components/           # Reusable UI pieces
│   │   ├── SwipeCard.tsx
│   │   ├── BallotItem.tsx
│   │   ├── ConfidenceGauge.tsx
│   │   └── AIChatbot.tsx
│   │
│   ├── services/             # Business logic
│   │   ├── api.ts                  # API client
│   │   ├── districtLookup.ts       # Address → districts
│   │   ├── ballotRetrieval.ts      # Get ballot data
│   │   ├── statementGenerator.ts   # Generate questions
│   │   ├── preferenceEngine.ts     # Update user vector
│   │   ├── matchingEngine.ts       # Calculate matches
│   │   └── aiSummarizer.ts         # Explain ballot items
│   │
│   ├── models/               # Data structures
│   │   ├── User.ts
│   │   ├── BallotItem.ts
│   │   ├── Candidate.ts
│   │   └── Statement.ts
│   │
│   ├── utils/                # Helper functions
│   │   ├── cosineSimilarity.ts
│   │   ├── vectorOperations.ts
│   │   └── validators.ts
│   │
│   ├── navigation/           # App navigation setup
│   │   └── AppNavigator.tsx
│   │
│   └── App.tsx              # Main app entry point
│
├── backend/                  # Server code (separate folder)
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── database/
│
├── tests/                    # Automated tests
├── docs/                     # Documentation
└── package.json             # Dependencies list
```

---

## Development Phases

We're building this in stages. Here's what comes first:

### Phase 1: MVP (Minimum Viable Product) - First 3-4 months

**Goal:** Get the basic flow working end-to-end

**What we're building:**
1. Simple intake form (manual district entry, no fancy address lookup yet)
2. Swipe interface with 50 pre-written questions
3. Basic ballot display with recommendations
4. Simple confidence scores

**Good tasks for beginners:**
- Design and build the intake form UI
- Create the swipe card component
- Style the ballot item cards
- Write validation functions for user input

### Phase 2: Smart Features - Next 2-3 months

**Goal:** Add AI intelligence

**What we're building:**
1. AI-generated questions (not pre-written)
2. AI explanations of ballot measures
3. Chatbot to answer questions
4. Address-based district lookup

**Medium difficulty tasks:**
- Integrate AI APIs
- Build the chatbot interface
- Create visualization components

### Phase 3: Polish - 2 months

**Goal:** Make it beautiful and complete

**What we're building:**
1. Push notifications for election reminders
2. PDF export
3. Poll location finder
4. Performance improvements

### Phase 4: Scale - Ongoing

**Goal:** Handle lots of users, reduce costs

---

## How to Contribute

### As a Beginner, You Can:

#### 1. **UI/UX Work** (Easiest to start)
- Design screen layouts
- Create components (buttons, cards, forms)
- Style with CSS/styling libraries
- Test on different phone sizes

**Example task:**
```javascript
// Create a simple button component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const PrimaryButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

#### 2. **Data Modeling**
- Define TypeScript interfaces for data
- Create validation functions
- Document data structures

**Example task:**
```typescript
// Define what a ballot item looks like
export interface BallotItem {
  id: string;
  type: 'candidate' | 'measure' | 'proposition';
  title: string;
  description: string;
  position?: string; // For candidate races
  candidates?: Candidate[];
  confidence?: number;
  recommendation?: 'yes' | 'no' | 'neutral';
}
```

#### 3. **Testing**
- Write test cases
- Test UI on different devices
- Report bugs with clear descriptions

#### 4. **Documentation**
- Write code comments
- Create guides like this one
- Document API endpoints

### Learning Path

**Week 1-2: Setup & Basics**
- Install React Native development environment
- Learn basic JavaScript/TypeScript
- Understand component structure
- Build your first simple component

**Week 3-4: Understanding Data Flow**
- Learn about state management
- Understand API calls
- Practice with mock data

**Week 5-6: Features**
- Build a small feature end-to-end
- Work with version control (Git)
- Collaborate with the team

**Week 7-8: Integration**
- Connect frontend to backend
- Work with real APIs
- Debug issues

---

## Common Tasks & Examples

### Task 1: Create a New Screen

```typescript
// src/screens/ExampleScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ExampleScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My New Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

### Task 2: Make an API Call

```typescript
// src/services/api.ts
export const fetchUserBallot = async (userId: string) => {
  try {
    const response = await fetch(`/api/users/${userId}/ballot`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ballot:', error);
    throw error;
  }
};
```

### Task 3: Calculate Confidence Score

```typescript
// src/services/confidenceCalculator.ts
import { cosineSimilarity } from '../utils/cosineSimilarity';

export const calculateConfidence = (
  userVector: number[],
  itemVector: number[]
): number => {
  // Get similarity (-1 to 1)
  const similarity = cosineSimilarity(userVector, itemVector);

  // Convert to percentage (0 to 100)
  const confidence = ((similarity + 1) / 2) * 100;

  // Round to whole number
  return Math.round(confidence);
};
```

### Task 4: Create a Swipe Card

```typescript
// src/components/SwipeCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

export const SwipeCard = ({ statement, onSwipe }) => {
  const handleGesture = (event) => {
    const { translationX } = event.nativeEvent;

    if (translationX > 100) {
      onSwipe('agree');
    } else if (translationX < -100) {
      onSwipe('disagree');
    }
  };

  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <View style={styles.card}>
        <Text style={styles.statement}>{statement}</Text>
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    height: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statement: {
    fontSize: 18,
    textAlign: 'center',
  },
});
```

---

## Resources & Learning Materials

### For Beginners

**JavaScript Basics:**
- [JavaScript.info](https://javascript.info/) - Comprehensive JS tutorial
- [FreeCodeCamp](https://www.freecodecamp.org/) - Interactive lessons

**React Native:**
- [Official React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Native Express](http://www.reactnative.express/) - Quick reference

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript for React Developers](https://www.typescriptlang.org/docs/handbook/react.html)

**Git & Version Control:**
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

### Understanding AI Concepts

**Embeddings & Vectors:**
- [What are embeddings?](https://vickiboykis.com/what_are_embeddings/) - Great intro
- [Visual intro to similarity](https://www.youtube.com/watch?v=8krd5qKVw-Q)

**LLMs (Large Language Models):**
- [How GPT works (simple explanation)](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/)
- [RAG explained](https://www.pinecone.io/learn/retrieval-augmented-generation/)

### Development Tools

**Required:**
- [VS Code](https://code.visualstudio.com/) - Code editor
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Git](https://git-scm.com/) - Version control

**Helpful:**
- [Postman](https://www.postman.com/) - Test APIs
- [React DevTools](https://react-devtools-tutorial.vercel.app/) - Debug React
- [Expo Go](https://expo.dev/client) - Test React Native on your phone

---

## Getting Help

### When You're Stuck:

1. **Check the docs** - Most questions are answered in official documentation
2. **Search the codebase** - Someone might have solved this already
3. **Ask the team** - Use Slack/Discord (we're friendly!)
4. **Google it** - "React Native [your problem]" usually finds answers
5. **Stack Overflow** - Search first, ask second

### Good Questions Include:
- What you're trying to do
- What you've tried
- The error message (if any)
- Relevant code snippets

**Bad:** "It doesn't work"
**Good:** "I'm trying to fetch ballot data in `BallotScreen.tsx` but getting a 404 error. Here's my fetch call: [code]. I checked and the API endpoint exists."

---

## Key Principles

### 1. Mobile-First
Everything should work great on phones. Test on small screens!

### 2. User Privacy
Never share or sell user data. Be transparent about what we collect.

### 3. Transparency
Always explain why we recommend something. Show confidence scores.

### 4. Accessibility
Make sure screen readers work. Use good color contrast. Support different text sizes.

### 5. Cost Efficiency
AI API calls cost money! Cache everything we can reuse.

---

## Quick Reference

### Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Check for TypeScript errors
npm run type-check

# Format code
npm run format
```

### Useful Code Snippets

**Loading state:**
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.getData();
    // handle data
  } catch (error) {
    // handle error
  } finally {
    setLoading(false);
  }
};
```

**Error handling:**
```typescript
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof NetworkError) {
    showError('Check your internet connection');
  } else {
    showError('Something went wrong');
  }
}
```

---

## Glossary

- **API** - Application Programming Interface (how programs talk to each other)
- **Backend** - The server/database part users don't see
- **Component** - A reusable piece of UI (like a button or card)
- **Frontend** - The app users see and interact with
- **Props** - Data passed to a component
- **State** - Data that can change (like form inputs)
- **Vector** - A list of numbers representing something (like preferences)
- **Embedding** - Converting text to a vector
- **LLM** - Large Language Model (like GPT)
- **RAG** - Retrieval-Augmented Generation (AI + database lookup)

---

## Next Steps

1. **Set up your development environment** - Follow React Native setup guide
2. **Clone the repo** - Get the code on your computer
3. **Run the app** - Make sure everything works
4. **Pick a small task** - Start with something simple like styling a component
5. **Make your first commit** - Get comfortable with the workflow
6. **Ask questions** - Don't be shy!

---

## Remember

- **Everyone was a beginner once** - Don't be intimidated
- **It's okay to not know** - That's why we learn
- **Small progress is still progress** - Every line of code counts
- **The best way to learn is by doing** - Jump in!
- **We're a team** - We succeed together

Welcome to the project! 🎉

---

*Last updated: January 9, 2026*
*For questions or suggestions about this tutorial, contact the development team*
