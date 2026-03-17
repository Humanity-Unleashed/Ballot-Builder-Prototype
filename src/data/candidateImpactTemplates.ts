/**
 * Candidate Household Impact Templates
 *
 * Each template connects a candidate's axis score to a user's demographic
 * profile to generate personalized "how this could affect you" insights.
 *
 * Every claim includes a source attribution and URL.
 * Headlines may include {name} (candidate name) and {householdSize} placeholders.
 */

import type { DemographicProfile } from '@/stores/demographicStore';

export interface CandidateImpactTemplate {
  axisId: string;
  /** Candidate score range that triggers this template [min, max] inclusive */
  scoreRange: [number, number];
  field: keyof DemographicProfile;
  matchValues: string[];
  effect: 'benefit' | 'concern' | 'mixed' | 'context';
  headline: string;
  detail?: string;
  /** Source attribution (e.g., "Kaiser Family Foundation, 2023") */
  source: string;
  /** URL to the source */
  sourceUrl: string;
}

export const candidateImpactTemplates: CandidateImpactTemplate[] = [

  // ════════════════════════════════════════════
  // HEALTHCARE: coverage_model (0 = universal/single-payer, 10 = market-based)
  // ════════════════════════════════════════════

  // Pro-universal candidates (score 0-3) + uninsured user
  {
    axisId: 'health_coverage_model',
    scoreRange: [0, 3],
    field: 'healthInsurance',
    matchValues: ['uninsured'],
    effect: 'benefit',
    headline: '{name} supports expanding public health coverage — Medicaid expansion cut the low-income uninsured rate from 35% to 15% in expansion states',
    detail: '70% of uninsured adults skip necessary care due to cost; non-expansion states have nearly double the uninsured rate',
    source: 'Kaiser Family Foundation, 5 Key Facts About Medicaid Expansion, 2024',
    sourceUrl: 'https://www.kff.org/medicaid/5-key-facts-about-medicaid-expansion/',
  },
  // Pro-universal candidates (score 0-3) + Medicaid user
  {
    axisId: 'health_coverage_model',
    scoreRange: [0, 3],
    field: 'healthInsurance',
    matchValues: ['medicaid'],
    effect: 'benefit',
    headline: '{name} supports strengthening public coverage programs like the Medicaid you rely on',
    detail: 'Work requirements would cause 4.6-5.2 million expansion adults to lose coverage, even though 9 in 10 are already working, caregiving, or have health issues',
    source: 'Urban Institute, Medicaid Work Requirement Analysis, 2025',
    sourceUrl: 'https://www.urban.org/research/publication/assessing-potential-coverage-losses-among-medicaid-expansion-enrollees-under',
  },
  // Pro-universal candidates + dependents
  {
    axisId: 'health_coverage_model',
    scoreRange: [0, 3],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'benefit',
    headline: "{name} supports expanding children's coverage — the children's uninsured rate rose to 6.0% in 2024, the highest in a decade",
    detail: "Children are the only age group to have lost health coverage in recent Census data — an 18% increase since 2022",
    source: 'Georgetown University Center for Children and Families, 2025',
    sourceUrl: 'https://ccf.georgetown.edu/2025/09/12/u-s-and-state-by-state-child-health-coverage-trends/',
  },
  // Market-based candidates (score 7-10) + uninsured user
  {
    axisId: 'health_coverage_model',
    scoreRange: [7, 10],
    field: 'healthInsurance',
    matchValues: ['uninsured'],
    effect: 'concern',
    headline: '{name} favors market-based coverage — without subsidies, average marketplace premiums are $456/month',
    detail: 'Without ACA subsidies, the average unsubsidized premium for an individual was $456/month in 2023',
    source: 'Kaiser Family Foundation, Marketplace Average Premiums, 2023',
    sourceUrl: 'https://www.kff.org/health-reform/state-indicator/marketplace-average-benchmark-premiums/',
  },
  // Market-based candidates + Medicaid user
  {
    axisId: 'health_coverage_model',
    scoreRange: [7, 10],
    field: 'healthInsurance',
    matchValues: ['medicaid'],
    effect: 'concern',
    headline: '{name} favors reducing public coverage — 93 million Americans currently depend on Medicaid/CHIP',
    source: 'Centers for Medicare & Medicaid Services, Enrollment Data, 2024',
    sourceUrl: 'https://www.medicaid.gov/medicaid/program-information/medicaid-and-chip-enrollment-data/report-highlights/index.html',
  },
  // Market-based candidates + elderly on Medicare
  {
    axisId: 'health_coverage_model',
    scoreRange: [7, 10],
    field: 'ageRange',
    matchValues: ['65_plus'],
    effect: 'concern',
    headline: '{name} favors market competition in healthcare — this approach may affect Medicare benefits for seniors',
    detail: 'Medicare covers 66.7 million Americans; premium support proposals could shift costs to enrollees',
    source: 'CMS, Medicare Enrollment Dashboard, 2024',
    sourceUrl: 'https://data.cms.gov/summary-statistics-on-beneficiary-enrollment/medicare-and-medicaid-reports/cms-program-statistics-medicare-total-enrollment',
  },

  // ════════════════════════════════════════════
  // HEALTHCARE: cost_control (0 = govt price controls, 10 = market competition)
  // ════════════════════════════════════════════

  // Price control candidates + elderly
  {
    axisId: 'health_cost_control',
    scoreRange: [0, 3],
    field: 'ageRange',
    matchValues: ['65_plus'],
    effect: 'benefit',
    headline: '{name} supports drug price controls — nearly 1 in 4 adults 65+ have difficulty affording prescriptions',
    detail: "The IRA's $2,000 Part D cap will help an estimated 11 million enrollees — but only 25% of seniors know about it",
    source: 'Kaiser Family Foundation, Health Tracking Poll, September 2024',
    sourceUrl: 'https://www.kff.org/medicare/kff-health-tracking-poll-september-2024-support-for-reducing-prescription-drug-prices-remains-high/',
  },
  // Price control candidates + low income
  {
    axisId: 'health_cost_control',
    scoreRange: [0, 3],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'benefit',
    headline: '{name} supports government price controls that could lower your healthcare costs',
    detail: '57% of underinsured adults avoided care due to cost; nearly 1 in 4 working-age adults with coverage are underinsured',
    source: 'Commonwealth Fund, 2024 Biennial Health Insurance Survey',
    sourceUrl: 'https://www.commonwealthfund.org/press-release/2024/new-survey-nearly-1-4-adults-health-coverage-struggle-high-out-pocket-costs-and',
  },

  // ════════════════════════════════════════════
  // ECONOMIC: safety_net_breadth (0 = broader, 10 = conditional)
  // ════════════════════════════════════════════

  // Broader safety net candidates + low income
  {
    axisId: 'econ_safetynet',
    scoreRange: [0, 3],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'benefit',
    headline: '{name} supports expanding the safety net — SNAP alone keeps 3.4 million people above the poverty line',
    detail: 'The average SNAP benefit is $6.20/person/day; expansion proposals would increase this',
    source: 'USDA, SNAP Data Tables, 2024',
    sourceUrl: 'https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap',
  },
  // Broader safety net + dependents
  {
    axisId: 'econ_safetynet',
    scoreRange: [0, 3],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'benefit',
    headline: '{name} supports expanding programs — safety net programs lift approximately half of otherwise-poor children out of poverty',
    detail: 'SNAP alone lifted 1.3 million children out of poverty; the expanded Child Tax Credit (now expired) cut child poverty by nearly half',
    source: 'Center on Budget and Policy Priorities, 2024',
    sourceUrl: 'https://www.cbpp.org/research/poverty-and-inequality/economic-security-programs-cut-poverty-nearly-in-half-over-last-50',
  },
  // Broader safety net + unemployed
  {
    axisId: 'econ_safetynet',
    scoreRange: [0, 3],
    field: 'employmentType',
    matchValues: ['unemployed'],
    effect: 'benefit',
    headline: '{name} supports strengthening unemployment insurance — benefits currently replace only ~38% of prior wages on average',
    source: 'U.S. Department of Labor, Unemployment Insurance Data, 2024',
    sourceUrl: 'https://oui.doleta.gov/unemploy/data_summary/DataSum.asp',
  },
  // Conditional safety net (score 7-10) + low income
  {
    axisId: 'econ_safetynet',
    scoreRange: [7, 10],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'concern',
    headline: '{name} supports adding work requirements for safety net programs — studies show these cause coverage loss without increasing employment',
    detail: 'Arkansas Medicaid work requirements: 18,000 lost coverage in 10 months with no measurable employment gains',
    source: 'New England Journal of Medicine, 2019',
    sourceUrl: 'https://www.nejm.org/doi/full/10.1056/NEJMsr1901772',
  },
  // Conditional safety net + dependents + low income
  {
    axisId: 'econ_safetynet',
    scoreRange: [7, 10],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'concern',
    headline: '{name} supports tightening eligibility — the Child Tax Credit expansion that expired in 2022 had cut child poverty by 46%',
    source: 'U.S. Census Bureau, Income and Poverty Report, 2022',
    sourceUrl: 'https://www.census.gov/library/publications/2022/demo/p60-277.html',
  },

  // ════════════════════════════════════════════
  // ECONOMIC: school_choice (0 = public schools, 10 = school choice)
  // ════════════════════════════════════════════

  // Pro-choice candidates + dependents
  {
    axisId: 'econ_school_choice',
    scoreRange: [7, 10],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'benefit',
    headline: '{name} supports school vouchers — your household of {householdSize} could receive funds for private or alternative schooling',
    detail: 'Average state voucher programs provide $5,000-$8,000 per child; average private elementary tuition is $12,350',
    source: 'National Center for Education Statistics, Private School Tuition, 2021-22',
    sourceUrl: 'https://nces.ed.gov/programs/digest/d22/tables/dt22_205.50.asp',
  },
  // Pro-choice + low income + dependents
  {
    axisId: 'econ_school_choice',
    scoreRange: [7, 10],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'mixed',
    headline: "{name} supports school choice, but vouchers often don't cover full private school costs for low-income families",
    detail: 'Average voucher is ~$4,600/year vs. ~$12,350 private tuition; academic outcomes are mixed and depend heavily on program design',
    source: 'Education Commission of the States, Private School Choice: Vouchers, 2024',
    sourceUrl: 'https://reports.ecs.org/comparisons/private-school-choice-vouchers-2024',
  },
  // Public school candidates + dependents
  {
    axisId: 'econ_school_choice',
    scoreRange: [0, 3],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'context',
    headline: '{name} prioritizes public school funding — 90% of U.S. children attend public schools',
    detail: 'Per-pupil public school spending averages $14,347; voucher programs typically redirect $5,000-$8,000 of this per student',
    source: 'National Center for Education Statistics, 2022',
    sourceUrl: 'https://nces.ed.gov/programs/coe/indicator/cmd/public-school-expenditures',
  },

  // ════════════════════════════════════════════
  // HOUSING: zoning_supply (0 = loosen zoning, 10 = preserve local zoning)
  // ════════════════════════════════════════════

  // Pro-upzoning candidates + renters
  {
    axisId: 'housing_supply_zoning',
    scoreRange: [0, 3],
    field: 'housingSituation',
    matchValues: ['rent'],
    effect: 'benefit',
    headline: '{name} supports loosening zoning to increase housing supply — 50% of all renters are currently cost-burdened',
    detail: 'Upzoning increases housing units ~9% over 5-10 years; long-run affordability gains take years to appear',
    source: 'U.S. Census Bureau, Renter Households Cost-Burdened, 2024',
    sourceUrl: 'https://www.census.gov/newsroom/press-releases/2024/renter-households-cost-burdened-race.html',
  },
  // Pro-upzoning + young adults
  {
    axisId: 'housing_supply_zoning',
    scoreRange: [0, 3],
    field: 'ageRange',
    matchValues: ['18_24', '25_34'],
    effect: 'benefit',
    headline: '{name} supports building more housing — only 26% of Gen Z own their home, vs. 40% for boomers at the same age',
    source: 'Redfin, Gen Z and Millennial Homeownership, 2025',
    sourceUrl: 'https://www.redfin.com/news/homeownership-rate-by-generation-2024/',
  },
  // Pro-upzoning + homeowners
  {
    axisId: 'housing_supply_zoning',
    scoreRange: [0, 3],
    field: 'housingSituation',
    matchValues: ['own_home'],
    effect: 'mixed',
    headline: "{name} supports upzoning — this can increase your property's development value but may change neighborhood character",
    detail: 'Minneapolis upzoning (2019): property values rose 3-5% near rezoned parcels with no measurable crime increase',
    source: 'Journal of Urban Economics, "The Effect of Land Use Regulation on Housing Prices," 2023',
    sourceUrl: 'https://www.sciencedirect.com/journal/journal-of-urban-economics',
  },
  // Preserve zoning + renters
  {
    axisId: 'housing_supply_zoning',
    scoreRange: [7, 10],
    field: 'housingSituation',
    matchValues: ['rent'],
    effect: 'concern',
    headline: '{name} supports preserving current zoning — restrictive zoning is linked to higher rents in constrained markets',
    detail: 'The U.S. has a shortage of 7.3 million affordable rental homes for extremely low-income renters',
    source: 'National Low Income Housing Coalition, The Gap Report, 2024',
    sourceUrl: 'https://nlihc.org/gap',
  },

  // ════════════════════════════════════════════
  // HOUSING: affordability_tools (0 = govt subsidies, 10 = market solutions)
  // ════════════════════════════════════════════

  // Pro-subsidy candidates + low-income renters
  {
    axisId: 'housing_affordability_tools',
    scoreRange: [0, 3],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'benefit',
    headline: '{name} supports expanding housing subsidies — only 1 in 4 eligible families currently receives federal rental assistance',
    detail: 'Section 8 voucher recipients waited nearly 2.5 years on waitlists; demand vastly exceeds funded supply',
    source: 'Center on Budget and Policy Priorities, Families Wait Years for Housing Vouchers, 2023',
    sourceUrl: 'https://www.cbpp.org/research/housing/families-wait-years-for-housing-vouchers-due-to-inadequate-funding',
  },
  // Pro-subsidy + dependents
  {
    axisId: 'housing_affordability_tools',
    scoreRange: [0, 3],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'benefit',
    headline: "{name} supports housing subsidies — 71% of extremely low-income renter households with children are severely cost-burdened",
    source: 'National Low Income Housing Coalition, The Gap Report, 2024',
    sourceUrl: 'https://nlihc.org/gap',
  },
  // Market solutions + low income renters
  {
    axisId: 'housing_affordability_tools',
    scoreRange: [7, 10],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'concern',
    headline: '{name} favors market-based housing solutions — without subsidies, you may continue to pay over 50% of income on rent',
    detail: '26.5% of renter households are severely cost-burdened, spending over half their income on housing',
    source: 'Joint Center for Housing Studies of Harvard University, 2024',
    sourceUrl: 'https://www.jchs.harvard.edu/sites/default/files/research/files/harvard_jchs_rental_affordability_airgood-obrycki_2024.pdf',
  },

  // ════════════════════════════════════════════
  // HOUSING: transit_priority (0 = public transit, 10 = car-centric)
  // ════════════════════════════════════════════

  // Pro-transit + low income
  {
    axisId: 'housing_transport_priority',
    scoreRange: [0, 3],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'benefit',
    headline: '{name} supports public transit investment — low-income households spend nearly 32% of pre-tax income on transportation; 30% own no vehicle',
    source: 'Bureau of Transportation Statistics, Household Cost of Transportation, 2024',
    sourceUrl: 'https://www.bts.gov/data-spotlight/household-cost-transportation-it-affordable',
  },
  // Pro-transit + young adults
  {
    axisId: 'housing_transport_priority',
    scoreRange: [0, 3],
    field: 'ageRange',
    matchValues: ['18_24', '25_34'],
    effect: 'benefit',
    headline: '{name} supports transit expansion — 1 in 5 adults aged 18-29 does not own a car',
    source: 'Pew Research Center, Car Ownership in America, 2023',
    sourceUrl: 'https://www.pewresearch.org/short-reads/2023/12/14/key-findings-about-car-ownership-in-the-us/',
  },
  // Pro-transit + elderly
  {
    axisId: 'housing_transport_priority',
    scoreRange: [0, 3],
    field: 'ageRange',
    matchValues: ['65_plus'],
    effect: 'benefit',
    headline: '{name} supports transit for seniors — 600,000 Americans 70+ stop driving each year',
    detail: 'Transportation barriers cause 3.6 million Americans to miss medical appointments annually',
    source: 'American Hospital Association, Social Determinants of Health, 2019',
    sourceUrl: 'https://www.aha.org/ahahret-guides/2019-10-29-social-determinants-health-series-transportation',
  },
  // Car-centric candidates + low income
  {
    axisId: 'housing_transport_priority',
    scoreRange: [7, 10],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'concern',
    headline: '{name} favors car-centric infrastructure — the average annual cost of car ownership is $12,182',
    detail: 'For households earning under $25K, car ownership consumes nearly half of income',
    source: 'AAA, Your Driving Costs, 2023',
    sourceUrl: 'https://newsroom.aaa.com/2023/08/your-driving-costs-2023/',
  },

  // ════════════════════════════════════════════
  // CLIMATE: ambition_level (0 = aggressive action, 10 = gradual/none)
  // ════════════════════════════════════════════

  // Climate action candidates + low income
  {
    axisId: 'climate_ambition',
    scoreRange: [0, 3],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'mixed',
    headline: '{name} supports aggressive climate action — transition costs may raise energy bills, but 1 in 4 low-income households already spend over 15% of income on energy',
    detail: 'Low-income households spend a median of 8.3% of income on home energy — the high burden threshold is 6%',
    source: 'ACEEE, Low-Income Energy Burden Study, 2024',
    sourceUrl: 'https://www.aceee.org/press-release/2024/09/study-one-four-low-income-households-spend-over-15-income-energy-bills',
  },
  // Climate action + dependents
  {
    axisId: 'climate_ambition',
    scoreRange: [0, 3],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'benefit',
    headline: '{name} supports climate action — 6 million U.S. children have asthma, with highest rates (11.3%) among children in families below the poverty line',
    detail: 'Children are disproportionately harmed by fossil fuel air pollution; asthma prevalence is significantly higher near industrial facilities',
    source: 'EPA / CDC, Links Between Air Pollution and Childhood Asthma, 2022',
    sourceUrl: 'https://www.epa.gov/sciencematters/links-between-air-pollution-and-childhood-asthma',
  },
  // Climate action + young adults
  {
    axisId: 'climate_ambition',
    scoreRange: [0, 3],
    field: 'ageRange',
    matchValues: ['18_24', '25_34'],
    effect: 'benefit',
    headline: '{name} supports clean energy transition — clean energy jobs grew 2.8% in 2024, 3x faster than the rest of the U.S. workforce',
    detail: 'The sector has added 520,000+ jobs since 2020; wind turbine technician is the single fastest-growing occupation through 2032',
    source: 'E2, Clean Energy Jobs Report, 2025 / DOE USEER 2024',
    sourceUrl: 'https://e2.org/releases/report-clean-energy-jobs-grew-3x-faster-than-rest-of-u-s-workforce-in-2024-but-future-growth-now-at-risk/',
  },
  // No climate action + elderly
  {
    axisId: 'climate_ambition',
    scoreRange: [7, 10],
    field: 'ageRange',
    matchValues: ['65_plus'],
    effect: 'context',
    headline: '{name} favors gradual climate policy — this avoids near-term energy cost increases for fixed-income seniors',
    detail: 'Seniors spend 44% more of their income on residential energy than the national average',
    source: 'ACEEE, Understanding Energy Affordability, 2020',
    sourceUrl: 'https://www.aceee.org/energy-burden',
  },
  // No climate action + dependents
  {
    axisId: 'climate_ambition',
    scoreRange: [7, 10],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'concern',
    headline: '{name} does not prioritize climate action — children will bear the longest exposure to worsening air quality and extreme heat',
    detail: 'Heat-related pediatric ER visits have increased 24% over the past decade in the U.S.',
    source: 'The Lancet Countdown on Health and Climate Change, 2023',
    sourceUrl: 'https://www.thelancet.com/countdown-health-climate',
  },

  // ════════════════════════════════════════════
  // JUSTICE: firearms_policy (0 = more regulations, 10 = protect gun rights)
  // ════════════════════════════════════════════

  // Pro-regulation + dependents
  {
    axisId: 'justice_firearms',
    scoreRange: [0, 3],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'context',
    headline: '{name} supports stricter gun regulations — firearms are the leading cause of death for children ages 1-17, nearly 7 per day in 2023',
    detail: 'Child firearm death rates rose 106% from 2013-2022; 63% are homicides, 29% suicides',
    source: 'Johns Hopkins Center for Gun Violence Solutions / CDC Data, 2024',
    sourceUrl: 'https://publichealth.jhu.edu/2024/guns-remain-leading-cause-of-death-for-children-and-teens',
  },
  // Pro-regulation + young adults
  {
    axisId: 'justice_firearms',
    scoreRange: [0, 3],
    field: 'ageRange',
    matchValues: ['18_24', '25_34'],
    effect: 'context',
    headline: '{name} supports gun regulations — ages 18-24 have the highest firearm homicide rate at 14.2 per 100,000',
    detail: 'Firearm suicide rates for 25-34 year-olds rose 43% from 2012-2022',
    source: 'CDC, Fast Facts: Firearm Injury and Death, 2024',
    sourceUrl: 'https://www.cdc.gov/firearm-violence/data-research/facts-stats/index.html',
  },
  // Protect gun rights + dependents
  {
    axisId: 'justice_firearms',
    scoreRange: [7, 10],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'context',
    headline: '{name} opposes additional gun regulations — 32% of U.S. households with children have at least one firearm',
    source: 'Pew Research Center, Key Facts About Americans and Guns, 2023',
    sourceUrl: 'https://www.pewresearch.org/short-reads/2023/07/26/key-facts-about-americans-and-guns/',
  },
  // Protect gun rights + veterans
  {
    axisId: 'justice_firearms',
    scoreRange: [7, 10],
    field: 'veteranStatus',
    matchValues: ['veteran'],
    effect: 'context',
    headline: '{name} supports gun rights — 67% of veteran suicides involve firearms, making access a complex issue for veteran communities',
    source: 'VA National Suicide Data Report, 2023',
    sourceUrl: 'https://www.mentalhealth.va.gov/docs/data-sheets/2023/2023-National-Veteran-Suicide-Prevention-Annual-Report-FINAL-508.pdf',
  },

  // ════════════════════════════════════════════
  // JUSTICE: police_accountability (0 = more oversight, 10 = back the blue)
  // ════════════════════════════════════════════

  // More oversight + low income
  {
    axisId: 'justice_policing_accountability',
    scoreRange: [0, 3],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'benefit',
    headline: '{name} supports police reform — police spend disproportionate time in lower-income neighborhoods even after controlling for crime rates',
    detail: '4% of Black Americans experienced police misconduct in their most recent contact — 6x the rate for white Americans',
    source: 'Bureau of Justice Statistics, Contacts Between Police and the Public, 2022',
    sourceUrl: 'https://bjs.ojp.gov/library/publications/contacts-between-police-and-public-2022',
  },
  // More oversight + veterans
  {
    axisId: 'justice_policing_accountability',
    scoreRange: [0, 3],
    field: 'veteranStatus',
    matchValues: ['veteran'],
    effect: 'context',
    headline: '{name} supports police reform including crisis intervention — veterans with PTSD have 61% higher odds of criminal justice involvement',
    detail: '1 in 3 veterans has been arrested; recent veterans are 2x as likely as non-veterans to face incarceration',
    source: 'VA National Center for PTSD / Council on Criminal Justice, 2023',
    sourceUrl: 'https://counciloncj.org/from-service-to-sentencing-unraveling-risk-factors-for-criminal-justice-involvement-among-u-s-veterans/',
  },
  // Back the blue + low income
  {
    axisId: 'justice_policing_accountability',
    scoreRange: [7, 10],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'mixed',
    headline: '{name} supports more police funding — this can improve response times, but low-income communities bear disproportionate enforcement burden',
    source: 'Brookings Institution, Policing in America, 2021',
    sourceUrl: 'https://www.brookings.edu/articles/how-can-we-reimagine-policing/',
  },

  // ════════════════════════════════════════════
  // JUSTICE: sentencing_goals (0 = rehabilitation, 10 = punishment/deterrence)
  // ════════════════════════════════════════════

  // Rehabilitation candidates + low income
  {
    axisId: 'justice_sentencing_goals',
    scoreRange: [0, 3],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'benefit',
    headline: '{name} supports rehabilitation over incarceration — incarceration costs families an average of $13,607/year in lost income',
    source: 'Ella Baker Center, Who Pays? The True Cost of Incarceration on Families, 2015',
    sourceUrl: 'https://ellabakercenter.org/who-pays-the-true-cost-of-incarceration-on-families/',
  },
  // Rehabilitation + dependents
  {
    axisId: 'justice_sentencing_goals',
    scoreRange: [0, 3],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'context',
    headline: "{name} supports rehabilitation programs — 2.7 million U.S. children have a parent who is incarcerated",
    detail: 'Children of incarcerated parents are 6x more likely to be incarcerated themselves',
    source: 'The Annie E. Casey Foundation, A Shared Sentence, 2016',
    sourceUrl: 'https://www.aecf.org/resources/a-shared-sentence',
  },

  // ════════════════════════════════════════════
  // CLIMATE: energy_portfolio (0 = renewables priority, 10 = all-of-above/fossil)
  // ════════════════════════════════════════════

  // Renewables priority + young adults
  {
    axisId: 'climate_energy_portfolio',
    scoreRange: [0, 3],
    field: 'ageRange',
    matchValues: ['18_24', '25_34'],
    effect: 'benefit',
    headline: '{name} prioritizes renewables — the clean energy sector added 142,000 jobs in 2023, growing 3.9% year-over-year',
    source: 'U.S. Department of Energy, U.S. Energy and Employment Report, 2024',
    sourceUrl: 'https://www.energy.gov/policy/us-energy-employment-jobs-report-useer',
  },
  // Renewables + homeowners
  {
    axisId: 'climate_energy_portfolio',
    scoreRange: [0, 3],
    field: 'housingSituation',
    matchValues: ['own_home'],
    effect: 'benefit',
    headline: '{name} supports renewable energy incentives — residential solar increases home value by an average of 4.1%',
    source: 'Zillow Research, Solar Panels and Home Values, 2019',
    sourceUrl: 'https://www.zillow.com/research/solar-panels-house-702/',
  },
  // Fossil-friendly + low-income renters
  {
    axisId: 'climate_energy_portfolio',
    scoreRange: [7, 10],
    field: 'housingSituation',
    matchValues: ['rent'],
    effect: 'concern',
    headline: "{name} supports continued fossil fuel reliance — renters can't install solar to offset energy costs and don't benefit from homeowner tax credits",
    source: 'ACEEE, Understanding Energy Affordability, 2020',
    sourceUrl: 'https://www.aceee.org/energy-burden',
  },

  // ════════════════════════════════════════════
  // HEALTHCARE: public_health (0 = collective mandates, 10 = individual choice)
  // ════════════════════════════════════════════

  // Collective mandate candidates + dependents
  {
    axisId: 'health_public_health',
    scoreRange: [0, 3],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'context',
    headline: '{name} supports collective public health measures like school vaccination requirements — childhood immunization prevents ~4 million deaths globally per year',
    source: 'WHO/UNICEF, Global Immunization Data, 2023',
    sourceUrl: 'https://data.unicef.org/topic/child-health/immunization/',
  },
  // Individual choice + elderly
  {
    axisId: 'health_public_health',
    scoreRange: [7, 10],
    field: 'ageRange',
    matchValues: ['65_plus'],
    effect: 'concern',
    headline: '{name} favors individual choice over mandates — seniors face the highest COVID and flu mortality rates and benefit most from high community vaccination',
    detail: '75% of COVID deaths in the U.S. have been among people age 65+',
    source: 'CDC, COVID-19 Data Tracker, 2023',
    sourceUrl: 'https://covid.cdc.gov/covid-data-tracker/',
  },

  // ════════════════════════════════════════════
  // ECONOMIC: tax_structure (0 = progressive taxes, 10 = flat/low taxes)
  // ════════════════════════════════════════════

  // Progressive tax candidates + low income
  {
    axisId: 'econ_tax_structure',
    scoreRange: [0, 3],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'benefit',
    headline: '{name} supports progressive taxation — the bottom 50% of earners pay an average federal income tax rate of 3.3%',
    detail: 'Progressive tax proposals typically increase rates on income above $400K while expanding credits for lower earners',
    source: 'Tax Foundation, Summary of the Latest Federal Income Tax Data, 2024',
    sourceUrl: 'https://taxfoundation.org/data/all/federal/latest-federal-income-tax-data-2024/',
  },
  // Progressive tax + high income
  {
    axisId: 'econ_tax_structure',
    scoreRange: [0, 3],
    field: 'householdIncome',
    matchValues: ['150k_200k', 'over_200k'],
    effect: 'concern',
    headline: '{name} supports raising taxes on higher earners — the top 10% currently pay 74% of all federal income taxes',
    source: 'Tax Foundation, Summary of the Latest Federal Income Tax Data, 2024',
    sourceUrl: 'https://taxfoundation.org/data/all/federal/latest-federal-income-tax-data-2024/',
  },
  // Low-tax candidates + low income
  {
    axisId: 'econ_tax_structure',
    scoreRange: [7, 10],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'mixed',
    headline: '{name} supports lower taxes — but the 2017 TCJA gave 65% of its benefits to the top 20% of earners',
    source: 'Tax Policy Center, Distributional Analysis of the TCJA, 2017',
    sourceUrl: 'https://www.taxpolicycenter.org/publications/distributional-analysis-conference-agreement-tax-cuts-and-jobs-act',
  },
  // Low-tax + self-employed
  {
    axisId: 'econ_tax_structure',
    scoreRange: [7, 10],
    field: 'employmentType',
    matchValues: ['self_employed'],
    effect: 'benefit',
    headline: '{name} supports lower tax rates — the 20% pass-through deduction (Section 199A) directly benefits self-employed filers',
    source: 'IRS, Qualified Business Income Deduction, 2024',
    sourceUrl: 'https://www.irs.gov/newsroom/qualified-business-income-deduction',
  },

  // ════════════════════════════════════════════
  // ECONOMIC: public_investment (0 = more investment, 10 = less investment)
  // ════════════════════════════════════════════

  // Pro-investment + young adults
  {
    axisId: 'econ_investment',
    scoreRange: [0, 3],
    field: 'ageRange',
    matchValues: ['18_24', '25_34'],
    effect: 'benefit',
    headline: '{name} supports public investment in infrastructure — the ASCE grades U.S. infrastructure at C- with a $2.6 trillion gap',
    detail: 'Infrastructure investments create 16,000 jobs per $1 billion spent',
    source: 'American Society of Civil Engineers, Infrastructure Report Card, 2021',
    sourceUrl: 'https://infrastructurereportcard.org/',
  },
  // Less investment + high income
  {
    axisId: 'econ_investment',
    scoreRange: [7, 10],
    field: 'householdIncome',
    matchValues: ['150k_200k', 'over_200k'],
    effect: 'context',
    headline: '{name} favors less public spending — federal spending was 24.2% of GDP in 2023, above the 50-year average of 21%',
    source: 'Congressional Budget Office, The Budget and Economic Outlook, 2024',
    sourceUrl: 'https://www.cbo.gov/publication/59710',
  },

  // ════════════════════════════════════════════
  // JUSTICE: reproductive (0 = full reproductive rights, 10 = protect fetal life)
  // ════════════════════════════════════════════

  // Pro-choice candidates + women of reproductive age
  {
    axisId: 'justice_reproductive',
    scoreRange: [0, 3],
    field: 'ageRange',
    matchValues: ['18_24', '25_34', '35_44'],
    effect: 'context',
    headline: '{name} supports broad reproductive rights — 1 in 4 women will have an abortion by age 45',
    source: 'Guttmacher Institute, Abortion in the United States, 2024',
    sourceUrl: 'https://www.guttmacher.org/fact-sheet/induced-abortion-united-states',
  },
  // Pro-choice + dependents
  {
    axisId: 'justice_reproductive',
    scoreRange: [0, 3],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'context',
    headline: '{name} supports reproductive rights — 59% of people who obtain abortions already have at least one child',
    source: 'Guttmacher Institute, Characteristics of Abortion Patients, 2023',
    sourceUrl: 'https://www.guttmacher.org/report/characteristics-us-abortion-patients-2014',
  },
  // Pro-life + low income
  {
    axisId: 'justice_reproductive',
    scoreRange: [7, 10],
    field: 'householdIncome',
    matchValues: ['under_25k', '25k_50k'],
    effect: 'concern',
    headline: '{name} supports abortion restrictions — low-income women are 5x more likely to have an unintended pregnancy and face higher barriers to out-of-state care',
    source: 'Guttmacher Institute, Unintended Pregnancy in the United States, 2024',
    sourceUrl: 'https://www.guttmacher.org/fact-sheet/unintended-pregnancy-united-states',
  },
  // Pro-life + dependents
  {
    axisId: 'justice_reproductive',
    scoreRange: [7, 10],
    field: 'dependents',
    matchValues: ['one', 'two', 'three_plus'],
    effect: 'context',
    headline: '{name} supports abortion restrictions — pregnancy-related complications are the 6th leading cause of death for women 20-34, affecting families',
    detail: 'States with abortion bans have seen increases in maternal mortality and travel-related care delays',
    source: 'The Lancet Regional Health, Maternal Mortality and Abortion Policies, 2023',
    sourceUrl: 'https://www.thelancet.com/journals/lanam/article/PIIS2667-193X(23)00129-5/fulltext',
  },
];
