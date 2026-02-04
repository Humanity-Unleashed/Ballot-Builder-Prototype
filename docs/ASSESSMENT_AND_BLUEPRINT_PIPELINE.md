# Assessment & Blueprint Pipeline

How a user goes from zero to a fully scored civic blueprint with archetype classification.

---

## 1. Data Model Overview

### Hierarchy

```
Spec (static, loaded from backend)
  -> 5 Domains (econ, health, housing, justice, climate)
     -> 3 Axes each = 15 total axes
        -> N Items (assessment statements) per axis
```

### Domains

| ID        | Name                           | Axes                                                              |
|-----------|--------------------------------|-------------------------------------------------------------------|
| `econ`    | Economic Opportunity & Taxes   | `econ_safetynet`, `econ_investment`, `econ_school_choice`         |
| `health`  | Healthcare & Public Health     | `health_coverage_model`, `health_cost_control`, `health_public_health` |
| `housing` | Housing & Local Growth         | `housing_supply_zoning`, `housing_affordability_tools`, `housing_transport_priority` |
| `justice` | Public Safety & Justice        | `justice_policing_accountability`, `justice_sentencing_goals`, `justice_firearms` |
| `climate` | Climate, Energy & Environment  | `climate_ambition`, `climate_energy_portfolio`, `climate_permitting` |

### Axes

Each axis is a single policy spectrum with two poles:

- **Pole A** (left/purple side) -- e.g., "Broader Safety Net"
- **Pole B** (right/teal side) -- e.g., "More Conditional Safety Net"

Axes are intentionally designed to avoid false binaries. When two concepts aren't mutually exclusive (e.g., "safety" vs "rights"), they're decoupled into separate axes.

### Items

Assessment statements that the user agrees/disagrees with. Each item maps to one or more axes with a direction key:

```typescript
interface Item {
  id: string;
  text: string;                        // The statement shown to the user
  axis_keys: Record<string, 1 | -1>;   // Which axes this informs, +1 or -1
  level: GovernmentLevel;               // local | state | national | general
  tags: string[];
}
```

The `axis_keys` direction (+1/-1) determines whether agreement pushes the score toward Pole A or Pole B.

---

## 2. Assessment Flow

### 2.1 Entry Point

The user lands on the Blueprint tab in `not_started` state and sees the IntroScreen. Tapping "Start Drafting" begins the assessment with all 5 domains selected.

### 2.2 Question Presentation

The assessment uses a **slider-based** approach (not swipe cards). For each axis, the user sees:

- The axis name and question
- A 5-position draggable slider
- Position title + description at each stop
- The center position (index 2) marked as "Current US Policy"

Each slider position maps to a score via `sliderPositionToScore()`:
- Position 0 (far left/Pole A) -> score closer to -1
- Position 2 (center) -> score 0
- Position 4 (far right/Pole B) -> score closer to +1

### 2.3 Adaptive Selection (for swipe-based flow)

When using the adaptive assessment path, questions are selected dynamically:

**Three-phase strategy:**

| Phase | Questions | Strategy | Goal |
|-------|-----------|----------|------|
| Early | 1-10 | Domain coverage | Ensure every domain gets represented |
| Mid | 10-20 | Uncertainty targeting | Focus on axes with confidence < 0.7 or < 3 answers |
| Late | 20+ | Information maximization | Fill remaining gaps, prefer multi-axis items |

**Early stopping:**
- **Minimum**: `max(8, numDomains * 3)` = 15 questions (all 5 domains)
- **Maximum**: `max(15, numDomains * 6)` = 30 questions
- **Stops early when**: all axes have >= 2 answers AND confidence >= 0.7

**Item scoring heuristic** (late rounds):
- +2 per axis the item informs
- +3 if axis has < 3 answers
- +2 if axis confidence < 0.7

### 2.4 Response-to-Swipe Conversion

The slider-based assessment converts each slider position into synthetic swipe events:

```
For each axis response:
  1. Convert slider position to score via sliderPositionToScore()
  2. Find items that map to this axis
  3. Take up to 2 items per axis
  4. For each item: effectiveScore = score * item.axis_keys[axisId]
  5. Map effectiveScore to a SwipeResponse:
     <= -0.6  -> strong_disagree
     <= -0.2  -> disagree
     >= 0.6   -> strong_agree
     >= 0.2   -> agree
     else     -> unsure
```

---

## 3. Scoring

### 3.1 Response Scale

```
strong_disagree: -2
disagree:        -1
unsure:           0
agree:           +1
strong_agree:    +2
```

