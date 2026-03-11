# Ballot-Specific Dynamic Axis Weighting

**Research Note 07** | March 2026
**Prerequisite reading:** Research Note 06 (Entropy-Based Confidence Scoring)

---

## 1. Problem Statement

The matching formula computes candidate match scores as:

```
w_i = gw_i * cov_i * conf_i * estr_i
S   = SUM(w_i * A_i) / SUM(w_i)
A_i = 1 - |U_i - C_i| / 2
```

All `gw_i` currently default to 1.0. The spec allows 0.0-2.0 but provides no procedure for setting non-default weights. This is a substantial gap: on any given ballot, some axes are decisive (every candidate takes a different position on gun policy) while others are irrelevant (no ballot item touches transit policy). Treating them identically dilutes the axes that actually help the user discriminate.

The system has 16 axes. For a specific user's ballot (jurisdiction + election), the set of contests and measures determines which axes matter, and the candidate field on each contest determines which axes actually differentiate candidates. A dynamic weighting system should exploit both sources of information.

### 1.1 What Static Weights Get Wrong

Consider a Michigan voter whose ballot has:
- U.S. Senate race (candidates differentiated on climate, healthcare, firearms)
- State House race (candidates differentiated on housing, education)
- Three ballot measures (touching transit, zoning, and sentencing)

With static `gw_i = 1.0`, the matching algorithm treats the user's position on `econ_tax_structure` (which no candidate or measure on this ballot distinguishes) identically to `justice_firearms` (where the Senate candidates are 8 points apart on the 0-10 scale). The tax structure axis contributes to the match score despite providing zero discriminating information for this ballot. Worse, it can *dominate* the score if the user's confidence and coverage on tax structure happen to be high.

### 1.2 Prior Work

Smartvote (Switzerland) found that axis weight changes shift recommendation frequencies by up to 105% for individual candidates (Smartvote Research Report, 2019). Their system uses 8 policy dimensions with editor-assigned weights of 1-4. Even small weight perturbations produced double-digit swings in which candidate ranked first. This finding motivates strict adversarial robustness constraints (Section 6).

---

## 2. Candidate Spread Measure

### 2.1 Definition

For a given ballot item (contest or measure) and axis, the **candidate spread** measures how much the candidates' positions on that axis vary, weighted by the evidence strength behind each position.

**For candidate races:**

```
axis_spread(axis_id, contest) = weighted_std_dev(
  positions = [C_1[axis_id], C_2[axis_id], ..., C_n[axis_id]],
  weights   = [estr_1[axis_id], estr_2[axis_id], ..., estr_n[axis_id]]
)
```

Where `C_k[axis_id]` is candidate k's position on the axis (0-10 scale) and `estr_k[axis_id]` is the evidence strength for that position.

If fewer than 2 candidates have positions on the axis (i.e., the axis is scored for at most one candidate), the spread is 0.

**For ballot measures:**

Ballot measures have `yesAxisEffects` that define the magnitude and direction of a YES vote on each relevant axis. The "spread" for a measure is the absolute magnitude of the YES effect:

```
axis_spread(axis_id, measure) = |yesAxisEffects[axis_id]|
```

This captures that a measure with a large effect on an axis creates a bigger decision point than one with a marginal effect.

### 2.2 Weighted Standard Deviation

The weighted standard deviation uses evidence strength as weights, so well-evidenced positions contribute more to the spread calculation than speculative ones:

```
weighted_mean = SUM(estr_k * C_k) / SUM(estr_k)
weighted_var  = SUM(estr_k * (C_k - weighted_mean)^2) / SUM(estr_k)
weighted_std  = sqrt(weighted_var)
```

### 2.3 Normalization

Raw spread values are on the 0-10 scale (maximum possible std dev is 5.0 for two candidates at 0 and 10). We normalize to [0, 1]:

```
normalized_spread = min(1.0, weighted_std / 3.5)
```

The divisor of 3.5 (not 5.0) means that a race where candidates span 70% of the axis range already saturates the spread measure. This is intentional: we want the spread to distinguish "candidates agree" from "candidates disagree," not to fine-grade the degree of disagreement once it's already substantial.

### 2.4 TypeScript Implementation

```typescript
/**
 * Compute the evidence-weighted standard deviation of candidate positions
 * on a single axis for a single ballot item.
 */
export function axisSpread(
  axisId: string,
  ballotItem: BallotItem
): number {
  if (ballotItem.type === 'proposition') {
    // For measures, spread is the absolute magnitude of the YES effect
    const effect = ballotItem.yesAxisEffects?.[axisId];
    if (effect === undefined) return 0;
    // yesAxisEffects are on [-1, 1] scale; normalize to [0, 1]
    return Math.min(1.0, Math.abs(effect));
  }

  // For candidate races
  if (!ballotItem.candidates || ballotItem.candidates.length < 2) return 0;

  const positions: { value: number; weight: number }[] = [];
  for (const candidate of ballotItem.candidates) {
    const stance = candidate.profile.stances[axisId];
    if (stance === undefined) continue;
    // Evidence strength: use evidence array length as a proxy, default 0.5
    const evidenceEntries = candidate.profile.evidence?.[axisId];
    const estr = evidenceEntries && evidenceEntries.length > 0
      ? Math.min(1.0, 0.3 + 0.15 * evidenceEntries.length)
      : 0.5;
    positions.push({ value: stance, weight: estr });
  }

  if (positions.length < 2) return 0;

  const totalWeight = positions.reduce((s, p) => s + p.weight, 0);
  if (totalWeight === 0) return 0;

  const wMean = positions.reduce((s, p) => s + p.weight * p.value, 0) / totalWeight;
  const wVar = positions.reduce(
    (s, p) => s + p.weight * (p.value - wMean) ** 2,
    0
  ) / totalWeight;
  const wStd = Math.sqrt(wVar);

  // Normalize: 3.5 on 0-10 scale saturates at 1.0
  return Math.min(1.0, wStd / 3.5);
}
```

---

## 3. Ballot Relevance Weight

### 3.1 Definition

The **ballot relevance** of an axis measures how many ballot items on the user's specific ballot involve that axis, weighted by the significance of each item.

```
ballot_relevance(axis_id) = SUM over items(item_significance * axis_present(axis_id, item))
```

Where:
- `axis_present(axis_id, item)` = 1 if the axis is in `item.relevantAxes`, 0 otherwise
- `item_significance` is an editorial weight reflecting the importance of the ballot item (default 1.0 for all items; can be increased for top-of-ballot races like U.S. Senate or Governor)

### 3.2 Normalization

Raw ballot relevance ranges from 0 (axis appears on no ballot items) to the total number of ballot items (axis appears everywhere). We normalize to [0, 1] by dividing by the maximum relevance across all axes:

