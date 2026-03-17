# IRT Item Calibration Strategy for Ballot Builder

**Document version:** 2.0
**Date:** 2026-03-09
**Scope:** 16 civic policy axes, 144 assessment items (6 per axis currently deployed in spec v1.0.0)
**Scoring model in production:** Shrinkage-regularized normalized sum; `shrunk = normalized * (n_answered / (n_answered + 6))`

---

## 1. Psychometric Framework

### 1.1 Why IRT for a Voting Advice Application (VAA)

The current scoring model treats all items equally and uses a simple shrinkage estimator. This works well at launch but has three limitations that IRT calibration addresses:

1. **Item efficiency.** Not all items contribute equally to measurement precision. Some items are answered similarly by nearly everyone (low discrimination); others sharply separate voters (high discrimination). IRT item parameters let us select the highest-information items first in an adaptive or prioritized presentation, reducing respondent fatigue while maintaining measurement accuracy.

2. **Difficulty coverage.** The current item pool may cluster at one region of the latent trait continuum. If most items are "easy agrees" for progressive respondents, we lose measurement precision for centrists or for distinguishing among strong conservatives. IRT difficulty parameters reveal gaps in trait coverage.

3. **Cross-axis adaptive routing.** With calibrated parameters, we can implement computerized adaptive testing (CAT) across the 16 axes simultaneously. After a respondent answers 2-3 anchor items, the system can route to the domain with the highest remaining posterior entropy, dramatically reducing total items needed for adequate classification.

### 1.2 Recommended IRT Model

**Graded Response Model (GRM; Samejima, 1969)**

The GRM is the natural choice because:
- Response categories are ordered (strong_disagree through strong_agree on 5 points).
- It estimates both discrimination (a) and threshold (b) parameters per item.
- It is the standard model for political attitude measurement (used in ANES IRT studies since 2012).

Each item i has:
- **a_i**: discrimination parameter (slope; higher = more informative)
- **b_i1, b_i2, b_i3, b_i4**: four threshold parameters (category boundaries on the latent trait continuum)

The current 5-point scale maps as:
| Response | Score value | GRM category |
|----------|------------|-------------|
| strong_disagree | -0.85 | 1 |
| disagree | -0.45 | 2 |
| unsure | 0.0 | 3 |
| agree | +0.45 | 4 |
| strong_agree | +0.85 | 5 |

Note: For items keyed -1 (poleB), responses are reverse-coded before GRM fitting so that higher latent trait always corresponds to poleA.

### 1.3 Relationship to Current Scoring

After calibration, we can either:
- **Option A (recommended for MVP):** Keep the current shrinkage scoring but use IRT parameters to rank-order items for adaptive presentation and flag low-discrimination items for revision.
- **Option B (full IRT scoring):** Replace shrinkage scoring with Expected A Posteriori (EAP) estimation under the fitted GRM. This gives proper standard errors and enables true CAT. More complex but substantially more efficient.

The calibration study described here supports both options.

---

## 2. Per-Axis Instrument Mapping and Calibration Parameters

### Legend

- **a (discrimination):** 1 = low (most voters similar), 2 = moderate (reasonable spread), 3 = high (strongly separates voters)
- **Validated instruments:** Existing survey programs with items mapping to the axis
- **Gap items:** Proposed only where validated instrument overlap is weak (fewer than 3 directly mapping validated items)

---

### ECONOMIC DOMAIN

#### 2.1 econ_safetynet — Broader safety net vs. Conditional/limited safety net

| Property | Value |
|----------|-------|
| **Axis ID** | `econ_safetynet` |
| **Current items** | 6 (econ_safetynet_01 through _06) |
| **Discrimination estimate (a)** | **2** (moderate) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201246 ("Government should provide more/fewer services"), V201304 ("Guaranteed jobs and income vs. let each person get ahead on own"), V201306x ("Government aid to Black people scale" — partial overlap on conditional vs. universal framing) | Strong — V201246 and V201304 are the canonical redistribution items in US political science |
| **GSS** | NATFARE ("Spending on welfare"), NATFAREY ("Spending on assistance to the poor" — wording experiment), HELPPOOR ("Should government improve standard of living") | Strong — the NATFARE/NATFAREY pair is one of the most studied framing effects in survey research |
| **Pew Political Typology** | "Government should do more to help needy Americans even if it means going deeper into debt" vs. "Government today can't afford to do much more to help the needy" (Typology battery, used since 2014) | Strong |
| **World Values Survey** | V98 ("People should take more responsibility to provide for themselves vs. government should take more responsibility to ensure that everyone is provided for") | Moderate — broader than US context |
| **Schwartz PVQ** | Benevolence items (caring for in-group welfare) have weak indirect mapping; not a policy instrument | Weak |

**Gap items:** Not needed. Instrument coverage is excellent. The ANES V201246/V201304 pair and GSS HELPPOOR are well-calibrated reference items. Use these as external anchors.

**Discrimination justification:** a=2. The safety net dimension is a core left-right differentiator in US politics but is not as sharply bimodal as firearms or climate. Pew (2022) finds that approximately 59% of Americans support "more government services" while 39% prefer "fewer services" — there is genuine spread but not extreme polarization. The GSS NATFARE/NATFAREY framing experiment shows that wording shifts opinion by ~20 points, indicating that response patterns are real but sensitive to item phrasing.

---

#### 2.2 econ_investment — More public investment vs. Lower taxes/tighter budgets

| Property | Value |
|----------|-------|
| **Axis ID** | `econ_investment` |
| **Current items** | 6 (econ_investment_01 through _06) |
| **Discrimination estimate (a)** | **2** (moderate) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201246 ("Government services vs. spending/taxes" 7-point scale), V201309 ("Federal spending on public schools"), V201312 ("Federal spending on highways and bridges") | Strong — V201246 is the single most-used item for this dimension |
| **GSS** | NATSPAC, NATENVIR, NATEDUC, NATROAD, NATSCI (spending priority battery) | Strong — the "are we spending too much, too little, or about right" battery directly measures investment appetite |
| **Pew Political Typology** | "Government regulation of business does more harm than good" (partial), tax/spending items in typology battery | Moderate |
| **Wahl-O-Mat** (Germany) | "Der Staat soll mehr in Bildung und Infrastruktur investieren" — direct analogue in German VAA context | Moderate (cross-national) |
| **Smartvote** (Switzerland) | "Der Staat soll die Steuern senken, auch wenn das zu Einsparungen bei öffentlichen Leistungen führt" | Moderate (cross-national) |

**Gap items:** Not needed.

**Discrimination justification:** a=2. Similar to safety net — this is a core economic left-right axis. Gallup (2024) finds Americans split roughly 50-45 on whether government "does too much" vs. "should do more," with some respondents in the middle. The spread is real but the distribution is not bimodal; rather, it is roughly normal with a slight conservative lean, yielding moderate discrimination.

