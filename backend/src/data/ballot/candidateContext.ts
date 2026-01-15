/**
 * Candidate Context Data
 *
 * Mock quotes, voting records, speeches, and news for each candidate.
 * Used to show sources for candidate positions and recommendations.
 */

import type { CandidateContext, SourceRef } from '../../types';

// ============================================
// Jane Smith - Governor (Democratic)
// ============================================

export const janeSmithContext: CandidateContext[] = [
  {
    id: 'ctx_js_healthcare_1',
    candidateId: 'cand_gov_jane_smith',
    topicId: ['healthcare'],
    content:
      "Healthcare is a right, not a privilege. My plan will expand Medicaid to cover an additional 500,000 residents and cap prescription drug costs at $35 per month for seniors.",
    type: 'speech',
    date: '2024-09-15',
    sourceUrl: 'https://janesmith2024.com/speeches/healthcare-summit',
  },
  {
    id: 'ctx_js_healthcare_2',
    candidateId: 'cand_gov_jane_smith',
    topicId: ['healthcare'],
    content:
      "When I was in the State Assembly, I voted for SB 1245 which established the first state-run prescription drug purchasing program, saving taxpayers $200 million.",
    type: 'voting_record',
    date: '2022-03-12',
    sourceUrl: 'https://stateassembly.gov/bills/sb1245/vote-record',
  },
  {
    id: 'ctx_js_climate_1',
    candidateId: 'cand_gov_jane_smith',
    topicId: ['climate'],
    content:
      "We need to invest $50 billion in clean energy infrastructure over the next decade. This isn't just about the environment - it's about jobs. My plan will create 100,000 new green jobs in solar, wind, and battery manufacturing.",
    type: 'platform',
    date: '2024-08-01',
    sourceUrl: 'https://janesmith2024.com/platform/climate-energy',
  },
  {
    id: 'ctx_js_climate_2',
    candidateId: 'cand_gov_jane_smith',
    topicId: ['climate'],
    content:
      "In an interview with the Tribune, Smith outlined her aggressive climate timeline: 'We can't wait for the federal government. States have to lead. I'm committed to 80% renewable energy by 2030.'",
    type: 'interview',
    date: '2024-10-02',
    sourceUrl: 'https://statetribune.com/politics/smith-climate-interview-2024',
  },
  {
    id: 'ctx_js_education_1',
    candidateId: 'cand_gov_jane_smith',
    topicId: ['education'],
    content:
      "Our teachers are underpaid and our schools are crumbling. I'm proposing a 20% increase in education funding, with teacher starting salaries raised to $55,000 minimum across the state.",
    type: 'speech',
    date: '2024-08-22',
    sourceUrl: 'https://janesmith2024.com/speeches/teacher-appreciation-rally',
  },
  {
    id: 'ctx_js_education_2',
    candidateId: 'cand_gov_jane_smith',
    topicId: ['education'],
    content:
      "Smith's education plan also includes universal pre-K for all 4-year-olds, funded through corporate tax reform. 'Every child deserves the same start,' she told supporters at the Atlanta rally.",
    type: 'news',
    date: '2024-09-05',
    sourceUrl: 'https://atlantadaily.com/news/smith-education-rally-2024',
  },
  {
    id: 'ctx_js_economy_1',
    candidateId: 'cand_gov_jane_smith',
    topicId: ['economy'],
    content:
      "Smith has consistently supported raising the minimum wage. In 2023, she co-sponsored the Fair Wage Act which proposed a $15/hour state minimum, though it failed in committee.",
    type: 'voting_record',
    date: '2023-05-18',
    sourceUrl: 'https://stateassembly.gov/bills/hb789/sponsors',
  },
];

export const janeSmithSources: SourceRef[] = [
  {
    title: 'Healthcare Summit Speech - September 2024',
    url: 'https://janesmith2024.com/speeches/healthcare-summit',
    content: 'Full transcript of Jane Smith\'s healthcare policy address at the State Healthcare Summit.',
  },
  {
    title: 'SB 1245 Vote Record - State Assembly',
    url: 'https://stateassembly.gov/bills/sb1245/vote-record',
    content: 'Official voting record showing Smith\'s support for prescription drug purchasing program.',
  },
  {
    title: 'Climate & Energy Platform',
    url: 'https://janesmith2024.com/platform/climate-energy',
    content: 'Detailed policy platform outlining $50B clean energy infrastructure investment plan.',
  },
  {
    title: 'State Tribune Interview - Climate Policy',
    url: 'https://statetribune.com/politics/smith-climate-interview-2024',
    content: 'Exclusive interview discussing Smith\'s 80% renewable energy by 2030 commitment.',
  },
  {
    title: 'Education Rally Speech - August 2024',
    url: 'https://janesmith2024.com/speeches/teacher-appreciation-rally',
    content: 'Speech outlining 20% education funding increase and teacher salary proposals.',
  },
];