```
max_relevance = max over all axes(ballot_relevance(axis_id))
normalized_relevance(axis_id) = ballot_relevance(axis_id) / max_relevance
```

If `max_relevance = 0` (degenerate case: no ballot items have axis mappings), all normalized relevances are 1.0 (fall back to uniform).

### 3.3 Why Not Binary?

An earlier version of this design used binary relevance: 1.0 if the axis appears on any ballot item, 0.0 otherwise. This fails because it treats an axis that appears in one minor local race identically to one that appears in the top-of-ballot Senate race plus two ballot measures. Graduated relevance captures this distinction.

### 3.4 TypeScript Implementation

```typescript
export interface BallotRelevanceConfig {
  /** Override significance for specific ballot items (default 1.0) */
  itemSignificance?: Record<string, number>;
}

/**
 * Compute per-axis ballot relevance weights for a specific ballot.
 * Returns a Record mapping axis IDs to normalized [0, 1] relevance scores.
 */
export function computeBallotRelevance(
  ballotItems: BallotItem[],
  axisIds: string[],
  config?: BallotRelevanceConfig
): Record<string, number> {
  const rawRelevance: Record<string, number> = {};
  for (const axisId of axisIds) {
    rawRelevance[axisId] = 0;
  }

  for (const item of ballotItems) {
    const sig = config?.itemSignificance?.[item.id] ?? 1.0;
    const relevant = item.relevantAxes ?? [];
    for (const axisId of relevant) {
      if (axisId in rawRelevance) {
        rawRelevance[axisId] += sig;
      }
    }
  }

  const maxRel = Math.max(...Object.values(rawRelevance), 0.001); // avoid /0
  const normalized: Record<string, number> = {};
  for (const axisId of axisIds) {
    normalized[axisId] = rawRelevance[axisId] / maxRel;
  }

  return normalized;
}
```

---

## 4. Combined Dynamic Weight Formula

### 4.1 Design Principles

The dynamic `gw_i` replaces the static 1.0 default. It must satisfy:

1. **Monotonic in spread**: Higher candidate spread on an axis means more discriminating power, which deserves more weight.
2. **Monotonic in relevance**: Axes appearing on more (or more significant) ballot items deserve more weight.
3. **Bounded**: The output must stay within `[gw_min, gw_max]` to satisfy adversarial constraints.
4. **Smooth**: Small changes in input should not produce discontinuous weight changes.
5. **Default-preserving**: When spread and relevance are both at their midpoints, the weight should be approximately 1.0 (preserving backward compatibility).

### 4.2 Formula

```
raw_dynamic_gw_i = base_weight
                 * (spread_floor + (1 - spread_floor) * normalized_spread_i)
                 * (relevance_floor + (1 - relevance_floor) * normalized_relevance_i)
```

Parameters:
- `base_weight = 1.0` (anchor; ensures backward compatibility)
- `spread_floor = 0.15` (even axes with no spread get 15% of the spread contribution)
- `relevance_floor = 0.20` (even irrelevant axes get 20% of the relevance contribution)

The floors prevent any axis from being completely zeroed out by the dynamic system. An axis with zero spread and zero relevance still gets `gw_i = 1.0 * 0.15 * 0.20 = 0.03`, which after clamping (Section 6) becomes the minimum weight.

After computing the raw value, clamp and rescale:

```
dynamic_gw_i = clamp(raw_dynamic_gw_i, GW_MIN, GW_MAX)
```

Where `GW_MIN = 0.10` and `GW_MAX = 2.00` (per the existing spec range).

### 4.3 Aggregate Spread Across Ballot Items

An axis may appear on multiple ballot items. The spread value used in the formula should be the **maximum spread** across all items where the axis appears, not the average. Rationale: if the U.S. Senate candidates are polarized on firearms but the local school board candidates agree on firearms, the axis is still highly discriminating for the user's ballot because the Senate race matters.

```
aggregate_spread(axis_id) = max over items(axis_spread(axis_id, item))
```

### 4.4 Full Dynamic Weight Computation

```typescript
export interface DynamicWeightConfig {
  baseWeight: number;      // default 1.0
  spreadFloor: number;     // default 0.15
  relevanceFloor: number;  // default 0.20
  gwMin: number;           // default 0.10
  gwMax: number;           // default 2.00
}

const DEFAULT_WEIGHT_CONFIG: DynamicWeightConfig = {
  baseWeight: 1.0,
  spreadFloor: 0.15,
  relevanceFloor: 0.20,
  gwMin: 0.10,
  gwMax: 2.00,
};

/**
 * Compute dynamic global weights for all axes given a specific ballot.
 */
export function computeDynamicWeights(
  ballotItems: BallotItem[],
  axisIds: string[],
  config: Partial<DynamicWeightConfig> = {},
  ballotRelevanceConfig?: BallotRelevanceConfig
): Record<string, number> {
  const cfg = { ...DEFAULT_WEIGHT_CONFIG, ...config };

  // Step 1: Compute ballot relevance
  const relevance = computeBallotRelevance(
    ballotItems, axisIds, ballotRelevanceConfig
  );

  // Step 2: Compute aggregate spread per axis (max across items)
  const aggregateSpread: Record<string, number> = {};
  for (const axisId of axisIds) {
    let maxSpread = 0;
    for (const item of ballotItems) {
      const s = axisSpread(axisId, item);
      if (s > maxSpread) maxSpread = s;
    }
    aggregateSpread[axisId] = maxSpread;
  }

  // Step 3: Compute dynamic weights
  const weights: Record<string, number> = {};
  for (const axisId of axisIds) {
    const spreadFactor = cfg.spreadFloor
      + (1 - cfg.spreadFloor) * aggregateSpread[axisId];
    const relevanceFactor = cfg.relevanceFloor
      + (1 - cfg.relevanceFloor) * relevance[axisId];

    const raw = cfg.baseWeight * spreadFactor * relevanceFactor;
    weights[axisId] = Math.max(cfg.gwMin, Math.min(cfg.gwMax, raw));
  }

  return weights;
}
```

---

## 5. User Position Informativeness

### 5.1 The Question

Axes where the user holds strong positions (near 0 or 10 on the scale, corresponding to -1 or +1 normalized) contribute more discriminating power than neutral positions. A user at 5.0 on an axis will produce similar alignment scores `A_i` for all candidates regardless of their positions: `A_i = 1 - |5 - C_i| / 10` produces a narrow range even when candidates span the axis.

Should this be incorporated into the axis weight?

### 5.2 Analysis

Define user position informativeness as:

```
UPI(user_score) = 2 * |user_score - 5| / 10
```

This ranges from 0 (user is exactly at the midpoint) to 1 (user is at a pole).

