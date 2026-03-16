/**
 * Slider Position Data for Smart Assessment
 *
 * Each axis has 5 positions (or more). The center position (index 2 for 5 positions)
 * represents current US policy and gets the grey color.
 *
 * IMPORTANT: Axes are designed to avoid false binaries. When two concepts aren't
 * mutually exclusive (e.g., "safety" vs "rights"), they are decoupled into
 * separate axes that each represent a genuine spectrum.
 */

export interface SliderPosition {
  title: string;
  description: string;
  isCurrentPolicy?: boolean;
  /** Evidence-based tradeoffs shown when card is selected */
  tradeoffs?: string[];
}

export interface AxisSliderConfig {
  axisId: string;
  question: string;
  poleALabel: string; // Purple side
  poleBLabel: string; // Teal side
  positions: SliderPosition[];
  currentPolicyIndex: number; // Which position represents current policy
}

export const axisSliderConfigs: Record<string, AxisSliderConfig> = {
  // ============================================
  // LEGACY AXIS CONFIGS (matching backend spec IDs)
  // These ensure labels work with the current profile data
  // ============================================

  econ_safetynet: {
    axisId: 'econ_safetynet',
    question: 'Should government help be available to more people with fewer requirements?',
    poleALabel: 'Broader\nSafety Net',
    poleBLabel: 'More Conditional\nSafety Net',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Universal support programs',
        description: 'Robust benefits available to all with minimal conditions',
        tradeoffs: [
          'Eliminates stigma and coverage gaps — everyone qualifies (Nordic model evidence)',
          'Nordic-level benefits require ~10-15% GDP more in taxes — roughly $8,000-$12,000 per household/year',
          'Some studies find modest work disincentives; others (Finland basic-income trial) found minimal impact',
        ],
      },
      {
        title: 'Broad eligibility with some conditions',
        description: 'Wide access to assistance with basic requirements',
        tradeoffs: [
          'Covers most vulnerable while maintaining some accountability structure',
          'Bureaucratic costs of eligibility verification can consume 10-20% of program budgets',
          'Income cliffs can discourage earning more (losing benefits at thresholds)',
        ],
      },
      {
        title: 'Targeted programs with work incentives',
        description: 'Benefits for those in need with participation requirements',
        isCurrentPolicy: true,
        tradeoffs: [
          'EITC is one of the most effective anti-poverty programs (lifts ~6M out of poverty annually)',
          'Work requirements exclude those who can\'t work due to disability, caregiving, or illness',
          'Administrative burden causes eligible people to lose benefits (up to 25% churn rate)',
        ],
      },
      {
        title: 'Strict eligibility and conditions',
        description: 'Aid limited to verified need with strong work requirements',
        tradeoffs: [
          'Focuses limited resources on those most in need',
          'States with stricter requirements saw caseload drops but not poverty reduction (CBPP)',
          'Verification processes can be humiliating and deter eligible applicants',
        ],
      },
      {
        title: 'Minimal safety net',
        description: 'Limited government assistance, emphasize self-reliance',
        tradeoffs: [
          'Lower tax burden and less government bureaucracy',
          'Countries without safety nets see higher child poverty and worse health outcomes (OECD data)',
          'Private charity historically unable to meet scale of need during recessions',
        ],
      },
    ],
  },

  econ_investment: {
    axisId: 'econ_investment',
    question: 'Should we pay more in taxes to fund public services?',
    poleALabel: 'More Public\nInvestment',
    poleBLabel: 'Lower Taxes\nLess Spending',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Major expansion of public services',
        description: 'Significantly increase spending on schools, infrastructure, and services',
        tradeoffs: [
          'Public infrastructure investment returns $1.50-$2.20 per dollar spent over 20 years (CBO estimates)',
          'Scale matters: a 5% GDP increase means roughly $6,000-$8,000 more per household/year in taxes',
          'Government programs can crowd out private alternatives, though evidence is mixed by sector',
        ],
      },
      {
        title: 'Targeted public investments',
        description: 'Increase funding for high-priority community needs',
        tradeoffs: [
          'Focuses resources where public return is highest (education, infrastructure)',
          'Political process often directs spending to connected interests, not highest need',
          'Moderate tax increases more politically sustainable than large ones',
        ],
      },
      {
        title: 'Maintain current balance',
        description: 'Keep existing service and tax levels',
        isCurrentPolicy: true,
        tradeoffs: [
          'Avoids disruption to existing programs and tax expectations',
          'Current deficit trajectory adds ~$2T/year to national debt — roughly $15,000 per household in new borrowing annually (CBO 2024)',
          'Infrastructure rated D+ by ASCE — maintenance backlog growing',
        ],
      },
      {
        title: 'Reduce spending, lower taxes',
        description: 'Cut programs to return money to taxpayers',
        tradeoffs: [
          'Tax cuts can stimulate economic growth and private investment',
          'Service cuts disproportionately affect those who depend on public programs',
          'Tax cut revenue effects are debated — some self-financing, most are not (CBO scoring)',
        ],
      },
      {
        title: 'Minimal government spending',
        description: 'Dramatically reduce taxes and public programs',
        tradeoffs: [
          'Could save ~$10,000+ per household/year in taxes if services are cut proportionally',
          'Would require eliminating or privatizing Social Security, Medicare, or defense — all politically popular',
          'No developed country operates at this spending level (~10% GDP vs current ~24%)',
        ],
      },
    ],
  },

  econ_school_choice: {
    axisId: 'econ_school_choice',
    question: 'Should education funding focus on public schools or follow student choice?',
    poleALabel: 'Strengthen\nPublic Schools',
    poleBLabel: 'Expand School\nChoice',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Fund public schools exclusively',
        description: 'All education dollars go to neighborhood public schools',
        tradeoffs: [
          'Ensures maximum resources per student in public system',
          'Limits options for families in underperforming school districts',
          'Public schools serve 90% of US students and must accept all children',
        ],
      },
      {
        title: 'Prioritize public schools',
        description: 'Most funding to public schools with limited alternatives',
        tradeoffs: [
          'Maintains strong public system while allowing some innovation (magnet schools)',
          'Charter schools show mixed results — some outperform, many don\'t (CREDO study)',
          'Limited choice may not help families in chronically underperforming districts',
        ],
      },
      {
        title: 'Mixed public and choice options',
        description: 'Public schools alongside charter and magnet programs',
        isCurrentPolicy: true,
        tradeoffs: [
          '7,800+ charter schools serve 3.7M students; bipartisan support varies by state (EdNext)',
          'Charter expansion can reduce funding available to remaining public school students',
          'Some charters achieve strong results (KIPP, Success Academy); quality is highly variable',
        ],
      },
      {
        title: 'Expand school choice',
        description: 'Significant funding for charters, vouchers, and alternatives',
        tradeoffs: [
          'Empowers families, especially low-income, to access better-performing schools',
          'Voucher programs in Milwaukee and DC show modest gains for some students (IES)',
          'Can accelerate segregation by income and race without careful design',
        ],
      },
      {
        title: 'Full funding portability',
        description: 'Families choose any school, funding follows the student',
        tradeoffs: [
          'Maximum family choice — competition may drive quality improvements',
          'Rural and low-density areas may lack alternative school options',
          'Accountability concerns: private schools receiving public funds face less oversight',
        ],
      },
    ],
  },

  econ_tax_structure: {
    axisId: 'econ_tax_structure',
    question: 'How should the tax burden be distributed across income levels?',
    poleALabel: 'Progressive\nTaxation',
    poleBLabel: 'Flat / Sales\nTax',
    currentPolicyIndex: 1,
    positions: [
      {
        title: 'Highly progressive with wealth tax',
        description: 'Steep graduated rates plus taxes on large fortunes and capital gains',
        tradeoffs: [
          'Top 1% hold 31% of wealth — progressive taxes reduce concentration (Federal Reserve)',
          'Wealth taxes have been repealed in several EU countries due to capital flight and administrative cost',
          'Debate is active: some economists argue wealth taxes are essential; others say they reduce investment',
        ],
      },
      {
        title: 'Progressive income tax',
        description: 'Graduated rates where higher earners pay higher percentages',
        isCurrentPolicy: true,
        tradeoffs: [
          'Top 10% pay ~74% of federal income taxes; bottom 50% pay ~3% (IRS data)',
          'Complex deduction system creates loopholes and compliance costs (~$400B/year, or ~$3,000 per household)',
          'Broadly supported: Pew 2023 finds 61% say wealthy pay too little',
        ],
      },
      {
        title: 'Simplified brackets with fewer deductions',
        description: 'Fewer tax brackets, lower top rate, close loopholes',
        tradeoffs: [
          'Reduces compliance costs and makes tax system more transparent',
          'Eliminating popular deductions (mortgage interest, charity) faces strong opposition',
          'May shift tax burden depending on which deductions are cut',
        ],
      },
      {
        title: 'Flat income tax',
        description: 'Everyone pays the same percentage regardless of income',
        tradeoffs: [
          'Simple and transparent — everyone understands their rate',
          'Without exemptions, a flat tax is regressive (takes larger share of low incomes)',
          'Flat-tax countries (Estonia, Russia) are much smaller economies with different contexts',
        ],
      },
      {
        title: 'Replace income tax with consumption tax',
        description: 'Eliminate income tax, fund government through sales or value-added tax',
        tradeoffs: [
          'Encourages saving and investment by not taxing income',
          'Consumption taxes are regressive — low-income households spend a higher share of income on taxed goods',
          'Would require ~25-30% national sales tax to replace income tax revenue; some proposals include rebates for low-income (Tax Foundation)',
        ],
      },
    ],
  },

  health_coverage_model: {
    axisId: 'health_coverage_model',
    question: 'Should government offer health insurance to everyone?',
    poleALabel: 'More Government\nInsurance',
    poleBLabel: 'More Private\nInsurance',
    currentPolicyIndex: 3,
    // 6 positions: reflects distinct coverage models identified in KFF 2024 and ANES V201336
    positions: [
      {
        title: 'Single-payer government health system',
        description: 'One public program replaces all private insurance',
        tradeoffs: [
          'Eliminates administrative overhead (~30% of US healthcare spending — PNHP research)',
          'Requires large new federal taxes, but replaces premiums, deductibles, and copays — most studies find total household costs similar or somewhat lower (CBO, Lancet)',
          'Eliminates out-of-pocket costs but may increase wait times for elective procedures',
        ],
      },
      {
        title: 'Public option available to all',
        description: 'Government plan competes alongside private insurance',
        tradeoffs: [
          'Preserves choice while offering a lower-cost alternative (KFF 2024: 63% support)',
          'May destabilize private insurance markets if government plan underprices competitors',
          'Coverage gaps remain for those who fall between eligibility criteria',
        ],
      },
      {
        title: 'Expand public programs (Medicare/Medicaid)',
        description: 'Lower Medicare age and broaden Medicaid eligibility',
        tradeoffs: [
          'Builds on existing trusted programs rather than creating new ones',
          'Provider reimbursement rates are lower than private — some doctors limit Medicare patients',
          'Increases federal spending without fully addressing uninsured population',
        ],
      },
      {
        title: 'Mix of public and private coverage',
        description: 'Medicare/Medicaid for some, employer plans for others',
        isCurrentPolicy: true,
        tradeoffs: [
          'Familiar system that most Americans already navigate',
          '~27 million still uninsured; coverage tied to employment creates gaps during job changes',
          'Administrative complexity: different rules for Medicare, Medicaid, ACA, employer plans',
        ],
      },
      {
        title: 'Private insurance with subsidies',
        description: 'Market-based coverage with tax credits for those who need help',
        tradeoffs: [
          'Promotes competition that can drive innovation and consumer choice',
          'Subsidies may not keep pace with premium increases (ACA marketplace experience)',
          'Insurer overhead and profit account for ~12% of premiums (vs. ~2% for Medicare); healthy people may choose not to buy',
        ],
      },
      {
        title: 'Fully private insurance market',
        description: 'Individuals and families buy coverage directly from insurers',
        tradeoffs: [
          'Maximum consumer choice and minimal government involvement',
          'Pre-ACA experience: insurers denied coverage for pre-existing conditions',
          'Without mandates, healthy people opt out, raising costs for those who remain',
        ],
      },
    ],
  },

  health_cost_control: {
    axisId: 'health_cost_control',
    question: 'Should government set limits on healthcare prices?',
    poleALabel: 'Government\nPrice Limits',
    poleBLabel: 'Market\nCompetition',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Comprehensive price controls',
        description: 'Government sets all healthcare prices',
        tradeoffs: [
          'Countries with price controls (Japan, Germany) spend 50-70% less per capita, though outcomes vary by measure',
          'May reduce pharmaceutical innovation incentives — debated: some studies find minimal effect, others significant',
          'Provider shortages possible if reimbursement rates are set too low',
        ],
      },
      {
        title: 'Regulate prices in key areas',
        description: 'Negotiate drug prices, cap hospital charges',
        tradeoffs: [
          'Medicare drug negotiation (IRA 2022) projected to save $100B over 10 years (~$80 per household/year)',
          'Drug companies argue price controls will reduce R&D spending; independent analyses show mixed effects on innovation',
          'Hospital price caps may cause cost-shifting to other services',
        ],
      },
      {
        title: 'Mix of regulation and competition',
        description: 'Some price rules plus transparency for shopping',
        isCurrentPolicy: true,
        tradeoffs: [
          'Hospital price transparency rules took effect 2021 but compliance is low (~30%)',
          'Combines government leverage with market incentives',
          'US still spends ~$12,500/person (2x the OECD average) with mixed outcomes',
        ],
      },
      {
        title: 'Promote competition and transparency',
        description: 'Require price disclosure so consumers can compare',
        tradeoffs: [
          'Informed consumers can drive down prices in competitive markets',
          'Healthcare is hard to "shop" — emergencies, complex conditions limit consumer choice',
          'Price transparency alone hasn\'t significantly reduced costs where implemented',
        ],
      },
      {
        title: 'Let market set prices',
        description: 'Competition between providers drives efficiency',
        tradeoffs: [
          'Market mechanisms drive innovation and efficiency in other industries',
          'Healthcare has limited competition — most markets have 1-2 hospital systems',
          'Patients lack bargaining power when facing serious illness',
        ],
      },
    ],
  },

  health_public_health: {
    axisId: 'health_public_health',
    question: 'How should government approach public health and drug policy?',
    poleALabel: 'Prevention &\nTreatment',
    poleBLabel: 'Personal Choice\n& Enforcement',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Proactive public health programs',
        description: 'Government leads prevention, treatment, and harm reduction',
        tradeoffs: [
          'Some prevention programs return ~$5.60 per $1 invested, though returns vary widely by program (Trust for America\'s Health)',
          'Mandatory programs (vaccination, fluoridation) can conflict with individual autonomy',
          'Harm reduction (needle exchanges, safe injection sites) reduces disease transmission but remains controversial',
        ],
      },
      {
        title: 'Robust health education and services',
        description: 'Fund community health and treatment programs',
        tradeoffs: [
          'Community health centers serve 30M+ Americans in underserved areas',
          'Education campaigns have mixed effectiveness — smoking declined, obesity hasn\'t',
          'Drug treatment on demand reduces overdose deaths but requires sustained funding',
        ],
      },
      {
        title: 'Balanced approach',
        description: 'Some public health programs alongside personal responsibility',
        isCurrentPolicy: true,
        tradeoffs: [
          'Current system: CDC prevention, state health departments, limited drug treatment',
          'Post-COVID: 40-point partisan gap on government health authority (Pew 2022)',
          'Opioid crisis (100K+ deaths/year) highlights limits of current approach',
        ],
      },
      {
        title: 'Limited intervention',
        description: 'Focus on essential disease control only',
        tradeoffs: [
          'Respects individual choice in health decisions',
          'Infectious diseases require collective action — individual choices affect community health',
          'May increase long-term healthcare costs by deferring prevention',
        ],
      },
      {
        title: 'Minimal government role',
        description: 'Leave health decisions to individuals, enforce drug laws',
        tradeoffs: [
          'Maximum personal freedom over health and lifestyle choices',
          'War on Drugs costs ~$50B/year (~$400 per household) with limited impact on drug use rates',
          'Without public health infrastructure, pandemic response capacity is severely limited',
        ],
      },
    ],
  },

  housing_supply_zoning: {
    axisId: 'housing_supply_zoning',
    question: 'Should cities allow more housing to be built in existing neighborhoods?',
    poleALabel: 'Build More\nAllow Density',
    poleBLabel: 'Preserve\nLimit Growth',
    currentPolicyIndex: 2,
    // 4 positions: UCLA Lewis Center research shows cross-cutting (a=1)
    // YIMBY vs NIMBY cuts across party lines — 55% Dem vs 45% GOP support building near transit
    positions: [
      {
        title: 'Allow housing everywhere by right',
        description: 'Remove most zoning restrictions — any lot can have apartments',
        tradeoffs: [
          'Minneapolis eliminated single-family zoning in 2018; rents stabilized while neighbors\' didn\'t',
          'May change neighborhood character that existing residents value',
          'Reduces housing costs overall but benefits take 3-5 years to materialize',
        ],
      },
      {
        title: 'Allow density near transit and jobs',
        description: 'Upzone commercial corridors and transit stops, protect interior neighborhoods',
        tradeoffs: [
          'Concentrates growth where infrastructure already exists — more efficient use of public investment',
          'Can increase displacement pressure in transit-adjacent communities without anti-displacement measures',
          'Oregon, California have passed similar "middle housing" laws with bipartisan support',
        ],
      },
      {
        title: 'Case-by-case with community input',
        description: 'New development requires neighborhood review and approval',
        isCurrentPolicy: true,
        tradeoffs: [
          'Gives existing residents a voice in changes to their neighborhood',
          'Community review adds 1-3 years to project timelines, increasing housing costs (Up for Growth)',
          'Opposition tends to come from homeowners; renters are underrepresented in public hearings',
        ],
      },
      {
        title: 'Preserve current neighborhood character',
        description: 'Maintain existing zoning to protect community stability',
        tradeoffs: [
          'Protects property values and neighborhood feel for existing residents',
          'Restricting supply drives up housing costs — US is short ~3.8M homes (NAR 2024)',
          'Single-family zoning has historical roots in racial exclusion (Rothstein, "The Color of Law")',
        ],
      },
    ],
  },

  housing_affordability_tools: {
    axisId: 'housing_affordability_tools',
    question: 'Should government control rents and build public housing?',
    poleALabel: 'Rent Limits &\nPublic Housing',
    poleBLabel: 'Build More\nFewer Rules',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Strong rent control and public housing',
        description: 'Cap rents and invest heavily in public/nonprofit housing',
        tradeoffs: [
          'Protects existing tenants from displacement in rapidly gentrifying areas',
          'Most economists find rent control reduces long-run supply (Stanford study: 15% drop); some argue newer designs mitigate this',
          'Public housing wait lists average 2+ years in most major cities — funding has been cut since the 1990s',
        ],
      },
      {
        title: 'Rent stabilization with affordability requirements',
        description: 'Limit rent increases and require affordable units',
        tradeoffs: [
          'Inclusionary zoning requires 10-20% affordable units in new developments',
          'Developers may build less if affordability requirements reduce profit margins',
          'Stabilization helps current renters but doesn\'t create new affordable units',
        ],
      },
      {
        title: 'Mix of regulations and supply incentives',
        description: 'Some rent protections alongside encouraging construction',
        isCurrentPolicy: true,
        tradeoffs: [
          'LIHTC program produces ~100K affordable units/year — most successful US housing program',
          'NAHB estimates regulations add 30-40% to costs in high-cost cities; critics argue this conflates safety codes with land-use rules',
          'Neither pure regulation nor pure supply has solved affordability alone',
        ],
      },
      {
        title: 'Focus on increasing supply',
        description: 'Build more housing, limit regulations that slow construction',
        tradeoffs: [
          'Research shows every 10% increase in housing supply reduces rents 1-3% (Mast 2021)',
          'New market-rate construction is initially expensive; "filtering" takes decades to reach low-income',
          'Removing regulations can lead to lower quality construction and displacement',
        ],
      },
      {
        title: 'Let the market work',
        description: 'Remove rent controls and mandates to maximize building',
        tradeoffs: [
          'Markets efficiently allocate housing to those willing and able to pay',
          'Without affordability requirements, low-income housing is never profitable to build',
          'Houston (minimal zoning) has lower housing costs but also sprawl and flood risk',
        ],
      },
    ],
  },

  housing_transport_priority: {
    axisId: 'housing_transport_priority',
    question: 'Should cities invest more in transit or roads?',
    poleALabel: 'Transit &\nBiking',
    poleBLabel: 'Roads &\nParking',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Prioritize transit, walking, and biking',
        description: 'Shift funding toward sustainable transportation',
        tradeoffs: [
          'Transit riders have 76% lower carbon footprint for commuting (APTA)',
          'Transit investment doesn\'t serve rural and suburban areas effectively',
          'Bike/pedestrian infrastructure shows high health ROI, though estimates vary widely by study and context (10-25x range)',
        ],
      },
      {
        title: 'Major transit expansion',
        description: 'Grow bus and rail while maintaining roads',
        tradeoffs: [
          'Cities with strong transit (NYC, DC) have higher economic productivity per capita',
          'US transit construction costs are 2-5x higher than peer countries',
          'Transit ridership has not fully recovered post-COVID (~75% of 2019 levels)',
        ],
      },
      {
        title: 'Balanced investment',
        description: 'Fund transit, roads, and active transportation equally',
        isCurrentPolicy: true,
        tradeoffs: [
          'Federal Highway Trust Fund spends ~80% on roads, ~20% on transit',
          'Balanced approach can spread resources too thin to be effective in any mode',
          'Infrastructure needs vary dramatically by geography — one size doesn\'t fit all',
        ],
      },
      {
        title: 'Maintain roads with selective transit',
        description: 'Focus on road capacity, add transit where clearly needed',
        tradeoffs: [
          '85% of Americans commute by car — road investment serves the majority',
          'Adding highway lanes induces demand — congestion returns within 5-10 years (Texas A&M)',
          'Transit where ridership is high (urban corridors) can be cost-effective',
        ],
      },
      {
        title: 'Prioritize roads and parking',
        description: 'Ensure drivers can get where they need to go',
        tradeoffs: [
          'Supports the way most Americans currently live and commute',
          'Parking minimums add $30-50K per housing unit in construction costs',
          'Car-dependent development increases household transportation costs (~$12K/year avg)',
        ],
      },
    ],
  },

  justice_policing_accountability: {
    axisId: 'justice_policing_accountability',
    question: 'How much oversight should police have?',
    poleALabel: 'More Oversight\n& Alternatives',
    poleBLabel: 'More Police\n& Enforcement',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Strong independent oversight and alternatives',
        description: 'Civilian control and non-police crisis response',
        tradeoffs: [
          'CAHOOTS (Eugene, OR) diverts 5-8% of 911 calls to unarmed teams at 1/10th the cost',
          'Civilian boards often lack enforcement power — recommendations may be ignored',
          'Response time concerns for calls that escalate from non-violent to dangerous',
        ],
      },
      {
        title: 'Civilian review with alternative responders',
        description: 'Oversight plus mental health teams for some calls',
        tradeoffs: [
          'Denver STAR program: 0 arrests in 2,500+ mental health calls handled by clinicians',
          'Requires significant investment in training and staffing non-police responders',
          'Police unions often resist external oversight mechanisms',
        ],
      },
      {
        title: 'Advisory oversight, co-responder model',
        description: 'Police and mental health work together',
        isCurrentPolicy: true,
        tradeoffs: [
          'Co-responder programs in 20+ cities show reduced use of force on mental health calls',
          'Officers still lead most calls — presence of armed responder can escalate situations',
          '45-point partisan gap on whether major changes needed (Pew 2021)',
        ],
      },
      {
        title: 'Support police with crisis training',
        description: 'More officers trained in crisis intervention',
        tradeoffs: [
          'CIT training shown to reduce injuries to both officers and civilians',
          '40-hour training is minimal for complex mental health situations',
          'Training alone may not change department culture without structural reform',
        ],
      },
      {
        title: 'Expand police presence and authority',
        description: 'More officers with freedom to enforce proactively',
        tradeoffs: [
          'Research shows additional police reduce violent crime (10% more officers → 3-5% less crime — multiple studies)',
          'Proactive policing (stop-and-frisk) disproportionately targets minority communities (DOJ investigations)',
          'Police misconduct settlements cost large cities hundreds of millions annually',
        ],
      },
    ],
  },

  justice_sentencing_goals: {
    axisId: 'justice_sentencing_goals',
    question: 'Should the justice system focus on rehabilitation or punishment?',
    poleALabel: 'Focus on\nRehabilitation',
    poleBLabel: 'Focus on\nPunishment',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Rehabilitation and restoration',
        description: 'Focus on treatment, education, and reentry support',
        tradeoffs: [
          'Norway\'s rehab model has 20% recidivism vs. US 44% — though population and crime mix differ significantly',
          'Community supervision costs ~$5-10K/year vs. ~$35K/year for prison (varies widely by state)',
          'Victims\' rights advocates argue rehabilitation can undervalue harm done to victims',
        ],
      },
      {
        title: 'Shorter sentences with programming',
        description: 'Address root causes, invest in alternatives to prison',
        tradeoffs: [
          'First Step Act (2018) — bipartisan reform — reduced some federal sentences with broad support',
          'Drug courts reduce recidivism 8-14% compared to traditional prosecution (RAND)',
          'Short sentences may not allow time for meaningful treatment completion',
        ],
      },
      {
        title: 'Balance punishment and rehabilitation',
        description: 'Consequences plus programs for those who want them',
        isCurrentPolicy: true,
        tradeoffs: [
          'Most states offer some prison programs but funding is inconsistent',
          'US incarceration rate (531/100K) is highest in developed world — 5x the OECD average',
          'Participation-based programs may not reach those most likely to reoffend',
        ],
      },
      {
        title: 'Accountability with some programs',
        description: 'Clear punishment, programs available for motivated individuals',
        tradeoffs: [
          'Consistent sentencing promotes fairness and public trust in justice system',
          'Mandatory minimums reduce judicial discretion for individual circumstances',
          'Program availability varies dramatically by facility and state',
        ],
      },
      {
        title: 'Strict punishment and longer sentences',
        description: 'Remove offenders to protect the public',
        tradeoffs: [
          'Incapacitation does prevent crime during imprisonment (estimated 10-15% crime reduction)',
          'Diminishing returns: most crime committed by young adults who age out regardless of sentence length',
          'Long sentences destabilize families and communities — research links mass incarceration to intergenerational poverty',
        ],
      },
    ],
  },

  justice_firearms: {
    axisId: 'justice_firearms',
    question: 'How much regulation should there be on firearms?',
    poleALabel: 'Stronger Gun\nSafety Rules',
    poleBLabel: 'Fewer\nRestrictions',
    currentPolicyIndex: 3,
    // 6 positions: ANES V201338/V201340/V201342 identify distinct policy clusters
    // Pew 2023: 50-point partisan gap, bimodal distribution
    positions: [
      {
        title: 'Comprehensive licensing and registration',
        description: 'Mandatory training, licensing, and registration for all firearms',
        tradeoffs: [
          'Countries with licensing (Australia, Japan) have far lower gun death rates, though cultural factors and gun prevalence also differ',
          'Creates a national registry that many gun owners view as a precursor to confiscation',
          'Licensing costs and requirements may disproportionately affect low-income gun owners',
        ],
      },
      {
        title: 'Ban assault-style weapons and high-capacity magazines',
        description: 'Prohibit semi-automatic rifles and magazines over 10 rounds',
        tradeoffs: [
          '1994-2004 federal ban associated with reduced mass shooting fatalities (Stanford study)',
          'Defining "assault weapon" is legally difficult — cosmetic features vs. function',
          'An estimated 20M+ AR-style rifles already in circulation; enforcement is challenging',
        ],
      },
      {
        title: 'Universal background checks and red flag laws',
        description: 'Close private sale loopholes, allow courts to temporarily remove guns from at-risk individuals',
        tradeoffs: [
          'Background checks supported by 80%+ of voters including gun owners (Pew 2023)',
          'Red flag laws raise due process concerns — guns removed before a hearing',
          'Private sale enforcement is difficult without a registry',
        ],
      },
      {
        title: 'Current standards with state flexibility',
        description: 'Background checks for dealers, states set additional rules',
        isCurrentPolicy: true,
        tradeoffs: [
          'Allows states to tailor rules to local culture and needs',
          'Creates patchwork: strict states undercut by neighboring states with looser laws',
          'Private sales and gun shows can bypass federal background checks',
        ],
      },
      {
        title: 'Expand concealed carry and reduce restrictions',
        description: 'National concealed carry reciprocity, fewer purchase barriers',
        tradeoffs: [
          'More lawful carriers may deter some crimes (Lott research, debated)',
          'More guns in public spaces associated with higher rates of gun injuries (RAND)',
          'State-level variation in training requirements creates safety concerns',
        ],
      },
      {
        title: 'Constitutional carry, minimal regulation',
        description: 'No permits needed, few government barriers for law-abiding citizens',
        tradeoffs: [
          '25+ states have adopted permitless carry as of 2024',
          'Removes cost and time barriers that some see as infringing 2nd Amendment rights',
          'Multiple studies find permitless carry associated with increased gun violence; effect sizes and methods are debated (Everytown, Johns Hopkins)',
        ],
      },
    ],
  },

  climate_ambition: {
    axisId: 'climate_ambition',
    question: 'How quickly should we act on climate change?',
    poleALabel: 'Act Fast\non Climate',
    poleBLabel: 'Go Slow\nKeep Costs Low',
    currentPolicyIndex: 2,
    // 5 positions: Yale Climate Communication + ANES V201401
    // 50+ point partisan gap (Pew 2023), IRT a=3
    positions: [
      {
        title: 'Emergency climate mobilization',
        description: 'Aggressive action even with significant short-term costs',
        tradeoffs: [
          'IPCC says limiting warming to 1.5°C requires 45% emissions cuts by 2030',
          'Rapid transition could strand fossil fuel assets and raise energy costs in the short term, though long-term costs of inaction may be higher',
          'Energy price spikes disproportionately impact low-income households without targeted subsidies',
        ],
      },
      {
        title: 'Ambitious transition this decade',
        description: 'Major emissions cuts by 2035, net-zero by 2050',
        tradeoffs: [
          'Aligns with Paris Agreement targets and IRA investment timeline',
          'Clean energy jobs are growing 2x faster than overall employment (DOE 2024)',
          'Grid reliability concerns during transition — renewables need storage solutions',
        ],
      },
      {
        title: 'Steady transition balancing priorities',
        description: 'Meaningful progress while managing economic impacts',
        isCurrentPolicy: true,
        tradeoffs: [
          'Current US policy (IRA + EPA rules) targets 40% reduction by 2030',
          'May be too slow to avoid worst climate impacts per IPCC projections',
          'Balances energy security with emissions goals — politically durable',
        ],
      },
      {
        title: 'Gradual shift prioritizing affordability',
        description: 'Transition as clean energy becomes cost-competitive',
        tradeoffs: [
          'Solar and wind are already cheapest new electricity in most markets (Lazard 2024)',
          'Delays lock in fossil infrastructure with 30-50 year lifespans',
          'Protects energy-sector jobs and communities dependent on fossil fuel industry',
        ],
      },
      {
        title: 'Slow transition for stability',
        description: 'Avoid disrupting reliable, affordable energy',
        tradeoffs: [
          'Preserves existing energy infrastructure and jobs in the near term',
          'Delay increases adaptation costs — estimates range widely ($23T globally by 2050, Swiss Re; per-household impact depends on region)',
          'US fossil fuel production supports ~1.7M direct jobs, many in communities with few alternatives (BLS)',
        ],
      },
    ],
  },

  climate_energy_portfolio: {
    axisId: 'climate_energy_portfolio',
    question: 'What energy sources should we prioritize?',
    poleALabel: 'Solar &\nWind First',
    poleBLabel: 'Mix of\nAll Energy',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Renewables only',
        description: 'Phase out all fossil fuels, prioritize solar and wind',
        tradeoffs: [
          'Solar costs dropped 90% since 2010 — now cheapest new electricity in most markets (Lazard)',
          'Grid reliability requires storage solutions — battery costs still declining but not yet sufficient',
          'Critical mineral supply chains (lithium, cobalt) raise new geopolitical dependencies',
        ],
      },
      {
        title: 'Primarily renewables with nuclear',
        description: 'Clean energy priority including nuclear as baseload power',
        tradeoffs: [
          'Nuclear provides 24/7 carbon-free power that complements intermittent solar/wind',
          'New nuclear plants cost $10-15B and take 10+ years to build in the US',
          'Existing nuclear fleet (93 reactors) provides 19% of US electricity — carbon-free',
        ],
      },
      {
        title: 'Diverse energy mix',
        description: 'Support renewables alongside existing energy sources',
        isCurrentPolicy: true,
        tradeoffs: [
          'IRA invests $370B in clean energy over 10 years (~$300/household/year) while US remains world\'s top oil/gas producer',
          'Gallup 2024: 58% favor alternative energy vs. 38% fossil fuels',
          'Transition pace depends on technology cost curves — market forces are shifting mix',
        ],
      },
      {
        title: 'All-of-the-above including fossil fuels',
        description: 'Support domestic production across all energy types',
        tradeoffs: [
          'Energy security argument: domestic production reduces foreign dependency',
          'Natural gas produces ~50% less CO2 than coal — a "bridge fuel" argument',
          'Continued fossil investment locks in infrastructure with 30-50 year lifespans',
        ],
      },
      {
        title: 'Energy independence first',
        description: 'Maximize domestic fossil fuel production',
        tradeoffs: [
          'US is already a net energy exporter as of 2019 (EIA)',
          'Oil/gas industry supports ~1.7M direct jobs, many in rural communities (BLS)',
          'Expanding production conflicts with emissions reduction goals',
        ],
      },
    ],
  },

  climate_permitting: {
    axisId: 'climate_permitting',
    question: 'How should we balance environmental review with project speed?',
    poleALabel: 'Thorough\nReview First',
    poleBLabel: 'Faster\nApprovals',
    currentPolicyIndex: 1,
    // 4 positions: Low salience (a=1), most voters lack stable preferences
    // Double cross-cut: progressives split (build green fast vs protect communities),
    // conservatives split (cut red tape vs protect property rights)
    positions: [
      {
        title: 'Full environmental review for all projects',
        description: 'Comprehensive impact assessment before any construction',
        tradeoffs: [
          'NEPA review catches environmental harms before they happen — prevented thousands of toxic exposures',
          'Average federal permitting takes 4.5 years (GAO) — delays add 20-30% to project costs',
          'Review process gives affected communities a voice in decisions that impact their health',
        ],
      },
      {
        title: 'Standard review with time limits',
        description: 'Complete assessment within 2 years, with community input',
        isCurrentPolicy: true,
        tradeoffs: [
          'Debt ceiling deal (2023) imposed 2-year NEPA timelines — bipartisan compromise',
          'Time limits may rush review of complex projects with long-term environmental consequences',
          'Balances thoroughness with the cost of delay',
        ],
      },
      {
        title: 'Fast-track clean energy and housing',
        description: 'Streamlined permitting for projects that reduce emissions or increase housing',
        tradeoffs: [
          'Solar/wind projects face same permitting delays as fossil fuel projects — self-defeating',
          'Defining which projects qualify for fast-track creates lobbying and gaming opportunities',
          'Bipartisan appeal: progressives want green energy speed, conservatives want less red tape',
        ],
      },
      {
        title: 'Minimal review with basic safeguards',
        description: 'Approve most projects quickly, intervene only for clear harm',
        tradeoffs: [
          'Dramatically reduces construction costs and timelines',
          'Historical evidence: pre-NEPA era saw widespread pollution and environmental destruction',
          'Shifts burden from prevention to after-the-fact cleanup (often more expensive)',
        ],
      },
    ],
  },

  // ============================================
  // DETAILED AXIS CONFIGS (new design)
  // For future use when backend spec is updated
  // ============================================

  // DECOUPLED from old "econ_safetynet" which had false binary of "Support vs Initiative"
  // Now split into: WHO gets help (eligibility) and WHAT'S required (conditions)

  econ_benefit_eligibility: {
    axisId: 'econ_benefit_eligibility',
    question: 'Who should qualify for government assistance programs?',
    poleALabel: 'Universal\nAccess',
    poleBLabel: 'Targeted\nNeed',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Universal benefits for all citizens',
        description: 'Everyone receives support regardless of income level',
      },
      {
        title: 'Broad eligibility with high income thresholds',
        description: 'Most working and middle-class families qualify',
      },
      {
        title: 'Moderate means-testing',
        description: 'Benefits phase out as income rises above median',
        isCurrentPolicy: true,
      },
      {
        title: 'Strict income requirements',
        description: 'Only those below the poverty line qualify',
      },
      {
        title: 'Minimal eligibility for extreme hardship',
        description: 'Reserved for the most severe situations only',
      },
    ],
  },

  econ_benefit_conditions: {
    axisId: 'econ_benefit_conditions',
    question: 'Should receiving benefits require work, training, or other activities?',
    poleALabel: 'Unconditional\nSupport',
    poleBLabel: 'Work-Linked\nBenefits',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'No conditions on receiving benefits',
        description: 'People know their own circumstances best',
      },
      {
        title: 'Voluntary support services offered',
        description: 'Job training and services available but not required',
      },
      {
        title: 'Work requirements with broad exemptions',
        description: 'Most must work or train, with exceptions for caregivers, disabled, students',
        isCurrentPolicy: true,
      },
      {
        title: 'Strict work requirements for able-bodied adults',
        description: 'Work or job training required to receive benefits',
      },
      {
        title: 'Time-limited benefits with strict requirements',
        description: 'Short-term help only, strong incentives to become self-sufficient',
      },
    ],
  },

  econ_taxes_spending: {
    axisId: 'econ_taxes_spending',
    question: 'How should we balance public services and tax levels?',
    poleALabel: 'More Services\nHigher Taxes',
    poleBLabel: 'Lower Taxes\nFewer Services',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Significantly increase public investment',
        description: 'Major expansion of schools, infrastructure, and services funded by higher taxes',
      },
      {
        title: 'Moderate tax increases for key priorities',
        description: 'Targeted investments in high-priority community needs',
      },
      {
        title: 'Maintain current balance',
        description: 'Keep existing service levels with current tax rates',
        isCurrentPolicy: true,
      },
      {
        title: 'Reduce taxes while protecting essentials',
        description: 'Focus spending on core services, return savings to taxpayers',
      },
      {
        title: 'Substantially lower taxes and spending',
        description: 'Significantly reduce government role, maximize personal income',
      },
    ],
  },

  // REFRAMED from old "econ_school_choice" which had false binary of "Public Schools vs Choice"
  // Real question: Where should education funding flow?

  econ_education_funding: {
    axisId: 'econ_education_funding',
    question: 'Where should public education funding go?',
    poleALabel: 'District\nSchools',
    poleBLabel: 'Follows\nStudent',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Fund neighborhood public schools exclusively',
        description: 'All public education dollars go to district-run schools',
      },
      {
        title: 'Primarily fund district schools with limited alternatives',
        description: 'Most funding to public schools, some magnet and charter options',
      },
      {
        title: 'Mixed funding across school types',
        description: 'Public schools alongside state-regulated charter programs',
        isCurrentPolicy: true,
      },
      {
        title: 'Significant funding portability',
        description: 'Families can direct funds to various approved schools',
      },
      {
        title: 'Full funding follows the student',
        description: 'Families choose any school and funding follows their choice',
      },
    ],
  },

  // ============================================
  // HEALTHCARE & PUBLIC HEALTH
  // ============================================

  // DECOUPLED from old "health_coverage_model" which had false binary of "Access vs Choice"
  // Now split into: Should coverage be universal? And who provides it?

  health_coverage_scope: {
    axisId: 'health_coverage_scope',
    question: 'Should health insurance coverage be required for everyone?',
    poleALabel: 'Universal\nCoverage',
    poleBLabel: 'Voluntary\nCoverage',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Automatic enrollment for all residents',
        description: 'Everyone is covered by default, no gaps in coverage',
      },
      {
        title: 'Coverage required with strong subsidies',
        description: 'Individual mandate with substantial help for affordability',
      },
      {
        title: 'Coverage encouraged but not required',
        description: 'Subsidies available, penalties removed for being uninsured',
        isCurrentPolicy: true,
      },
      {
        title: 'Coverage fully optional',
        description: 'People choose whether to buy insurance based on their needs',
      },
      {
        title: 'No government role in coverage decisions',
        description: 'Insurance is a personal decision without government involvement',
      },
    ],
  },

  health_coverage_system: {
    axisId: 'health_coverage_system',
    question: 'Who should provide health insurance?',
    poleALabel: 'Public\nSystem',
    poleBLabel: 'Private\nMarket',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Single government-run health system',
        description: 'One public program covers everyone',
      },
      {
        title: 'Public option competes with private plans',
        description: 'Government plan available to all who want it',
      },
      {
        title: 'Mix of public programs and private insurance',
        description: 'Medicare/Medicaid for some, employer plans for others',
        isCurrentPolicy: true,
      },
      {
        title: 'Private insurance with government subsidies',
        description: 'Market-based coverage with help for those who need it',
      },
      {
        title: 'Fully private insurance market',
        description: 'Individuals buy coverage directly from insurers',
      },
    ],
  },

  health_cost_approach: {
    axisId: 'health_cost_approach',
    question: 'How should we control healthcare costs?',
    poleALabel: 'Price\nRegulation',
    poleBLabel: 'Market\nForces',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Government sets all healthcare prices',
        description: 'Comprehensive price controls across the system',
      },
      {
        title: 'Regulate prices in key areas',
        description: 'Negotiate drug prices, cap hospital charges, limit surprise bills',
      },
      {
        title: 'Mix of regulation and competition',
        description: 'Some price rules plus transparency to enable shopping',
        isCurrentPolicy: true,
      },
      {
        title: 'Promote competition and price transparency',
        description: 'Require price disclosure so consumers can compare',
      },
      {
        title: 'Let market competition set prices',
        description: 'Competition between providers drives efficiency',
      },
    ],
  },

  // DECOUPLED from old "health_public_health" which had false binary of "Prevention vs Responsibility"
  // Now split into: Level of public health intervention, and approach to substance use

  health_prevention_programs: {
    axisId: 'health_prevention_programs',
    question: 'How active should government be in promoting public health?',
    poleALabel: 'Proactive\nPrograms',
    poleBLabel: 'Minimal\nIntervention',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Comprehensive public health campaigns',
        description: 'Active government programs on nutrition, exercise, screenings',
      },
      {
        title: 'Robust prevention and education efforts',
        description: 'Fund community health programs and health education',
      },
      {
        title: 'Moderate public health initiatives',
        description: 'Basic health campaigns and disease monitoring',
        isCurrentPolicy: true,
      },
      {
        title: 'Limited to essential disease control',
        description: 'Focus on contagious disease prevention only',
      },
      {
        title: 'Minimal government health promotion',
        description: 'Leave health decisions to individuals and doctors',
      },
    ],
  },

  health_substance_policy: {
    axisId: 'health_substance_policy',
    question: 'How should we address substance use and addiction?',
    poleALabel: 'Treatment\nFocus',
    poleBLabel: 'Enforcement\nFocus',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Treat addiction as a health issue',
        description: 'Decriminalize use, invest heavily in treatment and harm reduction',
      },
      {
        title: 'Prioritize treatment with some enforcement',
        description: 'Expand treatment options, reduce penalties for personal use',
      },
      {
        title: 'Balance treatment and enforcement',
        description: 'Fund both treatment programs and drug enforcement',
        isCurrentPolicy: true,
      },
      {
        title: 'Enforcement with treatment options',
        description: 'Maintain drug laws, offer treatment as alternative to jail',
      },
      {
        title: 'Strong enforcement against drug use',
        description: 'Criminal penalties deter use and protect communities',
      },
    ],
  },

  // ============================================
  // HOUSING & LOCAL GROWTH
  // ============================================

  housing_density: {
    axisId: 'housing_density',
    question: 'How much new housing should be allowed in existing neighborhoods?',
    poleALabel: 'Allow\nMore Density',
    poleBLabel: 'Preserve\nCurrent Zoning',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Allow housing by right everywhere',
        description: 'Remove most zoning restrictions to maximize supply',
      },
      {
        title: 'Significantly expand where housing can be built',
        description: 'Allow apartments near transit, jobs, and commercial areas',
      },
      {
        title: 'Moderate density increases in select areas',
        description: 'Some upzoning while protecting established neighborhoods',
        isCurrentPolicy: true,
      },
      {
        title: 'Limited growth with community approval',
        description: 'New density requires neighborhood input and approval',
      },
      {
        title: 'Maintain current neighborhood character',
        description: 'Preserve existing zoning to protect communities',
      },
    ],
  },

  // REFRAMED from old "housing_affordability_tools" which had false binary of "Rent Control vs Supply"
  // Supply is covered by housing_density. This now focuses on rent regulation specifically.

  housing_rent_regulation: {
    axisId: 'housing_rent_regulation',
    question: 'Should government limit how much landlords can raise rents?',
    poleALabel: 'Strong Rent\nLimits',
    poleBLabel: 'Market\nRents',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Strict rent control on all housing',
        description: 'Cap rent increases across the board to protect tenants',
      },
      {
        title: 'Rent stabilization for most housing',
        description: 'Limit annual increases, with some exemptions for new construction',
      },
      {
        title: 'Rent limits in some jurisdictions',
        description: 'States and cities decide whether to regulate rents',
        isCurrentPolicy: true,
      },
      {
        title: 'Minimal rent regulation',
        description: 'Let market set rents, with limited protections',
      },
      {
        title: 'No government rent limits',
        description: 'Landlords and tenants negotiate freely',
      },
    ],
  },

  housing_transport_investment: {
    axisId: 'housing_transport_investment',
    question: 'How should transportation funding be prioritized?',
    poleALabel: 'Transit &\nBikes',
    poleBLabel: 'Roads &\nParking',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Prioritize transit, walking, and biking',
        description: 'Shift funding toward sustainable transportation',
      },
      {
        title: 'Invest heavily in transit expansion',
        description: 'Grow bus and rail while maintaining roads',
      },
      {
        title: 'Balanced investment across all modes',
        description: 'Fund transit, roads, and active transportation',
        isCurrentPolicy: true,
      },
      {
        title: 'Maintain roads with selective transit',
        description: 'Focus on road capacity, add transit where clearly needed',
      },
      {
        title: 'Prioritize roads and parking',
        description: 'Ensure drivers can get where they need to go',
      },
    ],
  },

  // ============================================
  // PUBLIC SAFETY & JUSTICE
  // ============================================

  // DECOUPLED from old "justice_policing_accountability" which had false binary of "Community vs Enforcement"
  // Now split into: Who responds to crises? And what oversight exists?

  justice_crisis_response: {
    axisId: 'justice_crisis_response',
    question: 'Who should respond to mental health crises and non-violent emergencies?',
    poleALabel: 'Civilian\nResponders',
    poleBLabel: 'Police\nResponse',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Dedicated civilian crisis teams',
        description: 'Mental health professionals and social workers handle most calls',
      },
      {
        title: 'Civilian responders as primary, police as backup',
        description: 'Non-police handle crises unless safety threat emerges',
      },
      {
        title: 'Co-responder teams',
        description: 'Police and mental health professionals respond together',
        isCurrentPolicy: true,
      },
      {
        title: 'Police-led with crisis training',
        description: 'Officers trained in crisis intervention take the lead',
      },
      {
        title: 'Police handle all emergency calls',
        description: 'Uniformed officers respond to maintain order and safety',
      },
    ],
  },

  justice_police_oversight: {
    axisId: 'justice_police_oversight',
    question: 'How much independent oversight should police departments have?',
    poleALabel: 'Strong\nOversight',
    poleBLabel: 'Department\nDiscretion',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Independent oversight with enforcement power',
        description: 'Civilian board can investigate, discipline, and set policy',
      },
      {
        title: 'Civilian review with investigative authority',
        description: 'Independent body investigates complaints and recommends action',
      },
      {
        title: 'Advisory civilian oversight',
        description: 'Civilian input on policy, internal affairs handles complaints',
        isCurrentPolicy: true,
      },
      {
        title: 'Internal accountability with some transparency',
        description: 'Department handles discipline with public reporting',
      },
      {
        title: 'Department self-governance',
        description: 'Police leadership manages accountability internally',
      },
    ],
  },

  // REFRAMED from old "justice_sentencing_goals" which had false binary of "Second Chances vs Public Safety"
  // Everyone wants public safety. Real question: Primary approach to achieving it.

  justice_incarceration_approach: {
    axisId: 'justice_incarceration_approach',
    question: 'What should be the primary purpose of incarceration?',
    poleALabel: 'Rehabilitation\n& Reentry',
    poleBLabel: 'Punishment\n& Deterrence',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Focus on rehabilitation and restoration',
        description: 'Prison time centered on treatment, education, and preparing for release',
      },
      {
        title: 'Rehabilitation priority with accountability',
        description: 'Shorter sentences focused on addressing root causes',
      },
      {
        title: 'Balance punishment and rehabilitation',
        description: 'Meaningful consequences plus programming for those who want it',
        isCurrentPolicy: true,
      },
      {
        title: 'Accountability with some rehabilitation',
        description: 'Clear punishment, programs available for motivated individuals',
      },
      {
        title: 'Focus on punishment and incapacitation',
        description: 'Remove offenders from society to protect the public',
      },
    ],
  },

  justice_sentence_length: {
    axisId: 'justice_sentence_length',
    question: 'How long should prison sentences generally be?',
    poleALabel: 'Shorter\nSentences',
    poleBLabel: 'Longer\nSentences',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Significantly reduce sentence lengths',
        description: 'Research shows diminishing returns after a few years',
      },
      {
        title: 'Reduce sentences for non-violent offenses',
        description: 'Reserve long sentences for serious violent crimes',
      },
      {
        title: 'Current sentencing guidelines',
        description: 'Maintain existing ranges with judicial discretion',
        isCurrentPolicy: true,
      },
      {
        title: 'Increase sentences for repeat offenders',
        description: 'Longer terms for those who continue to offend',
      },
      {
        title: 'Longer sentences across the board',
        description: 'Keep dangerous people away from society longer',
      },
    ],
  },

  // REFRAMED from old "justice_firearms" which had false binary of "Safety vs Rights"
  // Real question: Level of firearm regulation

  justice_firearm_regulation: {
    axisId: 'justice_firearm_regulation',
    question: 'How much regulation should there be on firearm purchases and ownership?',
    poleALabel: 'More\nRegulation',
    poleBLabel: 'Fewer\nRestrictions',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Comprehensive licensing and registration',
        description: 'Mandatory training, licensing, and registration for all firearms',
      },
      {
        title: 'Universal background checks with waiting periods',
        description: 'Close private sale loopholes, add cooling-off periods',
      },
      {
        title: 'Current federal standards with state flexibility',
        description: 'Background checks for dealers, states set additional rules',
        isCurrentPolicy: true,
      },
      {
        title: 'Streamlined purchasing with basic checks',
        description: 'Quick background checks, fewer restrictions on what can be purchased',
      },
      {
        title: 'Minimal regulation for law-abiding citizens',
        description: 'Second Amendment rights with few government barriers',
      },
    ],
  },

  // ============================================
  // CLIMATE, ENERGY & ENVIRONMENT
  // ============================================

  climate_transition_speed: {
    axisId: 'climate_transition_speed',
    question: 'How quickly should we transition away from fossil fuels?',
    poleALabel: 'Rapid\nTransition',
    poleBLabel: 'Gradual\nTransition',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Emergency climate mobilization',
        description: 'Aggressive deadlines even with significant short-term disruption',
      },
      {
        title: 'Ambitious transition this decade',
        description: 'Major emissions cuts by 2035, net-zero by 2050',
      },
      {
        title: 'Steady transition balancing priorities',
        description: 'Meaningful progress while managing economic impacts',
        isCurrentPolicy: true,
      },
      {
        title: 'Gradual shift prioritizing affordability',
        description: 'Transition as clean energy becomes cost-competitive',
      },
      {
        title: 'Slow transition to ensure stability',
        description: 'Avoid disrupting reliable, affordable energy',
      },
    ],
  },

  climate_clean_energy_investment: {
    axisId: 'climate_clean_energy_investment',
    question: 'How much should government invest in clean energy development?',
    poleALabel: 'Major\nInvestment',
    poleBLabel: 'Market\nLed',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Massive public investment in clean energy',
        description: 'Government leads buildout of renewable infrastructure',
      },
      {
        title: 'Substantial subsidies and incentives',
        description: 'Tax credits, grants, and loans to accelerate adoption',
      },
      {
        title: 'Moderate support for clean energy',
        description: 'Some incentives while letting markets develop',
        isCurrentPolicy: true,
      },
      {
        title: 'Limited, targeted incentives',
        description: 'Support only breakthrough technologies',
      },
      {
        title: 'Let markets drive energy investment',
        description: 'Remove subsidies for all energy types',
      },
    ],
  },

  climate_fossil_fuel_policy: {
    axisId: 'climate_fossil_fuel_policy',
    question: 'What policies should apply to oil, gas, and coal production?',
    poleALabel: 'Phase Out\nFossil Fuels',
    poleBLabel: 'Support\nDomestic Production',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Ban new fossil fuel projects',
        description: 'No new drilling, mining, or pipelines permitted',
      },
      {
        title: 'Restrict expansion, remove subsidies',
        description: 'Wind down support and limit new development',
      },
      {
        title: 'Current mix of regulation and support',
        description: 'Some environmental rules alongside production incentives',
        isCurrentPolicy: true,
      },
      {
        title: 'Streamline permitting for domestic production',
        description: 'Reduce barriers to American energy development',
      },
      {
        title: 'Maximize domestic fossil fuel production',
        description: 'Energy independence through all available resources',
      },
    ],
  },

  climate_permitting_speed: {
    axisId: 'climate_permitting_speed',
    question: 'How should we balance environmental review thoroughness with project speed?',
    poleALabel: 'Thorough\nReview',
    poleBLabel: 'Faster\nApproval',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Comprehensive review for all projects',
        description: 'Full environmental and community impact assessment required',
      },
      {
        title: 'Thorough review with reasonable timelines',
        description: 'Complete assessment within defined time limits',
      },
      {
        title: 'Balanced review process',
        description: 'Standard review with expedited paths for some projects',
        isCurrentPolicy: true,
      },
      {
        title: 'Streamlined approval for priority projects',
        description: 'Faster permitting for clean energy and housing',
      },
      {
        title: 'Rapid approval with basic safeguards',
        description: 'Minimize delays while maintaining core protections',
      },
    ],
  },
};

