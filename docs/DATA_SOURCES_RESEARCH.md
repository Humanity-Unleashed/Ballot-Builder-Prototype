# Ballot Builder: Real-World Data Sources Research

> **Purpose:** This document maps every category of data in the Ballot Builder prototype to potential real-world sources. Use it to evaluate which APIs, datasets, or manual processes are needed to replace the current static/mock data with live production data.

---

## Current State Summary

The prototype uses **100% static TypeScript data** for ballot content, candidates, measures, and candidate positions. The assessment frameworks (Civic Axes + Schwartz Values) are static by design and don't need replacement. External API clients for Google Civic, Ballotpedia, and FVAP have been built but are awaiting API keys.

---

## Data Category 1: Ballot Content (Candidates, Races, Measures)

### What exists now (static)
- **6 fake candidates** across 2 races (Mayor, City Council D5) — `src/server/data/ballot/candidates.ts`
- **2 contests** with jurisdiction, term info — `src/server/data/ballot/contests.ts`
- **6 ballot measures** (3 state propositions, 3 local measures) with yes/no outcomes, supporter/opponent lists — `src/server/data/ballot/measures.ts`
- **1 assembled ballot** for "Sample State, Fulton County" — `src/server/data/ballot/ballot.ts`
- Election date hardcoded to `2025-11-04`

### What's needed for production
- Real candidates running in real races for a given address/district
- Real ballot measures with official language, fiscal impact, supporter/opponent lists
- Correct jurisdictions (federal, state, county, city, school board, special district)
- Election date from official sources

### Already built (awaiting API keys)
- **Ballotpedia API client** (`src/server/services/externalApis.ts`): `getBallotByPoint(lat, lng, electionDate)` returns races + candidates + measures
- **Ballot transformer** (`src/server/services/ballotTransformer.ts`): Converts Ballotpedia responses to internal types
- **Live ballot service** (`src/server/services/liveBallotService.ts`): Full pipeline with caching (24h TTL for ballots, 30d for zipcode lookups)
- **API route** (`src/app/api/ballot/by-zipcode/route.ts`): Zipcode-based ballot lookup

### Potential real-world sources

| Source | What it provides | Auth | Cost | Coverage |
|--------|-----------------|------|------|----------|
| **Ballotpedia API** | Full ballot: races, candidates, measures, elections by geography | API key | Paid (per-state pricing) | All 50 states, local to federal |
| **Google Civic Information API** | Address → districts, polling places, elected officials, elections | API key | Free (25K requests/day) | National |
| **Civic Data API (Democracy Works / TurboVote)** | Election info, polling places, ballot data | Partnership | Varies | National |
| **Open Elections / OpenElections.net** | Historical election results, candidate lists | None | Free | National (historical) |
| **Vote.org API** | Voter registration, ballot access tools | Partnership | Free for nonprofits | National |
| **State Secretary of State feeds** | Official candidate filings, certified ballot content | Varies by state | Free | Per-state |
| **BallotReady API** | Candidate info, endorsements, ballot measures | Partnership | Paid | National |

### Research questions
1. Ballotpedia pricing model — per-state vs. bundled? Volume discounts?
2. How far in advance does Ballotpedia populate candidate data before an election?
3. For local races (school board, water district), which API has the deepest coverage?
4. What's the fallback when an API doesn't cover a specific race?

---

## Data Category 2: Candidate Policy Positions (Axis Stances)

### What exists now (static)
- Each candidate has hardcoded `axisStances: Record<axisId, 0-10>` mapping their position on all 15 civic axes
- Each candidate has `valueStances: Record<valueId, -1 to 1>` mapping Schwartz value alignment
- These are entirely fabricated for the prototype

### What's needed for production
- Real policy positions for real candidates, scored on the 15 civic axes
- Confidence scores indicating data quality per axis per candidate
- Evidence/source attribution for each score
- This is the **core IP** — the recommendation engine depends entirely on this data

### The 15 civic axes to score candidates on

