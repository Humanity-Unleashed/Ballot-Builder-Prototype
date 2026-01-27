# Blueprint Visualization Research

**Created:** January 27, 2026
**Status:** Research Findings
**Problem:** Current visualization mockups (radar charts, polar charts, gradient bars) are not intuitive enough for users to understand their civic blueprint at a glance.

---

## Current Mockups Analysis

### What Was Tried

| Mockup | Approach | Issue |
|--------|----------|-------|
| `blueprint-v3-options.html` | Multi-bar view + Radar charts per domain | Abstract scales, requires interpretation |
| `blueprint-polar-charts.html` | Rose charts, spider charts, gauge charts | Visually complex, hard to read exact positions |
| `blueprint-axis-styles.html` | 8values split bars, gradient bars, segments | Too technical, percentages don't convey meaning |

### Why They Feel Unintuitive

1. **Abstract Representations**: All approaches show positions on scales (0-100%, left-right) but users don't intuitively know what "35% toward public healthcare" means in practice.

2. **Data-Heavy, Not Story-Driven**: Charts show raw data positions but don't tell users what they actually believe or why it matters.

3. **Too Much Information**: Showing all 12+ axes at once overwhelms users. No hierarchy or progressive disclosure.

4. **Missing Context**: No comparison to real-world benchmarks (current policy, party platforms, other voters).

5. **Requires Learning**: Users must learn what the visualization means before they can interpret their results.

---

## Research Findings

### Key Insight: Narrative Over Numbers

