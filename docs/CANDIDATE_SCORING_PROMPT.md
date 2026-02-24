# Candidate & Measure Scoring Research Prompt

> **How to use:** Copy this entire document into a Claude conversation. Then provide a real candidate's name, office, and any source material (campaign website URL, Ballotpedia page, endorsement list, voting record, etc.). The model will score them against the Ballot Builder framework.

---

## Your Task

You are a nonpartisan political analyst scoring real candidates and ballot measures for the **Ballot Builder** app. This app helps voters see how candidates and measures align with their personal values — it does NOT endorse or recommend any party or ideology.

Your job is to:
1. Research the candidate/measure using the sources provided (and web search if available)
2. Score them on the **15 Civic Axes** (0-10 scale)
3. Score them on the **10 Schwartz Values** (-1 to 1 scale)
4. Provide evidence citations for each score
5. Output structured data that can be dropped directly into the app

**Critical principles:**
- Be nonpartisan. Score based on stated positions and record, not party label.
- When evidence is ambiguous or missing for an axis, say so — don't guess.
- Distinguish between what a candidate has *done* (votes, record) vs. what they *say* (campaign promises).
- Assign a confidence level (low/medium/high) for each axis score based on how much evidence exists.

---

## The 15 Civic Axes Scoring Rubric

Each axis is a spectrum from **Pole A (score 0)** to **Pole B (score 10)**. A score of 5 means balanced/centrist on that axis.

### Domain 1: Economic Opportunity & Taxes

**Axis: `econ_safetynet` — Government Support Programs**
- **0 (Pole A): Broader safety net** — Supports robust benefits with fewer conditions; prioritizes reducing hardship
- **10 (Pole B): Conditional/limited safety net** — Prefers targeted aid, stricter eligibility, limiting dependency/cost
- *Evidence to look for:* Positions on welfare, SNAP, unemployment benefits, work requirements, Medicaid eligibility

**Axis: `econ_investment` — Taxes & Public Spending**
- **0 (Pole A): More public investment** — Supports bonds/levies and expanded public services
- **10 (Pole B): Lower taxes/tighter budgets** — Skeptical of spending increases; prefers efficiency or private solutions
- *Evidence to look for:* Tax votes, budget proposals, infrastructure spending positions, bond support/opposition

**Axis: `econ_school_choice` — Public Schools vs School Choice**
- **0 (Pole A): Strengthen public schools** — Prioritizes funding and stability for neighborhood public schools
- **10 (Pole B): Expand school choice** — Prioritizes family choice and competitive pressure (vouchers, charters)
- *Evidence to look for:* Positions on vouchers, charter schools, public school funding, ESAs, teachers' unions

### Domain 2: Healthcare & Public Health

**Axis: `health_coverage_model` — Who Provides Health Insurance**
- **0 (Pole A): More government insurance** — Supports public option, expanded public programs
- **10 (Pole B): More private insurance** — Prefers private insurance with government as backstop
- *Evidence to look for:* Positions on Medicare for All, ACA, Medicaid expansion, public option, insurance mandates

**Axis: `health_cost_control` — Lowering Healthcare Costs**
- **0 (Pole A): Government price limits** — Supports price caps, negotiation authority
- **10 (Pole B): Market competition** — Prefers market discipline, shopping, incentives over price controls
- *Evidence to look for:* Drug price negotiation, hospital price transparency, PBM regulation, surprise billing

**Axis: `health_public_health` — Public Health & Drug Policy**
- **0 (Pole A): Prevention & treatment** — Supports proactive public health interventions, non-carceral drug responses
- **10 (Pole B): Personal choice & enforcement** — Prefers limited mandates, enforcement-based drug approaches
- *Evidence to look for:* Vaccine mandates, harm reduction, opioid policy, mental health funding, drug decriminalization

### Domain 3: Housing & Local Growth

**Axis: `housing_supply_zoning` — Building More Housing**
- **0 (Pole A): Build more / allow density** — Supports zoning reform and faster permitting
- **10 (Pole B): Preserve / limit growth** — Prioritizes neighborhood stability and local control
- *Evidence to look for:* Zoning reform votes, ADU support, density positions, NIMBY/YIMBY stances

**Axis: `housing_affordability_tools` — Making Housing Affordable**
- **0 (Pole A): Rent limits & public housing** — Supports rent stabilization, subsidies, public/nonprofit housing
- **10 (Pole B): Build more, fewer rules** — Prefers boosting supply and limiting rent controls
- *Evidence to look for:* Rent control positions, affordable housing mandates, housing bond votes, Section 8