**Case for including UPI in the weight:** A neutral user position means the axis cannot discriminate between candidates *for this user*. Even if candidates are spread across the axis, the user will see similar alignment scores for all of them. Downweighting via UPI correctly reflects this.

**Case against including UPI in the weight:** The user's neutral position is already captured by `conf_i` (via entropy-based confidence from Research Note 06). A neutral structured selection produces lower entropy confidence (0.267 default), which already downweights the axis. Adding UPI would double-penalize neutrality.

Additionally, UPI in the weight creates an incentive problem: the system would effectively tell users "your neutral position doesn't matter," which is editorially questionable. Some users are genuine centrists whose centrist position IS their signal.

### 5.3 Resolution

**UPI should NOT be incorporated into `gw_i`.** It is already handled by `conf_i` via the entropy-based confidence system. The entropy confidence for neutral positions (0.19-0.32 depending on signals, per Research Note 06 Section 4.1) already downweights neutral axes appropriately.

However, UPI should be used as a **diagnostic metric** in the transparency display (Section 7) and as an input to the **adaptive sequencing priority** (Section 8). Specifically:

- In the per-axis breakdown UI, show the user when their neutral position means an axis "doesn't help distinguish candidates for you"
- In adaptive sequencing, axes with high dynamic weight but currently-neutral user positions are high-value re-ask candidates (the user's answer matters a lot for this ballot, but we don't have a clear signal yet)

### 5.4 Formal Separation of Concerns

| Factor | Where it lives | What it captures |
|--------|---------------|-----------------|
| Axis importance to this ballot | `gw_i` (dynamic) | Candidate spread + ballot relevance |
| User's positional clarity | `conf_i` (entropy) | How much the user's response narrows the posterior |
| Candidate evidence quality | `estr_i` | How well-supported the candidate's position is |
| Axis coverage | `cov_i` | Whether the axis has been addressed at all |

All four are already multiplicative in `w_i`. Adding UPI to `gw_i` would conflate ballot-level importance with user-level clarity.

---

## 6. Adversarial Robustness Constraints

### 6.1 Motivation

Per the Smartvote research, axis weight changes can shift individual candidate recommendation frequencies by up to 105%. In a system where weights are computed dynamically, we must ensure that:

1. No single axis can dominate the match score
2. The system cannot be gamed by a data contributor who inflates spread on a particular axis
3. Weight changes are explainable to the user

### 6.2 Constraint 1: Single-Axis Weight Cap

```
GW_MAX = 2.00
```

No axis's dynamic weight may exceed 2.0, regardless of spread and relevance. This is the existing spec maximum, preserved as a hard cap.

**Effective weight cap.** The total per-axis weight is `w_i = gw_i * cov_i * conf_i * estr_i`. With `gw_i` capped at 2.0, the maximum single-axis weight is `2.0 * 1.0 * 1.0 * 1.0 = 2.0`.

**Dominance bound.** With 16 axes and a minimum weight of 0.10, the maximum fraction of total weight from any single axis is:

```
max_fraction = 2.0 / (2.0 + 15 * 0.10) = 2.0 / 3.5 = 0.571
```

This is too high. A single axis contributing 57% of the match score is unacceptable. We add a **dominance constraint**: after computing all `w_i`, if any single axis exceeds 35% of the total weight, rescale it down:

```
total_w = SUM(w_i)
for each axis i:
  if w_i / total_w > DOMINANCE_CAP:
    w_i = DOMINANCE_CAP * total_w / (1 + DOMINANCE_CAP * (n_axes - 1))
    // Recompute total_w after adjustment
```

Where `DOMINANCE_CAP = 0.35`.

In practice, this constraint will rarely bind. With realistic confidence and evidence strength values (typically 0.5-0.9), even a `gw_i = 2.0` axis will have `w_i` around 1.0-1.6, which is well below 35% of total weight when other axes are active.

### 6.3 Constraint 2: Minimum Active Axes

At least 3 axes must have non-zero effective weight `w_i > 0` for a match score to be computed. If fewer than 3 axes are active (because coverage is zero on most axes), the system should display "insufficient data" rather than a match percentage.

```
MIN_ACTIVE_AXES = 3
```

This prevents pathological cases where a match score is computed from 1-2 axes, which would be meaningless.

### 6.4 Constraint 3: Transparency

Every dynamic weight must be visible to the user in the per-axis match breakdown. The UI should show:

1. The dynamic weight for each axis (displayed as a relative bar or normalized percentage)
2. **Why** the weight is what it is: "This axis is weighted heavily because [Senate candidates disagree strongly on gun policy] and [gun policy appears in 2 items on your ballot]"
3. A comparison to uniform weighting: "With equal weights, your top match would be [X]. With ballot-adjusted weights, it's [Y]." (Only show this when the ranking actually changes.)

### 6.5 Constraint 4: Editorial Override

The dynamic weight system must accept editorial overrides. For specific ballot items, editors can set `gw_override_i` that replaces the computed dynamic weight. This is a safety valve for cases where the algorithm produces weights that are editorially inappropriate (e.g., a single-issue axis dominates because of an unusual candidate field).

```typescript
export interface EditorialOverride {
  axisId: string;
  weight: number;        // Replaces dynamic gw_i
  reason: string;        // Required: human-readable justification
  overrideDate: string;  // ISO date for audit trail
}
```

### 6.6 Constraint Summary

| Constraint | Value | Purpose |
|-----------|-------|---------|
| `GW_MIN` | 0.10 | No axis completely zeroed |
| `GW_MAX` | 2.00 | No axis over-amplified |
| `DOMINANCE_CAP` | 0.35 | No axis > 35% of total weight |
| `MIN_ACTIVE_AXES` | 3 | No match from <3 axes |
| Editorial override | Optional | Human safety valve |
| Transparency | Required | All weights shown in UI |

---

## 7. Transparency Requirements

### 7.1 Per-Axis Weight Breakdown

For each candidate match, the UI should display a breakdown table (collapsible) with columns:

| Column | Source | Example |
|--------|--------|---------|
| Axis name | Static data | "Gun Laws" |
| Your position | User profile | "Lean toward stronger rules" (3.0) |
| Candidate position | Candidate score | "Fewer restrictions" (8.5) |
| Evidence strength | CandidateScore table | "HIGH (3 sources)" |
| Axis weight | Dynamic computation | "1.45x (high)" |
| Weight reason | Dynamic computation | "Candidates disagree strongly; appears in 2 ballot items" |
| Alignment | Match formula | "Opposed (5.5 point gap)" |

### 7.2 Weight Explanation Templates

