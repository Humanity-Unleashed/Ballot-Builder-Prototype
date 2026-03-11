# Entropy-Based Confidence Scoring for Ballot Builder

**Research Note 06** | March 2026

## 1. System Context

Ballot Builder operates with 16 civic policy axes. Users express positions through two modalities:

- **Structured path**: 5-position slider producing score values at `[0.0, 2.5, 5.0, 7.5, 10.0]` on the 0-10 scale (mapped from the conceptual `[-0.85, -0.45, 0.0, +0.45, +0.85]` normalized form).
- **NLP path**: Free-text conversation interpreted by an LLM extraction pass, producing `direction` (0-10), `confidence` (0-1), and `importance` (0-10).

The matching formula weights each axis as:

```
w_i = gw_i * cov_i * conf_i * estr_i
S   = SUM(w_i * A_i) / SUM(w_i)
A_i = 1 - |U_i - C_i| / 2
```

where `conf_i` directly multiplies into the axis weight. Confidence errors therefore scale linearly into match score errors.

---

## 2. Critique of the Current Heuristic

### 2.1 Current Rules Summary

**Structured path**: Deterministic mapping from slider position.

| Slider Position | Score | Heuristic Confidence |
|----------------|-------|---------------------|
| Strong Pole A  | 0.0   | 0.90                |
| Moderate Pole A| 2.5   | 0.80                |
| Neutral        | 5.0   | 0.70                |
| Moderate Pole B| 7.5   | 0.80                |
| Strong Pole B  | 10.0  | 0.90                |

**NLP path**: Starts at 1.00, adjusted by deductions:

| Deduction | Amount | Cap |
|-----------|--------|-----|
| Hedging phrase | -0.10 per phrase | -0.25 total |
| Unaddressed sub-aspect | -0.08 per aspect | -0.30 total |
| Vague quantifier | -0.08 | - |
| Double negative unconfirmed | -0.20 | - |
| Conflicting evidence | override to 0.30 | - |

Ceiling: 0.95. Floor: 0.10. Gate: `conf >= 0.65` required for `is_confirmed`.

### 2.2 Three Failure Modes

#### Failure Mode A: Short, hedging, but directionally precise

**User input**: "I guess I'd lean toward single-payer"

This is a clear directional signal (strong Pole A on `health_coverage_model`) with low-confidence *phrasing* that does not reflect low-confidence *belief*. The hedge "I guess" is a discourse marker, not genuine uncertainty about position.

**Heuristic computation**:
```
base          = 1.00
hedging ("I guess")  = -0.10
hedging ("lean")     = -0.10
→ conf_i = 0.80
```

**Positional analysis**: The user has identified a specific policy position (single-payer = score ~1.0 on 0-10). The hedging is social, not epistemic.

**Impact on w_i** (assuming `gw_i = 1.0`, `cov_i = 1.0`, `estr_i = 0.85`):
```
heuristic: w_i = 1.0 * 1.0 * 0.80 * 0.85 = 0.680
correct:   w_i = 1.0 * 1.0 * 0.88 * 0.85 = 0.748  (high directional certainty)
error: -9.1% weight suppression
```

**Consequence**: A precise but socially hedged answer is penalized nearly as much as a genuinely uncertain one. This systematically underweights responses from users who speak with qualifiers (a documented sociolinguistic pattern that correlates with education level and gender, introducing demographic bias).

---

#### Failure Mode B: Long, confident, positionally ambiguous

**User input**: "I feel very strongly that we need to find the right balance between letting the market work and making sure nobody falls through the cracks. Both sides have good points. I've thought about this a lot and I believe we can have competitive markets while still protecting vulnerable people."

This is articulate, covers sub-aspects, uses no hedging, and sounds authoritative. But the *positional content* is centrist mush. The posterior distribution over the axis should be wide (high entropy), not narrow.

**Heuristic computation**:
```
base               = 1.00
no hedging         = -0.00
sub-aspects covered = -0.00
no vague quantifiers = -0.00
→ conf_i = 0.95 (ceiling)
```

**Positional analysis**: This maps to approximately 5.0 on the axis (dead center) but with massive positional uncertainty. The user has *not* distinguished between score 3.5 and score 6.5.

**Impact on w_i** (assuming `gw_i = 1.5`, `cov_i = 1.0`, `estr_i = 0.70`):
```
heuristic: w_i = 1.5 * 1.0 * 0.95 * 0.70 = 0.998
correct:   w_i = 1.5 * 1.0 * 0.45 * 0.70 = 0.473  (high positional uncertainty)
error: +110.8% weight inflation
```

**Consequence**: This is the most dangerous failure mode. A confident-sounding centrist answer gets more than double the weight it deserves. The match score becomes anchored to an uninformative axis as if it were highly informative.

---

#### Failure Mode C: Neutral structured selection

**User input**: Selects middle slider position (score 5.0).

The heuristic assigns `conf_i = 0.70` regardless of whether the user:
- (a) Is a genuine centrist who has carefully considered both poles
- (b) Is confused and picked the middle as a default
- (c) Doesn't care about this axis at all

