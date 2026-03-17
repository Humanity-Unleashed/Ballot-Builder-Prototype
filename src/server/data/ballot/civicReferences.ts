/**
 * Deterministic Reference Content for Offices & Ballot Measures
 *
 * This store provides validated, source-checked descriptions of elected offices
 * and ballot measures. It is injected into LLM prompts as trusted context so
 * the model answers "What does a Railroad Commissioner do?" from our verified
 * content, not from its own (potentially stale or incorrect) training data.
 *
 * AUTHORING RULES:
 * - Use only authoritative, non-partisan sources (official government sites,
 *   state/local election boards, reputable nonpartisan voter guides).
 * - Cross-check basic facts (responsibilities, term length, jurisdiction).
 * - When sources conflict, prefer official legal/government sources and note ambiguity.
 * - Tone: neutral, civic, non-partisan. Audience: general US voters.
 * - Prioritize factual accuracy and clear boundaries over completeness.
 * - If uncertain about a detail, omit it or mark it explicitly.
 */

import type { OfficeReference, MeasureReference, CivicReference } from '../../types';

// ============================================
// FEDERAL OFFICES
// ============================================

export const usSenateFederal: OfficeReference = {
  id: 'us_senator_federal',
  type: 'role',
  jurisdiction: 'United States',
  jurisdictionLevel: 'federal',
  title: 'U.S. Senator',
  shortDescription:
    'One of 100 members of the United States Senate, the upper chamber of Congress. Each state elects two senators who represent the entire state and serve six-year terms.',
  responsibilities: [
    'Writes and votes on federal legislation covering taxes, spending, healthcare, immigration, defense, and more',
    'Confirms presidential appointments including Cabinet members, federal judges, and Supreme Court justices',
    'Ratifies treaties negotiated by the President (requires two-thirds vote)',
    'Conducts oversight of federal agencies through committee hearings and investigations',
    'Tries impeachment cases brought by the House of Representatives',
    'Represents the interests of their entire state in federal policy debates',
  ],
  scopeLimits: [
    'Cannot introduce revenue bills (must originate in the House)',
    'Cannot unilaterally pass legislation — requires House agreement and presidential signature (or veto override)',
    'Does not set state or local policy directly',
  ],
  termLength: '6 years, no term limits',
  seats: 2, // per state
  sources: [
    'https://www.senate.gov/about/powers-procedures.htm',
    'https://www.congress.gov/about',
  ],
  usageNotes: [
    'When a user asks what a U.S. Senator does, use this description. Do not speculate about powers not listed.',
    'Clarify that senators represent the entire state, not a specific district (that is the House).',
    'If asked about specific policy areas, explain the senator votes on legislation but does not single-handedly set policy.',
  ],
};

export const usRepresentativeFederal: OfficeReference = {
  id: 'us_representative_federal',
  type: 'role',
  jurisdiction: 'United States',
  jurisdictionLevel: 'federal',
  title: 'U.S. Representative',
  shortDescription:
    'One of 435 members of the United States House of Representatives, the lower chamber of Congress. Each representative serves a two-year term and represents a specific congressional district within their state.',
  responsibilities: [
    'Writes and votes on federal legislation — all revenue (tax) bills must originate in the House',
    'Approves the federal budget and government spending through the appropriations process',
    'Has the sole power of impeachment (bringing charges against federal officials)',
    'Conducts oversight of federal agencies through committee hearings',
    'Represents the interests of their specific congressional district',
    'Elects the Speaker of the House, who sets the legislative agenda',
  ],
  scopeLimits: [
    'Cannot confirm presidential appointments or ratify treaties (Senate only)',
    'Cannot try impeachment cases (Senate only)',
    'Does not set state or local policy directly',
  ],
  termLength: '2 years, no term limits',
  seats: 1, // per district
  sources: [
    'https://www.house.gov/the-house-explained',
    'https://www.congress.gov/about',
  ],
  usageNotes: [
    'When a user asks what a U.S. Representative does, use this description. Emphasize that they represent a specific district, not the whole state.',
    'If asked about Senate-specific powers (confirmations, treaties), clarify that those belong to the Senate.',
  ],
};

// ============================================
// STATE OFFICES — MICHIGAN
// ============================================

