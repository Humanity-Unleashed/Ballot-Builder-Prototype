# Your First Tasks - Getting Started with Coding

This guide walks you through your first actual coding contributions to Ballot Builder. These tasks are designed for beginners and will help you understand the codebase.

## Before You Start

Make sure you have:
- [ ] Read [BEGINNER_TUTORIAL.md](BEGINNER_TUTORIAL.md)
- [ ] Set up your development environment (Node.js, VS Code, Git)
- [ ] Cloned this repository
- [ ] Installed dependencies (`npm install`)

---

## Task 1: Create Your First Data Model (15 minutes)

**What you'll learn:** TypeScript interfaces, data structure design

**What to do:** Define what a "Policy Statement" looks like in code.

### Step-by-step:

1. Create a new file: `src/models/Statement.ts`

2. Add this code:

```typescript
/**
 * Represents a policy statement that users swipe on
 * in the Civic Blueprint builder
 */
export interface Statement {
  // Unique identifier
  id: string;

  // The actual statement text
  text: string;

  // Which policy area this belongs to
  category: PolicyCategory;

  // How specific is this statement?
  specificity: 'broad' | 'moderate' | 'specific';

  // When was this created?
  createdAt: Date;

  // Has this been shown to the user?
  shown?: boolean;

  // How did the user respond?
  userResponse?: 'agree' | 'disagree' | null;
}

/**
 * Different policy areas we ask about
 */
export type PolicyCategory =
  | 'healthcare'
  | 'education'
  | 'economy'
  | 'environment'
  | 'criminal-justice'
  | 'immigration'
  | 'foreign-policy'
  | 'civil-rights'
  | 'infrastructure'
  | 'technology';

/**
 * Example statement for testing
 */
export const EXAMPLE_STATEMENT: Statement = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  text: 'The government should invest more in renewable energy sources',
  category: 'environment',
  specificity: 'moderate',
  createdAt: new Date(),
  shown: false,
  userResponse: null,
};
```

3. Save the file

**What you just did:**
- Defined the structure for policy statements
- Used TypeScript to ensure data consistency
- Created an example for testing

---

## Task 2: Build a Simple Component (30 minutes)

**What you'll learn:** React components, props, styling

**What to do:** Create a confidence gauge component that shows match percentages.

### Step-by-step:

1. Create a new file: `src/components/ConfidenceGauge.tsx`

2. Add this code:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Props for the ConfidenceGauge component
 */
interface ConfidenceGaugeProps {
  // The confidence percentage (0-100)
  confidence: number;

  // Optional custom label
  label?: string;
}

/**
 * Displays a visual gauge showing how confident we are
 * in a recommendation
 */
export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  confidence,
  label = 'Match',
}) => {
  // Determine color based on confidence level
  const getColor = () => {
    if (confidence < 50) return '#FF3B30'; // Red - low confidence
    if (confidence < 75) return '#FF9500'; // Orange - medium
    return '#34C759'; // Green - high confidence
  };

  // Determine text label
  const getConfidenceLabel = () => {
    if (confidence < 50) return 'Low confidence';
    if (confidence < 75) return 'Moderate confidence';
    return 'High confidence';
  };

  return (
    <View style={styles.container}>
      {/* Percentage display */}
      <Text style={[styles.percentage, { color: getColor() }]}>
        {confidence}%
      </Text>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Progress bar background */}
      <View style={styles.barBackground}>
        {/* Progress bar fill */}
        <View
          style={[
            styles.barFill,
            {
              width: `${confidence}%`,
              backgroundColor: getColor(),
            },
          ]}
        />
      </View>

      {/* Confidence description */}
      <Text style={styles.description}>{getConfidenceLabel()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  percentage: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  barBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  description: {
    fontSize: 14,
    color: '#999',
  },
});
```

3. Create a test file to see your component: `src/components/ConfidenceGauge.test.tsx`

```typescript
import React from 'react';
import { View } from 'react-native';
import { ConfidenceGauge } from './ConfidenceGauge';

/**
 * Simple test screen to see the ConfidenceGauge in action
 * You can import this in App.tsx to visualize
 */
export const ConfidenceGaugeTest = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'space-around', padding: 20 }}>
      <ConfidenceGauge confidence={85} label="Candidate Match" />
      <ConfidenceGauge confidence={60} label="Measure 42" />
      <ConfidenceGauge confidence={30} label="Proposition 7" />
    </View>
  );
};
```

**What you just did:**
- Created a reusable UI component
- Used props to make it flexible
- Added conditional styling based on data
- Created a test to visualize it

---

## Task 3: Write a Utility Function (20 minutes)

**What you'll learn:** Pure functions, algorithms, testing

**What to do:** Implement the cosine similarity function used for matching.

### Step-by-step:

1. Create a new file: `src/utils/cosineSimilarity.ts`

2. Add this code:

```typescript
/**
 * Calculates the cosine similarity between two vectors
 * Returns a value between -1 and 1:
 * - 1 means perfect match
 * - 0 means no relationship
 * - -1 means perfect opposite
 */