```typescript
const WEIGHT_EXPLANATION_TEMPLATES = {
  high_spread_high_relevance:
    "This issue is weighted heavily because candidates take very different positions " +
    "and it affects {n_items} item(s) on your ballot.",

  high_spread_low_relevance:
    "Candidates disagree strongly on this, though it mainly affects one race on your ballot.",

  low_spread_high_relevance:
    "This issue appears in {n_items} ballot item(s), but candidates have similar positions, " +
    "so it doesn't help distinguish them much.",

  low_spread_low_relevance:
    "This issue has lower weight because candidates mostly agree and it affects " +
    "few items on your ballot.",

  editorial_override:
    "This weight was set by our editorial team: {reason}",
};
```

### 7.3 Ranking Change Disclosure

When dynamic weights change the top-ranked candidate compared to uniform weights, the UI must disclose this. The disclosure should be neutral and non-judgmental:

> "With ballot-adjusted weights that emphasize issues where candidates disagree most, [Candidate A] is your top match at 78%. With equal weights across all issues, [Candidate B] would rank first at 74%."

This disclosure is critical for trust. Users should understand that the system is not arbitrarily picking favorites, but rather emphasizing the axes that are most decision-relevant for their specific ballot.

---

## 8. Integration with Adaptive Sequencing

### 8.1 Connection to Research Note 02

The adaptive sequencing algorithm (Research Note 02) selects question order using the Expected Weighted Information Gain (EWIG) criterion, which already accepts `ballotWeights: Record<string, number>`. The dynamic weights computed here should be passed directly as those ballot weights.

### 8.2 Question Priority

The sequencer should ask questions about high-dynamic-weight axes first, because:

1. These axes matter most for the user's actual ballot decisions
2. Answers on high-weight axes contribute more to match score precision
3. If the user drops out early, the most decision-relevant axes will have been covered

The EWIG formula already handles this by weighting the expected information gain by the ballot weight. No additional modification to the sequencer is needed; the dynamic weight computation simply provides better-calibrated inputs.

### 8.3 Ballot-Aware Sequencing Flow

```
1. User enters address
2. Ballot pipeline resolves address -> ballot items
3. computeDynamicWeights(ballotItems, axisIds) -> per-axis gw_i
4. Pass gw_i as ballotWeights to adaptive sequencer
5. Sequencer asks high-gw_i axes first
6. User completes assessment (or stops early)
7. Match computation uses the same gw_i values
```

The key property is that Steps 3, 5, and 7 all use the **same** dynamic weights. The sequencer optimizes for the same objective function that the match formula uses.

### 8.4 Pre-Ballot Fallback

If the user has not entered an address (no ballot loaded), all dynamic weights default to 1.0 and the sequencer falls back to pure information-gain ordering. Once the ballot is loaded, weights are recomputed and any remaining questions are reordered.

---

## 9. Worked Numerical Example

### 9.1 Setup

A Michigan voter has a ballot with 3 items:

**Item A: U.S. Senate race** (significance = 1.5 due to top-of-ballot)
- 3 candidates: Chen (D), Rogers (R), Williams (I)
- `relevantAxes`: `climate_ambition`, `health_coverage_model`, `justice_firearms`, `econ_safetynet`, `econ_tax_structure`

**Item B: State House District 38** (significance = 1.0)
- 2 candidates: Garcia (D), Thompson (R)
- `relevantAxes`: `housing_supply_zoning`, `econ_school_choice`, `housing_transport_priority`, `econ_investment`

**Item C: Ballot Measure - Transit Funding Bond** (significance = 1.0)
- `relevantAxes`: `housing_transport_priority`, `econ_investment`
- `yesAxisEffects`: `{ housing_transport_priority: -0.6, econ_investment: -0.4 }`

### 9.2 Candidate Positions (0-10 scale)

**U.S. Senate:**

| Axis | Chen (D) | estr | Rogers (R) | estr | Williams (I) | estr |
|------|----------|------|------------|------|-------------|------|
| climate_ambition | 2.0 | 0.90 | 8.5 | 0.85 | 5.0 | 0.60 |
| health_coverage_model | 1.5 | 0.85 | 7.0 | 0.80 | 4.5 | 0.55 |
| justice_firearms | 2.0 | 0.90 | 9.0 | 0.90 | 6.0 | 0.50 |
| econ_safetynet | 2.5 | 0.80 | 7.5 | 0.75 | 5.0 | 0.45 |
| econ_tax_structure | 2.0 | 0.75 | 7.0 | 0.70 | 5.5 | 0.40 |

**State House:**

| Axis | Garcia (D) | estr | Thompson (R) | estr |
|------|-----------|------|-------------|------|
| housing_supply_zoning | 3.0 | 0.70 | 7.0 | 0.65 |
| econ_school_choice | 3.5 | 0.75 | 8.0 | 0.70 |
| housing_transport_priority | 2.5 | 0.65 | 6.5 | 0.60 |
| econ_investment | 3.0 | 0.70 | 7.5 | 0.65 |

### 9.3 Step 1: Compute Candidate Spread

**U.S. Senate (Item A):**

For `climate_ambition`:
```
Positions: [2.0, 8.5, 5.0], Weights: [0.90, 0.85, 0.60]
w_mean = (0.90*2.0 + 0.85*8.5 + 0.60*5.0) / (0.90+0.85+0.60)
       = (1.80 + 7.225 + 3.00) / 2.35
       = 12.025 / 2.35 = 5.117
w_var  = (0.90*(2.0-5.117)^2 + 0.85*(8.5-5.117)^2 + 0.60*(5.0-5.117)^2) / 2.35
       = (0.90*9.714 + 0.85*11.449 + 0.60*0.014) / 2.35
       = (8.743 + 9.732 + 0.008) / 2.35
       = 18.483 / 2.35 = 7.865
w_std  = sqrt(7.865) = 2.804
normalized_spread = min(1.0, 2.804/3.5) = 0.801
```

For `health_coverage_model`:
```
Positions: [1.5, 7.0, 4.5], Weights: [0.85, 0.80, 0.55]
w_mean = (0.85*1.5 + 0.80*7.0 + 0.55*4.5) / 2.20 = (1.275+5.600+2.475)/2.20 = 4.250
w_var  = (0.85*7.563 + 0.80*7.563 + 0.55*0.063) / 2.20 = (6.428+6.050+0.034)/2.20 = 5.687
w_std  = 2.385
normalized_spread = min(1.0, 2.385/3.5) = 0.681
```

For `justice_firearms`:
```
Positions: [2.0, 9.0, 6.0], Weights: [0.90, 0.90, 0.50]
w_mean = (0.90*2.0 + 0.90*9.0 + 0.50*6.0) / 2.30 = (1.8+8.1+3.0)/2.30 = 5.609
w_var  = (0.90*13.024 + 0.90*11.504 + 0.50*0.154) / 2.30 = (11.722+10.354+0.077)/2.30 = 9.631
w_std  = 3.103
normalized_spread = min(1.0, 3.103/3.5) = 0.887
```