export const miGovernor: OfficeReference = {
  id: 'mi_governor_statewide',
  type: 'role',
  jurisdiction: 'Michigan',
  jurisdictionLevel: 'state',
  title: 'Governor of Michigan',
  shortDescription:
    'The chief executive of the State of Michigan, responsible for enforcing state laws, proposing the state budget, and leading the executive branch agencies.',
  responsibilities: [
    'Signs or vetoes legislation passed by the Michigan Legislature',
    'Proposes the state budget to the Legislature',
    'Appoints heads of state departments, boards, and commissions (some require Senate confirmation)',
    'Commands the Michigan National Guard',
    'Issues executive orders and directives to state agencies',
    'Grants pardons and commutations for state crimes',
    'Represents Michigan in interstate and federal negotiations',
  ],
  scopeLimits: [
    'Cannot pass legislation without the Legislature — proposes but does not enact laws alone',
    'Cannot set local property taxes, zoning, or school district policy',
    'Federal policy (immigration, Social Security, military) is outside the governor\'s authority',
  ],
  termLength: '4 years, limited to 2 terms',
  seats: 1,
  sources: [
    'https://www.michigan.gov/whitmer/about/the-office',
    'https://www.legislature.mi.gov/documents/publications/constitution.pdf',
  ],
  usageNotes: [
    'When a user asks what the Governor does, use this description and listed responsibilities.',
    'If asked about federal issues (Social Security, immigration), explain those are federal, not state, responsibilities.',
    'The governor has significant appointment power — clarify this if users ask about agency leadership.',
  ],
};

export const miStateSenator: OfficeReference = {
  id: 'mi_state_senator',
  type: 'role',
  jurisdiction: 'Michigan',
  jurisdictionLevel: 'state',
  title: 'Michigan State Senator',
  shortDescription:
    'One of 38 members of the Michigan Senate, the upper chamber of the state Legislature. Each senator represents a district of roughly 265,000 people and serves a four-year term.',
  responsibilities: [
    'Writes and votes on state legislation covering education, healthcare, criminal justice, transportation, and more',
    'Approves the state budget (jointly with the House)',
    'Confirms gubernatorial appointments to state boards, commissions, and department heads',
    'Conducts oversight of state agencies through committee hearings',
    'Represents the interests of their specific senate district',
  ],
  scopeLimits: [
    'Cannot set federal policy (immigration, defense, Social Security)',
    'Cannot control local municipal decisions unless state law preempts them',
    'Cannot unilaterally pass laws — requires House agreement and governor\'s signature',
  ],
  termLength: '4 years, limited to 2 terms (after 2022 redistricting)',
  seats: 1, // per district
  sources: [
    'https://www.senate.michigan.gov/about/',
    'https://www.legislature.mi.gov/documents/publications/constitution.pdf',
  ],
  usageNotes: [
    'When a user asks what a state senator does, use this description. Distinguish from U.S. Senator if there is confusion.',
    'Clarify that state senators handle state-level policy, not federal issues.',
  ],
};

export const miStateRepresentative: OfficeReference = {
  id: 'mi_state_representative',
  type: 'role',
  jurisdiction: 'Michigan',
  jurisdictionLevel: 'state',
  title: 'Michigan State Representative',
  shortDescription:
    'One of 110 members of the Michigan House of Representatives, the lower chamber of the state Legislature. Each representative serves a two-year term and represents a district of roughly 92,000 people.',
  responsibilities: [
    'Writes and votes on state legislation',
    'Initiates appropriations (spending) bills — all state spending bills must originate in the House',
    'Approves the state budget (jointly with the Senate)',
    'Conducts oversight of state agencies through committee hearings',
    'Represents the interests of their specific house district',
  ],
  scopeLimits: [
    'Cannot confirm gubernatorial appointments (Senate only)',
    'Cannot set federal or local policy directly',
  ],
  termLength: '2 years, limited to 3 terms (after 2022 redistricting)',
  seats: 1,
  sources: [
    'https://www.house.mi.gov/about',
    'https://www.legislature.mi.gov/documents/publications/constitution.pdf',
  ],
  usageNotes: [
    'When a user asks what a state representative does, use this description.',
    'Distinguish from U.S. Representative if there is confusion.',
  ],
};