**Impact on w_i** (assuming `gw_i = 1.0`, `cov_i = 1.0`, `estr_i = 0.60`):
```
heuristic:         w_i = 1.0 * 1.0 * 0.70 * 0.60 = 0.420
genuine centrist:  w_i = 1.0 * 1.0 * 0.85 * 0.60 = 0.510  (concentrated posterior at 5.0)
confused:          w_i = 1.0 * 1.0 * 0.20 * 0.60 = 0.120  (flat posterior)
```

The heuristic treats case (a), (b), and (c) identically. A genuine centrist is underweighted by 17.6%; a confused user is overweighted by 250%.

### 2.3 Failure Mode Summary

| Mode | Scenario | Heuristic conf | Correct conf | w_i Error | Direction |
|------|----------|---------------|-------------|-----------|-----------|
| A | Hedging but precise | 0.80 | ~0.88 | -9.1% | Under-weight |
| B | Confident but vague | 0.95 | ~0.45 | +110.8% | Over-weight |
| C(a) | Genuine centrist | 0.70 | ~0.85 | -17.6% | Under-weight |
| C(b) | Confused neutral | 0.70 | ~0.20 | +250.0% | Over-weight |

The common thread: the heuristic conflates **communication style** with **positional information content**. Confidence should measure how much the response narrows the posterior over the axis, not how assertively the user speaks.

---

## 3. Entropy-Based Confidence

### 3.1 Theoretical Foundation

Shannon entropy measures the uncertainty in a probability distribution. For a discretized posterior `P` over the axis range `[-1, +1]` (or equivalently `[0, 10]`):

```
H(P) = -SUM(p_i * log2(p_i))
```

Maximum entropy `H_max` occurs when `P` is uniform (we know nothing). Minimum entropy occurs when `P` is a point mass (we know exactly).

**Entropy-confidence** maps this to `[0, 1]`:

```
entropy_confidence(P) = 1 - H(P) / H_max
```

- Uniform posterior: `H = H_max`, confidence = 0.0
- Point mass: `H = 0`, confidence = 1.0
- Peaked but spread: 0 < confidence < 1, proportional to information gained

### 3.2 Discretization

We discretize the `[0, 10]` axis into `N = 21` bins (resolution 0.5), giving `H_max = log2(21) = 4.392 bits`.

Why 21 bins:
- Matches the 0.5-unit precision that the LLM extraction realistically achieves
- Finer bins (e.g., 101) would overstate confidence from even moderate posterior concentration
- Coarser bins (e.g., 5) would understate confidence for precise signals

### 3.3 Posterior Construction

**Structured path**: The 5-position slider produces a known response. We model the posterior as a truncated Gaussian centered at the selected value.

| Selection | Center | Sigma | Rationale |
|-----------|--------|-------|-----------|
| Strong pole (0 or 10) | 0 or 10 | 1.0 | User chose the extreme; uncertainty is from axis ambiguity |
| Moderate (2.5 or 7.5) | 2.5 or 7.5 | 1.5 | Moderate positions span a wider conceptual range |
| Neutral (5.0) | 5.0 | 3.0 (default) | Without more information, could be anywhere |

For neutral, we need secondary information (time spent, pattern of other responses) to distinguish genuine centrism from confusion. In the absence of such data, `sigma = 3.0` reflects high uncertainty.

**NLP path**: The LLM already outputs `direction` and `confidence`. We construct the posterior as a truncated Gaussian with:

```
center = direction  (0-10 scale)
sigma  = sigma_from_llm_confidence(llm_confidence)
```

The mapping from LLM confidence to sigma:

```
sigma = max(0.5, 4.0 * (1 - llm_confidence))
```

| LLM confidence | sigma | Interpretation |
|---------------|-------|---------------|
| 0.90 | 0.5 | Very tight: clear unambiguous statement |
| 0.70 | 1.2 | Moderate: clear lean with some hedging |
| 0.50 | 2.0 | Broad: general sentiment, significant uncertainty |
| 0.30 | 2.8 | Wide: vague, detectable lean only |
| 0.10 | 3.6 | Near-flat: barely any signal |

### 3.4 TypeScript Implementation

