# Assessment & Blueprint Pipeline

How a user progresses from zero to a fully scored civic blueprint with archetype classification.

## Overview

The assessment pipeline transforms user responses into a structured political profile (Blueprint) that powers ballot recommendations.

```
User Input (Slider Positions)
        ↓
Synthetic Swipe Conversion
        ↓
Axis Scoring Algorithm
        ↓
Blueprint Profile
        ↓
Meta-Dimensions
        ↓
Archetype Classification
```

---

## 1. Data Model

### Hierarchy

```
Spec (loaded from /api/civic-axes/spec)
  └── 5 Domains
       └── 3 Axes each = 15 total axes
            └── N Items (assessment statements) per axis
```

### Domains

| ID | Name | Axes |
|----|------|------|
| `econ` | Economic Opportunity & Taxes | `econ_safetynet`, `econ_investment`, `econ_school_choice` |
| `health` | Healthcare & Public Health | `health_coverage_model`, `health_cost_control`, `health_public_health` |
| `housing` | Housing & Local Growth | `housing_supply_zoning`, `housing_affordability_tools`, `housing_transport_priority` |
| `justice` | Public Safety & Justice | `justice_policing_accountability`, `justice_sentencing_goals`, `justice_firearms` |
| `climate` | Climate, Energy & Environment | `climate_ambition`, `climate_energy_portfolio`, `climate_permitting` |

### Axes

Each axis represents a policy spectrum with two poles:

- **Pole A** (left/purple side) - e.g., "Broader Safety Net"
- **Pole B** (right/teal side) - e.g., "More Conditional Safety Net"

Axes are designed to avoid false binaries. Concepts that aren't mutually exclusive are split into separate axes.

### Items

Assessment statements that inform axis scores:

```typescript
interface Item {
  id: string;
  text: string;                        // Statement shown to user
  axis_keys: Record<string, 1 | -1>;   // Which axes, with direction
  level: GovernmentLevel;              // local | state | national | general
  tags: string[];
}
```

The `axis_keys` direction (+1/-1) determines whether agreement pushes toward Pole A or Pole B.

---

## 2. Assessment Flow

### Entry Point

User lands on Blueprint page in `not_started` state and sees IntroScreen. Tapping "Start Drafting" begins assessment.

### Slider-Based Assessment

For each axis, the user sees:
- Axis name and question
- 5-position draggable slider
- Position title + description at each stop
- Center position (index 2) represents current policy baseline

**Slider Position Mapping:**
- Position 0 (far left/Pole A) → score closer to -1
- Position 2 (center) → score 0
- Position 4 (far right/Pole B) → score closer to +1

### Response Conversion

Slider positions are converted to synthetic swipe events:

```
For each axis response:
  1. Convert slider position to score via sliderPositionToScore()
  2. Find items that map to this axis
  3. Take up to 2 items per axis
  4. For each item: effectiveScore = score * item.axis_keys[axisId]
  5. Map effectiveScore to SwipeResponse:
     <= -0.6  → strong_disagree
     <= -0.2  → disagree
     >= 0.6   → strong_agree
     >= 0.2   → agree
     else     → unsure
```

---

## 3. Scoring Algorithm

### Response Scale

```
strong_disagree: -2
disagree:        -1
unsure:           0
agree:           +1
strong_agree:    +2
```

### Per-Axis Scoring

Implemented in `src/server/data/civicAxes/index.ts`:

```
For each axis:
  For each response where item maps to this axis:
    if response == unsure:
      n_unsure++
    else:
      contribution = responseValue * direction
      rawSum += contribution
      n_answered++
      maxPossible += 2

  normalized = rawSum / maxPossible          // range: [-1, +1]
  shrunk = normalized * (n_answered / (n_answered + k))
  confidence = n_answered / (n_answered + k)
```

Where `k` = shrinkage factor = **6**

### Shrinkage Effect

Shrinkage pulls scores toward zero when evidence is thin:

| Answers | Confidence | Score Multiplier |
|---------|------------|------------------|
| 1 | 0.14 | 14% of raw |
| 3 | 0.33 | 33% of raw |
| 6 | 0.50 | 50% of raw |
| 12 | 0.67 | 67% of raw |
| 30 | 0.83 | 83% of raw |

### Axis Score Output

```typescript
interface AxisScore {
  axis_id: string;
  raw_sum: number;       // Sum of (responseValue * direction)
  n_answered: number;    // Non-unsure responses
  n_unsure: number;
  normalized: number;    // raw_sum / maxPossible, [-1, +1]
  shrunk: number;        // normalized * confidence
  confidence: number;    // n_answered / (n_answered + k)
  top_drivers: string[]; // Item IDs with highest |contribution|
}
```

---

## 4. Blueprint Profile

### Score-to-Value Mapping

The shrunk score ([-1, +1]) maps to display value (0-10):

```
value_0_10 = round((1 - shrunk) * 5)
```

- shrunk = +1.0 → value = 0 (full Pole A)
- shrunk = 0.0 → value = 5 (center)
- shrunk = -1.0 → value = 10 (full Pole B)

### User Editing