| Domain | Axis ID | Pole A (score 0) | Pole B (score 10) |
|--------|---------|-------------------|---------------------|
| Economic | econ_safetynet | Broader safety net | Conditional safety net |
| Economic | econ_investment | More public investment | Less public investment |
| Economic | econ_school_choice | Traditional public schools | More school choice |
| Healthcare | health_coverage_model | Universal/single-payer | Market-based coverage |
| Healthcare | health_cost_control | Government price controls | Market competition |
| Healthcare | health_public_health | Collective mandates | Individual choice |
| Housing | housing_supply_zoning | Loosen zoning / more supply | Preserve local zoning |
| Housing | housing_affordability_tools | Government subsidies | Market solutions |
| Housing | housing_transport_priority | Public transit investment | Car-centric infrastructure |
| Justice | justice_policing_accountability | More oversight / reform | Back the blue / status quo |
| Justice | justice_sentencing_goals | Rehabilitation focus | Punishment / deterrence |
| Justice | justice_firearms | More gun regulations | Protect gun rights |
| Climate | climate_ambition | Aggressive climate action | Gradual / no climate policy |
| Climate | climate_energy_portfolio | Renewables priority | All-of-the-above / fossil |
| Climate | climate_permitting | Faster green permitting | Standard review process |

### Potential real-world sources

#### Tier 1: Interest Group Ratings (highest signal, most scalable)
| Source | What it provides | Coverage | Relevant Axes |
|--------|-----------------|----------|---------------|
| **Vote Smart / Justipedia** | Aggregated interest group ratings (0-100%) for legislators | Federal + state legislators | All axes via group mapping |
| **League of Conservation Voters (LCV)** | Environmental scorecard | Federal + some state | climate_ambition, climate_energy_portfolio |
| **Sierra Club** | Environmental endorsements + ratings | Federal + state | climate_ambition, climate_energy_portfolio |
| **NRA / Gun Owners of America** | Firearms policy grades (A-F) | Federal + state | justice_firearms |
| **Brady Campaign** | Gun safety ratings | Federal + state | justice_firearms |
| **ACLU** | Civil liberties scorecard | Federal | justice_policing_accountability, health_public_health |
| **Chamber of Commerce** | Business climate ratings | Federal + state | econ_investment, econ_safetynet |
| **AFL-CIO / SEIU** | Labor ratings | Federal + state | econ_investment, econ_safetynet |
| **National Education Association (NEA)** | Education policy ratings | Federal + state | econ_school_choice |
| **American Federation for Children** | School choice scorecard | Federal + state | econ_school_choice |
| **Physicians for a National Health Program** | Healthcare policy positions | Federal | health_coverage_model |
| **Heritage Action / Club for Growth** | Conservative fiscal scores | Federal | econ_investment, econ_safetynet |
| **FOP (Fraternal Order of Police)** | Law enforcement endorsements | Federal + state + local | justice_policing_accountability |

**Approach:** Map ~30-50 interest groups to axes. For each candidate, fetch all available ratings, convert to 0-10 axis scale, weighted average per axis. Confidence = coverage ratio.

#### Tier 2: Voting Records (reliable for incumbents)
| Source | What it provides | Coverage | Notes |
|--------|-----------------|----------|-------|
| **ProPublica Congress API** | Federal bill votes, sponsorships, committee memberships | US Congress | Free, API key required |
| **Open States API (v3)** | State legislature votes, bills, sponsors | All 50 state legislatures | Free, API key required |
| **GovTrack.us** | Federal bill tracking, vote records, ideology scores | US Congress | Free API + bulk data |
| **LegiScan API** | State + federal bill tracking and votes | All 50 states + federal | Free tier available |
| **Congress.gov API** | Official federal legislative data | US Congress | Free |

**Approach:** Maintain a curated list of "key bills" classified by civic axis. For each candidate with a legislative record, check votes on classified bills. Each YES/NO becomes a binary signal. Requires manual bill classification effort (~50-100 key bills for MI to start).

