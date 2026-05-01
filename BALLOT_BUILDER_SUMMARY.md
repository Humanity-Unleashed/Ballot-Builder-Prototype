# Ballot Builder — Project Summary

## What it is

Ballot Builder is a nonpartisan voter-preparation tool that matches individual voters with candidates and ballot measures based on their actual policy preferences — not party labels, celebrity endorsements, or pundit opinion.

A user takes a short values assessment, the system scores every candidate on their ballot against the same framework using public evidence (voting records, interest-group scorecards, stated positions), and then returns a personalized ballot with match percentages and the reasoning behind every recommendation.

The product is currently a working prototype targeting the 2026 election cycle in Michigan, North Carolina, Georgia, and Texas, with Michigan as the launch state.

---

## The problem it solves

Most voters arrive at the polls under-informed about down-ballot races. Existing solutions force them to choose between:

- **Party-line voting** — fast but ignores individual candidate records.
- **Endorsement lists** — outsources judgment to organizations whose values may not match the voter's.
- **Long-form research** — high-quality but takes hours per election and most people won't do it.

Ballot Builder collapses hours of research into a 5-minute assessment while preserving voter autonomy. The voter still picks their votes — the tool just surfaces relevant evidence.

---

## Who it's for

- **Primary**: Engaged but time-poor voters who want their vote to reflect their values, especially for down-ballot races where they have low information.
- **Secondary**: First-time voters and recently-moved voters who don't yet have local political context.
- **Tertiary**: Civic organizations, libraries, and nonpartisan voter-education groups looking for a tool to recommend.

---

## Core features

### 1. Civic Blueprint Assessment
A 5-minute adaptive quiz covering 17 policy topics across 5 domains: Economy (safety net, public investment, school choice, tax structure), Healthcare (coverage model, cost control, public health), Housing (zoning & supply, affordability tools, transit priority), Justice (policing accountability, sentencing goals, firearms, reproductive rights), and Climate (ambition level, energy portfolio, permitting speed). Users pick from concrete policy positions (not vague labels) and rate how much each topic matters to them.

**Outcome:** A personal "Blueprint" — a values profile that can be reused across every election the user participates in.

### 2. Personalized Ballot Match
For every contest on the user's ballot, the system shows match percentages with each candidate, plus a YES/NO recommendation for each measure with plain-language reasoning.

**Outcome:** The voter walks into the polling place with a defensible, personalized ballot they can adjust on the spot.

### 3. Evidence-Backed Scoring
Every candidate score links back to its sources — voting records, interest-group ratings (LCV, NRA, Chamber of Commerce, AFL-CIO, etc.), campaign statements. Confidence levels (High/Medium/Low) are shown per topic. Missing evidence stays missing — no fabricated scores.

**Outcome:** Trust through transparency. Voters can audit any recommendation and decide whether they accept the reasoning.

### 4. Real-Time Adjustment
Users can revisit and update their Blueprint at any time — even while reviewing their ballot — and watch recommendations recompute live.

**Outcome:** The tool teaches users about their own preferences by showing how shifts in one issue area change the slate.

### 5. AI Chat ("Ask AI")
A conversational layer where users can ask follow-up questions about any candidate or measure. The chat already knows the user's Blueprint, so it doesn't re-ask positions and gives context-aware answers.

**Outcome:** Lower-friction exploration for users who want to dig deeper without reading dense voter guides.

### 6. Demographic Personalization (opt-in)
If a user shares demographic info (renter/owner, income bracket, age, veteran status, etc.), the system shows "How this could affect you" callouts on relevant measures.

**Outcome:** Concrete impact framing that makes abstract policy feel personal.

### 7. Election Logistics
The product also surfaces the practical layer: registration deadlines, polling places, absentee ballot rules, and ID requirements — pulled from official state APIs.

**Outcome:** One-stop election prep, not just a recommendation engine.

### 8. Voting Squad
Users can form a small group with friends or family — a "Voting Squad" — that holds each other accountable through Election Day. Squad members can see binary status signals (whether each person has registered, completed their ballot prep, and voted) but **never** see anyone's assessment answers, values, or actual votes. Invites are shared via a link that drops new members into a tailored onboarding flow.

**Outcome:** Turns ballot prep from a solo chore into a social commitment. Drives turnout through peer accountability — known to be more effective than reminder apps or institutional nudges — while preserving the privacy that makes the rest of the product trustworthy. Also doubles as the product's primary growth loop: every prepared voter becomes an inviter.

---

## What makes the approach distinctive

- **Same framework on both sides.** Users and candidates are scored on identical 17-axis policy dimensions, so matching is a transparent geometric comparison, not editorial judgment.
- **Evidence floors.** The system refuses to score what it can't substantiate. A blank score is more honest than a guessed one.
- **Voting record beats campaign rhetoric.** When a candidate's votes contradict their statements, the record wins and the discrepancy is flagged.
- **Privacy by default.** Assessment answers stay on-device unless the user opts to save them. No tracking of political positions.
- **Nonpartisan by construction.** Scoring uses interest groups from across the spectrum, and party affiliation is never an input to the match.

---

## Expected outcomes

### For voters
- A complete, personalized ballot in 5 minutes vs. hours of research.
- Higher confidence and lower regret in down-ballot races.
- A reusable values profile that compounds in value across multiple elections.

### For civic engagement
- Increased turnout in down-ballot races where voters typically skip due to low information.
- Peer-driven turnout lift through Voting Squads — addressing the social-pressure gap that institutional GOTV efforts can't fill.
- Reduced reliance on party-line defaults and one-issue endorsements.
- A counter-narrative to the framing that politics is purely tribal — by showing voters that real policy preferences cut across party lines.

### For the trust ecosystem
- A transparent, auditable alternative to "trust me" voter guides.
- A model for evidence-backed civic tooling that other organizations could adopt or partner with.

---

## Current status

- Working prototype with full assessment flow, candidate scoring pipeline, ballot view, and AI chat.
- Production launch targeted for Michigan in the 2026 cycle.
- Expansion roadmap covers North Carolina, Georgia, and Texas.
- Architecture supports scaling beyond the four launch states once the candidate-research pipeline is industrialized.

---

## One-line positioning

> "A 5-minute assessment that turns your values into a complete, personalized ballot — with the evidence behind every recommendation, so you decide whether to trust it."