---

#### 2.3 econ_school_choice — Strengthen public schools vs. Expand school choice

| Property | Value |
|----------|-------|
| **Axis ID** | `econ_school_choice` |
| **Current items** | 6 (econ_school_choice_01 through _06) |
| **Discrimination estimate (a)** | **2** (moderate) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201309 ("Federal spending on public schools" — partial, investment side only), no direct voucher item in standard ANES battery | Weak-to-moderate |
| **GSS** | NATEDUC ("Spending on education") — measures investment appetite, not choice vs. public specifically | Weak |
| **Pew** | "Government should be more involved in education" items; specific school choice items appear in Pew education surveys (2017, 2021) but are not part of the standard typology battery | Moderate |
| **EdNext Poll** (Education Next/PEPG) | Annual survey includes validated items on vouchers, charters, teacher pay, and school choice — the gold standard for this specific domain. Items: "Do you support or oppose providing families with tax-funded scholarships or vouchers..." and "Do you support or oppose the formation of charter schools?" | Strong |

**Gap items:** The EdNext items are not part of the "big 5" survey programs listed in the task, so we should write calibration items that map to both the EdNext validated items and the current Ballot Builder items.

1. *"Parents should be able to use public funding to send their children to the school that best fits them, including religious schools."* (poleB; tests the religious-school extension of voucher support — defensible from both family-choice and separation-of-church-and-state perspectives)

2. *"When a public school is struggling, the priority should be fixing it rather than opening alternatives nearby."* (poleA; defensible because improvement-focused people and choice-focused people can both engage)

3. *"Competition between schools leads to better outcomes for students overall."* (poleB; a testable empirical belief where reasonable people disagree)

**Discrimination justification:** a=2. School choice does not fall neatly on the left-right spectrum. Some progressive urbanites support charters; some rural conservatives oppose vouchers that might defund their local school. The EdNext poll consistently finds bipartisan splits: roughly 45-55% support vouchers depending on wording and year. This cross-cutting pattern produces moderate discrimination — the item separates, but not as cleanly as pure left-right items.

---

#### 2.4 econ_tax_structure — Progressive taxation vs. Flat/consumption-based taxes

| Property | Value |
|----------|-------|
| **Axis ID** | `econ_tax_structure` |
| **Current items** | 6 (econ_tax_structure_01 through _06) |
| **Discrimination estimate (a)** | **2** (moderate) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201327 ("Federal income tax is too high / about right / too low"), V201329 ("Tax rate for millionaires"), V201246 (partial — the services-vs-taxes tradeoff indirectly touches tax structure) | Moderate — ANES asks about tax levels more than structure |
| **GSS** | TAX ("Federal income tax — too high, about right, too low"), TAXRICH, TAXMID, TAXPOOR (asked in some waves — separately asked whether taxes on the rich, middle, and poor are too high/low) | Strong — TAXRICH and TAXPOOR directly index progressivity preferences |
| **Pew** | "Upper-income people pay too little / fair share / too much in federal taxes" (standard battery item) | Moderate |
| **World Values Survey** | V99 ("Incomes should be made more equal" vs. "We need larger income differences as incentives") — related but not tax-specific | Weak |

**Gap items:** Coverage is adequate from ANES/GSS, but the flat-tax and consumption-tax pole is underrepresented in validated instruments (most surveys ask about progressivity, not about structural alternatives). One additional item:

1. *"A national sales tax that replaces the income tax would be simpler and fairer."* (poleB; defensible as a simplification argument; opponents can argue regressivity)

**Discrimination justification:** a=2. Tax structure preferences correlate with partisanship but show interesting heterogeneity. Pew (2023) finds 61% of Americans say the wealthy pay "too little" in taxes, but support for a flat tax polls at 30-40% depending on framing. The concept of consumption-based taxation is not well-understood by many respondents, which attenuates discrimination. Items about taxing the rich discriminate well (a~2.5); items about flat vs. progressive structure discriminate less well among people unfamiliar with the distinction.

---

### HEALTHCARE DOMAIN

#### 2.5 health_coverage_model — More government insurance vs. More private insurance

| Property | Value |
|----------|-------|
| **Axis ID** | `health_coverage_model` |
| **Current items** | 6 (health_coverage_model_01 through _06) |
| **Discrimination estimate (a)** | **3** (high) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201336 ("Government health insurance plan vs. private insurance plan" — 7-point scale; asked continuously since 1970) | Strong — this is one of the highest-discrimination items in the entire ANES battery |
| **GSS** | HELPSICK ("Should government help pay for medical care"), NATHEAL ("Spending on health") | Strong |
| **Pew Political Typology** | "It is the responsibility of the federal government to make sure all Americans have health care coverage" — core typology item | Strong |
| **KFF Health Tracking Poll** | Monthly tracking on public option, Medicare for All, ACA approval — extensive validated item bank | Strong |
| **World Values Survey** | V131 ("Government vs. individual responsibility for health care") | Moderate |

**Gap items:** Not needed. This is one of the best-validated axes in US political science.

**Discrimination justification:** a=3. Healthcare coverage preference is one of the most polarizing issues in US politics. The ANES V201336 item consistently shows a bimodal distribution with distinct peaks at positions 1 (government plan) and 7 (private insurance). KFF tracking (2024) finds 63% support for a public option but only 36% for single-payer, showing that the latent trait is highly spread. IRT analyses of the ANES consistently estimate discrimination parameters above 2.5 for healthcare items. This axis is an anchor-quality discriminator.

---

#### 2.6 health_cost_control — Government price limits vs. Market competition

| Property | Value |
|----------|-------|
| **Axis ID** | `health_cost_control` |
| **Current items** | 6 (health_cost_control_01 through _06) |
| **Discrimination estimate (a)** | **2** (moderate) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | No standard battery item specifically on price controls vs. market discipline in healthcare | Weak |
| **KFF Health Tracking Poll** | "Do you favor or oppose the federal government negotiating with drug companies to get lower prices on medications for people on Medicare?" (asked since 2019) | Strong for drug pricing; weaker for broader cost control |
| **GSS** | No direct item | None |
| **Pew** | "Government should do more to make health care affordable" — directional but does not distinguish mechanism (price controls vs. competition) | Weak |

**Gap items:** This axis has weak validated instrument overlap because most surveys ask whether costs are too high (near-universal agreement) rather than the mechanism for controlling them.

1. *"Health insurance companies should be free to offer plans with limited coverage if it keeps premiums low."* (poleB; tests the market-freedom dimension; poleA respondents worry about inadequate coverage, poleB respondents value consumer choice)

2. *"The government should set a maximum price for common prescription drugs."* (poleA; directly tests price-control acceptance; opponents can argue it reduces drug innovation)

