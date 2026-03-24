# Time Saved Estimation Methodology

> **Purpose:** Estimate how long comparable ballot research would take a voter doing it independently, so we can show a credible "time saved" figure on the impact card.

---

## High-Level Recommendation

**The best we can honestly say:** Comparable manual research is likely in the range of **2-7 minutes per ballot item**, depending on item type, yielding **roughly 60-120+ minutes for a typical ballot** of 15-30 items. Evidence is indirect — no large-scale study has directly measured end-to-end ballot research time — so we should present a range and be transparent about assumptions.

---

## 1. Summary of Evidence

### Direct behavioral data

| Finding | Source | Confidence |
|---------|--------|------------|
| Voters spent a **median of 41 seconds** (mean 72s) browsing candidate info when provided a research tool | Ferrara et al., "Do voters use information on candidates?", *Public Choice* (2025). Experimental study, Rome 2021 municipal elections. | MEDIUM — one study, non-US context, but rigorous |
| More than half of subjects spent **< 1 minute** researching candidates | Same study | MEDIUM |
| Marking a ballot takes **3-6 minutes** on average (11,990 voters, 21 states, 529 polling places) | U.S. Alliance for Election Excellence, Voting Time Estimator | HIGH — large sample |
| Ballot measures take significantly more time than candidate races (in-booth) | Same source | HIGH |

### Reading speed and content length

| Parameter | Value | Source | Confidence |
|-----------|-------|--------|------------|
| Adult silent reading speed (nonfiction) | **238 wpm** median (175-300 range) | Brysbaert (2019), meta-analysis of 190 studies, 18,573 participants. *Journal of Memory and Language* | HIGH |
| Effective speed for ballot/legal text (Flesch-Kincaid grade 16) | **~175-200 wpm** estimated | Inferred from Ballotpedia readability scores (2024) | MEDIUM |
| Ballot measure title | **68 words** avg (range: 7-940) | Ballotpedia, 159 measures in 2024 | HIGH |
| Ballot measure summary | **125 words** avg | Ballotpedia, 69 of 159 measures in 2024 | HIGH |
| Official pro/con argument (CA) | **500 words** max (state), 300 max (local) | California Elections Code 9060-9069 | HIGH |
| Rebuttal argument (CA) | **250 words** max | California Elections Code | HIGH |
| Full voter guide entry per proposition | **~1,500-2,500 words** (title + analysis + pro + con + rebuttals) | Estimated from CA Elections Code limits | MEDIUM |
| Newspaper endorsement article | **750-1,000 words** | Journalism standards (op-ed norms) | MEDIUM |
| LWV VOTE411 candidate entry | **~500-1,500 words** (3-6 questions, 100-300 words each) | Estimated from typical entries | LOW |

### Ballot complexity

| Parameter | Value | Source | Confidence |
|-----------|-------|--------|------------|
| Typical suburban presidential-year ballot | **20-35 contests** | Estimated from Ballotpedia, FVAP, Niemi & Herrnson (2003) | LOW-MEDIUM |
| Large urban presidential-year ballot | **30-50+ contests** | Same sources | LOW-MEDIUM |
| Ballot rolloff (voters skipping items) | **~10-33%** of voters don't complete the full ballot | Kimball et al.; Wikipedia (ballot rolloff) | MEDIUM |
| Many down-ballot races are uncontested | ~30% of state legislative races in 2024 | Ballotpedia uncontested race analysis, 2024 | HIGH |

### Sources cited