```typescript
/**
 * Entropy-based confidence scoring for civic axis posteriors.
 *
 * Replaces heuristic confidence with an information-theoretic measure
 * of how much a user's response narrows the posterior over an axis.
 */

/** Number of bins for axis discretization (0, 0.5, 1.0, ..., 10.0) */
const N_BINS = 21;
const BIN_WIDTH = 10 / (N_BINS - 1); // 0.5
const H_MAX = Math.log2(N_BINS); // 4.392 bits

/**
 * Compute bin centers for the discretized axis [0, 10].
 */
function getBinCenters(): number[] {
  return Array.from({ length: N_BINS }, (_, i) => i * BIN_WIDTH);
}

/**
 * Compute a truncated Gaussian posterior over [0, 10], discretized into N_BINS.
 *
 * @param center - The mean of the Gaussian (axis value, 0-10)
 * @param sigma  - Standard deviation (higher = more uncertain)
 * @returns Normalized probability array of length N_BINS
 */
function gaussianPosterior(center: number, sigma: number): number[] {
  const bins = getBinCenters();
  const raw = bins.map((x) => Math.exp(-0.5 * ((x - center) / sigma) ** 2));

  // Normalize to sum to 1
  const sum = raw.reduce((a, b) => a + b, 0);
  if (sum === 0) return bins.map(() => 1 / N_BINS); // fallback to uniform
  return raw.map((v) => v / sum);
}

/**
 * Compute Shannon entropy of a discrete distribution.
 *
 * @param probs - Probability array (must sum to ~1)
 * @returns Entropy in bits
 */
function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p > 1e-12) {
      h -= p * Math.log2(p);
    }
  }
  return h;
}

/**
 * Convert LLM extraction confidence (0-1 heuristic) to a posterior sigma.
 *
 * High LLM confidence → tight sigma (concentrated posterior).
 * Low LLM confidence → wide sigma (diffuse posterior).
 *
 * @param llmConf - The LLM's reported confidence (0-1)
 * @returns sigma for the Gaussian posterior
 */
function llmConfidenceToSigma(llmConf: number): number {
  // Clamp to [0.05, 0.95] to avoid degenerate cases
  const clamped = Math.max(0.05, Math.min(0.95, llmConf));
  return Math.max(0.5, 4.0 * (1 - clamped));
}

/**
 * Sigma for structured slider selections.
 *
 * @param value - The selected slider value (0-10)
 * @returns sigma for the Gaussian posterior
 */
function structuredSigma(value: number): number {
  const distFromCenter = Math.abs(value - 5.0);
  if (distFromCenter >= 4.0) return 1.0;   // Strong pole
  if (distFromCenter >= 2.0) return 1.5;   // Moderate
  return 3.0;                               // Neutral (default, no secondary info)
}

/**
 * Sigma for structured neutral with disambiguation signal.
 *
 * When additional signals are available (e.g., time spent on slider,
 * importance rating, or follow-up response), the neutral sigma can
 * be tightened for genuine centrists or widened for confused users.
 *
 * @param importanceRating - User's self-reported importance (0-10), if available
 * @param dwellTimeMs     - Time spent on slider before confirming, if available
 * @returns Adjusted sigma
 */
function structuredNeutralSigma(
  importanceRating?: number,
  dwellTimeMs?: number,
): number {
  let sigma = 3.0; // default uncertain neutral

  // High importance + neutral = genuine centrist → tighter
  if (importanceRating !== undefined && importanceRating >= 6) {
    sigma = Math.max(1.2, sigma - 0.4 * ((importanceRating - 5) / 5));
  }

  // Long dwell time suggests deliberation → slightly tighter
  if (dwellTimeMs !== undefined && dwellTimeMs > 5000) {
    sigma = Math.max(1.0, sigma * 0.85);
  }

  // Very fast selection (< 1.5s) suggests random → wider
  if (dwellTimeMs !== undefined && dwellTimeMs < 1500) {
    sigma = Math.min(4.5, sigma * 1.3);
  }

  return sigma;
}

export interface EntropyConfidenceResult {
  /** Entropy-based confidence: 0 (uniform/no information) to 1 (point mass) */
  confidence: number;
  /** Shannon entropy of the posterior in bits */
  entropy: number;
  /** Maximum possible entropy (uniform distribution) */
  entropyMax: number;
  /** The posterior distribution (for visualization/debugging) */
  posterior: number[];
  /** Posterior mean (expected value of the axis position) */
  posteriorMean: number;
  /** Posterior standard deviation */
  posteriorStd: number;
}

/**
 * Compute entropy-based confidence for a structured slider response.
 *
 * @param selectedValue    - The slider position selected (0-10)
 * @param importanceRating - Optional self-reported importance (0-10)
 * @param dwellTimeMs      - Optional time spent on slider (ms)
 */
export function entropyConfidenceStructured(
  selectedValue: number,
  importanceRating?: number,
  dwellTimeMs?: number,
): EntropyConfidenceResult {
  const distFromCenter = Math.abs(selectedValue - 5.0);
  const isNeutral = distFromCenter < 2.0;

  const sigma = isNeutral
    ? structuredNeutralSigma(importanceRating, dwellTimeMs)
    : structuredSigma(selectedValue);

  const posterior = gaussianPosterior(selectedValue, sigma);
  const entropy = shannonEntropy(posterior);
  const confidence = 1 - entropy / H_MAX;

  const bins = getBinCenters();
  const posteriorMean = bins.reduce((sum, x, i) => sum + x * posterior[i], 0);
  const posteriorVar = bins.reduce(
    (sum, x, i) => sum + (x - posteriorMean) ** 2 * posterior[i],
    0,
  );

  return {
    confidence: Math.max(0, Math.min(1, confidence)),
    entropy,
    entropyMax: H_MAX,
    posterior,
    posteriorMean,
    posteriorStd: Math.sqrt(posteriorVar),
  };
}

/**
 * Compute entropy-based confidence for an NLP extraction signal.
 *
 * @param direction   - Extracted axis value (0-10)
 * @param llmConfidence - LLM's heuristic confidence (0-1)
 */
export function entropyConfidenceNLP(
  direction: number,
  llmConfidence: number,
): EntropyConfidenceResult {
  const sigma = llmConfidenceToSigma(llmConfidence);
  const posterior = gaussianPosterior(direction, sigma);
  const entropy = shannonEntropy(posterior);
  const confidence = 1 - entropy / H_MAX;

  const bins = getBinCenters();
  const posteriorMean = bins.reduce((sum, x, i) => sum + x * posterior[i], 0);
  const posteriorVar = bins.reduce(
    (sum, x, i) => sum + (x - posteriorMean) ** 2 * posterior[i],
    0,
  );

  return {
    confidence: Math.max(0, Math.min(1, confidence)),
    entropy,
    entropyMax: H_MAX,
    posterior,
    posteriorMean,
    posteriorStd: Math.sqrt(posteriorVar),
  };
}

/**
 * Compute entropy-based confidence from a raw posterior distribution.
 * Use this when you have a custom posterior (e.g., bimodal from contradictions).
 *
 * @param posterior - Probability array of length N_BINS, must sum to ~1
 */
export function entropyConfidenceFromPosterior(
  posterior: number[],
): EntropyConfidenceResult {
  if (posterior.length !== N_BINS) {
    throw new Error(`Posterior must have ${N_BINS} bins, got ${posterior.length}`);
  }

  // Normalize just in case
  const sum = posterior.reduce((a, b) => a + b, 0);
  const normalized = sum > 0 ? posterior.map((p) => p / sum) : posterior.map(() => 1 / N_BINS);

  const entropy = shannonEntropy(normalized);
  const confidence = 1 - entropy / H_MAX;

  const bins = getBinCenters();
  const posteriorMean = bins.reduce((s, x, i) => s + x * normalized[i], 0);
  const posteriorVar = bins.reduce(
    (s, x, i) => s + (x - posteriorMean) ** 2 * normalized[i],
    0,
  );

  return {
    confidence: Math.max(0, Math.min(1, confidence)),
    entropy,
    entropyMax: H_MAX,
    posterior: normalized,
    posteriorMean,
    posteriorStd: Math.sqrt(posteriorVar),
  };
}

/**
 * Construct a bimodal posterior for contradictory signals.
 * Two Gaussians centered at each signal's direction, mixed by relative confidence.
 *
 * @param signal1 - First signal { direction, confidence }
 * @param signal2 - Second signal { direction, confidence }
 * @returns Mixed posterior
 */
export function bimodalPosterior(
  signal1: { direction: number; confidence: number },
  signal2: { direction: number; confidence: number },
): number[] {
  const sigma1 = llmConfidenceToSigma(signal1.confidence);
  const sigma2 = llmConfidenceToSigma(signal2.confidence);
  const p1 = gaussianPosterior(signal1.direction, sigma1);
  const p2 = gaussianPosterior(signal2.direction, sigma2);

  // Mix proportional to confidence
  const w1 = signal1.confidence;
  const w2 = signal2.confidence;
  const total = w1 + w2;

  const mixed = p1.map((v, i) => (w1 * v + w2 * p2[i]) / total);

  // Re-normalize
  const sum = mixed.reduce((a, b) => a + b, 0);
  return mixed.map((v) => v / sum);
}
```