For `econ_safetynet`:
```
Positions: [2.5, 7.5, 5.0], Weights: [0.80, 0.75, 0.45]
w_mean = (0.80*2.5 + 0.75*7.5 + 0.45*5.0) / 2.00 = (2.0+5.625+2.25)/2.00 = 4.938
w_var  = (0.80*5.946 + 0.75*6.566 + 0.45*0.004) / 2.00 = (4.757+4.924+0.002)/2.00 = 4.841
w_std  = 2.200
normalized_spread = min(1.0, 2.200/3.5) = 0.629
```

For `econ_tax_structure`:
```
Positions: [2.0, 7.0, 5.5], Weights: [0.75, 0.70, 0.40]
w_mean = (0.75*2.0 + 0.70*7.0 + 0.40*5.5) / 1.85 = (1.5+4.9+2.2)/1.85 = 4.649
w_var  = (0.75*7.025 + 0.70*5.524 + 0.40*0.725) / 1.85 = (5.269+3.867+0.290)/1.85 = 5.095
w_std  = 2.257
normalized_spread = min(1.0, 2.257/3.5) = 0.645
```

**State House (Item B):**

For `housing_supply_zoning`:
```
Positions: [3.0, 7.0], Weights: [0.70, 0.65]
w_mean = (0.70*3.0 + 0.65*7.0) / 1.35 = (2.1+4.55)/1.35 = 4.926
w_var  = (0.70*3.707 + 0.65*4.305) / 1.35 = (2.595+2.798)/1.35 = 3.994
w_std  = 1.999
normalized_spread = min(1.0, 1.999/3.5) = 0.571
```

For `econ_school_choice`:
```
Positions: [3.5, 8.0], Weights: [0.75, 0.70]
w_mean = (0.75*3.5 + 0.70*8.0) / 1.45 = (2.625+5.6)/1.45 = 5.672
w_var  = (0.75*4.724 + 0.70*5.424) / 1.45 = (3.543+3.797)/1.45 = 5.062
w_std  = 2.250
normalized_spread = min(1.0, 2.250/3.5) = 0.643
```

For `housing_transport_priority`:
```
Positions: [2.5, 6.5], Weights: [0.65, 0.60]
w_mean = (0.65*2.5 + 0.60*6.5) / 1.25 = (1.625+3.9)/1.25 = 4.420
w_var  = (0.65*3.686 + 0.60*4.326) / 1.25 = (2.396+2.596)/1.25 = 3.993
w_std  = 1.998
normalized_spread = min(1.0, 1.998/3.5) = 0.571
```

For `econ_investment`:
```
Positions: [3.0, 7.5], Weights: [0.70, 0.65]
w_mean = (0.70*3.0 + 0.65*7.5) / 1.35 = (2.1+4.875)/1.35 = 5.167
w_var  = (0.70*4.700 + 0.65*5.444) / 1.35 = (3.290+3.539)/1.35 = 5.059
w_std  = 2.249
normalized_spread = min(1.0, 2.249/3.5) = 0.643
```

**Ballot Measure (Item C):**

```
housing_transport_priority: |yesAxisEffects| = |-0.6| = 0.600
econ_investment:            |yesAxisEffects| = |-0.4| = 0.400
```

### 9.4 Step 2: Aggregate Spread (max across items)

| Axis | Item A | Item B | Item C | Aggregate (max) |
|------|--------|--------|--------|-----------------|
| climate_ambition | 0.801 | -- | -- | 0.801 |
| health_coverage_model | 0.681 | -- | -- | 0.681 |
| justice_firearms | 0.887 | -- | -- | 0.887 |
| econ_safetynet | 0.629 | -- | -- | 0.629 |
| econ_tax_structure | 0.645 | -- | -- | 0.645 |
| housing_supply_zoning | -- | 0.571 | -- | 0.571 |
| econ_school_choice | -- | 0.643 | -- | 0.643 |
| housing_transport_priority | -- | 0.571 | 0.600 | 0.600 |
| econ_investment | -- | 0.643 | 0.400 | 0.643 |
| (all other axes) | -- | -- | -- | 0.000 |

### 9.5 Step 3: Compute Ballot Relevance

Raw relevance (counting item significance):

| Axis | Item A (sig=1.5) | Item B (sig=1.0) | Item C (sig=1.0) | Raw |
|------|-----------------|-----------------|-----------------|-----|
| climate_ambition | 1.5 | -- | -- | 1.5 |
| health_coverage_model | 1.5 | -- | -- | 1.5 |
| justice_firearms | 1.5 | -- | -- | 1.5 |
| econ_safetynet | 1.5 | -- | -- | 1.5 |
| econ_tax_structure | 1.5 | -- | -- | 1.5 |
| housing_supply_zoning | -- | 1.0 | -- | 1.0 |
| econ_school_choice | -- | 1.0 | -- | 1.0 |
| housing_transport_priority | -- | 1.0 | 1.0 | 2.0 |
| econ_investment | -- | 1.0 | 1.0 | 2.0 |
| (all other axes) | -- | -- | -- | 0.0 |

Maximum raw relevance = 2.0 (transport and investment).

Normalized:

| Axis | Normalized Relevance |
|------|---------------------|
| climate_ambition | 0.750 |
| health_coverage_model | 0.750 |
| justice_firearms | 0.750 |
| econ_safetynet | 0.750 |
| econ_tax_structure | 0.750 |
| housing_supply_zoning | 0.500 |
| econ_school_choice | 0.500 |
| housing_transport_priority | 1.000 |
| econ_investment | 1.000 |
| (others) | 0.000 |

### 9.6 Step 4: Compute Dynamic Weights

Using `base_weight = 1.0`, `spread_floor = 0.15`, `relevance_floor = 0.20`:

```
dynamic_gw = 1.0 * (0.15 + 0.85 * spread) * (0.20 + 0.80 * relevance)
```