#### Tier 3: Campaign Positions (broadest coverage, lowest reliability)
| Source | What it provides | Coverage | Notes |
|--------|-----------------|----------|-------|
| **Ballotpedia candidate pages** | Platform summaries, endorsements, biographical info | Very broad | Web scraping or API |
| **VoteSmart / Justipedia Political Courage Test** | Candidate self-reported positions on issues | Varies (many don't respond) | Structured data when available |
| **OnTheIssues.org** | Candidate position summaries from public statements | Federal + governors | Web scraping |
| **Campaign websites** | Official platform pages | All candidates with websites | Requires NLP/LLM analysis |
| **News articles / interviews** | Reported positions and quotes | Varies | Requires NLP/LLM analysis |

**Approach:** For candidates without ratings or voting records (challengers, local races), use LLM analysis of campaign materials. Flag as lower confidence.

### Research questions
1. Vote Smart / Justipedia API access — is the ratings data available via API or only web?
2. How many Michigan state legislators have interest group ratings available?
3. For local candidates (city council, school board) — what data exists at all?
4. What's the legal/ethical framework for using LLM analysis of campaign websites to generate scores?
5. How to handle candidates who have no public record (first-time local candidates)?

---

## Data Category 3: Candidate Evidence & Context

### What exists now (static)
- `candidateContext.ts`: Mock quotes, speeches, interviews per candidate per topic
- Each entry has: content, type (speech/interview/platform/voting_record), date, sourceUrl
- Used to show "why this match?" evidence in the UI

### What's needed for production
- Real quotes, votes, and positions with verifiable sources
- Linked to specific civic axes for per-axis evidence display
- Tiered confidence display (voting record > interest group rating > campaign statement)

### Potential real-world sources
| Source | Data Type | Notes |
|--------|-----------|-------|
| **ProPublica Congress API** | Specific bill votes with bill text | Can link vote to axis |
| **Open States API** | State bill votes with bill text | Same approach for state races |
| **Ballotpedia** | Candidate biography, endorsements, campaign finance | Context for profiles |
| **Vote Smart / Justipedia** | Interest group ratings with group descriptions | "Rated 92% by LCV" |
| **FEC / OpenSecrets** | Campaign finance, donor data | Donor patterns indicate priorities |
| **News APIs (NewsAPI, GDELT)** | Recent articles mentioning candidates | Supplementary context |

---

## Data Category 4: Voter Registration & Election Rules

### What exists now
- **Michigan-only curated data** in `stateVotingRules.ts` (real deadlines, real URLs from MVIC)
- **State constants** for all 50 states (code ↔ name mapping)
- **3-tier fallback system**: Curated → FVAP API → Generic vote.gov URLs

### What's already built
- **FVAP XML client** (`src/server/services/fvapClient.ts`): Parses registration deadlines from `fvap.gov/xml-api/{State}/deadline-dates.xml`
- **VoterInfoCache** in database with 7-day TTL
- Fallback to curated MI data or generic state URLs

### Potential sources for expanding beyond Michigan
| Source | What it provides | Coverage | Notes |
|--------|-----------------|----------|-------|
| **FVAP eVAG XML API** | Registration deadlines (mail, online, in-person) | All 50 states | Already integrated |
| **Vote.org** | Registration tools, state-specific rules | National | Partnership needed for API |
| **VoteAmerica Civic Data API** | Registration rules, deadlines, ID requirements | National | Free, nonprofit |
| **State Secretary of State websites** | Official rules, dates, polling places | Per-state | Manual curation or scraping |
| **Google Civic API** | Polling places, election info by address | National | Already integrated |
| **US Vote Foundation** | State voting guides, absentee info | National | Web resource |

### Research questions
1. VoteAmerica API — is it still active and maintained? What's the data freshness?
2. FVAP data reliability — how often is it updated relative to actual state deadlines?
3. For ID requirements and absentee rules (not just deadlines), which source is most comprehensive?

---

## Data Category 5: District/Geography Resolution

### What exists now
- Zipcode-based lookup via Google Civic API (already built)
- `ZipcodeLookup` cache in database (30-day TTL)
- Returns: state, county, city, OCD division IDs, lat/lng

### What's already built
- **Google Civic client**: `getDivisionsByAddress(address)` and `geocodeAddress(address)`
- **5 Calls API client**: `getRepresentativesByZipcode(zipcode)` for current representatives
- **District hash computation** for cache keying

### Potential enhancements
| Source | What it provides | Notes |
|--------|-----------------|-------|
| **Google Civic API** | Address → all political districts | Already integrated |
| **Census Geocoder API** | Address → census tracts, blocks, counties | Free, high precision |
| **Cicero API (Azavea)** | Address → legislative districts at all levels | Paid, very precise |
| **Open States / People API** | District → current representatives | Free |
| **Representable.org** | Community-defined districts | Supplementary |

---

## Data Category 6: Assessment Content (Civic Axes + Schwartz Values)

### What exists now
- **144 civic axis assessment items** across 15 axes — `civicAxes/spec.ts`
- **10 Schwartz vignettes** (pick-one format) — `schwartzValues/spec.ts`
- **1 booster set** (AI & Technology Regulation) — `schwartzValues/boosters.ts`

### Status: Static by design
These are **research-backed assessment instruments**, not data that needs API replacement. The civic axes spec and Schwartz vignettes were designed for this application.

### Potential enhancements (not replacements)
- **More booster sets** for emerging topics (immigration, AI policy, housing crisis, etc.)
- **Item bank expansion** — more assessment items per axis for better precision
- **Psychometric validation** — statistical analysis of item performance after collecting user data
- **A/B testing** of item wording for clarity

---

## Data Category 7: Measure Analysis (Proposition Scoring)

### What exists now (static)
- Each measure has `yesAxisEffects: Record<axisId, -1 to 1>` — how a YES vote maps to each civic axis
- Each measure has `yesValueEffects: Record<valueId, -1 to 1>` — Schwartz value alignment
- Also has supporters/opponents lists, outcomes (what yes/no means), explanations

### What's needed for production
- Real ballot measure text from Ballotpedia
- Axis effect scoring for real measures
- Supporter/opponent lists from real endorsement data

### Potential approaches
| Approach | Description | Effort | Reliability |
|----------|------------|--------|-------------|
| **Manual expert classification** | Policy analysts score each measure on 15 axes | High per-measure | Highest |
| **LLM analysis of measure text** | Feed official ballot language to LLM, ask for axis alignment | Low | Medium (needs validation) |
| **Endorsement-based inference** | If LCV endorses YES, infer alignment on climate axes | Medium | Medium-High |
| **Hybrid** | LLM generates initial scores, human reviews/adjusts | Medium | High |

### Research questions
1. How many measures typically appear on a Michigan ballot?
2. What's the timeline between measures being certified and election day?
3. Can Ballotpedia's measure data include fiscal impact analysis?

---

## Priority Ranking for Michigan Launch

| Priority | Data Category | Effort | Impact | Recommended Source |
|----------|--------------|--------|--------|-------------------|
| **P0** | Ballot content (races, candidates, measures) | Low (already built) | Critical | Ballotpedia API |
| **P0** | District resolution (address → ballot) | Low (already built) | Critical | Google Civic API |
| **P1** | Candidate axis scoring (interest groups) | Medium | Critical | Vote Smart + interest group mapping |
| **P1** | Voter registration rules (beyond MI) | Low (FVAP built) | High | FVAP + VoteAmerica |
| **P2** | Voting record analysis | High (bill classification) | High | ProPublica + Open States |
| **P2** | Candidate evidence/context | Medium | High | ProPublica + Ballotpedia |
| **P2** | Measure axis scoring | Medium | High | LLM + expert review hybrid |
| **P3** | Campaign position analysis | High (NLP pipeline) | Medium | LLM analysis of websites |
| **P3** | More booster sets | Low | Low | Internal content creation |

---

## API Keys Needed

| API | Key Type | Status | Where to Get |
|-----|----------|--------|--------------|
| Google Civic Information API | API key (free) | Env var defined, no key yet | console.cloud.google.com |
| Ballotpedia API | API key (paid) | Env var defined, no key yet | Contact Ballotpedia sales |
| Vote Smart / Justipedia | API key | Not yet integrated | votesmart.org / justipedia.com |
| ProPublica Congress API | API key (free) | Not yet integrated | propublica.org/datastore/api |
| Open States API | API key (free) | Not yet integrated | openstates.org/accounts/signup |
| FVAP XML API | None needed | Already integrated | N/A |
| 5 Calls API | None needed | Already integrated | N/A |
