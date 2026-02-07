/**
 * Candidate Context Data
 *
 * Mock quotes, voting records, speeches, and news for each candidate.
 * Used to show sources for candidate positions and recommendations.
 * Data aligned with frontend mock data.
 */

import type { CandidateContext, SourceRef } from '../../types';

// ============================================
// Elena Martinez - Mayor (Democratic, Incumbent)
// ============================================

export const elenaMartinezContext: CandidateContext[] = [
  {
    id: 'ctx_em_housing_1',
    candidateId: 'martinez',
    topicId: ['housing'],
    content:
      "Housing is a human right. As Mayor, I've championed affordable housing initiatives that have produced 5,000 new units in my first term. We need to do more, and that means supporting measures like Prop 1.",
    type: 'speech',
    date: '2024-09-15',
    sourceUrl: 'https://martinezformayor.com/speeches/housing-summit',
  },
  {
    id: 'ctx_em_housing_2',
    candidateId: 'martinez',
    topicId: ['housing'],
    content:
      "I support rent stabilization because families shouldn't live in fear of being priced out of their neighborhoods. Measure B provides reasonable protections while still allowing landlords fair returns.",
    type: 'interview',
    date: '2024-10-02',
    sourceUrl: 'https://citygazette.com/politics/martinez-rent-interview',
  },
  {
    id: 'ctx_em_climate_1',
    candidateId: 'martinez',
    topicId: ['climate'],
    content:
      "Climate change is the defining challenge of our time. I'm proud to have led our city's transition to 50% renewable energy, and I'll vote yes on Prop 3 to accelerate our progress.",
    type: 'platform',
    date: '2024-08-01',
    sourceUrl: 'https://martinezformayor.com/platform/climate',
  },
  {
    id: 'ctx_em_transit_1',
    candidateId: 'martinez',
    topicId: ['economy'],
    content:
      "Transit expansion is an investment in our future. Measure A will reduce traffic, cut emissions, and make our city more accessible to everyone. The small tax increase is worth it.",
    type: 'speech',
    date: '2024-09-20',
    sourceUrl: 'https://martinezformayor.com/speeches/transit-rally',
  },
  {
    id: 'ctx_em_police_1',
    candidateId: 'martinez',
    topicId: ['economy'],
    content:
      "Public safety requires trust between police and communities. I support civilian oversight and investing in mental health response teams alongside traditional policing. Measure C takes the wrong approach.",
    type: 'interview',
    date: '2024-10-05',
    sourceUrl: 'https://localnews.com/martinez-public-safety-interview',
  },
];

export const elenaMartinezSources: SourceRef[] = [
  {
    title: 'Housing Summit Speech - September 2024',
    url: 'https://martinezformayor.com/speeches/housing-summit',
    content: 'Full transcript of Martinez\'s affordable housing policy address.',
  },
  {
    title: 'Climate Platform',
    url: 'https://martinezformayor.com/platform/climate',
    content: 'Policy document on climate action and renewable energy transition.',
  },
  {
    title: 'Transit Rally Speech',
    url: 'https://martinezformayor.com/speeches/transit-rally',
    content: 'Speech supporting Measure A transit expansion.',
  },
];

// ============================================
// David Thompson - Mayor (Republican, Challenger)
// ============================================