1. **Brysbaert, M. (2019).** "How many words do we read per minute? A review and meta-analysis of reading rate." *Journal of Memory and Language*, 109. [Link](https://www.sciencedirect.com/science/article/abs/pii/S0749596X19300786)
2. **Ferrara, E. et al. (2025).** "Do voters use information on candidates?" *Public Choice*. [Link](https://link.springer.com/article/10.1007/s11127-025-01325-x)
3. **Ballotpedia.** "Ballot measure readability scores, 2024." [Link](https://ballotpedia.org/Ballot_measure_readability_scores,_2024)
4. **U.S. Alliance for Election Excellence.** "Voting Time Estimator." 11,990 voters, 21 states. [Link](https://electionexcellence.org/resources/voting-time-estimator/)
5. **Niemi, R.G. & Herrnson, P.S. (2003).** "Beyond the Butterfly: The Complexity of U.S. Ballots." *Perspectives on Politics*, 1(2). [Link](https://www.cambridge.org/core/journals/perspectives-on-politics/article/abs/beyond-the-butterfly-the-complexity-of-us-ballots/D373587C85FB372E081CED858B6CB857)
6. **California Elections Code**, Sections 9060-9069 (ballot arguments) and 9080-9096 (ballot pamphlets). [Link](https://ballotpedia.org/California_Elections_Code,_Section_9060-9069:_Arguments_concerning_measures)
7. **FVAP.gov.** "About Elections" (elected positions data). [Link](https://www.fvap.gov/info/about-absentee-voting/elections)
8. **Pew Research Center.** "Where Americans turn for election news" (2024). [Link](https://www.pewresearch.org/journalism/2024/10/10/where-americans-turn-for-election-news/)

---

## 2. Proposed Estimation Model

### Model: Bottoms-Up Per-Item Estimate

The model distinguishes three item types with different research profiles:

#### Parameters

| Parameter | Candidate Race | Ballot Measure | Uncontested/Retention |
|-----------|---------------|----------------|----------------------|
| Sources consulted | 2 (e.g., voter guide + one article) | 2-3 (pro/con arguments + explainer) | 0.5 (quick skim or skip) |
| Words per source | 600 | 800 | 200 |
| Reading speed (wpm) | 220 | 190 | 238 |
| Search/navigation overhead | 1.5 min | 1.5 min | 0.25 min |
| **Total per item** | **~7 min** | **~10 min** | **~1 min** |

#### Formula

```
estimated_manual_minutes =
    (num_candidate_races * 7)
  + (num_ballot_measures * 10)
  + (num_uncontested * 1)
  + session_overhead
```

Where `session_overhead` = **5 minutes** (finding a voter guide, getting oriented, deciding which sources to trust).

#### Conservative / midpoint / generous variants

To avoid false precision, we compute a **range** using multipliers:

| Variant | Multiplier | Rationale |
|---------|------------|-----------|
| Conservative (low) | 0.5x | Some voters skim; many skip down-ballot items entirely |
| Midpoint | 1.0x | Our base estimate for a voter who genuinely researches each item |
| Thorough (high) | 1.5x | Voter who reads multiple sources, compares endorsements |

**We recommend displaying the conservative-to-midpoint range** (0.5x to 1.0x) to stay credible.

#### Example: Austin, TX ballot with 9 items

Suppose: 6 candidate races, 2 ballot measures, 1 uncontested retention.

```
midpoint = (6 * 7) + (2 * 10) + (1 * 1) + 5 = 42 + 20 + 1 + 5 = 68 min
conservative = 68 * 0.5 = 34 min
range shown: "35-70 minutes"
```

### Simplified Model (if item types aren't distinguished)

If we don't want to classify items:

```
estimated_manual_minutes = (num_items * base_minutes_per_item) + overhead

where:
  base_minutes_per_item = 5   (blended average across types)
  overhead = 5                 (session startup)
```

For 9 items: `(9 * 5) + 5 = 50 minutes`, displayed as **"~30-50 minutes"**.

---

## 3. Implementation

```typescript
interface TimeEstimateParams {
  numCandidateRaces: number;
  numBallotMeasures: number;
  numUncontested: number;
}

interface TimeEstimateResult {
  lowMinutes: number;
  highMinutes: number;
  midpointMinutes: number;
  /** Pre-formatted string like "35-70 minutes" */
  displayRange: string;
}

const MINUTES_PER_CANDIDATE_RACE = 7;
const MINUTES_PER_BALLOT_MEASURE = 10;
const MINUTES_PER_UNCONTESTED = 1;
const SESSION_OVERHEAD = 5;
const CONSERVATIVE_MULTIPLIER = 0.5;

export function estimateManualResearchTime(
  params: TimeEstimateParams
): TimeEstimateResult {
  const midpoint =
    params.numCandidateRaces * MINUTES_PER_CANDIDATE_RACE +
    params.numBallotMeasures * MINUTES_PER_BALLOT_MEASURE +
    params.numUncontested * MINUTES_PER_UNCONTESTED +
    SESSION_OVERHEAD;

  const low = Math.round(midpoint * CONSERVATIVE_MULTIPLIER / 5) * 5; // round to nearest 5
  const high = Math.round(midpoint / 5) * 5;

  return {
    lowMinutes: low,
    highMinutes: high,
    midpointMinutes: Math.round(midpoint),
    displayRange: `${low}\u2013${high} minutes`,
  };
}

// Simplified version if item types aren't available
export function estimateManualResearchTimeSimple(
  numItems: number
): TimeEstimateResult {
  const midpoint = numItems * 5 + SESSION_OVERHEAD;
  const low = Math.round(midpoint * CONSERVATIVE_MULTIPLIER / 5) * 5;
  const high = Math.round(midpoint / 5) * 5;

  return {
    lowMinutes: low,
    highMinutes: high,
    midpointMinutes: Math.round(midpoint),
    displayRange: `${low}\u2013${high} minutes`,
  };
}
```

---

## 4. User-Facing Copy (Draft Options)

### Option A: Concise with source nod

> **You prepped your ballot in {X} minutes.**
> Independent research on {N} ballot items typically takes {range} — based on average reading times for voter guides, candidate profiles, and ballot measure arguments.

### Option B: Transparent about the estimate

> **You prepped {N} items in {X} minutes.**
> We estimate comparable research would take about {range}. This assumes reading a voter guide entry and one additional source per item, at typical adult reading speeds. [How we calculated this]

*(The bracketed link opens a brief methodology tooltip or modal.)*

### Option C: Friendliest / least technical

> **{X} minutes well spent.**
> Researching {N} ballot items on your own — reading voter guides, comparing candidates, deciphering ballot measures — would likely take {range}. You saved roughly {Y_low}-{Y_high} minutes.

### Tooltip / "How we calculated this" expandable text

> We estimated manual research time using published data on adult reading speeds (~220 words per minute for civic content) and typical voter guide lengths (~600 words per candidate, ~1,500 words per ballot measure). We assumed a voter would consult 2 sources per item and included time for searching and navigating between sources. We show a conservative range to avoid overstating time savings. Sources: Brysbaert (2019), Ballotpedia ballot measure data (2024), California Elections Code.

---

## 5. Honesty Notes

**Where the evidence is strong:**
- Reading speed data (large meta-analysis, 18,573 participants)
- Content length data (statutory limits, Ballotpedia corpus)
- In-booth voting time (11,990 voters measured)

**Where the evidence is weak:**
- **No large-scale study** has measured end-to-end "time spent researching a ballot at home." Our estimate is constructed, not observed.
- **Number of sources consulted** is assumed (2 per item). One experimental study suggests many voters barely engage at all — meaning our "comparable research" scenario describes a *conscientious* voter, not the average one.
- **Ballot composition varies enormously** by jurisdiction. Our per-item breakdowns (candidate vs. measure vs. uncontested) help, but the base times are estimates.

**Design principle:** Frame the estimate as "what thorough research *would* take" rather than "what you *would have* done." This is more honest — many voters skip most items — and positions the tool as enabling thoroughness, not just speed.
