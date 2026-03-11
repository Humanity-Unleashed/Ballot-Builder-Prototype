# Ballot Builder — Scoring Methodology

This is the canonical scoring reference for the scorer agent. Read this before scoring any candidate or ballot measure.

---

## The two frameworks

Every candidate and ballot measure is scored on two independent frameworks:

### 1. Civic Axes (0–10 scale)
Policy positions across 15 issue areas. **0 = Pole A (progressive/interventionist)**, **10 = Pole B (conservative/market-oriented)**. A score of 5 means genuinely moderate or the evidence is truly ambiguous — not that we don't have data (omit the axis if no data).

### 2. Schwartz Basic Human Values (–1 to +1 scale)
Psychological motivational orientations. **+1 = value is actively central to identity and actions**, **0 = neutral/absent**, **–1 = candidate actively works against this value**. See `SCHWARTZ_VALUES.md` for full definitions.

---

## Evidence hierarchy

Always prefer higher-tier evidence. When sources conflict, higher tier wins:

| Tier | Source type | Example |
|------|------------|---------|
| 1 (highest) | Voting record | GovTrack vote, state legislature record |
| 1 | Third-party scorecard | LCV score, NRA grade |
| 2 | Campaign website (issues page) | Stated platform commitments |
| 2 | Structured interview | Public radio Q&A, editorial board |
| 3 | News coverage | Reporter's paraphrase of position |
| 3 | Endorsements | Who has endorsed them |
| 4 (lowest) | Biographical background | Prior career, education |

### Conflict resolution
- Tier 1 beats Tier 2, always. A candidate who says "I support gun safety" but voted against every gun safety bill gets scored by their votes, not their words.
- More recent beats older (current cycle > previous cycle > prior terms).
- Primary source beats secondary (candidate's own words > reporter's summary).
- Multiple corroborating sources beat a single source.

---

## Confidence levels

**HIGH**: Two or more Tier 1 sources agree, or multiple Tier 1+2 sources consistently point the same direction.

**MEDIUM**: One Tier 1 source, or two consistent Tier 2 sources, or one very specific Tier 2 source (e.g., a named bill vote in an interview).

**LOW**: Single Tier 2/3 source, or inference from background/biography, or ambiguous/general statements only.

**Omit entirely**: No evidence at all, or evidence is so vague as to be meaningless.

---

## Axis scoring guide

For each axis, these are the anchoring descriptions. Scores between anchors are proportional.

### econ_safetynet
- **0 (Pole A)**: Expand all safety net programs; universal basic income; robust unemployment, housing assistance
- **5**: Maintain current programs; targeted reforms only
- **10 (Pole B)**: Reduce or eliminate most entitlement programs; block grants; work requirements; deficit reduction above social spending

### econ_investment
- **0**: Aggressive public investment: industrial policy, infrastructure, R&D, manufacturing subsidies, green new deal-style programs
- **5**: Moderate targeted investment with fiscal constraints
- **10**: Minimize government economic intervention; private sector leads; oppose most industrial policy

### econ_tax_structure
- **0**: Highly progressive tax structure; wealth taxes; higher corporate taxes; close loopholes
- **5**: Maintain current structure with modest reforms
- **10**: Flat tax; lower rates across all brackets; reduce corporate taxes; eliminate estate tax

### econ_school_choice
- **0**: Universal public school system; oppose vouchers; fully fund public schools
- **5**: Allow charter schools; limited voucher programs in specific contexts
- **10**: Universal school choice; vouchers for all; private school tax credits; defund public school monopoly

### health_coverage_model
- **0**: Medicare for All / single-payer; government as sole or primary insurer; eliminate private insurance role
- **3**: Public option; Medicare/Medicaid buy-in; strong government alternative alongside private
- **5**: ACA-style regulated private markets with subsidies; no new public option
- **8**: Repeal ACA; health savings accounts; high-deductible plans; minimize mandates
- **10**: Pure free market; no mandates; no public insurance programs; maximum individual choice

### health_cost_control
- **0**: Government sets prices; Medicare drug negotiation; hospital rate setting; no-surprise billing
- **5**: Transparency requirements; limited negotiation; market competition expected to drive costs
- **10**: No price controls; free market determines all healthcare costs; oppose drug price negotiation

### health_public_health
- **0**: Strong public health mandates; vaccine requirements; environmental health regulation; strong FDA/CDC
- **5**: Voluntary public health guidance; limited mandates; balance individual choice with collective safety
- **10**: Oppose vaccine mandates; minimal public health authority; individual liberty paramount; against health restrictions

### housing_supply_zoning
- **0**: Eliminate exclusionary zoning; mandate density; by-right approval; federal preemption of local zoning
- **5**: Incentivize density reform; optional upzoning; some local control preserved
- **10**: Protect single-family zoning; local control absolute; oppose state/federal zoning mandates