// ============================================
// John Doe - Governor (Republican)
// ============================================

export const johnDoeContext: CandidateContext[] = [
  {
    id: 'ctx_jd_healthcare_1',
    candidateId: 'cand_gov_john_doe',
    topicId: ['healthcare'],
    content:
      "The answer to healthcare isn't more government control - it's more competition. I'll work to allow insurance to be sold across state lines and expand Health Savings Accounts.",
    type: 'speech',
    date: '2024-09-20',
    sourceUrl: 'https://johndoe2024.com/speeches/healthcare-freedom-rally',
  },
  {
    id: 'ctx_jd_healthcare_2',
    candidateId: 'cand_gov_john_doe',
    topicId: ['healthcare'],
    content:
      "At the Chamber of Commerce debate, Doe criticized his opponent's healthcare plan: 'Universal healthcare sounds nice until you see the $3 billion price tag. I believe in solutions that don't bankrupt our state.'",
    type: 'news',
    date: '2024-10-05',
    sourceUrl: 'https://businessjournal.com/election/chamber-debate-healthcare-2024',
  },
  {
    id: 'ctx_jd_climate_1',
    candidateId: 'cand_gov_john_doe',
    topicId: ['climate'],
    content:
      "We need an all-of-the-above energy strategy. Yes to renewables, but also yes to natural gas and nuclear. Energy independence means not putting all our eggs in one basket.",
    type: 'platform',
    date: '2024-08-15',
    sourceUrl: 'https://johndoe2024.com/platform/energy-independence',
  },
  {
    id: 'ctx_jd_climate_2',
    candidateId: 'cand_gov_john_doe',
    topicId: ['climate'],
    content:
      "In the Senate, Doe voted against SB 890, the Clean Energy Mandate, calling it 'government overreach that would raise utility bills by 40% for working families.'",
    type: 'voting_record',
    date: '2023-11-08',
    sourceUrl: 'https://statesenate.gov/bills/sb890/vote-record',
  },
  {
    id: 'ctx_jd_education_1',
    candidateId: 'cand_gov_john_doe',
    topicId: ['education'],
    content:
      "Parents should have the choice of where to send their kids to school. My education plan includes a $5,000 voucher program for families who want alternatives to failing public schools.",
    type: 'speech',
    date: '2024-09-08',
    sourceUrl: 'https://johndoe2024.com/speeches/school-choice-forum',
  },
  {
    id: 'ctx_jd_education_2',
    candidateId: 'cand_gov_john_doe',
    topicId: ['education'],
    content:
      "Doe co-sponsored the Educational Freedom Act in 2022, which would have created the state's first school voucher program. The bill passed the Senate but stalled in the House.",
    type: 'voting_record',
    date: '2022-06-15',
    sourceUrl: 'https://statesenate.gov/bills/sb567/sponsors',
  },
  {
    id: 'ctx_jd_economy_1',
    candidateId: 'cand_gov_john_doe',
    topicId: ['economy'],
    content:
      "Small businesses are the backbone of our economy. As Governor, I'll cut red tape and reduce the corporate tax rate from 6% to 4% to attract new businesses to our state.",
    type: 'interview',
    date: '2024-09-28',
    sourceUrl: 'https://localnews9.com/politics/doe-economy-interview',
  },
  {
    id: 'ctx_jd_economy_2',
    candidateId: 'cand_gov_john_doe',
    topicId: ['economy'],
    content:
      "Doe has a consistent record of opposing minimum wage increases, arguing they hurt small businesses. 'Let the market determine wages, not politicians,' he said at a recent business roundtable.",
    type: 'news',
    date: '2024-10-10',
    sourceUrl: 'https://stateeconomicreview.com/election/doe-wage-position',
  },
];