| Axis | Spread | Relevance | Spread Factor | Relev Factor | raw gw | clamped gw |
|------|--------|-----------|---------------|--------------|--------|------------|
| justice_firearms | 0.887 | 0.750 | 0.904 | 0.800 | 0.723 | 0.723 |
| climate_ambition | 0.801 | 0.750 | 0.831 | 0.800 | 0.665 | 0.665 |
| health_coverage_model | 0.681 | 0.750 | 0.729 | 0.800 | 0.583 | 0.583 |
| econ_tax_structure | 0.645 | 0.750 | 0.698 | 0.800 | 0.559 | 0.559 |
| econ_safetynet | 0.629 | 0.750 | 0.685 | 0.800 | 0.548 | 0.548 |
| econ_investment | 0.643 | 1.000 | 0.697 | 1.000 | 0.697 | 0.697 |
| econ_school_choice | 0.643 | 0.500 | 0.697 | 0.600 | 0.418 | 0.418 |
| housing_transport_priority | 0.600 | 1.000 | 0.660 | 1.000 | 0.660 | 0.660 |
| housing_supply_zoning | 0.571 | 0.500 | 0.635 | 0.600 | 0.381 | 0.381 |
| health_cost_control | 0.000 | 0.000 | 0.150 | 0.200 | 0.030 | 0.100* |
| health_public_health | 0.000 | 0.000 | 0.150 | 0.200 | 0.030 | 0.100* |
| housing_affordability_tools | 0.000 | 0.000 | 0.150 | 0.200 | 0.030 | 0.100* |
| justice_policing_accountability | 0.000 | 0.000 | 0.150 | 0.200 | 0.030 | 0.100* |
| justice_sentencing_goals | 0.000 | 0.000 | 0.150 | 0.200 | 0.030 | 0.100* |
| climate_energy_portfolio | 0.000 | 0.000 | 0.150 | 0.200 | 0.030 | 0.100* |
| climate_permitting | 0.000 | 0.000 | 0.150 | 0.200 | 0.030 | 0.100* |

*Clamped to GW_MIN = 0.10.

**Observation:** `justice_firearms` gets the highest weight (0.723) because it has the highest candidate spread AND appears on the significant Senate race. `econ_investment` gets a high weight (0.697) because it appears on two ballot items despite moderate spread. Axes not on the ballot get the floor weight of 0.10.

### 9.7 Step 5: Compute Match Scores

**User profile (0-10 scale):**

| Axis | User Value | conf_i | cov_i |
|------|-----------|--------|-------|
| climate_ambition | 2.0 | 0.82 | 1.0 |
| health_coverage_model | 3.0 | 0.70 | 1.0 |
| justice_firearms | 2.5 | 0.83 | 1.0 |
| econ_safetynet | 4.0 | 0.70 | 1.0 |
| econ_tax_structure | 3.0 | 0.75 | 1.0 |
| housing_supply_zoning | 4.0 | 0.55 | 1.0 |
| econ_school_choice | 3.0 | 0.70 | 1.0 |
| housing_transport_priority | 3.5 | 0.60 | 1.0 |
| econ_investment | 3.5 | 0.70 | 1.0 |

#### U.S. Senate Match: Dynamic vs Static Weights

**Chen (D):**

| Axis | U_i | C_i | estr | A_i | **Static w_i** (gw=1.0) | **Dynamic w_i** |
|------|-----|-----|------|-----|--------------------------|-----------------|
| climate_ambition | 2.0 | 2.0 | 0.90 | 1.000 | 1.0*1.0*0.82*0.90 = 0.738 | 0.665*1.0*0.82*0.90 = 0.491 |
| health_coverage | 3.0 | 1.5 | 0.85 | 0.925 | 1.0*1.0*0.70*0.85 = 0.595 | 0.583*1.0*0.70*0.85 = 0.347 |
| justice_firearms | 2.5 | 2.0 | 0.90 | 0.975 | 1.0*1.0*0.83*0.90 = 0.747 | 0.723*1.0*0.83*0.90 = 0.540 |
| econ_safetynet | 4.0 | 2.5 | 0.80 | 0.925 | 1.0*1.0*0.70*0.80 = 0.560 | 0.548*1.0*0.70*0.80 = 0.307 |
| econ_tax_structure | 3.0 | 2.0 | 0.75 | 0.950 | 1.0*1.0*0.75*0.75 = 0.563 | 0.559*1.0*0.75*0.75 = 0.314 |

Static: `S_Chen = (0.738*1.000 + 0.595*0.925 + 0.747*0.975 + 0.560*0.925 + 0.563*0.950) / (0.738+0.595+0.747+0.560+0.563)`
= `(0.738 + 0.550 + 0.728 + 0.518 + 0.535) / 3.203`
= `3.069 / 3.203 = 0.958 -> 95.8%`

Dynamic: `S_Chen = (0.491*1.000 + 0.347*0.925 + 0.540*0.975 + 0.307*0.925 + 0.314*0.950) / (0.491+0.347+0.540+0.307+0.314)`
= `(0.491 + 0.321 + 0.527 + 0.284 + 0.298) / 1.999`
= `1.921 / 1.999 = 0.961 -> 96.1%`

**Rogers (R):**

| Axis | U_i | C_i | estr | A_i | **Static w_i** | **Dynamic w_i** |
|------|-----|-----|------|-----|----------------|-----------------|
| climate_ambition | 2.0 | 8.5 | 0.85 | 0.675 | 0.697 | 0.464 |
| health_coverage | 3.0 | 7.0 | 0.80 | 0.800 | 0.560 | 0.326 |
| justice_firearms | 2.5 | 9.0 | 0.90 | 0.675 | 0.747 | 0.540 |
| econ_safetynet | 4.0 | 7.5 | 0.75 | 0.825 | 0.525 | 0.288 |
| econ_tax_structure | 3.0 | 7.0 | 0.70 | 0.800 | 0.525 | 0.294 |

Static: `S_Rogers = (0.697*0.675 + 0.560*0.800 + 0.747*0.675 + 0.525*0.825 + 0.525*0.800) / (0.697+0.560+0.747+0.525+0.525)`
= `(0.470 + 0.448 + 0.504 + 0.433 + 0.420) / 3.054`
= `2.276 / 3.054 = 0.745 -> 74.5%`

Dynamic: `S_Rogers = (0.464*0.675 + 0.326*0.800 + 0.540*0.675 + 0.288*0.825 + 0.294*0.800) / (0.464+0.326+0.540+0.288+0.294)`
= `(0.313 + 0.261 + 0.365 + 0.238 + 0.235) / 1.912`
= `1.411 / 1.912 = 0.738 -> 73.8%`

**Williams (I):**

| Axis | U_i | C_i | estr | A_i | **Static w_i** | **Dynamic w_i** |
|------|-----|-----|------|-----|----------------|-----------------|
| climate_ambition | 2.0 | 5.0 | 0.60 | 0.850 | 0.492 | 0.327 |
| health_coverage | 3.0 | 4.5 | 0.55 | 0.925 | 0.385 | 0.224 |
| justice_firearms | 2.5 | 6.0 | 0.50 | 0.825 | 0.415 | 0.300 |
| econ_safetynet | 4.0 | 5.0 | 0.45 | 0.950 | 0.315 | 0.173 |
| econ_tax_structure | 3.0 | 5.5 | 0.40 | 0.875 | 0.300 | 0.168 |

