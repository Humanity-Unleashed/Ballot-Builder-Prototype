# Implementation Task: Add Value-Framed Explanation Language

## Context

Ballot Builder uses a Civic Blueprint system that scores users on 15 policy axes, which roll up into 3 meta-dimensions:

- `responsibility_orientation`: Community-led ↔ Individual-led
- `change_tempo`: Change-seeking ↔ Stability-seeking  
- `governance_style`: Rules & standards ↔ Flexibility & choice

These meta-dimensions map cleanly onto established psychological value research (Schwartz's theory of basic human values). We want to leverage this mapping to generate more resonant, value-grounded language when explaining why ballot measures or policy positions might matter to a user.

**This is a copy/language enhancement only.** No changes to the assessment flow, scoring algorithm, or data model.

---

## Task

Create a utility module that provides value-framed explanation phrases based on a user's meta-dimension scores. This will be used when:

1. Explaining why a ballot measure aligns (or conflicts) with a user's profile
2. Generating personalized summaries of their Civic Blueprint
3. Framing policy tradeoffs in terms that resonate with their values

---

## File to Create

**Location:** `frontend/utils/valueFraming.ts`

### Data Structure

```typescript
interface ValueFramingConfig {
  metaDimension: 'responsibility_orientation' | 'change_tempo' | 'governance_style';
  pole: 'negative' | 'positive'; // negative = left/community/change/rules, positive = right/individual/stability/flexibility
  
  // Schwartz mapping (for internal documentation)
  schwartzValues: string[];
  
  // User-facing language
  coreValueLabel: string;           // e.g., "community wellbeing", "personal freedom"
  shortPhrase: string;              // e.g., "people looking out for each other"
  resonanceFraming: string;         // e.g., "This connects to your belief that..."
  tradeoffFraming: string;          // e.g., "You might weigh this against..."
  
  // Sentence fragments for template composition
  fragments: {
    youValuePhrase: string;         // "you value [X]"
    thisMattersPhrase: string;      // "this matters to people who [X]"
    alignmentPhrase: string;        // "this aligns with your preference for [X]"
    tensionPhrase: string;          // "this may create tension with your value of [X]"
  };
}
```

### Mapping Content

```typescript
export const VALUE_FRAMING: ValueFramingConfig[] = [
  // RESPONSIBILITY ORIENTATION
  {
    metaDimension: 'responsibility_orientation',
    pole: 'negative', // Community-led
    schwartzValues: ['universalism', 'benevolence'],
    coreValueLabel: 'collective wellbeing',
    shortPhrase: 'shared responsibility and mutual support',
    resonanceFraming: 'This connects to your belief that we do better when we look out for each other.',
    tradeoffFraming: 'You might weigh this against concerns about efficiency or individual choice.',
    fragments: {
      youValuePhrase: 'you value community-level solutions and shared responsibility',
      thisMattersPhrase: 'this matters to people who believe strong communities require collective investment',
      alignmentPhrase: 'this aligns with your preference for solutions that spread risk and responsibility broadly',
      tensionPhrase: 'this may create tension with your value of collective approaches to shared problems',
    },
  },
  {
    metaDimension: 'responsibility_orientation',
    pole: 'positive', // Individual-led
    schwartzValues: ['achievement', 'power', 'self-direction'],
    coreValueLabel: 'personal responsibility',
    shortPhrase: 'individual initiative and self-reliance',
    resonanceFraming: 'This connects to your belief that people thrive when they have ownership over their own outcomes.',
    tradeoffFraming: 'You might weigh this against concerns about those who face systemic barriers.',
    fragments: {
      youValuePhrase: 'you value individual agency and personal accountability',
      thisMattersPhrase: 'this matters to people who believe in earned success and self-determination',
      alignmentPhrase: 'this aligns with your preference for solutions that reward initiative and preserve choice',
      tensionPhrase: 'this may create tension with your value of personal freedom and individual responsibility',
    },
  },

  // CHANGE TEMPO
  {
    metaDimension: 'change_tempo',
    pole: 'negative', // Change-seeking
    schwartzValues: ['self-direction', 'stimulation', 'universalism'],
    coreValueLabel: 'progress and adaptation',
    shortPhrase: 'trying new approaches to solve problems',
    resonanceFraming: 'This connects to your belief that better solutions often require trying something new.',
    tradeoffFraming: 'You might weigh this against risks of unintended consequences.',
    fragments: {
      youValuePhrase: 'you value innovation and willingness to update approaches that aren\'t working',
      thisMattersPhrase: 'this matters to people who believe progress requires openness to change',
      alignmentPhrase: 'this aligns with your appetite for reform and fresh approaches',
      tensionPhrase: 'this may create tension with your openness to change and reform',
    },
  },
  {
    metaDimension: 'change_tempo',
    pole: 'positive', // Stability-seeking
    schwartzValues: ['security', 'tradition', 'conformity'],
    coreValueLabel: 'continuity and proven approaches',
    shortPhrase: 'building on what already works',
    resonanceFraming: 'This connects to your belief that stability and predictability have real value.',
    tradeoffFraming: 'You might weigh this against missed opportunities for improvement.',
    fragments: {
      youValuePhrase: 'you value tested approaches and predictable outcomes',
      thisMattersPhrase: 'this matters to people who believe stability enables long-term planning and trust',
      alignmentPhrase: 'this aligns with your preference for incremental change and proven methods',
      tensionPhrase: 'this may create tension with your value of continuity and careful deliberation',
    },
  },

  // GOVERNANCE STYLE
  {
    metaDimension: 'governance_style',
    pole: 'negative', // Rules & standards
    schwartzValues: ['universalism', 'security', 'conformity'],
    coreValueLabel: 'consistent standards',
    shortPhrase: 'clear rules that apply to everyone',
    resonanceFraming: 'This connects to your belief that fairness requires consistent, enforceable standards.',
    tradeoffFraming: 'You might weigh this against concerns about rigidity or one-size-fits-all mandates.',
    fragments: {
      youValuePhrase: 'you value clear guidelines and accountability through consistent rules',
      thisMattersPhrase: 'this matters to people who believe fairness requires standards that apply equally',
      alignmentPhrase: 'this aligns with your preference for transparent, enforceable standards',
      tensionPhrase: 'this may create tension with your belief in consistent rules and oversight',
    },
  },
  {
    metaDimension: 'governance_style',
    pole: 'positive', // Flexibility & choice
    schwartzValues: ['self-direction', 'achievement', 'power'],
    coreValueLabel: 'flexibility and local control',
    shortPhrase: 'room to adapt to specific situations',
    resonanceFraming: 'This connects to your belief that good solutions often require flexibility and local judgment.',
    tradeoffFraming: 'You might weigh this against concerns about inconsistency or gaps in protection.',
    fragments: {
      youValuePhrase: 'you value adaptability and solutions tailored to specific contexts',
      thisMattersPhrase: 'this matters to people who believe one-size-fits-all approaches often miss the mark',
      alignmentPhrase: 'this aligns with your preference for local discretion and flexible implementation',
      tensionPhrase: 'this may create tension with your value of flexibility and context-sensitive solutions',
    },
  },
];
```

### Utility Functions

```typescript
/**
 * Get the value framing config for a user's dominant pole on a meta-dimension.
 * 
 * @param metaDimension - The meta-dimension key
 * @param score - The user's score on that dimension, range [-1, +1]
 * @returns The ValueFramingConfig for their dominant pole, or null if neutral
 */
export function getValueFraming(
  metaDimension: 'responsibility_orientation' | 'change_tempo' | 'governance_style',
  score: number
): ValueFramingConfig | null {
  // If score is too close to center, don't claim a dominant value
  const NEUTRAL_THRESHOLD = 0.15;
  if (Math.abs(score) < NEUTRAL_THRESHOLD) return null;

  const pole = score < 0 ? 'negative' : 'positive';
  return VALUE_FRAMING.find(
    (vf) => vf.metaDimension === metaDimension && vf.pole === pole
  ) || null;
}

/**
 * Get all dominant value framings for a user's full meta-dimension profile.
 * 
 * @param metaScores - Object with responsibility_orientation, change_tempo, governance_style scores
 * @returns Array of ValueFramingConfig for each non-neutral dimension
 */
export function getUserValueFramings(metaScores: {
  responsibility_orientation: number;
  change_tempo: number;
  governance_style: number;
}): ValueFramingConfig[] {
  const dimensions = ['responsibility_orientation', 'change_tempo', 'governance_style'] as const;
  return dimensions
    .map((dim) => getValueFraming(dim, metaScores[dim]))
    .filter((vf): vf is ValueFramingConfig => vf !== null);
}

/**
 * Generate a brief value summary for the user (e.g., for profile display).
 * 
 * @param metaScores - Object with the three meta-dimension scores
 * @returns A 1-2 sentence summary of their core values
 */
export function generateValueSummary(metaScores: {
  responsibility_orientation: number;
  change_tempo: number;
  governance_style: number;
}): string {
  const framings = getUserValueFramings(metaScores);
  
  if (framings.length === 0) {
    return 'Your values are balanced across different perspectives, which means you likely weigh tradeoffs on a case-by-case basis.';
  }

  const valueLabels = framings.map((f) => f.coreValueLabel);
  
  if (valueLabels.length === 1) {
    return `Your civic perspective centers on ${valueLabels[0]}.`;
  }
  
  if (valueLabels.length === 2) {
    return `Your civic perspective emphasizes ${valueLabels[0]} and ${valueLabels[1]}.`;
  }

  return `Your civic perspective weaves together ${valueLabels.slice(0, -1).join(', ')}, and ${valueLabels.slice(-1)}.`;
}

/**
 * Generate a framing for why a policy position might resonate or create tension.
 * 
 * @param metaScores - User's meta-dimension scores
 * @param policyAlignment - Which meta-dimensions this policy aligns with (positive score = aligns with positive pole)
 * @returns Object with resonance and tension phrases
 */
export function generatePolicyFraming(
  metaScores: {
    responsibility_orientation: number;
    change_tempo: number;
    governance_style: number;
  },
  policyAlignment: {
    responsibility_orientation?: number;
    change_tempo?: number;
    governance_style?: number;
  }
): { resonance: string[]; tension: string[] } {
  const resonance: string[] = [];
  const tension: string[] = [];

  const dimensions = ['responsibility_orientation', 'change_tempo', 'governance_style'] as const;

  for (const dim of dimensions) {
    const userScore = metaScores[dim];
    const policyScore = policyAlignment[dim];
    
    if (policyScore === undefined || Math.abs(userScore) < 0.15) continue;

    const userPole = userScore < 0 ? 'negative' : 'positive';
    const policyPole = policyScore < 0 ? 'negative' : 'positive';
    const framing = VALUE_FRAMING.find((vf) => vf.metaDimension === dim && vf.pole === userPole);

    if (!framing) continue;

    if (userPole === policyPole) {
      resonance.push(framing.fragments.alignmentPhrase);
    } else {
      tension.push(framing.fragments.tensionPhrase);
    }
  }

  return { resonance, tension };
}
```

---

## Usage Examples

### In a ballot measure explanation:

```typescript
const metaScores = deriveMetaDimensions(userProfile);
const { resonance, tension } = generatePolicyFraming(metaScores, {
  responsibility_orientation: -0.6, // This measure leans community-oriented
  change_tempo: -0.4, // And involves reform
});

// resonance might contain: "this aligns with your preference for solutions that spread risk and responsibility broadly"
// tension might contain: "this may create tension with your value of continuity and careful deliberation"
```

### In the Blueprint profile summary:

```typescript
const metaScores = deriveMetaDimensions(userProfile);
const summary = generateValueSummary(metaScores);
// "Your civic perspective emphasizes collective wellbeing and progress and adaptation."
```

---

## Testing

1. Verify `getValueFraming` returns correct config for scores at -0.5, 0, +0.5
2. Verify `getUserValueFramings` handles mixed profiles (some dimensions neutral, some not)
3. Verify `generatePolicyFraming` correctly identifies alignment vs. tension
4. Verify all string fragments read naturally when composed into sentences

---

## Notes

- The Schwartz value mappings (`schwartzValues` field) are for internal documentation only—they're not displayed to users
- The `NEUTRAL_THRESHOLD` of 0.15 can be tuned based on UX testing
- These phrases are designed to be non-judgmental—neither pole is framed as superior
- This module has no dependencies on existing stores/context; it's pure utility functions