export const johnDoeSources: SourceRef[] = [
  {
    title: 'Healthcare Freedom Rally - September 2024',
    url: 'https://johndoe2024.com/speeches/healthcare-freedom-rally',
    content: 'Speech advocating for market-based healthcare solutions and HSA expansion.',
  },
  {
    title: 'Chamber of Commerce Debate Coverage',
    url: 'https://businessjournal.com/election/chamber-debate-healthcare-2024',
    content: 'News coverage of healthcare policy debate between gubernatorial candidates.',
  },
  {
    title: 'Energy Independence Platform',
    url: 'https://johndoe2024.com/platform/energy-independence',
    content: 'Policy document outlining all-of-the-above energy strategy.',
  },
  {
    title: 'SB 890 Vote Record - State Senate',
    url: 'https://statesenate.gov/bills/sb890/vote-record',
    content: 'Official voting record showing Doe\'s opposition to Clean Energy Mandate.',
  },
  {
    title: 'School Choice Forum Speech',
    url: 'https://johndoe2024.com/speeches/school-choice-forum',
    content: 'Speech detailing $5,000 school voucher program proposal.',
  },
];

// ============================================
// Sarah Johnson - Governor (Independent)
// ============================================

export const sarahJohnsonContext: CandidateContext[] = [
  {
    id: 'ctx_sj_healthcare_1',
    candidateId: 'cand_gov_sarah_johnson',
    topicId: ['healthcare'],
    content:
      "Neither side has it right on healthcare. We need a public option for those who want it, while preserving private insurance for those who don't. That's the pragmatic path forward.",
    type: 'speech',
    date: '2024-09-25',
    sourceUrl: 'https://johnsonforgovernor.com/speeches/healthcare-town-hall',
  },
  {
    id: 'ctx_sj_healthcare_2',
    candidateId: 'cand_gov_sarah_johnson',
    topicId: ['healthcare'],
    content:
      "Johnson, a former hospital administrator, brings real-world healthcare experience to the race. 'I've seen what works and what doesn't from the inside,' she told the Medical Association.",
    type: 'news',
    date: '2024-10-01',
    sourceUrl: 'https://healthcaretoday.com/politics/johnson-medical-association',
  },
  {
    id: 'ctx_sj_climate_1',
    candidateId: 'cand_gov_sarah_johnson',
    topicId: ['climate'],
    content:
      "I support a gradual transition to renewable energy - 60% by 2035. Rushing this transition will hurt working families with higher energy bills. We can protect the environment without destroying livelihoods.",
    type: 'platform',
    date: '2024-08-10',
    sourceUrl: 'https://johnsonforgovernor.com/platform/balanced-energy',
  },
  {
    id: 'ctx_sj_climate_2',
    candidateId: 'cand_gov_sarah_johnson',
    topicId: ['climate'],
    content:
      "In her social media response to the Clean Energy Initiative, Johnson wrote: 'Prop 15 has the right goal but the wrong timeline. 2035 is too aggressive. I support 2040 with job retraining programs.'",
    type: 'social_media',
    date: '2024-10-08',
    sourceUrl: 'https://twitter.com/JohnsonForGov/status/1234567890',
  },
  {
    id: 'ctx_sj_education_1',
    candidateId: 'cand_gov_sarah_johnson',
    topicId: ['education'],
    content:
      "We need education reform that includes accountability. More funding is important, but so is measuring outcomes. I'll tie new education spending to performance metrics.",
    type: 'interview',
    date: '2024-09-18',
    sourceUrl: 'https://educationweekly.com/candidates/johnson-accountability-interview',
  },
  {
    id: 'ctx_sj_education_2',
    candidateId: 'cand_gov_sarah_johnson',
    topicId: ['education'],
    content:
      "Johnson's education plan is a hybrid approach: increased public school funding paired with limited charter school expansion in underperforming districts. 'Competition can be healthy when done right,' she said.",
    type: 'news',
    date: '2024-09-22',
    sourceUrl: 'https://statetribune.com/education/johnson-hybrid-education-plan',
  },
  {
    id: 'ctx_sj_economy_1',
    candidateId: 'cand_gov_sarah_johnson',
    topicId: ['economy'],
    content:
      "I support a moderate minimum wage increase to $12.50/hour, indexed to inflation. This balances worker needs with small business concerns. Extremes on either side don't work.",
    type: 'platform',
    date: '2024-08-20',
    sourceUrl: 'https://johnsonforgovernor.com/platform/fair-economy',
  },
  {
    id: 'ctx_sj_housing_1',
    candidateId: 'cand_gov_sarah_johnson',
    topicId: ['housing'],
    content:
      "On Measure A, Johnson has taken a nuanced position: 'I support affordable housing but worry about implementation. We need guardrails to protect existing neighborhoods while building new units.'",
    type: 'interview',
    date: '2024-10-05',
    sourceUrl: 'https://housingpolicy.org/interviews/johnson-measure-a',
  },
];