Static: `S_Williams = (0.492*0.850 + 0.385*0.925 + 0.415*0.825 + 0.315*0.950 + 0.300*0.875) / (0.492+0.385+0.415+0.315+0.300)`
= `(0.418 + 0.356 + 0.342 + 0.299 + 0.263) / 1.907`
= `1.678 / 1.907 = 0.880 -> 88.0%`

Dynamic: `S_Williams = (0.327*0.850 + 0.224*0.925 + 0.300*0.825 + 0.173*0.950 + 0.168*0.875) / (0.327+0.224+0.300+0.173+0.168)`
= `(0.278 + 0.207 + 0.248 + 0.164 + 0.147) / 1.192`
= `1.044 / 1.192 = 0.876 -> 87.6%`

### 9.8 Results Comparison

| Candidate | Static Match | Dynamic Match | Rank (Static) | Rank (Dynamic) |
|-----------|-------------|--------------|---------------|----------------|
| Chen (D) | 95.8% | 96.1% | 1 | 1 |
| Williams (I) | 88.0% | 87.6% | 2 | 2 |
| Rogers (R) | 74.5% | 73.8% | 3 | 3 |

In this example, the ranking is preserved. The primary effect is on the **spread** between candidates: dynamic weighting slightly amplifies the gap between Chen and Rogers (from 21.3pp to 22.3pp) because the axes where they disagree most (firearms, climate) receive higher dynamic weights, and those happen to be axes where this user aligns more with Chen.

### 9.9 When Rankings Change

Rankings change when:
1. A candidate's advantage is concentrated on **low-spread axes** (where candidates agree) that get downweighted
2. A candidate's disadvantage is concentrated on **high-spread axes** that get upweighted

**Hypothetical modification:** Suppose Williams had a position of 2.0 on `econ_tax_structure` (perfectly aligned with user) but 7.5 on `justice_firearms` (opposed). Under static weights, the firearms disagreement and tax agreement roughly cancel. Under dynamic weights, the firearms axis (gw=0.723) is weighted 29% more heavily than tax structure (gw=0.559), so the firearms disagreement dominates, pushing Williams below Rogers.

This is the correct behavior: the system recognizes that firearms is a more discriminating axis on this ballot and gives it proportionally more influence.

---

## 10. Full Integration: Updated Weight Formula

### 10.1 Complete Per-Axis Weight

The full per-axis weight in the matching formula becomes:

```
w_i = dynamic_gw_i * cov_i * conf_i * estr_i
```

Where:
- `dynamic_gw_i` = output of `computeDynamicWeights()` (this document)
- `cov_i` = coverage status (1.0 if answered/imputed, 0.0 otherwise)
- `conf_i` = hybrid entropy-based confidence (Research Note 06)
- `estr_i` = candidate evidence strength (from CandidateScore table)

After dominance capping (Section 6.2):

```
total_w = SUM(w_i)
for each i: if w_i / total_w > 0.35, rescale w_i down
```

### 10.2 Complete TypeScript: computeWeightedMatch