/**
 * Get the slider configuration for an axis
 */
export function getSliderConfig(axisId: string): AxisSliderConfig | undefined {
  return axisSliderConfigs[axisId];
}

/**
 * Get all axis IDs that have slider configurations
 */
export function getAvailableSliderAxes(): string[] {
  return Object.keys(axisSliderConfigs);
}

/**
 * Convert a slider position (0-4 for 5 positions) to axis score (-1 to +1)
 * Position 0 = poleA (-1), Position 4 = poleB (+1)
 */
export function sliderPositionToScore(position: number, totalPositions: number): number {
  // Map 0 to -1, max to +1
  return ((position / (totalPositions - 1)) * 2) - 1;
}

/**
 * Get the color for a position based on its index
 * Center (current policy) is grey, edges are purple/teal
 */
export function getPositionColor(index: number, totalPositions: number, currentPolicyIndex: number): string {
  const midpoint = currentPolicyIndex;

  if (index === midpoint) {
    return '#9CA3AF'; // Grey - current policy
  }

  // Calculate how far from center (normalized 0-1)
  const distanceFromCenter = Math.abs(index - midpoint) / midpoint;

  if (index < midpoint) {
    // Purple side (poleA)
    if (distanceFromCenter > 0.5) {
      return '#A855F7'; // Deep purple
    }
    return '#C084FC'; // Light purple
  } else {
    // Teal side (poleB)
    if (distanceFromCenter > 0.5) {
      return '#14B8A6'; // Deep teal
    }
    return '#5EEAD4'; // Light teal
  }
}