export const miAttorneyGeneral: OfficeReference = {
  id: 'mi_attorney_general_statewide',
  type: 'role',
  jurisdiction: 'Michigan',
  jurisdictionLevel: 'state',
  title: 'Michigan Attorney General',
  shortDescription:
    'The chief legal officer of the State of Michigan, responsible for representing the state in court, enforcing consumer protection laws, and issuing legal opinions on state law.',
  responsibilities: [
    'Represents the State of Michigan in all legal proceedings, including before the U.S. Supreme Court',
    'Enforces consumer protection, antitrust, and environmental laws',
    'Issues formal legal opinions interpreting state law (binding on state agencies)',
    'Investigates and prosecutes public corruption, organized crime, and Medicaid fraud',
    'Oversees charitable trust enforcement and nonprofit oversight',
    'Coordinates with federal and local law enforcement on cross-jurisdictional cases',
  ],
  scopeLimits: [
    'Does not make laws — interprets and enforces them',
    'Cannot override local prosecutors\' charging decisions in most cases',
    'Federal law enforcement (FBI, DOJ) handles federal crimes separately',
  ],
  termLength: '4 years, limited to 2 terms',
  seats: 1,
  sources: [
    'https://www.michigan.gov/ag/about',
    'https://www.legislature.mi.gov/documents/publications/constitution.pdf',
  ],
  usageNotes: [
    'When a user asks what the Attorney General does, use this description.',
    'Clarify that the AG enforces laws but does not write them — that is the Legislature\'s role.',
    'If asked about criminal prosecution, explain the AG handles specific categories (corruption, fraud) while local prosecutors handle most criminal cases.',
  ],
};

export const miSecretaryOfState: OfficeReference = {
  id: 'mi_secretary_of_state_statewide',
  type: 'role',
  jurisdiction: 'Michigan',
  jurisdictionLevel: 'state',
  title: 'Michigan Secretary of State',
  shortDescription:
    'Michigan\'s chief election officer and administrator of vehicle and driver services. Oversees all state and federal elections held in Michigan and maintains official state records.',
  responsibilities: [
    'Administers all elections in Michigan, including voter registration, ballot certification, and results reporting',
    'Manages driver\'s licenses, vehicle titles and registrations through branch offices',
    'Maintains the state\'s official records and business filings',
    'Certifies election results and oversees ballot initiative petition processes',
    'Enforces campaign finance disclosure laws',
    'Implements voter ID requirements and manages the Qualified Voter File',
  ],
  scopeLimits: [
    'Does not write election law — the Legislature sets voting rules; the SOS implements them',
    'Cannot change voter eligibility requirements — those are set by state and federal law',
    'Does not handle law enforcement or criminal prosecution',
  ],
  termLength: '4 years, limited to 2 terms',
  seats: 1,
  sources: [
    'https://www.michigan.gov/sos/about',
    'https://www.legislature.mi.gov/documents/publications/constitution.pdf',
  ],
  usageNotes: [
    'When a user asks what the Secretary of State does, use this description.',
    'Many users associate SOS only with driver\'s licenses — make sure to highlight the election administration role.',
    'If asked about voting laws, clarify that the Legislature and state constitution set the rules; the SOS implements them.',
  ],
};

// ============================================
// STATE OFFICES — TEXAS
// ============================================

export const txGovernor: OfficeReference = {
  id: 'tx_governor_statewide',
  type: 'role',
  jurisdiction: 'Texas',
  jurisdictionLevel: 'state',
  title: 'Governor of Texas',
  shortDescription:
    'The chief executive of the State of Texas. Texas has a plural executive, meaning the governor shares executive power with several other independently elected officials (Lt. Governor, Attorney General, Comptroller, etc.).',
  responsibilities: [
    'Signs or vetoes legislation passed by the Texas Legislature (line-item veto on appropriations)',
    'Proposes the state budget to the Legislature',
    'Appoints members to state boards, commissions, and vacancies (subject to Senate confirmation)',
    'Commands the Texas National Guard and Texas State Guard',
    'Issues executive orders and proclamations',
    'Grants pardons, reprieves, and commutations (only upon recommendation of the Board of Pardons and Paroles)',
    'Calls special sessions of the Legislature and sets their agenda',
  ],
  scopeLimits: [
    'Weaker than many governors — Texas\'s plural executive means the Lt. Governor, AG, Comptroller, and Land Commissioner have independent authority',
    'Cannot unilaterally grant pardons — must have Board of Pardons and Paroles recommendation',
    'The Legislature meets only 140 days every two years, limiting the governor\'s legislative influence outside special sessions',
  ],
  termLength: '4 years, no term limits',
  seats: 1,
  sources: [
    'https://gov.texas.gov/about',
    'https://statutes.capitol.texas.gov/Docs/CN/htm/CN.4.htm',
  ],
  usageNotes: [
    'When a user asks about the Texas Governor, emphasize the plural executive structure — the governor is less powerful than governors in many other states.',
    'If asked about pardons, clarify the Board of Pardons and Paroles must recommend them first.',
  ],
};