```typescript
import type { BallotItem, ValueAxis, CandidateMatch, Candidate } from './ballotHelpers';

export interface WeightedMatchConfig {
  dominanceCap: number;   // default 0.35
  minActiveAxes: number;  // default 3
}

export interface WeightedAxisDetail {
  axisId: string;
  axisName: string;
  dynamicWeight: number;
  spreadValue: number;
  relevanceValue: number;
  userValue: number;
  candidateValue: number;
  evidenceStrength: number;
  confidence: number;
  effectiveWeight: number;  // w_i after dominance capping
  alignment: number;        // A_i
  contribution: number;     // w_i * A_i (how much this axis contributes to match)
  weightExplanation: string;
}

export interface WeightedMatchResult {
  candidateId: string;
  matchPercent: number;
  isBestMatch: boolean;
  axisDetails: WeightedAxisDetail[];
  totalEffectiveWeight: number;
  activeAxisCount: number;
  isInsufficient: boolean;  // true if < MIN_ACTIVE_AXES
  staticMatchPercent: number;  // for transparency comparison
  rankingChanged: boolean;     // true if dynamic ranking differs from static
}

const DEFAULT_MATCH_CONFIG: WeightedMatchConfig = {
  dominanceCap: 0.35,
  minActiveAxes: 3,
};

/**
 * Compute candidate matches using dynamic ballot-specific axis weights.
 *
 * This replaces the static gw_i = 1.0 in computeCandidateMatches() with
 * weights derived from candidate spread and ballot relevance.
 */
export function computeWeightedCandidateMatches(
  ballotItem: BallotItem,
  allBallotItems: BallotItem[],
  userAxes: ValueAxis[],
  axisIds: string[],
  dynamicWeights: Record<string, number>,
  config: Partial<WeightedMatchConfig> = {}
): WeightedMatchResult[] {
  const cfg = { ...DEFAULT_MATCH_CONFIG, ...config };

  if (ballotItem.type !== 'candidate_race' || !ballotItem.candidates) {
    return [];
  }

  const relevantAxes = ballotItem.relevantAxes ?? [];

  // Precompute spread for this item
  const spreadValues: Record<string, number> = {};
  for (const axId of relevantAxes) {
    spreadValues[axId] = axisSpread(axId, ballotItem);
  }

  // Compute ballot relevance for explanation text
  const relevance = computeBallotRelevance(allBallotItems, axisIds);

  // Compute static matches for comparison
  const staticResults: { candidateId: string; matchPercent: number }[] = [];

  const results: WeightedMatchResult[] = [];

  for (const candidate of ballotItem.candidates) {
    const axisDetails: WeightedAxisDetail[] = [];
    let totalWeightedAlignment = 0;
    let totalWeight = 0;
    let totalStaticWA = 0;
    let totalStaticW = 0;
    let activeCount = 0;

    for (const axisId of relevantAxes) {
      const userAxis = userAxes.find((a) => a.id === axisId);
      const candidateStance = candidate.profile.stances[axisId];
      if (userAxis === undefined || candidateStance === undefined) continue;

      const gw = dynamicWeights[axisId] ?? 1.0;
      const conf = userAxis.weight; // confidence is stored in weight field
      const estr = getEvidenceStrength(candidate, axisId);
      const cov = 1.0; // axis is covered if we reach here

      const w_i = gw * cov * conf * estr;
      const w_static = 1.0 * cov * conf * estr;
      const A_i = 1 - Math.abs(userAxis.value - candidateStance) / 10;

      activeCount++;
      totalWeightedAlignment += w_i * A_i;
      totalWeight += w_i;
      totalStaticWA += w_static * A_i;
      totalStaticW += w_static;

      // Generate weight explanation
      const spread = spreadValues[axisId] ?? 0;
      const rel = relevance[axisId] ?? 0;
      const nItems = allBallotItems.filter(
        (item) => item.relevantAxes?.includes(axisId)
      ).length;
      const explanation = generateWeightExplanation(spread, rel, nItems);

      axisDetails.push({
        axisId,
        axisName: userAxis.name,
        dynamicWeight: gw,
        spreadValue: spread,
        relevanceValue: rel,
        userValue: userAxis.value,
        candidateValue: candidateStance,
        evidenceStrength: estr,
        confidence: conf,
        effectiveWeight: w_i,
        alignment: A_i,
        contribution: w_i * A_i,
        weightExplanation: explanation,
      });
    }

    // Apply dominance cap
    if (totalWeight > 0) {
      for (const detail of axisDetails) {
        const fraction = detail.effectiveWeight / totalWeight;
        if (fraction > cfg.dominanceCap) {
          const cappedWeight = cfg.dominanceCap * totalWeight;
          totalWeightedAlignment -= detail.effectiveWeight * detail.alignment;
          totalWeightedAlignment += cappedWeight * detail.alignment;
          totalWeight -= detail.effectiveWeight;
          totalWeight += cappedWeight;
          detail.effectiveWeight = cappedWeight;
          detail.contribution = cappedWeight * detail.alignment;
        }
      }
    }

    const matchScore = totalWeight > 0
      ? totalWeightedAlignment / totalWeight
      : 0.5;
    const staticScore = totalStaticW > 0
      ? totalStaticWA / totalStaticW
      : 0.5;

    const matchPercent = Math.round(matchScore * 100);
    const staticMatchPercent = Math.round(staticScore * 100);

    staticResults.push({
      candidateId: candidate.id,
      matchPercent: staticMatchPercent,
    });

    results.push({
      candidateId: candidate.id,
      matchPercent,
      isBestMatch: false,
      axisDetails,
      totalEffectiveWeight: totalWeight,
      activeAxisCount: activeCount,
      isInsufficient: activeCount < cfg.minActiveAxes,
      staticMatchPercent,
      rankingChanged: false, // set below
    });
  }

  // Sort by match percent
  results.sort((a, b) => b.matchPercent - a.matchPercent);
  staticResults.sort((a, b) => b.matchPercent - a.matchPercent);

  // Mark best match
  if (results.length > 0 && results[0].matchPercent > 50 && !results[0].isInsufficient) {
    results[0].isBestMatch = true;
  }

  // Detect ranking changes
  if (results.length >= 2 && staticResults.length >= 2) {
    const dynamicTopId = results[0].candidateId;
    const staticTopId = staticResults[0].candidateId;
    if (dynamicTopId !== staticTopId) {
      for (const r of results) {
        r.rankingChanged = true;
      }
    }
  }

  return results;
}

function getEvidenceStrength(candidate: Candidate, axisId: string): number {
  const evidence = candidate.profile.evidence?.[axisId];
  if (!evidence || evidence.length === 0) return 0.5;
  return Math.min(1.0, 0.3 + 0.15 * evidence.length);
}

function generateWeightExplanation(
  spread: number,
  relevance: number,
  nItems: number
): string {
  const highSpread = spread > 0.5;
  const highRelevance = relevance > 0.5;

  if (highSpread && highRelevance) {
    return `This issue is weighted heavily because candidates take very different ` +
      `positions and it affects ${nItems} item(s) on your ballot.`;
  }
  if (highSpread && !highRelevance) {
    return `Candidates disagree strongly on this, though it mainly affects ` +
      `one race on your ballot.`;
  }
  if (!highSpread && highRelevance) {
    return `This issue appears in ${nItems} ballot item(s), but candidates ` +
      `have similar positions, so it doesn't help distinguish them much.`;
  }
  return `This issue has lower weight because candidates mostly agree and ` +
    `it affects few items on your ballot.`;
}
```

---

## 11. Discussion

### 11.1 What This System Does Not Do

This system adjusts weights *across axes*, not *within* the alignment calculation. The per-axis alignment formula `A_i = 1 - |U_i - C_i| / 10` is unchanged. The position scores for users and candidates are unchanged. The evidence strength values are unchanged. Only `gw_i` is dynamically computed.

This is a conservative design choice. The alignment formula and position scoring are well-tested components of the system. Changing them simultaneously with the weighting system would make it impossible to isolate the effects of either change.

### 11.2 When Dynamic Weights Matter Most

Dynamic weights have the largest impact when:

1. **The ballot is heterogeneous**: Some axes are highly contested and others are not. A ballot where every axis has similar spread will produce dynamic weights close to uniform.

2. **The user is relatively centrist**: For a user with strong positions across all axes, the match scores are already well-separated. Dynamic weights fine-tune the ranking. For a centrist user, where match scores cluster around 50-60%, the weight differences can be decisive.

3. **There are 3+ candidates**: With only 2 candidates, the spread calculation is a simple distance. With 3+ candidates (common in primaries or races with independents), spread captures whether the candidate field actually spans the axis or clusters on one side.

### 11.3 Interaction with Entropy Confidence

The dynamic weight (`gw_i`) and entropy confidence (`conf_i`) are multiplicative in `w_i`. This creates a desirable interaction: an axis that is both ballot-relevant AND clearly answered by the user gets the highest effective weight. An axis that is ballot-relevant but neutrally answered gets a moderate effective weight (high `gw_i` but low `conf_i`). An axis that is well-answered but irrelevant gets low effective weight (high `conf_i` but low `gw_i`).

This multiplicative decomposition preserves the separation of concerns: `gw_i` encodes "how much does this axis matter for this ballot" while `conf_i` encodes "how precisely do we know the user's position."

### 11.4 Limitations and Future Work

**Limitation 1: Spread computation requires scored candidates.** Until candidates have axis positions from the scoring pipeline (Phase 4 of the production implementation), spread values will be zero for all axes. The system gracefully degrades to relevance-only weighting, which is still better than uniform.

**Limitation 2: Item significance is manually assigned.** The `item_significance` override for top-of-ballot races is editorial. A principled alternative would be to weight by voter engagement data (what percentage of voters actually cast a vote in each race), but this data is not available pre-election.

**Limitation 3: No temporal dynamics.** Ballot items may be added or removed (e.g., a measure is struck from the ballot by court order). The dynamic weights should be recomputed whenever the ballot changes. The current design supports this (the function is stateless), but the UI must handle weight changes gracefully.

**Future extension: Axis interaction effects.** Some pairs of axes may interact non-linearly. For example, a user who is strongly pro-transit AND strongly pro-density may have a multiplicative preference for candidates who support both, beyond what the additive match formula captures. Modeling these interactions would require moving from the current linear weighted sum to a more expressive model, which is beyond the scope of this document.
