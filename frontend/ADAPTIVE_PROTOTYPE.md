# 🧭 Adaptive Prototype - Smart Question Flow

The adaptive prototype demonstrates intelligent question branching that feels personalized while keeping the simple swipe mechanic.

## What's Different?

### Standard Prototype:
- Linear: 20 questions in fixed order
- Same for everyone
- Broad coverage

### Adaptive Prototype:
- **Branching:** Questions change based on answers
- **Personalized:** Focuses on what YOU care about
- **Progressive:** Gets more specific over time
- **Efficient:** ~15 questions vs 20+

---

## How It Works

### The Flow:

```
Start: Healthcare (broad)
         ↓
  User swipes RIGHT (agree)
         ↓
💡 "You care about healthcare. Let's explore your views more..."
         ↓
Round 2: Government healthcare role
         ↓
  User swipes RIGHT (agree)
         ↓
💡 "Getting specific now..."
         ↓
Round 3: Single-payer vs public option
         ↓
Continue to Environment...
```

### Three Rounds:

**Round 1: Exploration** (5 topics)
- Healthcare (broad)
- Environment (broad)
- Education (broad)
- Economy (broad)
- Rights (broad)

🎯 Goal: Identify what you care about

**Round 2: Focus** (Varies)
- Dives into your interests
- Tests specific approaches
- "You support climate action. How aggressive?"

🎯 Goal: Understand your philosophy

**Round 3: Precision** (Varies)
- Very specific policy positions
- Edge cases
- "Single-payer or public option?"

🎯 Goal: Fine-tune your blueprint

---

## Example Flow: Healthcare

```
Q1: "Healthcare should be more affordable" [BROAD]
    ├─ AGREE → Q2a: "Government should provide healthcare"
    │           ├─ AGREE → Q3a: "Medicare-for-All system"
    │           └─ DISAGREE → Q3b: "Public option competing with private"
    │
    └─ DISAGREE → Q2b: "Market competition lowers costs"
                ├─ AGREE → Q3c: "Reduce health regulations"
                └─ DISAGREE → Q3d: "Require pre-existing coverage"
```

**Result:** 4 different possible paths based on 2 swipes!

---

## Key Features

### 1. Transition Messages
Between rounds, you see:
- "You care about healthcare. Let's explore..."
- "Diving deeper into your interests..."
- "Getting specific now..."

**Why:** Makes it feel smart and personalized

### 2. Round Indicators
Top of screen shows:
- "Round 1 • 3 answered"
- "Round 2 • 7 answered"
- "Round 3 • 12 answered"

**Why:** Users know where they are in the journey

### 3. Progress Hints
Bottom of screen:
- Round 1: "📊 Exploring broad topics..."
- Round 2: "🔍 Diving deeper..."
- Round 3: "🎯 Fine-tuning..."

**Why:** Reinforces the adaptive nature

### 4. Smart Branching
Each answer determines the next question:
```javascript
{
  "id": "healthcare_broad",
  "agree": "healthcare_government",  // ← Go here if agree
  "disagree": "healthcare_market"    // ← Go here if disagree
}
```

**Why:** Simple but feels sophisticated

---

## Comparison

### Test Both Versions!

**Standard Prototype Tab:**
- Linear progression
- 20 questions
- Simple and fast

**Adaptive Tab:**
- Branching paths
- 13-17 questions (varies by path)
- Feels personalized

---

## Technical Implementation

### Data Structure

```json
{
  "flow": {
    "healthcare_broad": {
      "id": "healthcare_broad",
      "round": 1,
      "text": "Healthcare should be more affordable",
      "vector": [0.8, 0.2, 0.1, 0.3, 0.5],
      "agree": "healthcare_government",
      "disagree": "healthcare_market",
      "transitionBefore": null
    }
  }
}
```

### Branching Logic

```typescript
// Get next question based on response
const nextQuestionId = direction === 'agree'
  ? currentQuestion.agree
  : currentQuestion.disagree;

// Show transition if exists
if (nextQuestion.transitionBefore) {
  showTransitionMessage(nextQuestion.transitionBefore);
  // Wait 1.5s, then show next question
}
```