3. *"Letting patients compare prices online and choose their own provider is a better way to reduce costs than government rules."* (poleB; tests market-transparency theory; opponents can argue information asymmetry makes this impractical)

**Discrimination justification:** a=2. While healthcare costs are universally concerning, the mechanism question (government regulation vs. market competition) produces real spread. KFF finds that drug price negotiation is supported by 80%+ of all voters (including 70% of Republicans), which means that specific item has low discrimination. But broader price-control items (hospital rate-setting, insurance premium caps) split more sharply. The moderate estimate reflects this mixture.

---

#### 2.7 health_public_health — Prevention & treatment vs. Personal choice & enforcement

| Property | Value |
|----------|-------|
| **Axis ID** | `health_public_health` |
| **Current items** | 6 (health_public_health_01 through _06) |
| **Discrimination estimate (a)** | **2** (moderate, post-COVID elevated) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V202160 ("Favor/oppose requiring face masks"), V202166 ("Government role in containing COVID") — pandemic-specific but calibrated for public health authority | Moderate (time-bound) |
| **GSS** | GRASS, MARHEAL (drug legalization items in some waves) — partial overlap on enforcement vs. treatment framing for drug policy | Weak-to-moderate |
| **Pew** | COVID public health battery (mask mandates, vaccine requirements); "Government has gone too far restricting people during COVID" | Moderate (time-bound) |
| **MFQ-2 (Moral Foundations)** | Liberty foundation ("Whether or not the government interfered with people's freedom to make their own choices") — captures the autonomy vs. collective-mandate dimension | Moderate — MFQ Liberty is the closest moral-foundations analogue |
| **World Values Survey** | V132 ("Drug use — personal choice or government restriction") — partial | Weak |

**Gap items:** The public-health-authority dimension became highly salient post-COVID but most validated items are pandemic-specific. Non-pandemic items are needed.

1. *"Local health departments should have the authority to require vaccinations for school-age children."* (poleA; tests non-COVID public health authority; opponents invoke parental choice, a politically defensible position)

2. *"Government should fund needle exchange programs and supervised consumption sites to reduce overdose deaths."* (poleA; tests harm-reduction acceptance; opponents can argue moral hazard, a defensible position)

3. *"Adults should be free to make their own health decisions without government pressure, even if those decisions affect public health."* (poleB; tests the autonomy claim broadly; proponents invoke liberty, opponents invoke externalities)

**Discrimination justification:** a=2. Pre-COVID, public health authority was a low-salience, low-discrimination issue (most people defaulted to "trust the experts"). Post-COVID, it became highly partisan. Pew (2022) found a 40-point partisan gap on whether government restrictions during COVID were appropriate. However, some of this polarization is COVID-specific and may attenuate. For a durable instrument, moderate discrimination is the safest calibration assumption, with the expectation that items referencing mandates will discriminate higher (a~2.5) and items about funding prevention programs will discriminate lower (a~1.5).

---

### HOUSING DOMAIN

#### 2.8 housing_supply_zoning — Build more / allow density vs. Preserve / limit growth

| Property | Value |
|----------|-------|
| **Axis ID** | `housing_supply_zoning` |
| **Current items** | 6 (housing_supply_zoning_01 through _06) |
| **Discrimination estimate (a)** | **1** (low-to-moderate) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | No standard battery item on zoning or housing supply | None |
| **GSS** | No standard battery item | None |
| **Pew** | "There is not enough affordable housing in my community" (2021) — measures perception, not policy preference | Weak |
| **Terner Center / UCLA Lewis Center housing surveys** | Multiple validated items on zoning, ADUs, density near transit — the best source for this axis but not part of the major national surveys | Strong (specialized) |
| **Smartvote (Switzerland)** | "Mehr Wohnraum durch verdichtetes Bauen schaffen" ("Create more housing through densification") | Strong (cross-national VAA) |
| **Wahl-O-Mat (Germany)** | Occasional housing supply items in state-level elections | Moderate (cross-national) |

**Gap items:** This axis is severely underrepresented in the major US survey programs. The Terner Center surveys are the best source but have limited IRT calibration data. Recommended gap items:

1. *"My city should allow duplexes and small apartment buildings in neighborhoods that are currently single-family only."* (poleA; tests the core YIMBY position; opponents can invoke neighborhood character, which is a widely held value)

2. *"It's reasonable for neighbors to have a say in whether a new apartment building gets built on their block."* (poleB; tests the local-control principle; proponents invoke democratic participation, opponents invoke NIMBYism)

3. *"States should be able to override local zoning rules to allow more housing near transit stops."* (poleA; tests state preemption of local zoning; opponents can invoke subsidiarity and local self-governance)

**Discrimination justification:** a=1. Zoning and housing supply are cross-cutting issues that do not sort neatly along partisan lines. The "YIMBY vs. NIMBY" cleavage exists within both parties. Progressive YIMBYs and free-market conservatives both support building more; progressive NIMBYs (environmental/neighborhood preservationists) and conservative NIMBYs (property-value protectors) both oppose. UCLA Lewis Center polling (2023) found that support for building more housing near transit was 55% among Democrats and 45% among Republicans — far less polarized than most policy axes. This cross-cutting pattern produces low item discrimination in a general-population calibration.

---

#### 2.9 housing_affordability_tools — Rent limits & public housing vs. Build more, fewer rules

| Property | Value |
|----------|-------|
| **Axis ID** | `housing_affordability_tools` |
| **Current items** | 6 (housing_affordability_tools_01 through _06) |
| **Discrimination estimate (a)** | **2** (moderate) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | No standard battery item on rent control or housing affordability tools | None |
| **GSS** | No standard battery item | None |
| **Pew** | "Is housing affordability a major problem in your community" — perception, not mechanism preference | Weak |
| **Terner Center housing surveys** | Items on rent control, inclusionary zoning, public housing investment | Strong (specialized) |
| **Data for Progress / YouGov housing polls** | "Do you support or oppose rent stabilization policies" — polarized items with partisan splits | Moderate |

**Gap items:** Similar to supply/zoning, mainstream surveys undercover this domain.

1. *"Cities should require that a share of units in new apartment buildings be reserved for lower-income tenants."* (poleA; tests inclusionary zoning; opponents can argue it reduces total housing production, a position supported by some economists)

2. *"Rent control helps renters in the short term but makes the housing shortage worse in the long run."* (poleB; tests the economic-consensus critique of rent control; proponents can argue tenant stability matters more)

3. *"Government-owned affordable housing should be expanded even though it costs taxpayers more."* (poleA; tests willingness to fund public housing directly; opponents can argue private-sector efficiency)

**Discrimination justification:** a=2. Rent control is more partisan than zoning (Pew 2021: 66% of Democrats favor, 36% of Republicans), giving moderate discrimination. However, the supply-side affordability argument appeals to a cross-partisan coalition, compressing the distribution somewhat. The combination yields moderate overall discrimination.