export const davidThompsonContext: CandidateContext[] = [
  {
    id: 'ctx_dt_economy_1',
    candidateId: 'thompson',
    topicId: ['economy'],
    content:
      "Our city is facing a fiscal crisis, and the answer isn't more taxes. I'll cut wasteful spending, streamline city services, and let businesses create jobs without government interference.",
    type: 'speech',
    date: '2024-09-18',
    sourceUrl: 'https://thompsonformayor.com/speeches/fiscal-responsibility',
  },
  {
    id: 'ctx_dt_housing_1',
    candidateId: 'thompson',
    topicId: ['housing'],
    content:
      "Rent control has failed everywhere it's been tried. Instead of Measure B, we should cut regulations that make it expensive to build. More supply, not price controls, is the answer.",
    type: 'interview',
    date: '2024-09-25',
    sourceUrl: 'https://businessweekly.com/thompson-housing-interview',
  },
  {
    id: 'ctx_dt_police_1',
    candidateId: 'thompson',
    topicId: ['economy'],
    content:
      "Public safety is job one for any mayor. I strongly support Measure C. Our police are understaffed and crime is rising. We need more officers on the street, not more bureaucratic oversight.",
    type: 'speech',
    date: '2024-10-01',
    sourceUrl: 'https://thompsonformayor.com/speeches/public-safety-forum',
  },
  {
    id: 'ctx_dt_climate_1',
    candidateId: 'thompson',
    topicId: ['climate'],
    content:
      "Prop 3's timeline is unrealistic and will spike energy costs for families and businesses. I support clean energy, but we need a gradual transition that doesn't destroy our economy.",
    type: 'platform',
    date: '2024-08-15',
    sourceUrl: 'https://thompsonformayor.com/platform/energy',
  },
  {
    id: 'ctx_dt_transit_1',
    candidateId: 'thompson',
    topicId: ['economy'],
    content:
      "Measure A is another tax increase we can't afford. Before asking taxpayers for more money, let's see if the transit authority can manage what they already have. I'm voting no.",
    type: 'social_media',
    date: '2024-10-03',
    sourceUrl: 'https://twitter.com/ThompsonForMayor/status/1234567890',
  },
];

export const davidThompsonSources: SourceRef[] = [
  {
    title: 'Fiscal Responsibility Speech',
    url: 'https://thompsonformayor.com/speeches/fiscal-responsibility',
    content: 'Speech on cutting wasteful spending and reducing taxes.',
  },
  {
    title: 'Public Safety Forum Speech',
    url: 'https://thompsonformayor.com/speeches/public-safety-forum',
    content: 'Speech supporting increased police funding.',
  },
  {
    title: 'Energy Platform',
    url: 'https://thompsonformayor.com/platform/energy',
    content: 'Policy document on gradual energy transition.',
  },
];

// ============================================
// Priya Patel - Mayor (Independent, Challenger)
// ============================================

export const priyaPatelContext: CandidateContext[] = [
  {
    id: 'ctx_pp_housing_1',
    candidateId: 'patel',
    topicId: ['housing'],
    content:
      "We need a both/and approach to housing: build more at all price points AND protect existing tenants. I support Prop 1 but have concerns about Measure B's implementation.",
    type: 'interview',
    date: '2024-09-20',
    sourceUrl: 'https://patelformayor.com/interviews/housing-policy',
  },
  {
    id: 'ctx_pp_housing_2',
    candidateId: 'patel',
    topicId: ['housing'],
    content:
      "As a former planning commissioner, I've seen how NIMBY attitudes block desperately needed housing. We need to build everywhere - in wealthy neighborhoods and working-class ones alike.",
    type: 'speech',
    date: '2024-09-28',
    sourceUrl: 'https://patelformayor.com/speeches/housing-forum',
  },
  {
    id: 'ctx_pp_climate_1',
    candidateId: 'patel',
    topicId: ['climate'],
    content:
      "I support climate action, but Prop 3's 2035 deadline is aggressive. I'd prefer 2040 with a clearer transition plan. Still, I'll likely vote yes because we need to move forward.",
    type: 'interview',
    date: '2024-10-02',
    sourceUrl: 'https://greencityjournal.com/patel-climate-interview',
  },
  {
    id: 'ctx_pp_police_1',
    candidateId: 'patel',
    topicId: ['economy'],
    content:
      "Public safety isn't just about police numbers. I support a balanced approach: some new officers, yes, but also investment in mental health response and community programs. Measure C is too one-sided.",
    type: 'platform',
    date: '2024-08-20',
    sourceUrl: 'https://patelformayor.com/platform/public-safety',
  },
  {
    id: 'ctx_pp_economy_1',
    candidateId: 'patel',
    topicId: ['economy'],
    content:
      "Neither party has it right on the economy. We need targeted investments in infrastructure and education, while also being fiscally responsible. No blank checks, but no austerity either.",
    type: 'speech',
    date: '2024-09-15',
    sourceUrl: 'https://patelformayor.com/speeches/economic-vision',
  },
];