**Axis: `housing_transport_priority` — Getting Around**
- **0 (Pole A): Transit, walking & biking** — Supports transit investment even at expense of road/parking
- **10 (Pole B): Cars & parking** — Prioritizes road capacity and parking availability
- *Evidence to look for:* Transit funding votes, bike lane positions, highway expansion, parking requirements

### Domain 4: Public Safety & Justice

**Axis: `justice_policing_accountability` — How Police Should Work**
- **0 (Pole A): More oversight & alternatives** — Supports civilian oversight and non-police responses
- **10 (Pole B): More police & enforcement** — Prioritizes proactive policing, staffing, discretion
- *Evidence to look for:* Police budget votes, oversight board positions, crisis response teams, qualified immunity

**Axis: `justice_sentencing_goals` — Prison vs. Rehabilitation**
- **0 (Pole A): Focus on rehabilitation** — Supports diversion, treatment, reentry investments
- **10 (Pole B): Focus on punishment** — Supports tougher sentencing, longer incarceration
- *Evidence to look for:* Sentencing reform votes, mandatory minimums, bail reform, prison alternatives

**Axis: `justice_firearms` — Gun Laws**
- **0 (Pole A): Stronger gun safety rules** — Supports training/permits, background checks, safe storage
- **10 (Pole B): Fewer restrictions** — Prioritizes broad access and minimal barriers
- *Evidence to look for:* Gun control votes, NRA/Brady ratings, concealed carry positions, assault weapons

### Domain 5: Climate, Energy & Environment

**Axis: `climate_ambition` — How Fast to Act on Climate**
- **0 (Pole A): Act fast on climate** — Accepts near-term costs for faster emissions cuts
- **10 (Pole B): Go slow, keep costs low** — Prioritizes energy cost, reliability, jobs; slower change
- *Evidence to look for:* Climate bill votes, net-zero targets, Paris Agreement, fossil fuel positions, LCV scores

**Axis: `climate_energy_portfolio` — Energy Sources**
- **0 (Pole A): Solar & wind first** — Prioritizes renewables and electrification; limits fossil expansion
- **10 (Pole B): Mix of all energy types** — Supports broader portfolio including nuclear and/or fossil fuels
- *Evidence to look for:* Renewable mandates, nuclear positions, fracking stance, EV mandates, oil/gas leasing

**Axis: `climate_permitting` — Building vs. Environmental Review**
- **0 (Pole A): Thorough review first** — Accepts slower projects to preserve environmental safeguards
- **10 (Pole B): Faster approvals** — Prioritizes speed and scale of building over procedural delay
- *Evidence to look for:* NEPA positions, permitting reform votes, environmental review streamlining

---

## The 10 Schwartz Values Scoring Rubric

Each value is scored from **-1** (candidate actively de-emphasizes/conflicts with this value) to **+1** (candidate strongly emphasizes/aligns with this value). 0 means neutral.

| Value ID | Display Name | What it means in a political context |
|----------|-------------|--------------------------------------|
| `universalism` | Fairness & Equality | Focus on equal rights, social justice, environmental protection for all |
| `benevolence` | Helping Others | Community care, social programs, helping families and neighbors |
| `tradition` | Tradition | Respect for customs, religious values, traditional institutions |
| `conformity` | Respect for Rules | Law and order, following established rules and norms |
| `security` | Safety & Stability | National security, public safety, economic stability, predictability |
| `power` | Influence & Leadership | Business success, economic power, strong executive authority |
| `achievement` | Personal Success | Meritocracy, personal responsibility, competitive excellence |
| `hedonism` | Enjoying Life | Personal freedom, quality of life, lifestyle autonomy |
| `stimulation` | New Experiences | Innovation, change, embracing new approaches and technology |
| `self_direction` | Independence | Individual choice, freedom from government control, autonomy |

---

## Output Format

For each candidate, provide this exact structure. **Only include axes where you found actual evidence.** Do not score axes where you have no information.

### Candidate Output

```
## [Candidate Name] — [Office] ([Party])

### Profile Summary
[1-2 sentence nonpartisan summary of their overall political profile]

### Key Positions
- [Position 1 — brief, factual]
- [Position 2]
- [Position 3]
- [Position 4]

### Civic Axis Scores

| Axis | Score (0-10) | Confidence | Evidence |
|------|-------------|------------|----------|
| econ_safetynet | X | low/med/high | [Specific evidence: vote, rating, statement, etc.] |
| econ_investment | X | low/med/high | [Evidence] |
| ... | ... | ... | ... |

### Schwartz Value Stances

| Value | Score (-1 to 1) | Reasoning |
|-------|----------------|-----------|
| universalism | X.X | [Brief reasoning] |
| benevolence | X.X | [Brief reasoning] |
| ... | ... | ... |

### Sources
1. [Source 1 with URL]
2. [Source 2 with URL]
3. ...
```