### No AI Needed!
- Pre-written questions
- Pre-defined paths
- Simple if-then logic
- Works perfectly for prototype

---

## User Experience

### What Users See:

1. **Start swiping** - Feels normal at first

2. **First transition** - "Oh, it's learning!"
   ```
   💡 You care about healthcare.
      Let's explore your views more...
   ```

3. **Specific questions** - "This is tailored to me!"
   ```
   Round 2 • Question becomes very relevant
   ```

4. **Results** - "Wow, these feel accurate!"
   ```
   ✨ Personalized to your views
   Based on 15 adaptive responses
   ```

### Psychological Impact:
- ✅ Feels intelligent
- ✅ Seems personalized
- ✅ Creates engagement
- ✅ Increases trust in results

---

## Testing Both Versions

### Try This Exercise:

1. **Do Standard Prototype first**
   - Note how it feels
   - Count questions
   - Check results

2. **Do Adaptive Prototype**
   - Notice the transitions
   - Feel the personalization
   - Compare results

3. **Ask Yourself:**
   - Which felt better?
   - Which seemed smarter?
   - Which results seemed more accurate?
   - Which would you actually use?

---

## Extending the Adaptive Flow

### Add More Paths:

```json
{
  "environment_specific": {
    "text": "Nuclear energy should be part of clean energy",
    "agree": "environment_nuclear_yes",
    "disagree": "environment_solar_only"
  }
}
```

### Add More Rounds:

```
Round 1: 5 broad topics
Round 2: 5 focused follow-ups
Round 3: 5 specific positions
Round 4: 3 edge cases (new!)
```

### Add Importance Ratings:

```json
{
  "text": "Healthcare should be affordable",
  "followUp": {
    "type": "importance",
    "question": "How important is this to you?",
    "scale": [1, 2, 3, 4, 5]
  }
}
```

---

## Benefits for Demo

### For Stakeholders:
- "Look how smart the system is!"
- "It adapts to each user"
- "More efficient than competitors"

### For Users:
- Feels personalized
- Less tedious
- More engaging
- Trust the results more

### For Development:
- Same simple swipe UI
- No complex AI needed
- Easy to modify paths
- Can test different flows

---

## Data Quality

### Adaptive Advantages:
- ✅ Fewer total questions
- ✅ More relevant questions
- ✅ Higher engagement
- ✅ Better signal-to-noise

### Potential Issues:
- ⚠️ Some topics might not be covered
- ⚠️ Path-dependent (different users see different questions)
- ⚠️ Harder to compare users

### Solutions:
- Always ask 1-2 questions per major topic
- Track which paths users take
- Ensure minimum coverage

---

## Running the Adaptive Prototype

### Quick Start:

```bash
cd frontend
npm start
# Press 'w' for web
```

### Find It:
Bottom navigation → **"Adaptive"** tab (branch icon 🌿)

### Compare:
- **Prototype** tab = Standard linear
- **Adaptive** tab = Smart branching

---

## File Locations

```
frontend/
├── app/(tabs)/
│   ├── prototype.tsx           ← Standard version
│   └── adaptive-prototype.tsx  ← Adaptive version
├── data/
│   ├── statements.json         ← Linear questions
│   └── adaptiveFlow.json       ← Branching questions
└── components/
    └── SwipeCard.tsx           ← Same component, both versions!
```

---

## Next Steps

### Iterate on Paths:
1. Test with real users
2. Track which paths are taken most
3. Refine questions based on feedback
4. Add more branches where needed

### Add Features:
1. Show "path map" in results
2. Let users go back and change answers
3. Add "why did you ask this?" explanations
4. Create visual journey summary

### Measure Success:
- Completion rate
- Time to complete
- User satisfaction
- Recommendation accuracy

---

## The Magic

**Users think:** "This AI is learning about me!"

**Reality:** Simple branching logic with smart UX

**Result:** High engagement + trust + better data

---

That's the power of good UX design! 🎯

The adaptive prototype shows that you don't need complex AI to feel intelligent. Just thoughtful question design and smooth transitions.

---

**Happy testing!** 🚀
