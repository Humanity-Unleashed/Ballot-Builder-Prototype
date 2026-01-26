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
      },
      {
        title: 'Broad eligibility with some conditions',
        description: 'Wide access to assistance with basic requirements',
      },
      {
        title: 'Targeted programs with work incentives',
        description: 'Benefits for those in need with participation requirements',
        isCurrentPolicy: true,
      },
      {
        title: 'Strict eligibility and conditions',
        description: 'Aid limited to verified need with strong work requirements',
      },
      {
        title: 'Minimal safety net',
        description: 'Limited government assistance, emphasize self-reliance',
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
      },
      {
        title: 'Targeted public investments',
        description: 'Increase funding for high-priority community needs',
      },
      {
        title: 'Maintain current balance',
        description: 'Keep existing service and tax levels',
        isCurrentPolicy: true,
      },
      {
        title: 'Reduce spending, lower taxes',
        description: 'Cut programs to return money to taxpayers',
      },
      {
        title: 'Minimal government spending',
        description: 'Dramatically reduce taxes and public programs',
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
      },
      {
        title: 'Prioritize public schools',
        description: 'Most funding to public schools with limited alternatives',
      },
      {
        title: 'Mixed public and choice options',
        description: 'Public schools alongside charter and magnet programs',
        isCurrentPolicy: true,
      },
      {
        title: 'Expand school choice',
        description: 'Significant funding for charters, vouchers, and alternatives',
      },
      {
        title: 'Full funding portability',
        description: 'Families choose any school, funding follows the student',
      },
    ],
  },

  health_coverage_model: {
    axisId: 'health_coverage_model',
    question: 'Should government offer health insurance to everyone?',
    poleALabel: 'More Government\nInsurance',
    poleBLabel: 'More Private\nInsurance',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Single-payer government health system',
        description: 'One public program covers everyone',
      },
      {
        title: 'Public option available to all',
        description: 'Government plan competes with private insurance',
      },
      {
        title: 'Mix of public and private coverage',
        description: 'Medicare/Medicaid for some, employer plans for others',
        isCurrentPolicy: true,
      },
      {
        title: 'Private insurance with subsidies',
        description: 'Market-based coverage with help for those who need it',
      },
      {
        title: 'Fully private insurance market',
        description: 'Individuals buy coverage directly from insurers',
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
      },
      {
        title: 'Regulate prices in key areas',
        description: 'Negotiate drug prices, cap hospital charges',
      },
      {
        title: 'Mix of regulation and competition',
        description: 'Some price rules plus transparency for shopping',
        isCurrentPolicy: true,
      },
      {
        title: 'Promote competition and transparency',
        description: 'Require price disclosure so consumers can compare',
      },
      {
        title: 'Let market set prices',
        description: 'Competition between providers drives efficiency',
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
      },
      {
        title: 'Robust health education and services',
        description: 'Fund community health and treatment programs',
      },
      {
        title: 'Balanced approach',
        description: 'Some public health programs alongside personal responsibility',
        isCurrentPolicy: true,
      },
      {
        title: 'Limited intervention',
        description: 'Focus on essential disease control only',
      },
      {
        title: 'Minimal government role',
        description: 'Leave health decisions to individuals, enforce drug laws',
      },
    ],
  },

  housing_supply_zoning: {
    axisId: 'housing_supply_zoning',
    question: 'Should cities allow more housing to be built in existing neighborhoods?',
    poleALabel: 'Build More\nAllow Density',
    poleBLabel: 'Preserve\nLimit Growth',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Allow housing everywhere by right',
        description: 'Remove most zoning restrictions to maximize supply',
      },
      {
        title: 'Significantly expand where housing can go',
        description: 'Allow apartments near transit, jobs, and commercial areas',
      },
      {
        title: 'Moderate density in select areas',
        description: 'Some upzoning while protecting established neighborhoods',
        isCurrentPolicy: true,
      },
      {
        title: 'Limited growth with community input',
        description: 'New density requires neighborhood approval',
      },
      {
        title: 'Preserve current neighborhood character',
        description: 'Maintain existing zoning to protect communities',
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
      },
      {
        title: 'Rent stabilization with affordability requirements',
        description: 'Limit rent increases and require affordable units',
      },
      {
        title: 'Mix of regulations and supply incentives',
        description: 'Some rent protections alongside encouraging construction',
        isCurrentPolicy: true,
      },
      {
        title: 'Focus on increasing supply',
        description: 'Build more housing, limit regulations that slow construction',
      },
      {
        title: 'Let the market work',
        description: 'Remove rent controls and mandates to maximize building',
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
      },
      {
        title: 'Major transit expansion',
        description: 'Grow bus and rail while maintaining roads',
      },
      {
        title: 'Balanced investment',
        description: 'Fund transit, roads, and active transportation equally',
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
      },
      {
        title: 'Civilian review with alternative responders',
        description: 'Oversight plus mental health teams for some calls',
      },
      {
        title: 'Advisory oversight, co-responder model',
        description: 'Police and mental health work together',
        isCurrentPolicy: true,
      },
      {
        title: 'Support police with crisis training',
        description: 'More officers trained in crisis intervention',
      },
      {
        title: 'Expand police presence and authority',
        description: 'More officers with freedom to enforce proactively',
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
      },
      {
        title: 'Shorter sentences with programming',
        description: 'Address root causes, invest in alternatives to prison',
      },
      {
        title: 'Balance punishment and rehabilitation',
        description: 'Consequences plus programs for those who want them',
        isCurrentPolicy: true,
      },
      {
        title: 'Accountability with some programs',
        description: 'Clear punishment, programs available for motivated individuals',
      },
      {
        title: 'Strict punishment and longer sentences',
        description: 'Remove offenders to protect the public',
      },
    ],
  },

  justice_firearms: {
    axisId: 'justice_firearms',
    question: 'How much regulation should there be on firearms?',
    poleALabel: 'Stronger Gun\nSafety Rules',
    poleBLabel: 'Fewer\nRestrictions',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Comprehensive licensing and registration',
        description: 'Mandatory training, licensing, and registration for all firearms',
      },
      {
        title: 'Universal background checks and waiting periods',
        description: 'Close private sale loopholes, add cooling-off periods',
      },
      {
        title: 'Current standards with state flexibility',
        description: 'Background checks for dealers, states set additional rules',
        isCurrentPolicy: true,
      },
      {
        title: 'Streamlined purchasing',
        description: 'Quick background checks, fewer restrictions',
      },
      {
        title: 'Minimal regulation',
        description: 'Few government barriers for law-abiding citizens',
      },
    ],
  },

  climate_ambition: {
    axisId: 'climate_ambition',
    question: 'How quickly should we act on climate change?',
    poleALabel: 'Act Fast\non Climate',
    poleBLabel: 'Go Slow\nKeep Costs Low',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Emergency climate mobilization',
        description: 'Aggressive action even with significant short-term costs',
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
        title: 'Slow transition for stability',
        description: 'Avoid disrupting reliable, affordable energy',
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
      },
      {
        title: 'Primarily renewables',
        description: 'Major investment in clean energy, limit fossil expansion',
      },
      {
        title: 'Diverse energy mix',
        description: 'Support renewables alongside existing energy sources',
        isCurrentPolicy: true,
      },
      {
        title: 'All-of-the-above including fossil fuels',
        description: 'Support domestic production across all energy types',
      },
      {
        title: 'Energy independence first',
        description: 'Maximize domestic fossil fuel production',
      },
    ],
  },

  climate_permitting: {
    axisId: 'climate_permitting',
    question: 'How should we balance environmental review with project speed?',
    poleALabel: 'Thorough\nReview First',
    poleBLabel: 'Faster\nApprovals',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Comprehensive environmental review',
        description: 'Full impact assessment for all projects',
      },
      {
        title: 'Thorough review with timelines',
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