### Measure Output

For ballot measures, provide:

```
## [Measure Title]

### Description
[Official ballot language or summary]

### Yes Axis Effects
[How a YES vote maps to each relevant civic axis. Use -1 to 1 scale where:
- Negative = YES aligns with Pole A (low axis scores)
- Positive = YES aligns with Pole B (high axis scores)]

| Axis | Effect (-1 to 1) | Reasoning |
|------|-----------------|-----------|
| [relevant_axis] | X.X | [Why YES pushes toward this pole] |

### Yes Value Effects
[How a YES vote maps to Schwartz values]

| Value | Effect (-1 to 1) | Reasoning |
|-------|-----------------|-----------|
| [relevant_value] | X.X | [Why YES aligns with/against this value] |

### Context
- Supporters: [Real supporter organizations]
- Opponents: [Real opponent organizations]
- Outcomes YES: [What happens if it passes]
- Outcomes NO: [What happens if it fails]
```

---

## TypeScript Data Format (for direct import into the app)

Once you've completed the analysis above, also output the data in this TypeScript format so it can be dropped into `src/server/data/ballot/candidates.ts`:

```typescript
// For a candidate:
{
  id: 'lastname-lowercase',
  contestId: 'REPLACE_WITH_CONTEST_ID',
  name: { full: 'First Last', ballotDisplay: 'First Last' },
  party: 'Democratic' | 'Republican' | 'Independent' | 'Libertarian' | 'Green',
  incumbencyStatus: 'incumbent' | 'challenger',
  ballotOrder: 1,
  positions: [
    'Position statement 1',
    'Position statement 2',
    'Position statement 3',
    'Position statement 4',
  ],
  axisStances: {
    // Only include axes with evidence. 0 = poleA, 10 = poleB
    econ_safetynet: X,
    econ_investment: X,
    // ... etc
  },
  valueStances: {
    // -1 to 1 scale
    universalism: X.X,
    benevolence: X.X,
    // ... etc
  },
  profileSummary: 'One-line nonpartisan summary.',
}

// For a measure:
{
  id: 'measure-id',
  type: 'measure' as const,
  title: 'Official Measure Title',
  shortTitle: 'Short Name',
  description: 'Official ballot question text',
  vector: [0, 0, 0, 0, 0], // Legacy, set to zeros
  relevantAxes: ['axis_id_1', 'axis_id_2'],
  yesAxisEffects: {
    // -1 to 1: negative = YES aligns with poleA, positive = YES aligns with poleB
    axis_id_1: X.X,
    axis_id_2: X.X,
  },
  yesValueEffects: {
    // -1 to 1: positive = YES aligns with this value
    universalism: X.X,
    security: X.X,
  },
  outcomes: {
    yes: 'What happens if it passes.',
    no: 'What happens if it fails.',
  },
  explanation: 'Detailed nonpartisan explanation.',
  supporters: ['Organization 1', 'Organization 2'],
  opponents: ['Organization 3', 'Organization 4'],
}
```

---

## Example Scoring (for calibration)

Here's how a hypothetical moderate Democrat governor might score, so you can calibrate:

| Axis | Score | Rationale |
|------|-------|-----------|
| econ_safetynet | 3 | Supports Medicaid expansion but with work requirements — leans poleA but not fully |
| econ_investment | 3 | Proposed infrastructure bond, slight tax increase — moderate poleA |
| econ_school_choice | 4 | Supports public schools but open to charter expansion — slight poleA |
| health_coverage_model | 2 | Pushed for state public option — clear poleA |
| justice_firearms | 3 | Signed red flag law, supports background checks — moderate poleA |
| climate_ambition | 3 | Set 2040 net-zero target — ambitious but not most aggressive |

And a hypothetical moderate Republican senator:

| Axis | Score | Rationale |
|------|-------|-----------|
| econ_safetynet | 7 | Supports work requirements, block-granting — clear poleB |
| econ_investment | 7 | Voted against most spending bills — poleB but supported infrastructure |
| justice_firearms | 8 | A-rated by NRA, opposed assault weapons ban — strong poleB |
| climate_ambition | 6 | Acknowledges climate change but opposes mandates — moderate poleB |
| climate_energy_portfolio | 7 | Supports nuclear + natural gas, opposes fossil fuel bans — poleB |

---

## Now score this candidate/measure:

[PASTE CANDIDATE NAME, OFFICE, AND SOURCE MATERIAL HERE]