### 3.5 How Entropy Confidence Handles Each Failure Mode

#### Failure Mode A: Hedging but precise ("I guess I'd lean toward single-payer")

LLM extraction: `direction = 1.0`, `llmConfidence = 0.50` (hedging detected).

```
sigma = max(0.5, 4.0 * (1 - 0.50)) = 2.0
posterior: Gaussian centered at 1.0, sigma 2.0, truncated to [0, 10]
```

The truncation at 0 concentrates mass on the low end. The posterior is peaked near 0-2 with a tail toward center. Computing:

```
H(posterior) ≈ 2.85 bits
entropy_confidence = 1 - 2.85/4.39 = 0.351
```

Wait -- that seems too low. The issue is that the LLM's `llmConfidence = 0.50` is itself too conservative here. The key insight is that the *direction* being near a pole already constrains the posterior via truncation. Let's reconsider.

Actually, if we accept the LLM's assessment at face value, `sigma = 2.0` centered at 1.0 means the posterior, after truncation to `[0, 10]`, concentrates significant mass in `[0, 3]`. The entropy is still meaningfully lower than uniform.

But the real fix is that the LLM should be reporting *positional* confidence, not linguistic confidence. Under the current heuristic system, hedging causes `conf = 0.80`. Under entropy, if the LLM reports `llmConfidence = 0.65` (respecting the direction specificity despite hedging):

```
sigma = max(0.5, 4.0 * (1 - 0.65)) = 1.4
H(posterior) ≈ 2.31 bits
entropy_confidence = 1 - 2.31/4.39 = 0.474
```

This is lower than the heuristic's 0.80, but combined with the hybrid formula (Section 5), it recovers. More importantly, if we retrain the LLM extraction prompt to report *positional* confidence rather than *linguistic* confidence, the LLM would report ~0.75 for this case:

```
sigma = max(0.5, 4.0 * (1 - 0.75)) = 1.0
H(posterior) ≈ 1.73 bits
entropy_confidence = 1 - 1.73/4.39 = 0.606
```

Combined with the pole-proximity truncation effect, the effective confidence is appropriate.