### 3.2 Per-Axis Scoring Algorithm

Implemented in `backend/src/data/civicAxes/index.ts -> scoreAxes()`:

```
For each axis:
  For each response where the item maps to this axis:
    if response == unsure:
      n_unsure++
    else:
      contribution = responseValue * direction   (direction is +1 or -1)
      rawSum += contribution
      n_answered++
      maxPossible += 2                           (max response magnitude)

  normalized = rawSum / maxPossible              (range: [-1, +1])
  shrunk = normalized * (n_answered / (n_answered + k))
  confidence = n_answered / (n_answered + k)
```

Where `k` = `shrinkage_k` = **6** (from spec config).

**Shrinkage** pulls scores toward zero when evidence is thin. With k=6:
- 1 answer: confidence = 0.14, score multiplied by 0.14
- 3 answers: confidence = 0.33
- 6 answers: confidence = 0.50
- 12 answers: confidence = 0.67
- 30 answers: confidence = 0.83

### 3.3 AxisScore Output

```typescript
interface AxisScore {
  axis_id: string;
  raw_sum: number;       // Sum of (responseValue * direction)
  n_answered: number;    // Non-unsure responses
  n_unsure: number;
  normalized: number;    // raw_sum / maxPossible, range [-1, +1]
  shrunk: number;        // normalized * confidence
  confidence: number;    // n_answered / (n_answered + k)
  top_drivers: string[]; // Item IDs with highest |contribution|
}
```

---

## 4. Blueprint Profile

### 4.1 Profile Structure

After scoring, results are stored in a `BlueprintProfile`:

```typescript
BlueprintProfile
  profile_version: string
  user_id: string
  updated_at: string
  domains: DomainProfile[]

DomainProfile
  domain_id: string
  importance: DomainImportance        // 0-10 scale
  axes: AxisProfile[]

AxisProfile
  axis_id: string
  value_0_10: number                  // Displayed stance, 0=Pole A, 10=Pole B
  source: 'learned_from_swipes' | 'user_edited' | 'default'
  confidence_0_1: number
  locked: boolean
  learning_mode: 'normal' | 'dampened' | 'frozen'
  importance?: number                 // Per-axis importance, 0-10
  estimates: { learned_score, learned_value_float }
  evidence: { n_items_answered, n_unsure, top_driver_item_ids }
```

### 4.2 Score-to-Value Mapping

The shrunk score (range [-1, +1]) is mapped to the display value (0-10):

```
value_0_10 = round((1 - shrunk) * 5)
```

- shrunk = +1.0 -> value = 0 (full Pole A)
- shrunk = 0.0 -> value = 5 (center)
- shrunk = -1.0 -> value = 10 (full Pole B)

### 4.3 User Editing

After the assessment, users can fine-tune any axis:
- **Slider**: Adjust stance value (0-10), changes `source` to `user_edited`
- **Importance**: Set per-axis priority (0-10 mapped to 5 dots)
- **Lock**: Freeze an axis so future swipes don't change it

---

## 5. Meta-Dimensions

Three higher-order dimensions are derived from the 15 axes. These power the archetype system and the Values Spectrum card.

### 5.1 Axis-to-Meta Mapping

| Meta-Dimension | Contributing Axes |
|---|---|
| **responsibility_orientation** | `econ_safetynet`, `econ_investment`, `health_coverage_model`, `health_public_health`, `housing_affordability_tools` |
| **change_tempo** | `housing_supply_zoning`, `housing_transport_priority`, `justice_sentencing_goals`, `climate_ambition`, `climate_energy_portfolio`, `climate_permitting` |
| **governance_style** | `econ_school_choice`, `health_cost_control`, `justice_policing_accountability`, `justice_firearms`, `climate_permitting` |

Note: `climate_permitting` contributes to both `change_tempo` and `governance_style`.

### 5.2 Computation

```
For each meta-dimension:
  For each contributing axis:
    axisScore = (5 - value_0_10) / 5        // Convert 0-10 back to [-1, +1]
    weight = domainImportance_0_10 / 10      // Importance as 0-1 weight

  meta_score = weighted_average(axisScores, weights)
```

Result range: [-1, +1] for each dimension.

### 5.3 Interpretation

| Dimension | -1 | +1 |
|---|---|---|
| `responsibility_orientation` | Community-led | Individual-led |
| `change_tempo` | Change-seeking | Stability-seeking |
| `governance_style` | Rules & standards | Flexibility & choice |

### 5.4 Display (Values Spectrum Card)