export const sarahJohnsonSources: SourceRef[] = [
  {
    title: 'Healthcare Town Hall - September 2024',
    url: 'https://johnsonforgovernor.com/speeches/healthcare-town-hall',
    content: 'Town hall speech outlining public option healthcare proposal.',
  },
  {
    title: 'Medical Association Coverage',
    url: 'https://healthcaretoday.com/politics/johnson-medical-association',
    content: 'News coverage of Johnson\'s healthcare experience and policy positions.',
  },
  {
    title: 'Balanced Energy Platform',
    url: 'https://johnsonforgovernor.com/platform/balanced-energy',
    content: 'Policy document on gradual renewable energy transition to 60% by 2035.',
  },
  {
    title: 'Education Accountability Interview',
    url: 'https://educationweekly.com/candidates/johnson-accountability-interview',
    content: 'Interview discussing performance-based education funding approach.',
  },
  {
    title: 'Fair Economy Platform',
    url: 'https://johnsonforgovernor.com/platform/fair-economy',
    content: 'Economic policy including indexed minimum wage proposal.',
  },
];

// ============================================
// Maria Garcia - State Senate District 10 (Democratic)
// ============================================

export const mariaGarciaContext: CandidateContext[] = [
  {
    id: 'ctx_mg_healthcare_1',
    candidateId: 'cand_senate_maria_garcia',
    topicId: ['healthcare'],
    content:
      "Healthcare should be available to everyone in our community, regardless of immigration status. I'll fight to expand state-funded healthcare to cover all residents.",
    type: 'speech',
    date: '2024-09-12',
    sourceUrl: 'https://garciaforsenate.com/speeches/community-health-forum',
  },
  {
    id: 'ctx_mg_healthcare_2',
    candidateId: 'cand_senate_maria_garcia',
    topicId: ['healthcare'],
    content:
      "As a city council member, Garcia led the effort to establish three community health clinics in underserved neighborhoods, providing free preventive care to over 10,000 residents annually.",
    type: 'news',
    date: '2024-08-28',
    sourceUrl: 'https://districtgazette.com/profiles/garcia-health-clinics',
  },
  {
    id: 'ctx_mg_climate_1',
    candidateId: 'cand_senate_maria_garcia',
    topicId: ['climate'],
    content:
      "Climate change is an emergency, not a future problem. I support fast-tracking renewable energy projects and will vote yes on Prop 15. We owe it to the next generation.",
    type: 'platform',
    date: '2024-08-05',
    sourceUrl: 'https://garciaforsenate.com/platform/climate-action',
  },
  {
    id: 'ctx_mg_climate_2',
    candidateId: 'cand_senate_maria_garcia',
    topicId: ['climate'],
    content:
      "Garcia was arrested at a climate protest in 2019, an experience she calls formative: 'Sometimes you have to put your body on the line for what you believe in. That's the kind of senator I'll be.'",
    type: 'interview',
    date: '2024-09-30',
    sourceUrl: 'https://progressivenews.com/profiles/garcia-climate-activism',
  },
  {
    id: 'ctx_mg_economy_1',
    candidateId: 'cand_senate_maria_garcia',
    topicId: ['economy'],
    content:
      "A $20 minimum wage isn't radical - it's what's needed for families to survive in this district. Workers haven't had a raise in years while corporate profits soar.",
    type: 'speech',
    date: '2024-09-05',
    sourceUrl: 'https://garciaforsenate.com/speeches/labor-day-rally',
  },
  {
    id: 'ctx_mg_economy_2',
    candidateId: 'cand_senate_maria_garcia',
    topicId: ['economy'],
    content:
      "On the city council, Garcia voted to raise the municipal minimum wage to $15/hour in 2022, making it the highest in the region. She's now pushing for statewide action.",
    type: 'voting_record',
    date: '2022-09-15',
    sourceUrl: 'https://citycouncil.gov/ordinances/2022-45/vote-record',
  },
  {
    id: 'ctx_mg_housing_1',
    candidateId: 'cand_senate_maria_garcia',
    topicId: ['housing'],
    content:
      "I'm a strong yes on Measure A. We have a housing crisis and we can't let NIMBY attitudes prevent solutions. Young families deserve a chance to live in our community.",
    type: 'social_media',
    date: '2024-10-03',
    sourceUrl: 'https://twitter.com/GarciaForSenate/status/9876543210',
  },
  {
    id: 'ctx_mg_housing_2',
    candidateId: 'cand_senate_maria_garcia',
    topicId: ['housing'],
    content:
      "Garcia also supports rent control measures: 'We need to protect current residents while building more housing. Both pieces are essential - you can't have one without the other.'",
    type: 'interview',
    date: '2024-09-20',
    sourceUrl: 'https://housingadvocate.org/interviews/garcia-rent-control',
  },
];