After assessment, users can fine-tune any axis:
- **Slider**: Adjust stance (0-10), sets `source` to `user_edited`
- **Importance**: Set per-axis priority (0-10)
- **Lock**: Freeze axis so future updates don't change it

---

## 5. Meta-Dimensions

Three higher-order dimensions derived from the 15 axes. These power the archetype system and Values Spectrum card.

### Axis-to-Meta Mapping

| Meta-Dimension | Contributing Axes |
|----------------|-------------------|
| **responsibility_orientation** | `econ_safetynet`, `econ_investment`, `health_coverage_model`, `health_public_health`, `housing_affordability_tools` |
| **change_tempo** | `housing_supply_zoning`, `housing_transport_priority`, `justice_sentencing_goals`, `climate_ambition`, `climate_energy_portfolio`, `climate_permitting` |
| **governance_style** | `econ_school_choice`, `health_cost_control`, `justice_policing_accountability`, `justice_firearms`, `climate_permitting` |

### Computation

```
For each meta-dimension:
  For each contributing axis:
    axisScore = (5 - value_0_10) / 5        // Convert 0-10 to [-1, +1]
    weight = domainImportance_0_10 / 10     // Importance as 0-1

  meta_score = weighted_average(axisScores, weights)
```

### Interpretation

| Dimension | -1 | +1 |
|-----------|----|----|
| `responsibility_orientation` | Community-led | Individual-led |
| `change_tempo` | Change-seeking | Stability-seeking |
| `governance_style` | Rules & standards | Flexibility & choice |

---

## 6. Archetypes

### The 8 Archetypes

Each archetype is a point in 3D meta-dimension space:

| Archetype | Emoji | Responsibility | Tempo | Governance | Traits |
|-----------|-------|----------------|-------|------------|--------|
| Caring Koala | koala | -0.7 | +0.5 | -0.4 | Community-minded, Steady |
| Independent Stallion | horse | +0.7 | -0.4 | +0.4 | Autonomy-first, Action-oriented |
| Thoughtful Owl | owl | -0.3 | +0.6 | -0.7 | Evidence-driven, Fairness-minded |
| Pragmatic Fox | fox | 0.0 | -0.2 | +0.4 | Practical, Flexible |
| Steady Turtle | turtle | -0.2 | +0.8 | +0.1 | Cautious, Long-term |
| Agile Panther | panther | +0.4 | -0.7 | +0.1 | Fast-moving, Decisive |
| Principled Elephant | elephant | -0.6 | -0.6 | -0.2 | Values-driven, Reform-minded |
| Loyal Retriever | dog | -0.1 | +0.7 | +0.5 | Trust-building, Continuity |

### Classification Algorithm

```
1. Compute user's MetaDimensionScores (3 values in [-1, +1])
2. For each archetype, compute Euclidean distance:
   distance = sqrt(
     (user.responsibility - centroid.responsibility)² +
     (user.tempo - centroid.tempo)² +
     (user.governance - centroid.governance)²
   )
3. Sort by distance ascending
4. Primary archetype = nearest
5. Secondary archetype = second nearest
6. Margin = distance[1] - distance[0]
```

---

## 7. Schwartz Values Integration

The Schwartz values assessment provides an additional layer of personal values that can inform ballot recommendations.

### Value Types

10 basic values organized in a circumplex:
- **Openness to Change**: Self-Direction, Stimulation, Hedonism
- **Self-Enhancement**: Achievement, Power
- **Conservation**: Security, Conformity, Tradition
- **Self-Transcendence**: Benevolence, Universalism

### Scoring

Uses **ipsatization** - scores are relative to the individual's mean rating:
```
ipsatized_score = raw_mean - individual_mean
```

This removes response bias and reveals relative value priorities.

---

## 8. Complete Pipeline Summary

```
User taps "Start Drafting"
        ↓
[Assessment: 15 slider questions, one per axis]
        ↓
[Convert slider positions to synthetic SwipeEvents]
        ↓
[POST /api/civic-axes/score: raw → normalized → shrunk]
        ↓
[Build BlueprintProfile: 5 domains × 3 axes]
        ↓
[User can fine-tune in edit modal]
        ↓
[deriveMetaDimensions(): 15 axes → 3 meta-dimensions]
        ↓
[computeArchetype(): Euclidean distance to 8 centroids]
        ↓
[Display: Values Spectrum, Priority Insight, Archetype]
```

---

## 9. Key Source Files

| File | Role |
|------|------|
| `src/server/data/civicAxes/spec.ts` | Canonical spec: domains, axes, items |
| `src/server/data/civicAxes/index.ts` | `scoreAxes()` scoring algorithm |
| `src/server/services/civicAxesService.ts` | Scoring service |
| `src/types/civicAssessment.ts` | TypeScript types |
| `src/types/blueprintProfile.ts` | Profile types |
| `src/data/sliderPositions.ts` | Slider configurations |
| `src/lib/archetypes.ts` | Meta-dimensions, archetype classification |
| `src/stores/userStore.ts` | Profile persistence |
| `src/components/blueprint/` | Assessment UI components |