export const txRailroadCommissioner: OfficeReference = {
  id: 'tx_railroad_commissioner_statewide',
  type: 'role',
  jurisdiction: 'Texas',
  jurisdictionLevel: 'state',
  title: 'Texas Railroad Commissioner',
  shortDescription:
    'One of three elected members of the Texas Railroad Commission, which regulates the oil and gas industry, natural gas utilities, pipeline safety, and surface coal and uranium mining in Texas. Despite its name, it no longer regulates railroads.',
  responsibilities: [
    'Regulates oil and gas exploration and production in Texas, the nation\'s largest producing state',
    'Issues drilling permits and enforces well-spacing and production rules',
    'Oversees pipeline safety inspections for intrastate natural gas and hazardous liquid pipelines',
    'Regulates natural gas utility rates for residential and commercial customers',
    'Oversees surface coal and uranium mining operations and reclamation',
    'Manages the state\'s oil and gas well plugging program for abandoned wells',
  ],
  scopeLimits: [
    'Does NOT regulate railroads — that authority was transferred to the federal Surface Transportation Board and TxDOT',
    'Does NOT regulate the electric grid — ERCOT and the Public Utility Commission of Texas handle electricity',
    'Does NOT regulate gasoline prices at the pump — those are set by market forces',
  ],
  termLength: '6 years, staggered (one seat up every 2 years), no term limits',
  seats: 3,
  sources: [
    'https://www.rrc.texas.gov/about-us/',
    'https://statutes.capitol.texas.gov/Docs/NR/htm/NR.81.htm',
  ],
  usageNotes: [
    'When a user asks about the Railroad Commission, immediately clarify it does NOT regulate railroads — this is the most common misconception.',
    'If asked about electricity, explain that ERCOT and the PUC handle the electric grid, not the Railroad Commission.',
    'This office is highly relevant to climate and energy policy — the commissioner influences how much oil and gas Texas produces.',
  ],
};

export const txAttorneyGeneral: OfficeReference = {
  id: 'tx_attorney_general_statewide',
  type: 'role',
  jurisdiction: 'Texas',
  jurisdictionLevel: 'state',
  title: 'Texas Attorney General',
  shortDescription:
    'The chief legal officer of the State of Texas, responsible for representing the state in litigation, enforcing consumer protection and open government laws, and issuing advisory legal opinions.',
  responsibilities: [
    'Represents the State of Texas in civil litigation, including multi-state lawsuits and cases before the U.S. Supreme Court',
    'Enforces the Texas Deceptive Trade Practices Act (consumer protection)',
    'Issues legal opinions interpreting state law (advisory, not binding on courts)',
    'Enforces the Texas Open Meetings Act and Public Information Act',
    'Enforces child support collection as the state\'s Title IV-D agency',
    'Investigates Medicaid fraud and certain categories of public corruption',
  ],
  scopeLimits: [
    'Does not prosecute most criminal cases — local district attorneys handle that',
    'Legal opinions are advisory, not court rulings — courts make final interpretations',
    'Cannot make or change laws — the Legislature does that',
  ],
  termLength: '4 years, no term limits',
  seats: 1,
  sources: [
    'https://www.texasattorneygeneral.gov/about-office',
    'https://statutes.capitol.texas.gov/Docs/CN/htm/CN.4.htm',
  ],
  usageNotes: [
    'When a user asks what the Texas AG does, use this description.',
    'If asked about criminal prosecution, clarify that local DAs handle most cases — the AG handles Medicaid fraud, consumer protection, and cases referred to the office.',
  ],
};