---

#### 2.10 housing_transport_priority — Transit, walking & biking vs. Cars & parking

| Property | Value |
|----------|-------|
| **Axis ID** | `housing_transport_priority` |
| **Current items** | 6 (housing_transport_priority_01 through _06) |
| **Discrimination estimate (a)** | **1** (low) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | No standard battery item on transit vs. cars | None |
| **GSS** | NATROAD ("Spending on highways and bridges") — asks about investment level, not modal priority | Weak |
| **Pew** | "How important is public transit in your community" — measures salience, not preference | Weak |
| **Smartvote** | "Der oeffentliche Verkehr soll gegenueber dem Individualverkehr staerker gefoerdert werden" ("Public transport should be promoted more than private transport") | Strong (cross-national) |
| **Wahl-O-Mat** | Transit vs. road items appear regularly in German state elections | Strong (cross-national) |
| **TransitCenter US survey** | Validated items on transit funding priorities, bike lane support, congestion pricing | Strong (specialized) |

**Gap items:** Mainstream US surveys barely touch this. European VAAs have excellent items. Recommended:

1. *"My city should spend more on bus and train service even if it means spending less on road maintenance."* (poleA; forces the tradeoff; both positions are defensible — transit advocates cite equity and efficiency, road advocates cite existing infrastructure needs)

2. *"Free parking should be available at most businesses and public spaces."* (poleB; tests the implicit car subsidy; proponents invoke accessibility, opponents invoke land-use efficiency)

3. *"Congestion pricing — charging drivers a fee to enter busy downtown areas — is a fair way to reduce traffic."* (poleA; already in the item pool as housing_transport_priority_05 but worth validating externally; defensible from both sides)

**Discrimination justification:** a=1. Transportation modal preference is driven primarily by geography, not ideology. Rural and suburban respondents of all political orientations prefer car infrastructure; urban respondents are more open to transit. Partisan gaps are small (Pew 2022: 54% of Democrats vs. 41% of Republicans think public transit should be a priority — a modest 13-point gap compared to 40+ point gaps on healthcare or guns). The geographic confound attenuates ideological discrimination.

---

### JUSTICE DOMAIN

#### 2.11 justice_policing_accountability — More oversight & alternatives vs. More police & enforcement

| Property | Value |
|----------|-------|
| **Axis ID** | `justice_policing_accountability` |
| **Current items** | 6 (justice_policing_accountability_01 through _06) |
| **Discrimination estimate (a)** | **3** (high) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V202146 ("How much should spending on police be increased or decreased"), V201433 ("How much do you favor affirmative action / policing items vary by wave") | Strong (2020 wave especially, post-George Floyd) |
| **GSS** | POLHITOK ("Is it ever justified for a police officer to strike a citizen"), COURTS ("Courts deal too harshly or not harshly enough with criminals") — indirect | Moderate |
| **Pew** | "Major changes needed in policing" (2020, 2021); "Confidence in police" battery; "Do you favor or oppose reducing the size of police departments" | Strong |
| **MFQ-2** | Authority foundation ("Whether or not someone conformed to the traditions of society", "Whether or not someone showed respect for authority") — captures the deference-to-authority dimension | Moderate |

**Gap items:** Not needed. Post-2020, this axis has extensive validated items.

**Discrimination justification:** a=3. Policing became one of the most polarizing issues in US politics after 2020. Pew (2021) found a 45-point partisan gap on whether major changes are needed in policing. The ANES V202146 (police spending) item shows a strongly bimodal distribution. Racial demographics further sharpen discrimination: Black respondents overwhelmingly favor oversight, while the distribution among white respondents is bimodal. This axis is among the highest-discrimination in our instrument.

---

#### 2.12 justice_sentencing_goals — Focus on rehabilitation vs. Focus on punishment

| Property | Value |
|----------|-------|
| **Axis ID** | `justice_sentencing_goals` |
| **Current items** | 6 (justice_sentencing_goals_01 through _06) |
| **Discrimination estimate (a)** | **2** (moderate) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201337 ("Courts deal too harshly or not harshly enough with criminals") — classic item, asked since 1972 | Strong |
| **GSS** | COURTS ("Courts in this area deal too harshly or not harshly enough with criminals"), CAPPUN ("Favor or oppose death penalty for murder") | Strong |
| **Pew** | "Is the criminal justice system too tough, not tough enough, or about right on crime" battery; recidivism and reentry items in 2022 criminal justice survey | Moderate |
| **MFQ-2** | Care foundation ("Whether or not someone suffered emotionally") may weakly predict rehabilitation preference; Fairness foundation ("Whether or not someone was treated differently from others") — weak indirect mapping | Weak |
| **World Values Survey** | V195 ("When jobs are scarce, employers should give priority to people of this country over immigrants" — not directly relevant); V191 ("Justifiable: claiming government benefits you are not entitled to" — tangential) | Weak |

**Gap items:** Not needed. ANES COURTS and GSS COURTS/CAPPUN are well-calibrated external anchors.

**Discrimination justification:** a=2. The rehabilitation-vs-punishment dimension has shifted significantly over the past decade. Bipartisan criminal justice reform (First Step Act, 2018) suggests convergence on some rehabilitation measures. Pew (2022) found 65% of all Americans favor approaches that address the causes of crime, while 32% favor stricter enforcement — but this masks a 35-point partisan gap. The moderate estimate reflects the combination of a real partisan gap with meaningful bipartisan crossover on specific policies (drug courts, reentry programs).

---

#### 2.13 justice_firearms — Stronger gun safety rules vs. Fewer restrictions

| Property | Value |
|----------|-------|
| **Axis ID** | `justice_firearms` |
| **Current items** | 6 (justice_firearms_01 through _06) |
| **Discrimination estimate (a)** | **3** (high) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201338 ("Federal government should make it more difficult / easier to buy a gun"), V201340 ("Ban assault-style weapons"), V201342 ("Background checks for all gun purchases") | Strong — among the highest-discrimination items in the ANES |
| **GSS** | GUNLAW ("Would you favor or oppose a law which would require a person to obtain a police permit before buying a gun?" — asked since 1972, one of the longest-running GSS items) | Strong |
| **Pew** | Extensive gun policy battery: universal background checks, assault weapons ban, concealed carry, red flag laws (2023) | Strong |
| **Gallup** | "Are you generally for or against stricter gun sale laws" — annual tracking since 1990 | Strong |

**Gap items:** Not needed. This is one of the most extensively validated policy dimensions in US survey research.

**Discrimination justification:** a=3. Firearms policy is among the most polarizing issues in US politics, with one of the largest and most stable partisan gaps. Pew (2023) found a 50-point partisan gap on whether gun laws should be more strict. The ANES gun-difficulty item shows extreme bimodality. Gallup tracking shows the partisan gap has widened from ~30 points in 2000 to ~50 points by 2023. Gun policy items consistently produce discrimination parameters above 2.5 in IRT analyses of the ANES.