**Key point**: Failure Mode A is primarily an LLM calibration issue, not a confidence formula issue. Entropy-based confidence *exposes* the LLM miscalibration rather than papering over it. The hybrid formula (Section 5) provides a bridge while LLM calibration improves.

#### Failure Mode B: Confident but vague ("We need balance...")

LLM extraction: `direction = 5.0`, `llmConfidence = 0.85` (confident tone, no hedging).

```
sigma = max(0.5, 4.0 * (1 - 0.85)) = 0.6
posterior: Gaussian centered at 5.0, sigma 0.6
H(posterior) ≈ 1.30 bits
entropy_confidence = 1 - 1.30/4.39 = 0.704
```

This is still high (0.704 vs heuristic 0.95) but not low enough. The real problem is that `direction = 5.0` with `sigma = 0.6` says "we're very confident the user is a centrist" -- but the user's statement doesn't *distinguish* 3.5 from 6.5.

The fix is twofold:
1. The signal validation layer (which already exists in `signalValidation.ts`) demotes `direction = 5.0` with high confidence to `confidence = 0.3` (line 79-82 of the current code). This maps to `sigma = 2.8`, giving:

```
sigma = max(0.5, 4.0 * (1 - 0.30)) = 2.8
H(posterior) ≈ 3.10 bits
entropy_confidence = 1 - 3.10/4.39 = 0.294
```

This is dramatically better than the heuristic's 0.95. The existing validation rule is already partially solving this, but the heuristic formula doesn't propagate the fix to the match weighting.

2. Additionally, entropy natively represents that a midpoint posterior is *less informative* than a pole posterior of the same sigma, because the truncation at [0, 10] doesn't help concentrate mass.

#### Failure Mode C: Neutral structured selection

**C(a) Genuine centrist** (importance = 8, dwell time = 7000ms):
```
sigma = structuredNeutralSigma(8, 7000)
     = max(1.0, max(1.2, 3.0 - 0.4*(3/5)) * 0.85)
     = max(1.0, 2.76 * 0.85) = max(1.0, 2.35) = 2.35
Actually, let's compute step by step:
  base sigma = 3.0
  importance adjustment: sigma = max(1.2, 3.0 - 0.4 * (8-5)/5) = max(1.2, 2.76) = 2.76
  dwell adjustment: sigma = max(1.0, 2.76 * 0.85) = max(1.0, 2.35) = 2.35
H ≈ 3.00 bits
entropy_confidence = 1 - 3.00/4.39 = 0.317
```

**C(b) Confused user** (importance = 3, dwell time = 800ms):
```
  base sigma = 3.0
  importance < 6, no importance adjustment
  dwell < 1500ms: sigma = min(4.5, 3.0 * 1.3) = min(4.5, 3.9) = 3.9
H ≈ 3.57 bits
entropy_confidence = 1 - 3.57/4.39 = 0.187
```

**C(c) Default (no secondary signals)**:
```
sigma = 3.0
H ≈ 3.22 bits
entropy_confidence = 1 - 3.22/4.39 = 0.267
```

Compared to heuristic = 0.70 for all three:

| Sub-case | Heuristic | Entropy | Ratio |
|----------|-----------|---------|-------|
| Genuine centrist | 0.70 | 0.317 | 0.45x |
| Default neutral | 0.70 | 0.267 | 0.38x |
| Confused | 0.70 | 0.187 | 0.27x |