Research on data storytelling shows that **narrative approaches significantly outperform raw data visualization** for user comprehension ([Stanford Narrative Visualization Study](http://vis.stanford.edu/files/2010-Narrative-InfoVis.pdf)).

> "Data stories improve the efficiency of comprehension tasks, as well as the effectiveness of comprehension tasks that involve a single insight, compared with conventional visualizations."

### Spotify Wrapped: The Gold Standard

Spotify Wrapped succeeds because it:

- **Tells a story** rather than showing a dashboard
- **Reveals one insight at a time** (progressive disclosure)
- **Uses emotional language** ("your anthem," "your soundtrack")
- **Provides social context** ("you're in the top 0.5% of listeners")
- **Minimizes text, maximizes visual impact**
- **Creates shareable moments**

Source: [NoGood - Spotify Wrapped Marketing Strategy](https://nogood.io/blog/spotify-wrapped-marketing-strategy/)

### ISideWith: Alignment Over Axes

ISideWith's approach differs from traditional political compasses:

- **Shows alignment percentages** with real parties/candidates rather than abstract axes
- **Doesn't label users** with ideology terms
- **Provides context** via "learn more" options for each issue
- **Neutral framing** - lets users discover where they align

Source: [8values vs ISideWith comparison](https://alittlebithuman.com/political-spectrum-tests/)

### Progressive Disclosure Best Practices

From [Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/):

> "Defer advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone."

For dashboards and data visualization:
- Use **interactive elements** (sliders, filters) to let users control information depth
- Implement **guided exploration** via tutorials, tips, or prompts
- Limit to **2 disclosure levels** maximum for good usability

---

## Alternative Visualization Approaches

### Approach 1: Story Cards (Spotify Wrapped Style)

**Concept**: Present the blueprint as a series of swipeable cards, each revealing one insight about the user.

```
┌─────────────────────────────────┐
│                                 │
│    Your #1 Priority             │
│                                 │
│    🏥 Healthcare                │
│                                 │
│    "Access to affordable        │
│     healthcare matters most     │
│     to you."                    │
│                                 │
│         [Swipe to continue →]   │
└─────────────────────────────────┘
```

**Flow:**
1. "Your top 3 priorities are..."
2. "On healthcare, you believe..."
3. "You're more progressive than 65% of voters on [X]"
4. "Your civic identity in 3 words..."
5. Summary card with shareable graphic

**Pros:**
- Highly engaging, familiar pattern
- One insight at a time reduces cognitive load
- Emotional connection through language
- Shareable moments

**Cons:**
- Takes longer to see everything
- May feel gimmicky for serious civic content

---

### Approach 2: "What You Support" Plain Language View

**Concept**: Instead of showing positions on scales, show a list of plain-language policy statements the user supports.

```
┌─────────────────────────────────┐
│ What You Believe                │
├─────────────────────────────────┤
│                                 │
│ ✓ Government should provide     │
│   a public health insurance     │
│   option                        │
│                                 │
│ ✓ Climate action should be a    │
│   top priority, even if it      │
│   costs more                    │
│                                 │
│ ✓ Police funding should be      │
│   maintained with reforms       │
│                                 │
│ ○ Education funding should      │
│   follow students to any        │
│   school (you're mixed on this) │
│                                 │
│         [See all 12 positions]  │
└─────────────────────────────────┘
```

**Key Features:**
- Checkmarks for clear positions, circles for mixed views
- Plain language, no jargon or scales
- Expandable to see full details
- Grouped by importance (your top priorities first)

**Pros:**
- Immediately understandable
- No learning curve
- Users can verify accuracy ("yes, I do believe that")
- Easy to share specific positions

**Cons:**
- Less visual appeal
- Doesn't show nuance (how strongly you lean)

---

### Approach 3: Alignment Comparison View

**Concept**: Show how the user aligns with known reference points (current policy, party platforms, or voter archetypes).

```
┌─────────────────────────────────┐
│ How You Compare                 │
├─────────────────────────────────┤
│                                 │
│ Current US Policy     ████░░ 67%│
│ Democratic Platform   ███████ 82%│
│ Republican Platform   ████░░░ 45%│
│ Libertarian Platform  ███░░░░ 38%│
│                                 │
├─────────────────────────────────┤
│ On most issues, you lean        │
│ toward expanding government     │
│ programs while supporting       │
│ moderate fiscal policies.       │
│                                 │
│         [See breakdown by issue]│
└─────────────────────────────────┘
```

**Key Features:**
- Familiar "match percentage" pattern
- Provides real-world context
- Summary text explains what the numbers mean
- Drill-down available for curious users

**Pros:**
- Immediately meaningful reference points
- Users understand what 82% alignment means
- Useful for voting decisions
- Less abstract than axis positions

**Cons:**
- Risk of reinforcing partisan identity
- May oversimplify nuanced positions
- Some users may reject party comparisons

---

### Approach 4: Priority-First Cards with Semantic Scale

**Concept**: Show one policy domain at a time as a card, with a simple semantic scale instead of numbers.

```
┌─────────────────────────────────┐
│ 🏥 Healthcare          ★★★★★   │
│    (Your #1 Priority)           │
├─────────────────────────────────┤
│                                 │
│ Your View:                      │
│ ┌─────────────────────────────┐ │
│ │ "Government should offer a  │ │
│ │  public insurance option    │ │
│ │  that competes with private │ │
│ │  plans."                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ How this compares:              │
│                                 │
│  More Gov't ◀━━━━●━━━▶ More Market│
│              ↑                  │
│         You're here             │
│                                 │
│ 📊 Similar to 42% of Americans  │
│                                 │
│    [Tap to fine-tune] [Next →]  │
└─────────────────────────────────┘
```

**Key Features:**
- Priority stars show importance at a glance
- Quoted statement shows exactly what they believe
- Simple left-right scale with "you're here" marker
- Social comparison for context
- One domain per card, swipe to navigate

**Pros:**
- Combines storytelling with data
- Shows both position AND priority
- Social comparison adds meaning
- Can still fine-tune from this view

**Cons:**
- More vertical space per item
- Still uses a scale (though simplified)

---

### Approach 5: Before/After Current Policy View

**Concept**: For each issue, show current US policy and where the user wants to move.

```
┌─────────────────────────────────┐
│ Healthcare Coverage             │
├─────────────────────────────────┤
│                                 │
│ 📍 Current US Policy:           │
│ "Mix of employer-based,         │
│  Medicaid, Medicare, and        │
│  individual market insurance"   │
│                                 │
│         ↓ You want to move to   │
│                                 │
│ 🎯 Your Preferred Policy:       │
│ "Government offers public       │
│  option that competes with      │
│  private plans"                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ █████░░░░░░ Moderate Change │ │
│ └─────────────────────────────┘ │
│                                 │
│    [Learn More] [Adjust →]      │
└─────────────────────────────────┘
```

**Key Features:**
- Anchors position against something known (current policy)
- Shows direction of desired change
- "Moderate change" label is more intuitive than percentages
- Before/after comparison is universally understood

**Pros:**
- Very intuitive comparison pattern
- Users can verify if they understand the current state
- Shows magnitude of desired change
- Grounded in reality, not abstract axes

**Cons:**
- Requires accurate current policy descriptions
- More text-heavy
- May feel political if current policy is controversial

---

### Approach 6: Issue Priority Matrix

**Concept**: A 2x2 grid showing what matters most and where you have strong vs. moderate views.

```
┌─────────────────────────────────────────┐
│ Your Civic Identity                      │
├────────────────────┬────────────────────┤
│  STRONG VIEWS      │  MODERATE VIEWS    │
│  (High Priority)   │  (High Priority)   │
│ ┌────────────────┐ │ ┌────────────────┐ │
│ │ • Healthcare   │ │ │ • Education    │ │
│ │ • Climate      │ │ │ • Housing      │ │
│ │                │ │ │                │ │
│ └────────────────┘ │ └────────────────┘ │
│   These define you │   Open to options  │
├────────────────────┼────────────────────┤
│  STRONG VIEWS      │  MODERATE VIEWS    │
│  (Lower Priority)  │  (Lower Priority)  │
│ ┌────────────────┐ │ ┌────────────────┐ │
│ │ • Justice      │ │ │ • Taxes        │ │
│ │                │ │ │ • Benefits     │ │
│ └────────────────┘ │ └────────────────┘ │
│   Firm but flexible│   Go with the flow │
└────────────────────┴────────────────────┘

         [Tap any issue for details]
```

**Key Features:**
- Shows what's important AND how strongly they feel
- Four quadrants create meaningful categories
- "These define you" language adds personality
- Overview-first, details on demand

**Pros:**
- Shows both dimensions (priority + conviction) at once
- Creates memorable identity categories
- Quick to scan
- Reduces to 4 buckets instead of 12+ axes

**Cons:**
- Less precise than individual axis views
- Categorization may oversimplify
- Doesn't show actual positions

---

### Approach 7: Conversational Summary

**Concept**: AI-generated paragraph describing the user's civic identity in natural language.

```
┌─────────────────────────────────┐
│ Your Civic Profile              │
├─────────────────────────────────┤
│                                 │
│ "You're someone who believes    │
│  government should play an      │
│  active role in healthcare and  │
│  climate action, but you also   │
│  value fiscal responsibility.   │
│                                 │
│  Healthcare is your top         │
│  priority — you'd like to see   │
│  a public option available to   │
│  all Americans.                 │
│                                 │
│  On education and justice,      │
│  you're more moderate, open to  │
│  different approaches as long   │
│  as they produce results."      │
│                                 │
│    [See detailed breakdown →]   │
└─────────────────────────────────┘
```

**Key Features:**
- Natural language summary
- Highlights key positions and priorities
- Feels personal and readable
- Can be generated from axis scores

**Pros:**
- Most intuitive format possible
- No scales or charts to interpret
- Feels like someone understands you
- Highly shareable

**Cons:**
- Less precise
- May miss nuances
- Harder to compare across users
- Needs good copy generation

---

## Recommended Hybrid Approach

Based on research, the most intuitive Blueprint visualization would combine:

### Level 1: Conversational Summary (Default View)
- 2-3 paragraph AI-generated description
- Highlights top priorities and strongest positions
- Shareable one-liner ("I'm a healthcare-first pragmatist")

### Level 2: Priority Cards (Swipe/Tap to Explore)
- One domain per card, ordered by importance
- Plain-language position statements
- Simple visual indicator (not percentage)
- "Similar to X% of voters" context

### Level 3: Detailed Adjustment (Modal on Demand)
- Full slider for fine-tuning
- Position descriptions at each point
- Current policy reference
- Keep existing modal UI for this level

### Visual Hierarchy

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Level 1: Summary                               │
│  "Here's who you are in a nutshell"             │
│  (Always visible, highly shareable)             │
│                                                 │
│                    ↓ Tap to explore             │
│                                                 │
│  Level 2: Priority Cards                        │
│  "Your positions on each issue"                 │
│  (Progressive disclosure, one at a time)        │
│                                                 │
│                    ↓ Tap to adjust              │
│                                                 │
│  Level 3: Detailed Sliders                      │
│  "Fine-tune your position"                      │
│  (On-demand, for power users)                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Implementation Suggestions

### Quick Wins (Low Effort, High Impact)

1. **Add a summary sentence** at the top: "You prioritize healthcare and believe in a strong government safety net."

2. **Reorder axes by importance** instead of fixed order - show what matters most first.

3. **Replace percentages with words**: Instead of "70% left", show "Leans toward public option."

4. **Add social comparison**: "42% of users have similar views on this issue."

### Medium Effort

5. **Story mode**: Add a "See your story" button that walks through positions one at a time.

6. **Plain-language positions**: For each axis, show a one-sentence summary of what they believe instead of just axis scores.

7. **Before/After context**: Show current US policy as a reference point on each axis.

### Larger Redesign

8. **Conversational summary**: Generate a 2-3 paragraph description of their civic identity.

9. **Alignment view**: Show how positions align with party platforms or voter archetypes.

10. **Shareable cards**: Create visually appealing summary cards for social sharing.

---

## Sources

- [Narrative Visualization: Telling Stories with Data (Stanford)](http://vis.stanford.edu/files/2010-Narrative-InfoVis.pdf)
- [Progressive Disclosure - Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)
- [Spotify Wrapped Marketing Strategy - NoGood](https://nogood.io/blog/spotify-wrapped-marketing-strategy/)
- [Data Storytelling - Harvard Business School](https://online.hbs.edu/blog/post/data-storytelling)
- [Political Spectrum Tests - ALittleBitHuman](https://alittlebithuman.com/political-spectrum-tests/)
- [Semantic Differential Scale UX - Enquete](https://www.enquete.com/en/blog-1280-when-to-use-a-semantic-differential-scale-over-a-likert-scale)
- [Card UI Design - Nielsen Norman Group](https://www.nngroup.com/articles/cards-component/)
- [4 Rules for Intuitive UX - Learn UI Design](https://www.learnui.design/blog/4-rules-intuitive-ux.html)
- [Visual Comparison Techniques - Dev3lop](https://dev3lop.com/visual-comparison-techniques-for-before-after-analysis/)