export const txLandCommissioner: OfficeReference = {
  id: 'tx_land_commissioner_statewide',
  type: 'role',
  jurisdiction: 'Texas',
  jurisdictionLevel: 'state',
  title: 'Texas Land Commissioner',
  shortDescription:
    'Head of the Texas General Land Office, which manages state-owned lands and mineral rights, funds public education through land revenue, administers veterans\' benefits, and leads coastal disaster recovery.',
  responsibilities: [
    'Manages 13 million acres of state-owned land and mineral rights, generating revenue for the Permanent School Fund',
    'Administers the Permanent School Fund, which provides billions in annual funding for Texas public schools',
    'Oversees Texas Veterans Land Board programs (home loans, land loans, nursing homes)',
    'Leads coastal erosion prevention and disaster recovery programs (including federal HUD grants after hurricanes)',
    'Manages the Alamo as a state historic site',
    'Leases state submerged lands for oil/gas production and wind energy',
  ],
  scopeLimits: [
    'Does not control the electric grid or energy regulation (that is PUC/ERCOT/Railroad Commission)',
    'Does not have general land-use zoning authority — that is local government',
    'Disaster recovery role is primarily for coastal areas; TDEM handles inland emergencies',
  ],
  termLength: '4 years, no term limits',
  seats: 1,
  sources: [
    'https://www.glo.texas.gov/the-glo/about/index.html',
    'https://statutes.capitol.texas.gov/Docs/NR/htm/NR.31.htm',
  ],
  usageNotes: [
    'When a user asks what the Land Commissioner does, emphasize the connection to public school funding through state land revenue.',
    'If asked about hurricane recovery, note that the GLO administers federal disaster recovery funds for coastal Texas.',
    'The Alamo management role often surprises voters — include it if asked about the office.',
  ],
};

export const txComptroller: OfficeReference = {
  id: 'tx_comptroller_statewide',
  type: 'role',
  jurisdiction: 'Texas',
  jurisdictionLevel: 'state',
  title: 'Texas Comptroller of Public Accounts',
  shortDescription:
    'Texas\'s chief financial officer, responsible for collecting state taxes, estimating state revenue, and certifying that the state budget is balanced. Also manages state investments and procurement.',
  responsibilities: [
    'Collects all state taxes (sales tax, franchise tax, motor fuels tax, etc.)',
    'Issues the Biennial Revenue Estimate that determines how much the Legislature can spend',
    'Certifies that the state budget does not exceed projected revenue (Texas has no income tax and requires a balanced budget)',
    'Manages state treasury investments and the Economic Stabilization ("Rainy Day") Fund',
    'Oversees state procurement and contracting',
    'Conducts performance reviews of state agencies',
  ],
  scopeLimits: [
    'Does not set tax rates — the Legislature does that',
    'Revenue estimate constrains legislative spending but does not direct how money is allocated',
    'Does not manage local government finances or property tax collection (that is county tax assessors)',
  ],
  termLength: '4 years, no term limits',
  seats: 1,
  sources: [
    'https://comptroller.texas.gov/about/',
    'https://statutes.capitol.texas.gov/Docs/CN/htm/CN.4.htm',
  ],
  usageNotes: [
    'When a user asks what the Comptroller does, emphasize the revenue estimation power — it effectively sets the ceiling on state spending.',
    'If asked about property taxes, clarify that local entities (county, school district, city) set property tax rates, not the Comptroller.',
  ],
};

// ============================================
// LOCAL OFFICES
// ============================================

export const cityMayor: OfficeReference = {
  id: 'city_mayor_generic',
  type: 'role',
  jurisdiction: 'City (generic)',
  jurisdictionLevel: 'city',
  title: 'Mayor',
  shortDescription:
    'The elected leader of a city government. Powers vary significantly by city charter — some mayors have strong executive authority (strong-mayor systems like Houston, NYC), while others share power with a city manager (council-manager systems like Austin, Phoenix).',
  responsibilities: [
    'Presides over city council meetings and sets the municipal agenda',
    'Proposes the city budget (in strong-mayor cities) or works with the city manager on budget development',
    'Represents the city in intergovernmental relations and public events',
    'Appoints department heads and key city staff (in strong-mayor cities)',
    'Signs or vetoes city ordinances (in cities where the mayor has veto power)',
  ],
  scopeLimits: [
    'Specific powers depend entirely on the city charter — check the particular city',
    'Cannot control state or federal policy',
    'In council-manager cities, the city manager runs day-to-day operations, not the mayor',
  ],
  termLength: 'Varies by city (typically 2 or 4 years)',
  seats: 1,
  sources: [
    'https://www.nlc.org/resource/forms-of-municipal-government/',
  ],
  usageNotes: [
    'When a user asks about a mayor, check whether their city uses strong-mayor or council-manager form — this dramatically affects the role.',
    'Do not assume the mayor has veto power or appointment power without checking the specific city charter.',
  ],
};