export const cosineSimilarity = (
  vectorA: number[],
  vectorB: number[]
): number => {
  // Validate inputs
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be the same length');
  }

  if (vectorA.length === 0) {
    throw new Error('Vectors cannot be empty');
  }

  // Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }

  // Calculate magnitude of vector A
  let magnitudeA = 0;
  for (let i = 0; i < vectorA.length; i++) {
    magnitudeA += vectorA[i] * vectorA[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);

  // Calculate magnitude of vector B
  let magnitudeB = 0;
  for (let i = 0; i < vectorB.length; i++) {
    magnitudeB += vectorB[i] * vectorB[i];
  }
  magnitudeB = Math.sqrt(magnitudeB);

  // Avoid division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Calculate and return cosine similarity
  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Converts cosine similarity to a confidence percentage (0-100)
 */
export const similarityToConfidence = (similarity: number): number => {
  // Convert from [-1, 1] to [0, 100]
  const confidence = ((similarity + 1) / 2) * 100;

  // Round to whole number
  return Math.round(confidence);
};

// Example usage and tests
if (require.main === module) {
  // Test 1: Identical vectors (perfect match)
  const vector1 = [1, 2, 3];
  const vector2 = [1, 2, 3];
  console.log('Identical vectors:', cosineSimilarity(vector1, vector2)); // Should be 1

  // Test 2: Opposite vectors
  const vector3 = [1, 2, 3];
  const vector4 = [-1, -2, -3];
  console.log('Opposite vectors:', cosineSimilarity(vector3, vector4)); // Should be -1

  // Test 3: Perpendicular vectors (no relationship)
  const vector5 = [1, 0];
  const vector6 = [0, 1];
  console.log('Perpendicular vectors:', cosineSimilarity(vector5, vector6)); // Should be 0

  // Test 4: Similar vectors
  const userVector = [0.8, 0.3, 0.5, 0.2]; // User's preferences
  const candidateVector = [0.7, 0.4, 0.6, 0.1]; // Candidate's positions
  const similarity = cosineSimilarity(userVector, candidateVector);
  console.log('User-Candidate similarity:', similarity);
  console.log('Confidence:', similarityToConfidence(similarity) + '%');
}
```

3. Run the tests:
```bash
npx ts-node src/utils/cosineSimilarity.ts
```

**What you just did:**
- Implemented a core algorithm for the app
- Added input validation
- Created helper functions
- Wrote inline tests

---

## Task 4: Create a Mock API Service (25 minutes)

**What you'll learn:** Async functions, API patterns, promises

**What to do:** Create a mock service that simulates fetching ballot data.

### Step-by-step:

1. Create a new file: `src/services/ballotService.ts`

2. Add this code:

```typescript
import type { BallotItem } from '../models/BallotItem';

/**
 * Mock ballot data for testing
 * In production, this would come from Ballotpedia API
 */
const MOCK_BALLOT_DATA: BallotItem[] = [
  {
    id: 'ballot-1',
    type: 'candidate',
    title: 'Governor',
    description: 'State Governor Race',
    candidates: [
      { name: 'Jane Smith', party: 'Democratic' },
      { name: 'John Doe', party: 'Republican' },
    ],
    confidence: 85,
    recommendation: 'Jane Smith',
  },
  {
    id: 'ballot-2',
    type: 'measure',
    title: 'Proposition 42: Education Funding',
    description:
      'Increases funding for public schools by implementing a 0.5% sales tax increase',
    outcomes: {
      yes: 'Public schools receive additional $500M annually',
      no: 'School funding remains at current levels',
    },
    confidence: 72,
    recommendation: 'yes',
  },
  {
    id: 'ballot-3',
    type: 'measure',
    title: 'Measure A: Housing Development',
    description: 'Allows construction of affordable housing units in residential zones',
    outcomes: {
      yes: 'Up to 1000 new affordable units can be built',
      no: 'Current zoning restrictions remain',
    },
    confidence: 45,
    recommendation: null, // Low confidence - no recommendation
  },
];

/**
 * Simulates network delay
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches ballot data for a user's district
 * Currently uses mock data, will be replaced with real API calls
 */
export const fetchBallot = async (userId: string): Promise<BallotItem[]> => {
  console.log(`Fetching ballot for user: ${userId}`);

  // Simulate network delay (500ms)
  await delay(500);

  // In production, this would be:
  // const response = await fetch(`/api/ballots/${userId}`);
  // return response.json();

  return MOCK_BALLOT_DATA;
};

/**
 * Fetches a single ballot item by ID
 */
export const fetchBallotItem = async (
  itemId: string
): Promise<BallotItem | null> => {
  console.log(`Fetching ballot item: ${itemId}`);

  await delay(300);

  const item = MOCK_BALLOT_DATA.find((ballot) => ballot.id === itemId);
  return item || null;
};

/**
 * Updates user's selection for a ballot item
 */
export const updateBallotSelection = async (
  userId: string,
  itemId: string,
  selection: string
): Promise<void> => {
  console.log(`User ${userId} selected "${selection}" for item ${itemId}`);

  await delay(200);

  // In production, save to database:
  // await fetch(`/api/users/${userId}/selections`, {
  //   method: 'POST',
  //   body: JSON.stringify({ itemId, selection }),
  // });
};
```

3. Create the BallotItem type: `src/models/BallotItem.ts`

```typescript
export interface BallotItem {
  id: string;
  type: 'candidate' | 'measure' | 'proposition';
  title: string;
  description: string;

  // For candidate races
  candidates?: Array<{
    name: string;
    party: string;
  }>;

  // For measures/propositions
  outcomes?: {
    yes: string;
    no: string;
  };

  // Recommendation data
  confidence?: number;
  recommendation?: string | 'yes' | 'no' | null;
}
```

**What you just did:**
- Created a service layer for API calls
- Used async/await for asynchronous operations
- Created mock data for testing
- Set up structure for future real API integration

---

## Task 5: Put It All Together (30 minutes)

**What you'll learn:** Connecting components, state management, data flow

**What to do:** Create a simple screen that uses everything you built.

### Step-by-step:

1. Create a new file: `src/screens/TestScreen.tsx`

2. Add this code:

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ConfidenceGauge } from '../components/ConfidenceGauge';
import { fetchBallot } from '../services/ballotService';
import type { BallotItem } from '../models/BallotItem';
import { cosineSimilarity, similarityToConfidence } from '../utils/cosineSimilarity';

/**
 * Test screen to demonstrate all the components working together
 */
export const TestScreen = () => {
  const [ballotItems, setBallotItems] = useState<BallotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ballot data when screen loads
  useEffect(() => {
    loadBallot();
  }, []);

  const loadBallot = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch ballot for test user
      const ballot = await fetchBallot('test-user-123');
      setBallotItems(ballot);
    } catch (err) {
      setError('Failed to load ballot');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your ballot...</Text>
      </View>
    );
  }

  // Show error message
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBallot}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show ballot items
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Ballot</Text>
      <Text style={styles.subheader}>
        {ballotItems.length} items • Based on your civic blueprint
      </Text>

      {/* Demo: Cosine similarity */}
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>🔬 Math Demo</Text>
        <Text style={styles.demoText}>
          Your preference vector: [0.8, 0.3, 0.5]
        </Text>
        <Text style={styles.demoText}>
          Candidate vector: [0.7, 0.4, 0.6]
        </Text>
        <Text style={styles.demoText}>
          Similarity:{' '}
          {cosineSimilarity([0.8, 0.3, 0.5], [0.7, 0.4, 0.6]).toFixed(3)}
        </Text>
        <Text style={styles.demoText}>
          Confidence:{' '}
          {similarityToConfidence(
            cosineSimilarity([0.8, 0.3, 0.5], [0.7, 0.4, 0.6])
          )}
          %
        </Text>
      </View>

      {/* Ballot items */}
      {ballotItems.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>

          {item.confidence !== undefined && (
            <ConfidenceGauge confidence={item.confidence} />
          )}

          {item.recommendation && (
            <View style={styles.recommendation}>
              <Text style={styles.recommendationLabel}>Recommendation:</Text>
              <Text style={styles.recommendationValue}>
                {item.recommendation}
              </Text>
            </View>
          )}

          {item.candidates && (
            <View style={styles.candidates}>
              <Text style={styles.candidatesLabel}>Candidates:</Text>
              {item.candidates.map((candidate, index) => (
                <Text key={index} style={styles.candidateName}>
                  • {candidate.name} ({candidate.party})
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoSection: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  recommendation: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  recommendationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recommendationValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  candidates: {
    marginTop: 12,
  },
  candidatesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  candidateName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});
```

**What you just did:**
- Created a full screen component
- Managed loading and error states
- Integrated all your previous work
- Demonstrated data flow from service → component

---

## Next Steps

After completing these tasks, you should:

1. **Test your code** - Make sure everything works
2. **Commit your changes** - Use Git to save your work
3. **Ask for code review** - Get feedback from the team
4. **Pick a new feature** - Move on to building real screens

### Suggested next features:
- Build the swipe card interaction
- Create the intake form
- Design the ballot browser navigation
- Implement user settings screen

---

## Tips for Success

✅ **Do:**
- Test your code as you write
- Add comments to explain tricky parts
- Ask questions when stuck
- Break big tasks into smaller steps
- Celebrate small wins!

❌ **Don't:**
- Copy code without understanding it
- Skip error handling
- Forget to save and commit
- Be afraid to ask for help

---

## Getting Help

Stuck on something? Here's how to get unstuck:

1. **Read the error message** - It usually tells you what's wrong
2. **Check the docs** - Official documentation is your friend
3. **Search Google** - Someone has probably had this problem before
4. **Ask the team** - We're here to help!

---

Good luck! You've got this! 🚀

*Remember: Every expert was once a beginner. The only way to learn is by doing.*