---

### CLIMATE DOMAIN

#### 2.14 climate_ambition — Act fast on climate vs. Go slow, keep costs low

| Property | Value |
|----------|-------|
| **Axis ID** | `climate_ambition` |
| **Current items** | 6 (climate_ambition_01 through _06) |
| **Discrimination estimate (a)** | **3** (high) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201401 ("How much should federal government be doing about rising temperatures" — 5-point scale), V202350 ("Global warming is happening" — gateway item) | Strong |
| **GSS** | TEMPGEN1 ("In general, do you think that a rise in the world's temperature caused by climate change is extremely dangerous, very dangerous..." — 5-point danger scale) | Strong |
| **Pew** | "Climate change is a major threat" battery; "Addressing climate change — favor or oppose each" (specific policies) | Strong |
| **Yale Climate Opinion Maps** | "How worried are you about global warming" (4-point) and "How much do you support regulating CO2 as a pollutant" — county-level calibration data available | Strong |
| **World Values Survey** | V81 ("Protecting environment vs. economic growth" — direct tradeoff framing) | Moderate |
| **Smartvote** | "Die Schweiz soll bis 2050 klimaneutral sein" ("Switzerland should be climate-neutral by 2050") | Strong (cross-national) |

**Gap items:** Not needed.

**Discrimination justification:** a=3. Climate policy is the single most partisan issue in the US after abortion and gun policy. Pew (2023) found a 50+ point partisan gap on whether climate change should be a top government priority. The ANES climate items consistently show bimodal response distributions. The Yale Climate Communication project has mapped this trait at the county level, confirming high geographic and demographic variance. IRT analyses of ANES data estimate discrimination parameters of 2.8-3.2 for climate action items.

---

#### 2.15 climate_energy_portfolio — Solar & wind first vs. Mix of all energy types

| Property | Value |
|----------|-------|
| **Axis ID** | `climate_energy_portfolio` |
| **Current items** | 6 (climate_energy_portfolio_01 through _06) |
| **Discrimination estimate (a)** | **2** (moderate) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201407 ("Favor or oppose offshore drilling"), V201409 ("Favor or oppose building more nuclear power plants") — separate items, not a portfolio-framing item | Moderate |
| **GSS** | No standard energy portfolio item | None |
| **Pew** | "Favor or oppose expanding [solar farms / wind farms / nuclear / natural gas / coal / offshore drilling]" — 6 separate items in the 2023 energy survey | Strong — can be combined into a renewables-vs-fossil portfolio index |
| **Gallup** | "Do you favor emphasizing production of oil, gas, coal vs. solar, wind, nuclear" (forced-choice framing since 2001) | Strong |
| **Yale Climate Communication** | Support for renewable energy standards — mapped at county level | Moderate |

**Gap items:** Not strictly needed, but the nuclear question complicates this axis. Nuclear support crosscuts the renewables-vs-fossil divide (some environmentalists support it, some oppose). The current item pool handles this by keying nuclear as poleB (mix of all types), which is defensible but may confuse respondents who support both renewables and nuclear.

1. *"The country should commit to getting most of its electricity from solar and wind within 15 years, even if it means higher energy bills during the transition."* (poleA; forces the cost tradeoff; both fast-transition and go-slow positions are defensible)

**Discrimination justification:** a=2. Energy portfolio preferences are correlated with climate ambition but less polarizing because of the nuclear crosscut and because "all of the above" is a popular centrist position. Gallup (2024) found that 58% of Americans favor emphasizing alternative energy vs. 38% for fossil fuels — a significant gap but with substantial overlap in the middle. The "mix of all types" framing captures a real moderate position, compressing the extremes. Nuclear support further complicates the latent structure, reducing unidimensional discrimination.

---

#### 2.16 climate_permitting — Thorough review first vs. Faster approvals

| Property | Value |
|----------|-------|
| **Axis ID** | `climate_permitting` |
| **Current items** | 6 (climate_permitting_01 through _06) |
| **Discrimination estimate (a)** | **1** (low) |

**Validated instrument mapping:**

| Instrument | Item/Scale | Mapping quality |
|------------|-----------|----------------|
| **ANES** | V201423 ("Favor or oppose regulating greenhouse gas emissions from power plants" — tangential), no direct NEPA/permitting items | Weak |
| **GSS** | GRNECON ("Economic growth always harms the environment" — V-shaped item, not directly about permitting) | Weak |
| **Pew** | No standard permitting-reform item | None |
| **Niskanen Center / R Street permitting reform surveys** | Specialized items on NEPA reform, permitting timelines, judicial review | Moderate (niche) |

**Gap items:** This axis is very poorly covered by mainstream surveys because permitting reform is a technical/elite issue that most voters have not considered deeply.

1. *"Building new clean energy projects like wind farms and solar parks is more important than lengthy environmental reviews."* (poleB; tests the "green YIMBY" position where speed of green transition outweighs review caution; both positions are defensible — environmentalists themselves are split)

2. *"Communities near a proposed factory or power plant should be able to delay or block it through legal challenges, even if the project meets safety standards."* (poleA; tests the community-veto principle; proponents invoke local autonomy and environmental justice, opponents invoke regulatory certainty)

3. *"The government takes too long to approve construction projects that the country needs."* (poleB; a broad sentiment item; proponents cite economic costs of delay, opponents cite the value of deliberation)

**Discrimination justification:** a=1. Permitting reform is a low-salience, technically complex issue where most voters lack stable preferences. It is also uniquely cross-cutting: progressive climate advocates split between "build green fast" (poleB) and "protect communities and ecosystems" (poleA); conservatives split between "cut red tape" (poleB) and "protect property rights from eminent domain / transmission lines" (poleA). This double cross-cut produces very low discrimination in a general population. In a politically engaged sample, discrimination may rise to a~1.5, but for a general-population VAA, a=1 is appropriate.

---

## 3. Summary Table