export const cityCouncilMember: OfficeReference = {
  id: 'city_council_member_generic',
  type: 'role',
  jurisdiction: 'City (generic)',
  jurisdictionLevel: 'city',
  title: 'City Council Member',
  shortDescription:
    'A member of the city\'s legislative body, responsible for passing local ordinances, approving the city budget, and overseeing city services. Council members may represent a specific district or be elected at-large.',
  responsibilities: [
    'Votes on local ordinances (zoning, building codes, business regulations)',
    'Approves the annual city budget and sets local tax rates (property tax, sales tax where applicable)',
    'Provides oversight of city departments and services (police, fire, parks, utilities)',
    'Approves or rejects major contracts, development agreements, and land-use changes',
    'Responds to constituent concerns within their district',
  ],
  scopeLimits: [
    'Cannot control state or federal policy',
    'Individual council members cannot direct city staff — the full council or city manager does that',
    'Zoning decisions may be limited by state preemption laws',
  ],
  termLength: 'Varies by city (typically 2 or 4 years)',
  seats: 1, // per district; varies
  sources: [
    'https://www.nlc.org/resource/forms-of-municipal-government/',
  ],
  usageNotes: [
    'When a user asks about a city council member, explain that local issues like zoning, policing, and city services are their core domain.',
    'Clarify whether the member represents a district or is at-large if the user asks.',
  ],
};

// ============================================
// LOOKUP AND ACCESS
// ============================================

/** All office references, keyed by ID */
const ALL_REFERENCES: Record<string, CivicReference> = {};

// Register all references
const allRefs: CivicReference[] = [
  // Federal
  usSenateFederal,
  usRepresentativeFederal,
  // Michigan
  miGovernor,
  miStateSenator,
  miStateRepresentative,
  miAttorneyGeneral,
  miSecretaryOfState,
  // Texas
  txGovernor,
  txRailroadCommissioner,
  txAttorneyGeneral,
  txLandCommissioner,
  txComptroller,
  // Local (generic)
  cityMayor,
  cityCouncilMember,
];

for (const ref of allRefs) {
  ALL_REFERENCES[ref.id] = ref;
}

/** Look up a reference by ID */
export function getReferenceById(id: string): CivicReference | null {
  return ALL_REFERENCES[id] || null;
}

/** Get all references */
export function getAllReferences(): CivicReference[] {
  return Object.values(ALL_REFERENCES);
}

/** Get references by jurisdiction level */
export function getReferencesByLevel(level: string): CivicReference[] {
  return Object.values(ALL_REFERENCES).filter(
    (r) => r.jurisdictionLevel === level
  );
}

/**
 * Build an LLM context block for an office reference.
 * Returns a formatted string ready to inject into a system prompt.
 */
export function buildOfficeContextBlock(ref: OfficeReference): string {
  const responsibilities = ref.responsibilities
    .map((r) => `  - ${r}`)
    .join('\n');

  const limits = ref.scopeLimits
    ? ref.scopeLimits.map((l) => `  - ${l}`).join('\n')
    : null;

  const notes = ref.usageNotes.map((n) => `  - ${n}`).join('\n');

  let block = `OFFICE: ${ref.title}
Jurisdiction: ${ref.jurisdiction} (${ref.jurisdictionLevel})
${ref.shortDescription}
${ref.termLength ? `Term: ${ref.termLength}` : ''}

Responsibilities:
${responsibilities}`;

  if (limits) {
    block += `\n\nThis office does NOT:
${limits}`;
  }

  block += `\n\nContext rules:
${notes}`;

  return block;
}

/**
 * Build an LLM context block for a ballot measure reference.
 */
export function buildMeasureContextBlock(ref: MeasureReference): string {
  const provisions = ref.keyProvisions
    .map((p) => `  - ${p}`)
    .join('\n');

  const notes = ref.usageNotes.map((n) => `  - ${n}`).join('\n');

  let block = `BALLOT MEASURE: ${ref.title}
Jurisdiction: ${ref.jurisdiction} (${ref.jurisdictionLevel})
${ref.shortDescription}

Key provisions:
${provisions}`;

  if (ref.fiscalImpact) {
    block += `\n\nFiscal impact: ${ref.fiscalImpact}`;
  }

  block += `\n\nContext rules:
${notes}`;

  return block;
}