export const mariaGarciaSources: SourceRef[] = [
  {
    title: 'Community Health Forum Speech',
    url: 'https://garciaforsenate.com/speeches/community-health-forum',
    content: 'Speech on expanding healthcare access regardless of immigration status.',
  },
  {
    title: 'District Gazette Profile - Health Clinics',
    url: 'https://districtgazette.com/profiles/garcia-health-clinics',
    content: 'Profile of Garcia\'s work establishing community health clinics.',
  },
  {
    title: 'Climate Action Platform',
    url: 'https://garciaforsenate.com/platform/climate-action',
    content: 'Policy platform supporting aggressive renewable energy timeline.',
  },
  {
    title: 'Labor Day Rally Speech',
    url: 'https://garciaforsenate.com/speeches/labor-day-rally',
    content: 'Speech advocating for $20/hour minimum wage.',
  },
  {
    title: 'City Council Minimum Wage Vote',
    url: 'https://citycouncil.gov/ordinances/2022-45/vote-record',
    content: 'Official record of Garcia\'s vote for $15/hour municipal minimum wage.',
  },
];

// ============================================
// Robert Chen - State Senate District 10 (Republican)
// ============================================

export const robertChenContext: CandidateContext[] = [
  {
    id: 'ctx_rc_healthcare_1',
    candidateId: 'cand_senate_robert_chen',
    topicId: ['healthcare'],
    content:
      "Healthcare should be affordable, but the solution isn't government takeover. I support expanding telehealth access and reducing regulations that drive up costs for providers.",
    type: 'platform',
    date: '2024-08-12',
    sourceUrl: 'https://chenforsenate.com/platform/healthcare-affordability',
  },
  {
    id: 'ctx_rc_healthcare_2',
    candidateId: 'cand_senate_robert_chen',
    topicId: ['healthcare'],
    content:
      "Chen, a small business owner who provides health insurance to his 50 employees, speaks from experience: 'I know what insurance costs. Government mandates just make it more expensive for everyone.'",
    type: 'interview',
    date: '2024-09-15',
    sourceUrl: 'https://smallbizweekly.com/profiles/chen-healthcare-employer',
  },
  {
    id: 'ctx_rc_climate_1',
    candidateId: 'cand_senate_robert_chen',
    topicId: ['climate'],
    content:
      "I support clean energy, but not at the cost of reliability. We need natural gas as a bridge fuel while renewables mature. Prop 15's timeline is reckless and will cause blackouts.",
    type: 'speech',
    date: '2024-09-22',
    sourceUrl: 'https://chenforsenate.com/speeches/energy-policy-forum',
  },
  {
    id: 'ctx_rc_climate_2',
    candidateId: 'cand_senate_robert_chen',
    topicId: ['climate'],
    content:
      "At the business owners' roundtable, Chen warned about Prop 15: 'My manufacturing friends tell me their energy costs would triple. That means layoffs or moving out of state. Is that what we want?'",
    type: 'news',
    date: '2024-10-02',
    sourceUrl: 'https://businesschronicle.com/election/chen-prop15-warning',
  },
  {
    id: 'ctx_rc_economy_1',
    candidateId: 'cand_senate_robert_chen',
    topicId: ['economy'],
    content:
      "Mandated wage increases kill small businesses. I've had to cut hours when minimum wage went up. Let businesses and workers negotiate wages freely.",
    type: 'speech',
    date: '2024-09-10',
    sourceUrl: 'https://chenforsenate.com/speeches/small-business-saturday',
  },
  {
    id: 'ctx_rc_economy_2',
    candidateId: 'cand_senate_robert_chen',
    topicId: ['economy'],
    content:
      "Chen's economic plan focuses on regulatory relief: 'For every new regulation, we should eliminate two. That's how you create a business-friendly environment that creates jobs.'",
    type: 'platform',
    date: '2024-08-20',
    sourceUrl: 'https://chenforsenate.com/platform/regulatory-reform',
  },
  {
    id: 'ctx_rc_housing_1',
    candidateId: 'cand_senate_robert_chen',
    topicId: ['housing'],
    content:
      "I'm voting no on Measure A. Property owners have rights too. You can't just rezone neighborhoods without their consent. There are better ways to build affordable housing.",
    type: 'interview',
    date: '2024-10-01',
    sourceUrl: 'https://propertyowners.org/interviews/chen-measure-a',
  },
  {
    id: 'ctx_rc_housing_2',
    candidateId: 'cand_senate_robert_chen',
    topicId: ['housing'],
    content:
      "Chen's alternative housing proposal focuses on streamlining permits for builders: 'The problem isn't zoning - it's that it takes two years to get a permit. Cut that to six months and watch housing supply increase.'",
    type: 'news',
    date: '2024-09-28',
    sourceUrl: 'https://realestatereview.com/election/chen-housing-alternative',
  },
];