| # | Axis ID | Validated Instruments | Gap Items Needed | a | Key justification |
|---|---------|----------------------|------------------|---|-------------------|
| 1 | econ_safetynet | ANES V201246/V201304, GSS NATFARE/HELPPOOR, Pew, WVS | No | 2 | Core L-R but not bimodal |
| 2 | econ_investment | ANES V201246, GSS spending battery, Pew, Smartvote, Wahl-O-Mat | No | 2 | Core L-R, normal distribution |
| 3 | econ_school_choice | EdNext Poll (specialized), ANES/GSS weak | Yes (3) | 2 | Cross-cutting; bipartisan splits |
| 4 | econ_tax_structure | ANES V201327/V201329, GSS TAXRICH/TAXPOOR, Pew | Yes (1) | 2 | Progressive taxation well-covered; flat/consumption tax not |
| 5 | health_coverage_model | ANES V201336, GSS HELPSICK/NATHEAL, Pew, KFF | No | 3 | Bimodal; 70-year ANES track record |
| 6 | health_cost_control | KFF drug pricing items (specialized) | Yes (3) | 2 | Mechanism question (how, not whether) is under-studied |
| 7 | health_public_health | ANES COVID items, MFQ-2 Liberty, GSS drug items | Yes (3) | 2 | Post-COVID salience; pre-COVID low discrimination |
| 8 | housing_supply_zoning | Terner Center (specialized), Smartvote, Wahl-O-Mat | Yes (3) | 1 | Geographic > ideological; cross-partisan |
| 9 | housing_affordability_tools | Terner Center (specialized), DFP/YouGov | Yes (3) | 2 | Rent control is partisan; supply-side crosscuts |
| 10 | housing_transport_priority | TransitCenter (specialized), Smartvote, Wahl-O-Mat | Yes (3) | 1 | Geography-driven; small partisan gap |
| 11 | justice_policing_accountability | ANES V202146, Pew policing battery, MFQ-2 Authority | No | 3 | Post-2020 extreme polarization |
| 12 | justice_sentencing_goals | ANES COURTS (since 1972), GSS COURTS/CAPPUN, Pew | No | 2 | Real gap but bipartisan crossover areas |
| 13 | justice_firearms | ANES V201338/V201340/V201342, GSS GUNLAW, Pew, Gallup | No | 3 | Among most polarizing; 50-pt partisan gap |
| 14 | climate_ambition | ANES V201401, GSS TEMPGEN1, Pew, Yale Climate Maps | No | 3 | 50+ pt partisan gap; bimodal |
| 15 | climate_energy_portfolio | ANES offshore/nuclear, Pew energy battery, Gallup | Yes (1) | 2 | Nuclear crosscut; "all of the above" compresses |
| 16 | climate_permitting | Niskanen/R Street (niche) | Yes (3) | 1 | Low salience; double cross-cut |

**Total gap items proposed:** 23 items across 8 axes

---

## 4. Anchor Axis Selection

### Objective

Select the 4 axes that, if measured first, maximally reduce posterior entropy across all 16 axes. This enables efficient adaptive routing: after 4-6 items on anchor axes, the system can predict likely positions on unmeasured axes and prioritize items that resolve the greatest remaining uncertainty.

### Selection criteria

1. **High discrimination (a >= 2):** Only high-discrimination axes provide enough information to update priors on correlated axes.
2. **High between-axis correlation:** An anchor axis is most valuable when it predicts positions on many other axes.
3. **Diverse dimensionality:** The 4 anchors should span the known latent dimensions of US political attitudes, not cluster on a single factor.

### Known correlation structure in US political science

US political attitudes are well-described by 2-3 latent dimensions (see Treier & Hillygus 2009, "The Nature of Political Ideology in the Contemporary Electorate"):

1. **Economic left-right (redistribution, government size):** Loads heavily on econ_safetynet, econ_investment, econ_tax_structure, health_coverage_model, housing_affordability_tools
2. **Social/cultural (traditionalism vs. progressivism):** Loads heavily on justice_firearms, justice_policing_accountability, justice_sentencing_goals, health_public_health
3. **Environmental/climate:** Loads heavily on climate_ambition, climate_energy_portfolio; partially loads on climate_permitting and housing_transport_priority

These three dimensions account for roughly 60-70% of variance in US policy attitudes (Jost, Federico & Napier, 2009). The remaining axes (school choice, housing supply/zoning, cost control, permitting) are either cross-cutting or low-salience, making them poor anchor candidates.

### Ranked anchor axes

| Rank | Axis | Dimension represented | a | Rationale |
|------|------|----------------------|---|-----------|
| **1** | `health_coverage_model` | Economic left-right | 3 | The single highest-loading item on the US economic L-R dimension. ANES V201336 has been the top predictor of partisan vote choice since 2008. Correlates r > 0.70 with econ_safetynet, econ_investment, econ_tax_structure, and r > 0.50 with housing_affordability_tools. Measuring this axis first updates priors on 5-6 other axes simultaneously. |
| **2** | `justice_firearms` | Social/cultural | 3 | The highest-discrimination axis in the social/cultural dimension. Gun policy correlates r > 0.60 with justice_policing_accountability and justice_sentencing_goals, and r > 0.45 with health_public_health. It is partially independent of the economic dimension (r ~ 0.35 with health_coverage_model), so it provides new information beyond anchor #1. |
| **3** | `climate_ambition` | Environmental | 3 | The gateway item for the entire climate domain. Climate ambition correlates r > 0.75 with climate_energy_portfolio and r > 0.50 with climate_permitting. It also correlates moderately (r ~ 0.40) with the economic L-R dimension, providing a bridge between economic and environmental attitudes. |
| **4** | `housing_supply_zoning` | Cross-cutting / orthogonal | 1 | Counterintuitive choice: this axis has low discrimination (a=1) and low correlation with the other three dimensions. That is precisely why it is valuable as the 4th anchor. After measuring axes 1-3, the system has strong priors on all economic, social, and climate axes. The remaining uncertainty concentrates on the cross-cutting housing/transport axes that are orthogonal to the main partisan dimensions. Housing supply/zoning is the best predictor of housing_affordability_tools (r ~ 0.45) and housing_transport_priority (r ~ 0.35) — axes that cannot be predicted from anchors 1-3. Including it as anchor #4 prevents the system from defaulting to uninformative centrist priors on the entire housing domain. |

### Expected entropy reduction

With these 4 anchors (approximately 4-6 items each = 16-24 total items), the system should be able to:
- Predict positions within +/- 0.5 SD on 10 of 16 axes (the 5 economic, 3 justice, 2 remaining climate)
- Have moderate uncertainty on housing_affordability_tools and housing_transport_priority (reducible with 2-3 targeted items each)
- Have high residual uncertainty only on econ_school_choice and climate_permitting (the most cross-cutting axes)

Total items needed for adequate classification across all 16 axes with CAT: approximately 35-45 items, compared to the current 96 items (6 per axis x 16 axes) in the fixed-form assessment. This represents a 50-60% reduction in respondent burden.

---

## 5. Calibration Study Design

### 5.1 Sample requirements

**Minimum sample size: N = 1,500**

Justification:
- GRM calibration with 6 items per axis requires at least 250 respondents per item for stable parameter estimates (Reise & Yu, 1990).
- With 144 existing items + 23 gap items = 167 total items, a full-battery administration is infeasible (respondent fatigue beyond ~60 items).
- Use a **matrix sampling / planned missingness design** (Rhemtulla & Little, 2012): divide the 167 items into 4 overlapping blocks of ~50 items each. Each respondent answers one block. With N=1,500, each block gets ~375 respondents, exceeding the 250 minimum.
- Include all 4 anchor-axis items in every block (common items for equating).