### housing_affordability_tools
- **0**: Large public housing investment; strong rent control; inclusionary zoning mandates; housing as right
- **5**: Targeted subsidies for low-income housing; limited rent stabilization; voluntary inclusion
- **10**: Market-only housing policy; oppose rent control; eliminate housing subsidies; let market clear

### housing_transport_priority
- **0**: Transit-first; active transport infrastructure; reduce car dependence; congestion pricing
- **5**: Balanced investment in roads and transit
- **10**: Highway and road investment priority; oppose transit mandates; car-centric transportation policy

### justice_policing_accountability
- **0**: Defund/abolish; civilian oversight with real power; end qualified immunity; major reforms
- **3**: Reform-focused; body cameras; demilitarize; data reporting; strong oversight
- **5**: Modest reforms while maintaining current structure; body cameras; training
- **7**: Support law enforcement; oppose major reforms; thin blue line; qualified immunity protection
- **10**: Maximum police authority; oppose all accountability measures; increase funding unconditionally

### justice_sentencing_goals
- **0**: Decarcerate; end mandatory minimums; restore voting rights; expungement; treatment over punishment
- **5**: Evidence-based reforms; reduce recidivism; some mandatory minimums; rehabilitation focus
- **10**: Long sentences; mandatory minimums; three-strikes; death penalty support; retribution focus

### justice_firearms
- **0**: Comprehensive gun regulation: universal background checks, assault weapons ban, magazine limits, red flag laws, licensing, insurance
- **3**: Significant regulation: universal background checks, red flag laws, some restrictions
- **5**: Enforce existing laws; some targeted reforms; oppose major new restrictions
- **8**: Oppose most new regulations; concealed carry expansion; oppose background check expansions
- **10**: Unrestricted 2nd Amendment; oppose all regulations; permitless carry; oppose red flag laws

### climate_ambition
- **0**: Emergency-level climate action; aggressive emissions targets; major economic transformation; end fossil fuels
- **3**: Strong climate policy; Paris Agreement+; significant clean energy investment; carbon pricing
- **5**: Moderate climate action; clean energy incentives; voluntary targets
- **8**: Skeptical of climate science or policy costs; fossil fuel expansion; oppose carbon taxes
- **10**: Climate change denial; maximum fossil fuel development; eliminate EPA climate authority

### climate_energy_portfolio
- **0**: Rapid transition: ban new fossil fuel development; 100% renewables mandate; no new gas plants
- **3**: Strong clean energy push; phase out coal; limit new gas; major renewables investment
- **5**: All-of-the-above energy; some clean energy investment; no fossil fuel phase-out
- **8**: Fossil fuel expansion; drill/mine more; oppose renewable mandates; export LNG
- **10**: Fossil fuel maximalism; eliminate clean energy subsidies; repeal renewable standards

### climate_permitting
- **0**: Environmental review strengthened; more community veto power; precautionary principle
- **5**: Balance environmental review with project timelines
- **10**: Dramatically cut permitting timelines; reduce environmental review; expedite fossil fuel AND clean energy projects

---

## Ballot measure scoring

For ballot measures, scores represent the effect of a **YES vote** on each axis.

- If YES moves policy toward more government intervention, progressive redistribution, or stronger regulation → score toward 0
- If YES moves policy toward less government, more market reliance, or reduced regulation → score toward 10
- If YES has no material effect on a given axis → omit that axis
- If YES is a process step (opens a process without committing to policy) → all axis scores near 0; value scores may still be meaningful

**Process measures** (like a Constitutional Convention): All axis scores ≈ 0 because the measure doesn't commit to any policy direction. The value scores are still informative — voting YES on a con-con expresses stimulation (openness to change), works against tradition and security.

---

## Special situations

### Candidate says one thing, voted another
Score the voting record. Note the discrepancy. Example note: "Stated in 2026 he won't change MI abortion amendment; congressional record shows 14 years of pro-life votes. Scored on record."

### Candidate evolved position
Score current position. Note the evolution. Example: "El-Sayed softened M4A language in early 2026 to allow union plan coexistence. Scored at 0 for stated M4A goal; evolution noted."

### First-time candidate, no record
Score only stated positions. Use LOW confidence for all. Omit axes with no stated position.

### Two candidates in same race with identical scores on some axes
That's fine. Don't manufacture differentiation. The differentiation will appear on other axes. The app can display both candidates' scores on the axes where they agree — that's informative too.

### Very close scores
If the evidence genuinely puts a candidate at, say, 4.5 on an axis, round to the nearest integer (4 or 5). The scale isn't meant to be precise to decimal places — it's ordinal positioning, not an exact measurement.