export const priyaPatelSources: SourceRef[] = [
  {
    title: 'Housing Policy Interview',
    url: 'https://patelformayor.com/interviews/housing-policy',
    content: 'Interview on housing policy and building more at all price points.',
  },
  {
    title: 'Public Safety Platform',
    url: 'https://patelformayor.com/platform/public-safety',
    content: 'Policy document on balanced approach to public safety.',
  },
  {
    title: 'Economic Vision Speech',
    url: 'https://patelformayor.com/speeches/economic-vision',
    content: 'Speech on pragmatic economic policy.',
  },
];

// ============================================
// Kevin Nguyen - City Council D5 (Democratic, Challenger)
// ============================================

export const kevinNguyenContext: CandidateContext[] = [
  {
    id: 'ctx_kn_housing_1',
    candidateId: 'nguyen',
    topicId: ['housing'],
    content:
      "We're in a housing emergency and the only solution is to build, build, build. I support upzoning, streamlined permitting, and every measure that adds housing units to our city.",
    type: 'speech',
    date: '2024-09-12',
    sourceUrl: 'https://nguyenford5.com/speeches/housing-crisis',
  },
  {
    id: 'ctx_kn_housing_2',
    candidateId: 'nguyen',
    topicId: ['housing'],
    content:
      "I'm a YIMBY and proud of it. When NIMBYs block housing, they're saying their property values matter more than families who need homes. That's wrong, and I'll fight it on the council.",
    type: 'interview',
    date: '2024-09-25',
    sourceUrl: 'https://yimbyaction.org/interviews/nguyen-d5',
  },
  {
    id: 'ctx_kn_economy_1',
    candidateId: 'nguyen',
    topicId: ['economy'],
    content:
      "Smart public investment creates the conditions for private sector growth. I support infrastructure spending that makes our district more attractive to businesses and residents.",
    type: 'platform',
    date: '2024-08-15',
    sourceUrl: 'https://nguyenford5.com/platform/economy',
  },
];

export const kevinNguyenSources: SourceRef[] = [
  {
    title: 'Housing Crisis Speech',
    url: 'https://nguyenford5.com/speeches/housing-crisis',
    content: 'Speech on housing emergency and need for more building.',
  },
  {
    title: 'YIMBY Action Interview',
    url: 'https://yimbyaction.org/interviews/nguyen-d5',
    content: 'Interview on pro-housing positions.',
  },
];

// ============================================
// Sarah O'Connor - City Council D5 (Democratic, Incumbent)
// ============================================

export const sarahOconnorContext: CandidateContext[] = [
  {
    id: 'ctx_so_housing_1',
    candidateId: 'oconnor',
    topicId: ['housing'],
    content:
      "Rent stabilization saved my constituent Maria from losing her home of 20 years. That's why I wrote Measure B and why I'll keep fighting for tenant protections on the council.",
    type: 'speech',
    date: '2024-09-18',
    sourceUrl: 'https://oconnorford5.com/speeches/tenant-rally',
  },
  {
    id: 'ctx_so_housing_2',
    candidateId: 'oconnor',
    topicId: ['housing'],
    content:
      "Building more market-rate housing won't help the families I represent. We need community land trusts, social housing, and strong rent protections. That's real affordable housing.",
    type: 'interview',
    date: '2024-10-01',
    sourceUrl: 'https://tenantvoice.org/interviews/oconnor-housing',
  },
  {
    id: 'ctx_so_police_1',
    candidateId: 'oconnor',
    topicId: ['economy'],
    content:
      "I've fought for civilian oversight of police because accountability matters. Measure C would expand a department that hasn't earned the community's trust. We need reform before expansion.",
    type: 'speech',
    date: '2024-09-28',
    sourceUrl: 'https://oconnorford5.com/speeches/police-accountability',
  },
  {
    id: 'ctx_so_economy_1',
    candidateId: 'oconnor',
    topicId: ['economy'],
    content:
      "Public investment in social services is an investment in our community. I support the transit expansion in Measure A and oppose tax cuts that would gut essential services.",
    type: 'platform',
    date: '2024-08-10',
    sourceUrl: 'https://oconnorford5.com/platform/economy',
  },
];