**Target demographics:**
- US adult citizens (18+), registered voters preferred but not required
- Stratified quota sampling by:
  - Party identification (30% Democrat, 30% Republican, 30% Independent, 10% other/none)
  - Age (18-29, 30-44, 45-64, 65+, roughly equal)
  - Education (non-college, some college, bachelor's+)
  - Geography (urban, suburban, rural)
  - Race/ethnicity (proportional to US Census)

**Recruitment:** Prolific or CloudResearch (academic panel platforms with validated demographic screening). Budget approximately $7-10 per respondent for a 15-minute survey = $10,500-15,000 total.

### 5.2 Study design

**Phase 1: Pilot (N=150, 2 weeks)**

- Full 167-item administration to 150 respondents (with breaks and attention checks)
- Purpose: identify floor/ceiling items, check for misunderstood wording, compute initial item-total correlations
- Drop items with item-total correlation < 0.30 or with > 80% of respondents in a single category
- Revise gap items that show unexpected response patterns

**Phase 2: Main calibration (N=1,500, 4 weeks)**

Matrix sampling design:

| Block | Items | Overlap with other blocks |
|-------|-------|--------------------------|
| A | All 4 anchor axes (24 items) + econ domain (24 items) + health domain (18 items) | Anchor axes in all blocks |
| B | All 4 anchor axes (24 items) + justice domain (18 items) + climate domain (18 items) | Anchor axes in all blocks |
| C | All 4 anchor axes (24 items) + housing domain (18 items) + gap items set 1 (12 items) | Anchor axes in all blocks |
| D | All 4 anchor axes (24 items) + gap items set 2 (11 items) + cross-loading validation items (15 items) | Anchor axes in all blocks |

Each block is approximately 48-54 items, requiring 12-15 minutes. Respondents are randomly assigned to one block.

**Attention checks:** Include 2-3 attention-check items per block (e.g., "Please select 'Agree' for this item"). Exclude respondents who fail more than 1.

**External validation items:** Include 5-8 items from validated instruments (ANES V201336, ANES V201338, GSS GUNLAW, GSS COURTS, ANES V201401) in each block to enable concurrent validity analysis.

### 5.3 Analysis plan

**Step 1: Confirmatory factor analysis (CFA)**

- Fit a 16-factor CFA model to confirm the hypothesized axis structure
- Check that each item loads primarily on its intended axis (standardized loading > 0.40)
- Check for significant cross-loadings that might indicate items measuring multiple axes
- Model fit criteria: CFI > 0.90, RMSEA < 0.06, SRMR < 0.08

**Step 2: GRM calibration**

- Fit Samejima's Graded Response Model separately for each axis using the `mirt` package in R (Chalmers, 2012) or `ltm` package
- Estimate a_i (discrimination) and b_i1...b_i4 (threshold) parameters for each item
- Check item fit using S-X2 statistic (Orlando & Thissen, 2000); flag items with p < 0.01
- Compute item information functions; identify the theta range where each item provides maximum information

**Step 3: Item selection for adaptive testing**

- For each axis, rank items by Fisher information at theta = 0 (the centrist position where most respondents cluster)
- Select the top 4-5 items per axis for the "short form" assessment (~64-80 items total)
- Verify that the selected items provide adequate information across the full theta range (-3 to +3), not just at the center
- If information drops below 0.50 at any theta region, add items from the gap-item pool targeting that region

**Step 4: Cross-axis correlation structure**

- Estimate the 16x16 inter-axis correlation matrix from the calibrated model
- Confirm or revise the anchor-axis selection based on observed (rather than hypothesized) correlations
- Build the Bayesian prior structure for CAT: the prior for each axis conditional on already-measured axes

**Step 5: CAT simulation**

- Using the calibrated item parameters and inter-axis correlation structure, simulate CAT administration for 10,000 synthetic respondents
- Measure: (a) number of items needed to reach SE < 0.30 on all 16 axes, (b) classification accuracy (proportion of respondents correctly classified into the correct third of each axis), (c) respondent burden (mean items administered)
- Compare fixed-form (96 items), short-form (64 items), and full CAT
- Target: CAT should achieve SE < 0.30 on all axes with fewer than 50 items for 90% of respondents

### 5.4 Timeline

| Week | Activity |
|------|----------|
| 1-2 | Finalize gap items; program survey on Qualtrics/Alchemer |
| 3-4 | Pilot study (N=150); analyze pilot data |
| 5 | Revise items based on pilot; reprogram |
| 6-9 | Main calibration study (N=1,500) |
| 10-11 | GRM analysis; item parameter estimation |
| 12 | CAT simulation; anchor validation |
| 13 | Final item selection; update spec.ts with calibrated parameters |

### 5.5 Integration with Ballot Builder

After calibration, the item parameters should be added to the spec as additional fields on each item:

```typescript
export interface CalibratedItem extends Item {
  irt: {
    a: number;           // discrimination
    b: [number, number, number, number]; // thresholds for 5-point GRM
    info_at_zero: number; // Fisher information at theta=0
    se_at_zero: number;   // standard error at theta=0
  };
  anchor: boolean;        // true if this item is in an anchor axis
  validated_source?: string; // e.g., "ANES V201336" if adapted from validated instrument
}
```

The adaptive presentation logic would then use `info_at_zero` (or the full information function evaluated at the current EAP estimate) to select the next item. The shrinkage scoring can remain as the primary scoring method for MVP, with the IRT parameters used only for item ordering and stopping rules.

---

## 6. References

### Survey instruments cited

- **ANES (American National Election Studies).** Time Series Cumulative Data File, 1948-2024. Variable numbers cited as V20xxxx per the 2020 and 2024 questionnaires. Available: https://electionstudies.org/
- **GSS (General Social Survey).** NORC at the University of Chicago, 1972-2024. Variable mnemonics (NATFARE, GUNLAW, COURTS, etc.) per the GSS cumulative codebook. Available: https://gss.norc.org/
- **Pew Research Center.** Political Typology (2014, 2017, 2021); various topical surveys on gun policy, climate, healthcare, policing cited by year. Available: https://www.pewresearch.org/
- **KFF (Kaiser Family Foundation).** Health Tracking Poll, monthly. Available: https://www.kff.org/
- **World Values Survey.** Wave 7 (2017-2022). Variable numbers cited as V##. Available: https://www.worldvaluessurvey.org/
- **MFQ-2 (Moral Foundations Questionnaire, Revised).** Atari, M., Haidt, J., Graham, J., Koleva, S., Stevens, S. T., & Dehghani, M. (2023). Morality beyond the WEIRD: How the nomological network of morality varies across cultures. *Journal of Personality and Social Psychology.*
- **Schwartz Portrait Values Questionnaire (PVQ-RR).** Schwartz, S. H. (2012). An overview of the Schwartz theory of basic values. *Online Readings in Psychology and Culture, 2*(1).
- **Smartvote.** Swiss VAA operated by Politools. Available: https://www.smartvote.ch/
- **Wahl-O-Mat.** German VAA operated by Bundeszentrale fuer politische Bildung (bpb). Available: https://www.wahl-o-mat.de/
- **EdNext Poll (Education Next / Program on Education Policy and Governance, Harvard).** Annual survey since 2007. Available: https://www.educationnext.org/
- **Terner Center for Housing Innovation, UC Berkeley.** Housing survey data. Available: https://ternercenter.berkeley.edu/
- **UCLA Lewis Center for Regional Policy Studies.** Housing attitudes research. Available: https://lewis.ucla.edu/
- **TransitCenter.** US transit attitudes survey. Available: https://transitcenter.org/
- **Yale Program on Climate Change Communication.** Climate Opinion Maps. Available: https://climatecommunication.yale.edu/

### Methodological references

- Samejima, F. (1969). Estimation of latent ability using a response pattern of graded scores. *Psychometrika Monograph Supplement, 17.*
- Chalmers, R. P. (2012). mirt: A multidimensional item response theory package for the R environment. *Journal of Statistical Software, 48*(6), 1-29.
- Orlando, M., & Thissen, D. (2000). Likelihood-based item-fit indices for dichotomous item response theory models. *Applied Psychological Measurement, 24*(1), 50-64.
- Reise, S. P., & Yu, J. (1990). Parameter recovery in the graded response model using MULTILOG. *Journal of Educational Measurement, 27*(2), 133-144.
- Rhemtulla, M., & Little, T. D. (2012). Planned missing data designs for research in cognitive development. *Journal of Cognition and Development, 13*(4), 425-438.
- Treier, S., & Hillygus, D. S. (2009). The nature of political ideology in the contemporary electorate. *Public Opinion Quarterly, 73*(4), 679-703.
- Jost, J. T., Federico, C. M., & Napier, J. L. (2009). Political ideology: Its structure, functions, and elective affinities. *Annual Review of Psychology, 60*, 307-337.

---

## Appendix A: Gap Item Summary

All 23 proposed gap items collected in one place for calibration study programming.

### econ_school_choice (3 items)
1. "Parents should be able to use public funding to send their children to the school that best fits them, including religious schools." (poleB)
2. "When a public school is struggling, the priority should be fixing it rather than opening alternatives nearby." (poleA)
3. "Competition between schools leads to better outcomes for students overall." (poleB)

### econ_tax_structure (1 item)
4. "A national sales tax that replaces the income tax would be simpler and fairer." (poleB)

### health_cost_control (3 items)
5. "Health insurance companies should be free to offer plans with limited coverage if it keeps premiums low." (poleB)
6. "The government should set a maximum price for common prescription drugs." (poleA)
7. "Letting patients compare prices online and choose their own provider is a better way to reduce costs than government rules." (poleB)

### health_public_health (3 items)
8. "Local health departments should have the authority to require vaccinations for school-age children." (poleA)
9. "Government should fund needle exchange programs and supervised consumption sites to reduce overdose deaths." (poleA)
10. "Adults should be free to make their own health decisions without government pressure, even if those decisions affect public health." (poleB)

### housing_supply_zoning (3 items)
11. "My city should allow duplexes and small apartment buildings in neighborhoods that are currently single-family only." (poleA)
12. "It's reasonable for neighbors to have a say in whether a new apartment building gets built on their block." (poleB)
13. "States should be able to override local zoning rules to allow more housing near transit stops." (poleA)

### housing_affordability_tools (3 items)
14. "Cities should require that a share of units in new apartment buildings be reserved for lower-income tenants." (poleA)
15. "Rent control helps renters in the short term but makes the housing shortage worse in the long run." (poleB)
16. "Government-owned affordable housing should be expanded even though it costs taxpayers more." (poleA)

### housing_transport_priority (3 items)
17. "My city should spend more on bus and train service even if it means spending less on road maintenance." (poleA)
18. "Free parking should be available at most businesses and public spaces." (poleB)
19. "Congestion pricing -- charging drivers a fee to enter busy downtown areas -- is a fair way to reduce traffic." (poleA)

### climate_energy_portfolio (1 item)
20. "The country should commit to getting most of its electricity from solar and wind within 15 years, even if it means higher energy bills during the transition." (poleA)

### climate_permitting (3 items)
21. "Building new clean energy projects like wind farms and solar parks is more important than lengthy environmental reviews." (poleB)
22. "Communities near a proposed factory or power plant should be able to delay or block it through legal challenges, even if the project meets safety standards." (poleA)
23. "The government takes too long to approve construction projects that the country needs." (poleB)

---

## Appendix B: ANES and GSS Item Cross-Reference

For researchers programming the calibration study, this table maps specific ANES/GSS item identifiers to Ballot Builder axes for external anchor validation.

| Ballot Builder Axis | ANES Variable(s) | GSS Variable(s) | Notes |
|---------------------|-------------------|------------------|-------|
| econ_safetynet | V201246, V201304, V201306x | NATFARE, NATFAREY, HELPPOOR | V201304 is the strongest single anchor |
| econ_investment | V201246, V201309, V201312 | NATEDUC, NATROAD, NATSPAC | V201246 double-loads with safetynet |
| econ_school_choice | V201309 (partial) | NATEDUC (partial) | No direct voucher/choice item in ANES/GSS |
| econ_tax_structure | V201327, V201329 | TAX, TAXRICH, TAXPOOR | TAXRICH is the strongest anchor |
| health_coverage_model | V201336 | HELPSICK, NATHEAL | V201336 is the gold-standard anchor |
| health_cost_control | -- | -- | Neither ANES nor GSS has a direct item |
| health_public_health | V202160, V202166 | GRASS | V202160 is COVID-specific |
| housing_supply_zoning | -- | -- | No ANES/GSS item |
| housing_affordability_tools | -- | -- | No ANES/GSS item |
| housing_transport_priority | -- | NATROAD (weak) | No direct modal-priority item |
| justice_policing_accountability | V202146 | POLHITOK | V202146 added in 2020 wave |
| justice_sentencing_goals | V201337 | COURTS, CAPPUN | Both available since 1970s |
| justice_firearms | V201338, V201340, V201342 | GUNLAW | GUNLAW asked since 1972 |
| climate_ambition | V201401, V202350 | TEMPGEN1 | V201401 is the direct-action item |
| climate_energy_portfolio | V201407, V201409 | -- | Separate items; no portfolio framing |
| climate_permitting | V201423 (weak) | GRNECON (weak) | No direct NEPA/permitting item |