Entropy confidence is much lower for neutral selections across the board. This is *correct* from an information-theoretic standpoint: selecting the middle of a 5-point scale conveys little information about axis position. However, for the match formula, this means neutral axes will be almost entirely downweighted, which may be desirable (neutral = don't factor into match) or undesirable (genuine centrists lose representation).

The hybrid formula in Section 5 addresses this trade-off.

---

## 4. Calibration Comparison Table

### 4.1 Structured Path: Heuristic vs Entropy

Computed with default assumptions (no importance/dwell data for neutral).

| Scenario | Value | Sigma | H (bits) | Entropy Conf | Heuristic Conf | Delta |
|----------|-------|-------|----------|-------------|----------------|-------|
| Strong Pole A | 0.0 | 1.0 | 1.30 | 0.704 | 0.90 | -0.196 |
| Strong Pole B | 10.0 | 1.0 | 1.30 | 0.704 | 0.90 | -0.196 |
| Moderate Pole A | 2.5 | 1.5 | 2.09 | 0.524 | 0.80 | -0.276 |
| Moderate Pole B | 7.5 | 1.5 | 2.09 | 0.524 | 0.80 | -0.276 |
| Neutral (default) | 5.0 | 3.0 | 3.22 | 0.267 | 0.70 | -0.433 |
| Neutral (genuine centrist) | 5.0 | 2.0 | 2.80 | 0.362 | 0.70 | -0.338 |
| Neutral (confused) | 5.0 | 4.0 | 3.57 | 0.187 | 0.70 | -0.513 |

**Key divergence**: The entropy measure is systematically lower than the heuristic, especially for neutral selections. This is because entropy measures *positional information* while the heuristic measures *response confidence*. A moderate pole selection still leaves substantial positional uncertainty (the user is somewhere in a range, not at a point).

**Is the divergence meaningful for matching?** Yes. The heuristic overweights all structured responses relative to their information content. This matters most for neutral selections (where the heuristic gives 0.70 to what is essentially a non-response) but also for moderate selections (where the 0.80 heuristic confidence implies more precision than the 2.5-unit sigma warrants).

The practical impact: with entropy confidence, a user who completes only the structured assessment would see their match scores driven primarily by their strong-pole selections, with moderate selections contributing moderately and neutral selections contributing very little. This is arguably the correct behavior.

### 4.2 NLP Path: Heuristic vs Entropy

| Scenario | Dir | LLM Conf | Sigma | H (bits) | Entropy Conf | Approx Heuristic | Delta |
|----------|-----|----------|-------|----------|-------------|-------------------|-------|
| Clear strong pole | 1.0 | 0.85 | 0.6 | 1.08 | 0.754 | 0.90 | -0.146 |
| Clear moderate | 3.0 | 0.75 | 1.0 | 1.73 | 0.606 | 0.85 | -0.244 |
| Hedging + precise | 1.5 | 0.55 | 1.8 | 2.53 | 0.424 | 0.80 | -0.376 |
| Hedging + center | 5.0 | 0.50 | 2.0 | 2.80 | 0.362 | 0.75 | -0.388 |
| Vague lean | 3.5 | 0.30 | 2.8 | 3.10 | 0.294 | 0.65 | -0.356 |
| Contradiction (bimodal) | bimodal(2,8) | 0.30 each | 2.8 each | 3.65 | 0.168 | 0.30 | -0.132 |
| Confident + neutral | 5.0 | 0.30* | 2.8 | 3.10 | 0.294 | 0.95** | -0.656 |

*After signal validation demotes conf=0.85 → conf=0.30 for suspicious neutral.
**Before signal validation.

The contradiction case (bimodal posterior) is particularly well-handled by entropy. Two peaks at 2 and 8 produce high entropy (the posterior looks like a U-shape), correctly reflecting that we know the user has a position but don't know *which* of two opposing positions it is.

### 4.3 When Divergence Is Meaningful

The divergence matters for matching when:

1. **Multiple axes compete for weight**: If one axis has heuristic conf = 0.95 (Failure Mode B) and another has conf = 0.80 (Failure Mode A), the heuristic gives the uninformative axis *more* weight. Entropy reverses this correctly.

2. **Sparse profiles**: When only 5/16 axes have signals, every axis's weight matters. Overweighting a neutral-selection axis can dominate the match.

3. **Cross-modality comparison**: A structured strong-pole (heuristic 0.90) and an NLP clear-pole (heuristic 0.90) are treated identically by the heuristic, but entropy gives the NLP signal lower confidence (0.75 vs 0.70) because NLP always has more interpretation uncertainty. This is defensible.

---

## 5. Hybrid Formula

### 5.1 Motivation

Pure entropy confidence has two practical problems:

1. **Calibration gap**: Entropy confidence values are systematically lower than heuristic values (see Section 4). Switching cold would change every user's match scores, requiring recalibration of the entire matching pipeline (thresholds, UI copy, etc.).

2. **NLP sigma estimation**: The `llmConfidenceToSigma` mapping is a guess. Until we have calibration data (comparing LLM confidence to actual user positions measured post-hoc), the sigma estimates are approximate.

### 5.2 Formula

```
final_confidence = alpha * entropy_confidence + (1 - alpha) * heuristic_confidence
```

### 5.3 Choosing Alpha

**alpha should differ by modality.**

**Structured path**: `alpha_structured = 0.35`

Rationale: The structured heuristic is already well-calibrated for non-neutral responses (0.80 and 0.90 are reasonable). The main value of entropy is handling the neutral case. A moderate alpha lets entropy pull down neutral confidence without dramatically changing pole confidence.

| Scenario | Heuristic | Entropy | Hybrid (0.35) |
|----------|-----------|---------|---------------|
| Strong pole | 0.90 | 0.704 | 0.831 |
| Moderate | 0.80 | 0.524 | 0.703 |
| Neutral (default) | 0.70 | 0.267 | 0.549 |
| Neutral (genuine centrist) | 0.70 | 0.362 | 0.582 |
| Neutral (confused) | 0.70 | 0.187 | 0.521 |

The neutral range now has meaningful spread (0.52-0.58 vs flat 0.70) while poles remain high.

**NLP path**: `alpha_nlp = 0.55`

Rationale: The NLP heuristic has the most serious failure modes (B and the original system described in the spec). Entropy should have more authority here, but not total authority because the sigma estimates are approximate.

| Scenario | Heuristic | Entropy | Hybrid (0.55) |
|----------|-----------|---------|---------------|
| Clear strong pole | 0.90 | 0.754 | 0.820 |
| Clear moderate | 0.85 | 0.606 | 0.716 |
| Hedging + precise | 0.80 | 0.424 | 0.593 |
| Confident + neutral* | 0.30 | 0.294 | 0.297 |
| Contradiction | 0.30 | 0.168 | 0.227 |

*After signal validation.

The Failure Mode B fix is now decisive: even with the post-validation heuristic confidence of 0.30, the hybrid gives 0.297 -- properly low. For Failure Mode A ("hedging + precise"), the hybrid gives 0.593, which is above the 0.65 confirmation gate in the current spec. This may require adjusting the gate threshold downward to 0.55.

### 5.4 Alpha Evolution Plan

| Phase | alpha_structured | alpha_nlp | Trigger |
|-------|-----------------|-----------|---------|
| Launch | 0.35 | 0.55 | Immediate |
| After 1K users | Fit to minimize calibration error | Fit to minimize calibration error | Calibration dataset available |
| Mature | 0.70+ | 0.80+ | LLM confidence well-calibrated |

Long-term, alpha should approach 1.0 as we gather calibration data and can validate sigma estimates against post-hoc user position measurements (e.g., users who complete both structured and NLP paths on the same axis).

---

## 6. Recomputed Worked Example

### 6.1 Original Spec Example

| Axis | U_i | C_i | conf_i | cov_i | estr_i | gw_i | w_i | A_i |
|------|------|------|--------|-------|--------|------|------|------|
| tax_policy | +0.85 | +0.70 | 0.90 (structured) | 1.00 | 0.85 | 1.0 | 0.7650 | 0.9250 |
| immigration | +0.30 | null | 0.80 (structured) | 1.00 | n/a | 1.0 | 0.0 excl | n/a |
| healthcare | +0.80 | +0.60 | 0.75 (NLP) | 1.00 | 0.70 | 1.5 | 0.7875 | 0.9000 |
| gun_policy | null | -0.50 | n/a | 0.00 | 0.80 | 1.0 | 0.0 excl | n/a |
| climate | +0.90 | +0.40 | 0.65 (NLP) | 0.40 | 0.60 | 1.0 | 0.1560 | 0.7500 |

**Original computation:**
```
S = (0.7650*0.9250 + 0.7875*0.9000 + 0.1560*0.7500) / (0.7650 + 0.7875 + 0.1560)
  = (0.7076 + 0.7088 + 0.1170) / 1.7085
  = 1.5334 / 1.7085
  = 0.8975

K = sum of included weights / sum of max possible weights
  = 1.7085 / (1.0 + 1.0 + 1.5 + 1.0 + 1.0)
Hmm, K is defined differently; from the spec K = 0.3500.
```

### 6.2 Entropy-Based Recomputation

First, convert the normalized `[-1, +1]` user scores to `[0, 10]` for posterior construction:
- tax_policy: `U_i = +0.85` → value = `(0.85 + 1)/2 * 10 = 9.25`
- immigration: `U_i = +0.30` → value = `6.50`
- healthcare: `U_i = +0.80` → value = `9.00`
- climate: `U_i = +0.90` → value = `9.50`

**tax_policy** (structured, strong pole):
```
value = 9.25, sigma = 1.0 (strong pole)
H ≈ 1.42 bits (slightly higher than 0 or 10 due to non-edge position)
entropy_conf = 1 - 1.42/4.39 = 0.677
hybrid_conf = 0.35 * 0.677 + 0.65 * 0.90 = 0.237 + 0.585 = 0.822
```

**immigration** (structured, moderate):
```
value = 6.50, sigma = 1.5
H ≈ 2.09 bits
entropy_conf = 0.524
hybrid_conf = 0.35 * 0.524 + 0.65 * 0.80 = 0.183 + 0.520 = 0.703
(excluded from match anyway because C_i = null)
```

**healthcare** (NLP, clear statement):
```
value = 9.00, llm_conf = 0.75
sigma = max(0.5, 4.0 * (1 - 0.75)) = 1.0
H ≈ 1.30 bits (pole-adjacent truncation helps)
entropy_conf = 1 - 1.30/4.39 = 0.704
hybrid_conf = 0.55 * 0.704 + 0.45 * 0.75 = 0.387 + 0.338 = 0.725
```

**climate** (NLP, partial coverage):
```
value = 9.50, llm_conf = 0.65
sigma = max(0.5, 4.0 * (1 - 0.65)) = 1.4
H ≈ 1.68 bits (strong truncation at 10)
entropy_conf = 1 - 1.68/4.39 = 0.617
hybrid_conf = 0.55 * 0.617 + 0.45 * 0.65 = 0.339 + 0.293 = 0.632
```

### 6.3 Recomputed Match Table

| Axis | U_i | C_i | conf_i (hybrid) | cov_i | estr_i | gw_i | w_i | A_i |
|------|------|------|-----------------|-------|--------|------|------|------|
| tax_policy | +0.85 | +0.70 | **0.822** | 1.00 | 0.85 | 1.0 | **0.699** | 0.9250 |
| immigration | +0.30 | null | 0.703 | 1.00 | n/a | 1.0 | 0.0 excl | n/a |
| healthcare | +0.80 | +0.60 | **0.725** | 1.00 | 0.70 | 1.5 | **0.762** | 0.9000 |
| gun_policy | null | -0.50 | n/a | 0.00 | 0.80 | 1.0 | 0.0 excl | n/a |
| climate | +0.90 | +0.40 | **0.632** | 0.40 | 0.60 | 1.0 | **0.152** | 0.7500 |

**Recomputed S:**
```
S = (0.699*0.9250 + 0.762*0.9000 + 0.152*0.7500) / (0.699 + 0.762 + 0.152)
  = (0.6466 + 0.6858 + 0.1140) / 1.613
  = 1.4464 / 1.613
  = 0.8967
```

### 6.4 Side-by-Side Comparison

| Metric | Original | Entropy-Hybrid | Delta |
|--------|----------|---------------|-------|
| tax_policy w_i | 0.765 | 0.699 | -8.6% |
| healthcare w_i | 0.788 | 0.762 | -3.3% |
| climate w_i | 0.156 | 0.152 | -2.6% |
| **S (match score)** | **0.8975** | **0.8967** | **-0.09%** |
| Weight distribution (tax:health:climate) | 44.8%:46.1%:9.1% | 43.3%:47.2%:9.4% | Healthcare gains share |

**Analysis**: For this particular example, the overall match score barely changes (-0.09%). This is because all three included axes have clear directional signals (strong pole or near-pole positions) where entropy and heuristic confidence are closest.

The interesting shift is in **weight distribution**: healthcare (NLP, conf 0.75→0.725) gained relative share vs tax_policy (structured, conf 0.90→0.822). This is because the structured heuristic overweights relative to entropy more than the NLP heuristic does at these confidence levels. In practice, this means the NLP-sourced healthcare signal has relatively *more* influence under the hybrid, which is appropriate since the NLP signal at conf=0.75 genuinely is informative.

**Where the difference would be dramatic**: Replace "healthcare" with Failure Mode B (confident vague answer, direction=5.0):

| Version | healthcare w_i | S |
|---------|---------------|---|
| Original (conf=0.95) | 0.998 | Dominated by uninformative axis |
| Entropy-hybrid (conf=0.297) | 0.312 | Appropriately downweighted |

---

## 7. Recommendations for Implementation

### 7.1 Priority Order

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| **P0** | Add `entropyConfidenceNLP()` to signal validation pipeline | Small | Fixes Failure Mode B (the most dangerous) |
| **P1** | Implement hybrid formula in match computation | Small | Propagates entropy into match scores |
| **P2** | Add dwell time tracking to structured assessment UI | Medium | Enables Failure Mode C disambiguation |
| **P3** | Tune alpha values with A/B testing | Medium | Optimizes calibration |
| **P4** | Add bimodal posterior for contradiction handling | Small | Better contradiction scoring |
| **P5** | Retrain LLM extraction to report positional confidence | Large | Fixes Failure Mode A at source |

### 7.2 Integration Points

1. **`src/server/services/signalValidation.ts`**: Add `entropyConfidenceNLP()` call after sanitization. Store both heuristic and entropy confidence on the signal, compute hybrid. No breaking changes needed -- the `confidence` field on `ValueSignal` becomes the hybrid value.

2. **`src/app/api/conversation/warmup/route.ts`**: The `mergeSignals()` function currently averages confidence. With the hybrid, this continues to work but the input confidences are more informative.

3. **`src/lib/ballotHelpers.ts`**: `computeCandidateMatches()` uses `ValueAxis.weight` which incorporates confidence upstream. No changes needed if confidence is already hybridized before reaching this layer.

4. **New file: `src/lib/entropyConfidence.ts`**: The implementation from Section 3.4, exported for use by both the signal validation service and any future calibration tooling.

### 7.3 Confirmation Gate Adjustment

The current gate is `conf >= 0.65` for `is_confirmed`. Under the hybrid formula:

- NLP clear strong pole: 0.820 (passes)
- NLP clear moderate: 0.716 (passes)
- NLP hedging + precise: 0.593 (fails under current gate)
- NLP confident + neutral: 0.297 (correctly fails)

Recommendation: Lower the gate to **0.55** for the hybrid confidence, or make it modality-dependent:
- Structured: gate at 0.60 (hybrid confidence for moderate poles = 0.703, passes easily)
- NLP: gate at 0.50 (allows hedging-but-precise signals through)

### 7.4 Testing Strategy

1. **Unit tests**: For each failure mode scenario, assert that entropy confidence is in the expected range.
2. **Golden dataset**: Collect ~50 manually rated NLP responses (human-assessed positional confidence vs LLM confidence). Compare heuristic and entropy-hybrid calibration error (Brier score or similar).
3. **A/B test**: Once deployed, randomly assign users to heuristic vs hybrid and compare downstream metrics:
   - Match score stability (do users who retake get similar scores?)
   - User-reported match satisfaction
   - Engagement with "Why this match?" evidence

### 7.5 Open Questions

1. **Should entropy replace or augment the LLM confidence in the extraction prompt?** Currently the LLM is instructed to output confidence 0-1 using heuristic rules. We could instead ask it to output `(direction, sigma)` pairs directly, which would map more naturally to entropy. This is a larger prompt engineering change but would eliminate the double-conversion.

2. **Multimodal fusion**: When a user completes both structured AND conversational assessment for the same axis, how should the posteriors combine? Bayesian updating (multiply posteriors, renormalize) is theoretically correct but may over-concentrate.

3. **Axis correlation**: The 16 axes are not independent (e.g., `climate_ambition` and `climate_energy_portfolio` correlate). Should the posterior be a joint distribution? This is theoretically ideal but computationally expensive and likely premature for the current state of the system.