export const sarahOconnorSources: SourceRef[] = [
  {
    title: 'Tenant Rally Speech',
    url: 'https://oconnorford5.com/speeches/tenant-rally',
    content: 'Speech on rent stabilization and tenant protections.',
  },
  {
    title: 'Police Accountability Speech',
    url: 'https://oconnorford5.com/speeches/police-accountability',
    content: 'Speech on civilian oversight and police reform.',
  },
];

// ============================================
// Michael Brooks - City Council D5 (Republican, Challenger)
// ============================================

export const michaelBrooksContext: CandidateContext[] = [
  {
    id: 'ctx_mb_housing_1',
    candidateId: 'brooks',
    topicId: ['housing'],
    content:
      "Our neighborhoods have character that's worth protecting. I oppose upzoning that would turn single-family areas into apartment blocks. There are better places to build density.",
    type: 'speech',
    date: '2024-09-15',
    sourceUrl: 'https://brooksford5.com/speeches/neighborhood-forum',
  },
  {
    id: 'ctx_mb_housing_2',
    candidateId: 'brooks',
    topicId: ['housing'],
    content:
      "Rent control is a disaster policy that reduces housing supply and quality. Measure B will make our housing shortage worse, not better. I'm strongly opposed.",
    type: 'interview',
    date: '2024-09-28',
    sourceUrl: 'https://propertyowners.org/interviews/brooks-rent-control',
  },
  {
    id: 'ctx_mb_police_1',
    candidateId: 'brooks',
    topicId: ['economy'],
    content:
      "Crime is up and residents don't feel safe. I strongly support Measure C because our police need the resources to do their jobs. Defunding experiments have failed.",
    type: 'speech',
    date: '2024-10-02',
    sourceUrl: 'https://brooksford5.com/speeches/public-safety-town-hall',
  },
  {
    id: 'ctx_mb_economy_1',
    candidateId: 'brooks',
    topicId: ['economy'],
    content:
      "The city spends too much on programs that don't work. I'll vote against new taxes like Measure A until we've shown we can manage existing funds responsibly.",
    type: 'platform',
    date: '2024-08-20',
    sourceUrl: 'https://brooksford5.com/platform/fiscal-policy',
  },
];

export const michaelBrooksSources: SourceRef[] = [
  {
    title: 'Neighborhood Forum Speech',
    url: 'https://brooksford5.com/speeches/neighborhood-forum',
    content: 'Speech on neighborhood preservation and opposing upzoning.',
  },
  {
    title: 'Public Safety Town Hall',
    url: 'https://brooksford5.com/speeches/public-safety-town-hall',
    content: 'Speech supporting increased police funding.',
  },
];

// ============================================
// Aggregated Exports
// ============================================

export const allCandidateContext: CandidateContext[] = [
  ...elenaMartinezContext,
  ...davidThompsonContext,
  ...priyaPatelContext,
  ...kevinNguyenContext,
  ...sarahOconnorContext,
  ...michaelBrooksContext,
];

export const candidateSources: Record<string, SourceRef[]> = {
  martinez: elenaMartinezSources,
  thompson: davidThompsonSources,
  patel: priyaPatelSources,
  nguyen: kevinNguyenSources,
  oconnor: sarahOconnorSources,
  brooks: michaelBrooksSources,
};

// Legacy exports for backwards compatibility (empty arrays)
export const janeSmithContext: CandidateContext[] = [];
export const janeSmithSources: SourceRef[] = [];
export const johnDoeContext: CandidateContext[] = [];
export const johnDoeSources: SourceRef[] = [];
export const sarahJohnsonContext: CandidateContext[] = [];
export const sarahJohnsonSources: SourceRef[] = [];
export const mariaGarciaContext: CandidateContext[] = [];
export const mariaGarciaSources: SourceRef[] = [];
export const robertChenContext: CandidateContext[] = [];
export const robertChenSources: SourceRef[] = [];

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