export const robertChenSources: SourceRef[] = [
  {
    title: 'Healthcare Affordability Platform',
    url: 'https://chenforsenate.com/platform/healthcare-affordability',
    content: 'Policy document on market-based healthcare solutions and telehealth expansion.',
  },
  {
    title: 'Small Biz Weekly Profile',
    url: 'https://smallbizweekly.com/profiles/chen-healthcare-employer',
    content: 'Profile of Chen as a small business owner providing employee health insurance.',
  },
  {
    title: 'Energy Policy Forum Speech',
    url: 'https://chenforsenate.com/speeches/energy-policy-forum',
    content: 'Speech on balanced energy policy and concerns about Prop 15 timeline.',
  },
  {
    title: 'Small Business Saturday Speech',
    url: 'https://chenforsenate.com/speeches/small-business-saturday',
    content: 'Speech opposing mandated minimum wage increases.',
  },
  {
    title: 'Regulatory Reform Platform',
    url: 'https://chenforsenate.com/platform/regulatory-reform',
    content: 'Economic policy focused on reducing business regulations.',
  },
];

// ============================================
// Aggregated Exports
// ============================================

export const allCandidateContext: CandidateContext[] = [
  ...janeSmithContext,
  ...johnDoeContext,
  ...sarahJohnsonContext,
  ...mariaGarciaContext,
  ...robertChenContext,
];

export const candidateSources: Record<string, SourceRef[]> = {
  cand_gov_jane_smith: janeSmithSources,
  cand_gov_john_doe: johnDoeSources,
  cand_gov_sarah_johnson: sarahJohnsonSources,
  cand_senate_maria_garcia: mariaGarciaSources,
  cand_senate_robert_chen: robertChenSources,
};

/**
 * Get all context records for a candidate
 */
export function getContextByCandidateId(candidateId: string): CandidateContext[] {
  return allCandidateContext.filter((ctx) => ctx.candidateId === candidateId);
}

/**
 * Get context records for a candidate filtered by topic
 */
export function getContextByCandidateAndTopic(
  candidateId: string,
  topicId: string
): CandidateContext[] {
  return allCandidateContext.filter(
    (ctx) => ctx.candidateId === candidateId && ctx.topicId.includes(topicId as any)
  );
}

/**
 * Get source references for a candidate
 */
export function getSourcesByCandidateId(candidateId: string): SourceRef[] {
  return candidateSources[candidateId] || [];
}

/**
 * Get all context records for a given topic across all candidates
 */
export function getContextByTopic(topicId: string): CandidateContext[] {
  return allCandidateContext.filter((ctx) => ctx.topicId.includes(topicId as any));
}