Each meta-dimension is shown as a split bar. The score is converted to left/right percentages:

```
leftPct = round((-score + 1) / 2 * 100)     // for non-inverted axes
leftPct = round((score + 1) / 2 * 100)      // for change_tempo (inverted so Stability shows left)
rightPct = 100 - leftPct
```

Each row also shows an **ideology label** for whichever side dominates:

| Axis Name | Left Wins | Right Wins |
|---|---|---|
| Social Model | Communitarian | Individualist |
| Reform Appetite | Incrementalist | Reformist |
| Oversight | Regulationist | Autonomist |

---

## 6. Archetypes

### 6.1 The 8 Archetypes

Each archetype is a point (centroid) in the 3D meta-dimension space:

| Archetype | Emoji | Responsibility | Tempo | Governance | Traits |
|---|---|---|---|---|---|
| Caring Koala | `koala` | -0.7 | +0.5 | -0.4 | Community-minded, Steady, Systems-oriented |
| Independent Stallion | `horse` | +0.7 | -0.4 | +0.4 | Autonomy-first, Action-oriented, Choice-focused |
| Thoughtful Owl | `owl` | -0.3 | +0.6 | -0.7 | Evidence-driven, Fairness-minded, Process-aware |
| Pragmatic Fox | `fox` | 0.0 | -0.2 | +0.4 | Practical, Flexible, Context-aware |
| Steady Turtle | `turtle` | -0.2 | +0.8 | +0.1 | Cautious, Resilient, Long-term |
| Agile Panther | `panther` | +0.4 | -0.7 | +0.1 | Fast-moving, Decisive, Adaptive |
| Principled Elephant | `elephant` | -0.6 | -0.6 | -0.2 | Values-driven, Reform-minded, Collective action |
| Loyal Retriever | `dog` | -0.1 | +0.7 | +0.5 | Trust-building, Community glue, Continuity |

### 6.2 Classification

```
1. Compute user's MetaDimensionScores (3 values in [-1, +1])
2. For each archetype, compute Euclidean distance:
   distance = sqrt(
     (user.responsibility - centroid.responsibility)^2 +
     (user.tempo - centroid.tempo)^2 +
     (user.governance - centroid.governance)^2
   )
3. Sort by distance ascending
4. Primary archetype = nearest
5. Secondary archetype = second nearest
6. Margin = distance[1] - distance[0]  (how decisive the classification is)
```

### 6.3 Confidence

Overall confidence is the average of all axis-level `confidence_0_1` values across the profile. Used to caveat the archetype result when evidence is thin.

---

## 7. Complete Pipeline Summary

```
User taps "Start Drafting"
  |
  v
[Assessment: 15 slider questions, one per axis]
  |
  v
[Convert slider positions to synthetic SwipeEvents]
  |
  v
[Backend scoreAxes(): raw_sum -> normalized -> shrunk, with confidence]
  |
  v
[Build BlueprintProfile: 5 domains x 3 axes = 15 AxisProfiles]
  |
  v
[User can fine-tune any axis value/importance in the edit modal]
  |
  v
[deriveMetaDimensions(): 15 axes -> 3 meta-dimension scores]
  |
  v
[computeArchetype(): 3D Euclidean distance to 8 centroids -> primary/secondary]
  |
  v
[Display: Values Spectrum card, Priority Insight card, Axis bars, Archetype]
```

---

## 8. Key Source Files

| File | Role |
|---|---|
| `backend/src/data/civicAxes/spec.ts` | Canonical spec: domains, axes, items, response scale, scoring config |
| `backend/src/data/civicAxes/index.ts` | `scoreAxes()` -- the scoring algorithm |
| `frontend/types/civicAssessment.ts` | TypeScript types for Spec, Item, Axis, Domain |
| `frontend/types/blueprintProfile.ts` | BlueprintProfile, AxisProfile, DomainProfile types |
| `frontend/data/sliderPositions.ts` | 15 axis slider configs with 5 positions each |
| `frontend/utils/adaptiveSelection.ts` | Adaptive question selection + early stopping |
| `frontend/utils/archetypes.ts` | Meta-dimensions, archetype centroids, classification |
| `frontend/context/BlueprintContext.tsx` | State management wrapper for profile operations |
| `frontend/stores/userStore.ts` | Zustand store: profile persistence, swipe recording |
| `frontend/app/(tabs)/blueprint.tsx` | UI: assessment flow, blueprint view, spectrum card |
| `frontend/services/api.ts` | API client: `civicAxesApi.scoreResponses()` |
