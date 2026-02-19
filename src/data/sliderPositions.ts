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
  description: string;
  isCurrentPolicy?: boolean;
}

export interface AxisSliderConfig {
  axisId: string;
  question: string;
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
    currentPolicyIndex: 2,
    positions: [
      { description: 'Benefits available to all residents with no conditions' },
      { description: 'Broad eligibility with basic participation encouraged' },
      { description: 'Benefits for those in need with work or training requirements', isCurrentPolicy: true },
      { description: 'Strict income limits and mandatory work requirements' },
      { description: 'Minimal government assistance; emphasis on self-reliance' },
    ],
  },

  econ_investment: {
    axisId: 'econ_investment',
    question: 'Should we pay more in taxes to fund public services?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Significantly raise taxes to expand schools, infrastructure, and services' },
      { description: 'Modestly increase taxes to fund high-priority needs' },
      { description: 'Maintain current tax and service levels', isCurrentPolicy: true },
      { description: 'Cut programs to lower taxes' },
      { description: 'Drastically reduce taxes and government services' },
    ],
  },

  econ_school_choice: {
    axisId: 'econ_school_choice',
    question: 'Should education funding focus on public schools or follow student choice?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'All public education funding goes to neighborhood public schools' },
      { description: 'Most funding to public schools with limited charter options' },
      { description: 'Public schools alongside charter and magnet programs', isCurrentPolicy: true },
      { description: 'Expand vouchers and charters so families can choose alternatives' },
      { description: 'Families choose any school and funding follows the student' },
    ],
  },

  health_coverage_model: {
    axisId: 'health_coverage_model',
    question: 'Should government offer health insurance to everyone?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Single government program covers everyone' },
      { description: 'Government plan available to all, competing with private insurers' },
      { description: 'Medicare/Medicaid for some; employer and private plans for others', isCurrentPolicy: true },
      { description: 'Private insurance market with subsidies for those who need help' },
      { description: 'Fully private insurance market without government plans' },
    ],
  },

  health_cost_control: {
    axisId: 'health_cost_control',
    question: 'Should government set limits on healthcare prices?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Government sets all healthcare prices' },
      { description: 'Government negotiates drug prices and caps hospital charges' },
      { description: 'Some price regulations alongside transparency requirements', isCurrentPolicy: true },
      { description: 'Require price disclosure so consumers can shop and compare' },
      { description: 'Let competition between providers set prices' },
    ],
  },

  health_public_health: {
    axisId: 'health_public_health',
    question: 'How should government approach public health and drug policy?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Government leads prevention, treatment, and harm reduction programs' },
      { description: 'Fund community health education and treatment services' },
      { description: 'Basic public health programs alongside personal responsibility', isCurrentPolicy: true },
      { description: 'Government focuses only on controlling contagious diseases' },
      { description: 'Leave health decisions to individuals; enforce drug laws' },
    ],
  },

  housing_supply_zoning: {
    axisId: 'housing_supply_zoning',
    question: 'Should cities allow more housing to be built in existing neighborhoods?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Remove most zoning restrictions to allow housing anywhere' },
      { description: 'Allow apartments near transit, jobs, and commercial areas' },
      { description: 'Allow some density increases while protecting established neighborhoods', isCurrentPolicy: true },
      { description: 'Require neighborhood approval for new density' },
      { description: 'Maintain existing zoning to preserve neighborhood character' },
    ],
  },

  housing_affordability_tools: {
    axisId: 'housing_affordability_tools',
    question: 'Should government control rents and build public housing?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Cap rents and invest heavily in public housing' },
      { description: 'Limit rent increases and require affordable units in new developments' },
      { description: 'Some rent protections alongside incentives for new construction', isCurrentPolicy: true },
      { description: 'Focus on building more housing; limit regulations that slow construction' },
      { description: 'Remove rent controls and mandates; let the market set prices' },
    ],
  },

  housing_transport_priority: {
    axisId: 'housing_transport_priority',
    question: 'Should cities invest more in transit or roads?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Shift transportation funding toward transit, walking, and biking' },
      { description: 'Expand bus and rail service while maintaining existing roads' },
      { description: 'Fund transit, roads, and active transportation equally', isCurrentPolicy: true },
      { description: 'Focus on road capacity; add transit only where clearly needed' },
      { description: 'Prioritize roads and parking to serve drivers' },
    ],
  },

  justice_policing_accountability: {
    axisId: 'justice_policing_accountability',
    question: 'How much oversight should police have?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Civilian control of police and non-police crisis response teams' },
      { description: 'Civilian review boards plus mental health teams for some calls' },
      { description: 'Advisory civilian oversight; police and mental health co-respond', isCurrentPolicy: true },
      { description: 'More officers trained in crisis intervention; internal oversight' },
      { description: 'Expand police presence with broad authority to enforce proactively' },
    ],
  },

  justice_sentencing_goals: {
    axisId: 'justice_sentencing_goals',
    question: 'Should the justice system focus on rehabilitation or punishment?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Focus on treatment, education, and reentry support' },
      { description: 'Shorter sentences with programs addressing root causes' },
      { description: 'Balance punishment with programs for those who want them', isCurrentPolicy: true },
      { description: 'Clear punishment with programs available for motivated individuals' },
      { description: 'Longer sentences to remove offenders and protect the public' },
    ],
  },

  justice_firearms: {
    axisId: 'justice_firearms',
    question: 'How much regulation should there be on firearms?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Require training, licensing, and registration for all firearms' },
      { description: 'Universal background checks and waiting periods for all sales' },
      { description: 'Background checks for dealers; states set additional rules', isCurrentPolicy: true },
      { description: 'Streamlined purchasing with quick background checks' },
      { description: 'Minimal regulation for law-abiding citizens' },
    ],
  },

  climate_ambition: {
    axisId: 'climate_ambition',
    question: 'How quickly should we act on climate change?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Emergency action even with significant short-term costs' },
      { description: 'Major emissions cuts by 2035, net-zero by 2050' },
      { description: 'Steady progress while managing economic impacts', isCurrentPolicy: true },
      { description: 'Gradual transition as clean energy becomes cost-competitive' },
      { description: 'Slow transition to avoid disrupting reliable, affordable energy' },
    ],
  },

  climate_energy_portfolio: {
    axisId: 'climate_energy_portfolio',
    question: 'What energy sources should we prioritize?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Phase out fossil fuels; prioritize solar and wind' },
      { description: 'Major investment in renewables; limit fossil fuel expansion' },
      { description: 'Support renewables alongside existing energy sources', isCurrentPolicy: true },
      { description: 'Support domestic production of all energy types including fossil fuels' },
      { description: 'Maximize domestic fossil fuel production for energy independence' },
    ],
  },

  climate_permitting: {
    axisId: 'climate_permitting',
    question: 'How should we balance environmental review with project speed?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Require full environmental impact assessment for all projects' },
      { description: 'Thorough review within defined time limits' },
      { description: 'Standard review with expedited paths for some projects', isCurrentPolicy: true },
      { description: 'Faster permitting for clean energy and housing projects' },
      { description: 'Rapid approval with only basic environmental safeguards' },
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
    currentPolicyIndex: 2,
    positions: [
      { description: 'Everyone receives support regardless of income' },
      { description: 'Most working and middle-class families qualify' },
      { description: 'Benefits phase out as income rises above median', isCurrentPolicy: true },
      { description: 'Only those below the poverty line qualify' },
      { description: 'Reserved for extreme hardship situations only' },
    ],
  },

  econ_benefit_conditions: {
    axisId: 'econ_benefit_conditions',
    question: 'Should receiving benefits require work, training, or other activities?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'No conditions on receiving benefits' },
      { description: 'Job training and services available but not required' },
      { description: 'Work requirements with exemptions for caregivers, disabled, students', isCurrentPolicy: true },
      { description: 'Able-bodied adults must work or train to receive benefits' },
      { description: 'Time-limited benefits with strict work requirements' },
    ],
  },

  econ_taxes_spending: {
    axisId: 'econ_taxes_spending',
    question: 'How should we balance public services and tax levels?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Significantly raise taxes to expand schools, infrastructure, and services' },
      { description: 'Modest tax increases for high-priority community needs' },
      { description: 'Maintain current service levels and tax rates', isCurrentPolicy: true },
      { description: 'Reduce taxes while focusing spending on core services' },
      { description: 'Substantially lower taxes and reduce government services' },
    ],
  },

  // REFRAMED from old "econ_school_choice" which had false binary of "Public Schools vs Choice"
  // Real question: Where should education funding flow?

  econ_education_funding: {
    axisId: 'econ_education_funding',
    question: 'Where should public education funding go?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'All public education dollars go to district-run schools' },
      { description: 'Most funding to public schools with some magnet and charter options' },
      { description: 'Public schools alongside state-regulated charter programs', isCurrentPolicy: true },
      { description: 'Families can direct funding to various approved schools' },
      { description: 'Families choose any school and funding follows their choice' },
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
    currentPolicyIndex: 2,
    positions: [
      { description: 'Everyone automatically enrolled with no gaps in coverage' },
      { description: 'Coverage required with substantial subsidies for affordability' },
      { description: 'Subsidies available but no penalty for being uninsured', isCurrentPolicy: true },
      { description: 'People choose whether to buy insurance based on their needs' },
      { description: 'Insurance is a personal decision without government involvement' },
    ],
  },

  health_coverage_system: {
    axisId: 'health_coverage_system',
    question: 'Who should provide health insurance?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Single government program covers everyone' },
      { description: 'Government plan available to all who want it, competing with private' },
      { description: 'Medicare/Medicaid for some; employer and private plans for others', isCurrentPolicy: true },
      { description: 'Private insurance market with subsidies for those who need help' },
      { description: 'Fully private insurance market without government plans' },
    ],
  },

  health_cost_approach: {
    axisId: 'health_cost_approach',
    question: 'How should we control healthcare costs?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Government sets all healthcare prices' },
      { description: 'Negotiate drug prices, cap hospital charges, limit surprise bills' },
      { description: 'Some price rules plus transparency to enable shopping', isCurrentPolicy: true },
      { description: 'Require price disclosure so consumers can compare' },
      { description: 'Let competition between providers set prices' },
    ],
  },

  // DECOUPLED from old "health_public_health" which had false binary of "Prevention vs Responsibility"
  // Now split into: Level of public health intervention, and approach to substance use

  health_prevention_programs: {
    axisId: 'health_prevention_programs',
    question: 'How active should government be in promoting public health?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Active government programs on nutrition, exercise, and screenings' },
      { description: 'Fund community health programs and health education' },
      { description: 'Basic health campaigns and disease monitoring', isCurrentPolicy: true },
      { description: 'Focus only on contagious disease prevention' },
      { description: 'Leave health decisions to individuals and doctors' },
    ],
  },

  health_substance_policy: {
    axisId: 'health_substance_policy',
    question: 'How should we address substance use and addiction?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Decriminalize use; invest heavily in treatment and harm reduction' },
      { description: 'Expand treatment options and reduce penalties for personal use' },
      { description: 'Fund both treatment programs and drug enforcement', isCurrentPolicy: true },
      { description: 'Maintain drug laws with treatment as an alternative to jail' },
      { description: 'Criminal penalties to deter use and protect communities' },
    ],
  },

  // ============================================
  // HOUSING & LOCAL GROWTH
  // ============================================

  housing_density: {
    axisId: 'housing_density',
    question: 'How much new housing should be allowed in existing neighborhoods?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Remove most zoning restrictions to allow housing anywhere' },
      { description: 'Allow apartments near transit, jobs, and commercial areas' },
      { description: 'Some upzoning while protecting established neighborhoods', isCurrentPolicy: true },
      { description: 'Require neighborhood approval for new density' },
      { description: 'Preserve existing zoning to protect neighborhood character' },
    ],
  },

  // REFRAMED from old "housing_affordability_tools" which had false binary of "Rent Control vs Supply"
  // Supply is covered by housing_density. This now focuses on rent regulation specifically.

  housing_rent_regulation: {
    axisId: 'housing_rent_regulation',
    question: 'Should government limit how much landlords can raise rents?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Cap rent increases across the board to protect tenants' },
      { description: 'Limit annual rent increases with some exemptions for new construction' },
      { description: 'States and cities decide whether to regulate rents', isCurrentPolicy: true },
      { description: 'Market sets rents with limited tenant protections' },
      { description: 'Landlords and tenants negotiate freely without government limits' },
    ],
  },

  housing_transport_investment: {
    axisId: 'housing_transport_investment',
    question: 'How should transportation funding be prioritized?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Shift funding toward transit, walking, and biking' },
      { description: 'Expand bus and rail while maintaining existing roads' },
      { description: 'Fund transit, roads, and active transportation equally', isCurrentPolicy: true },
      { description: 'Focus on road capacity; add transit only where clearly needed' },
      { description: 'Prioritize roads and parking to serve drivers' },
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
    currentPolicyIndex: 2,
    positions: [
      { description: 'Mental health professionals and social workers handle most calls' },
      { description: 'Civilian responders lead unless a safety threat emerges' },
      { description: 'Police and mental health professionals respond together', isCurrentPolicy: true },
      { description: 'Police officers with crisis training take the lead' },
      { description: 'Police handle all emergency calls to maintain order' },
    ],
  },

  justice_police_oversight: {
    axisId: 'justice_police_oversight',
    question: 'How much independent oversight should police departments have?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Civilian board can investigate, discipline, and set policy' },
      { description: 'Independent body investigates complaints and recommends action' },
      { description: 'Civilian input on policy; internal affairs handles complaints', isCurrentPolicy: true },
      { description: 'Department handles discipline with public reporting' },
      { description: 'Police leadership manages accountability internally' },
    ],
  },

  // REFRAMED from old "justice_sentencing_goals" which had false binary of "Second Chances vs Public Safety"
  // Everyone wants public safety. Real question: Primary approach to achieving it.

  justice_incarceration_approach: {
    axisId: 'justice_incarceration_approach',
    question: 'What should be the primary purpose of incarceration?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Prison focused on treatment, education, and preparing for release' },
      { description: 'Shorter sentences addressing root causes of crime' },
      { description: 'Meaningful consequences plus programs for those who want them', isCurrentPolicy: true },
      { description: 'Clear punishment with programs for motivated individuals' },
      { description: 'Remove offenders from society to protect the public' },
    ],
  },

  justice_sentence_length: {
    axisId: 'justice_sentence_length',
    question: 'How long should prison sentences generally be?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Significantly reduce sentence lengths across the board' },
      { description: 'Shorter sentences for non-violent offenses; long sentences for violent crimes' },
      { description: 'Maintain current sentencing guidelines with judicial discretion', isCurrentPolicy: true },
      { description: 'Longer sentences for repeat offenders' },
      { description: 'Longer sentences across the board to keep offenders away from society' },
    ],
  },

  // REFRAMED from old "justice_firearms" which had false binary of "Safety vs Rights"
  // Real question: Level of firearm regulation

  justice_firearm_regulation: {
    axisId: 'justice_firearm_regulation',
    question: 'How much regulation should there be on firearm purchases and ownership?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Require training, licensing, and registration for all firearms' },
      { description: 'Universal background checks and waiting periods for all sales' },
      { description: 'Background checks for dealers; states set additional rules', isCurrentPolicy: true },
      { description: 'Streamlined purchasing with quick background checks' },
      { description: 'Minimal regulation for law-abiding citizens' },
    ],
  },

  // ============================================
  // CLIMATE, ENERGY & ENVIRONMENT
  // ============================================

  climate_transition_speed: {
    axisId: 'climate_transition_speed',
    question: 'How quickly should we transition away from fossil fuels?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Aggressive deadlines even with significant short-term disruption' },
      { description: 'Major emissions cuts by 2035, net-zero by 2050' },
      { description: 'Steady progress while managing economic impacts', isCurrentPolicy: true },
      { description: 'Gradual transition as clean energy becomes cost-competitive' },
      { description: 'Slow transition to avoid disrupting reliable, affordable energy' },
    ],
  },

  climate_clean_energy_investment: {
    axisId: 'climate_clean_energy_investment',
    question: 'How much should government invest in clean energy development?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Government leads buildout of renewable infrastructure' },
      { description: 'Tax credits, grants, and loans to accelerate clean energy adoption' },
      { description: 'Some incentives while letting markets develop', isCurrentPolicy: true },
      { description: 'Limited incentives for breakthrough technologies only' },
      { description: 'Remove subsidies and let markets drive energy investment' },
    ],
  },

  climate_fossil_fuel_policy: {
    axisId: 'climate_fossil_fuel_policy',
    question: 'What policies should apply to oil, gas, and coal production?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Ban new drilling, mining, and pipelines' },
      { description: 'Wind down subsidies and limit new fossil fuel development' },
      { description: 'Environmental rules alongside production incentives', isCurrentPolicy: true },
      { description: 'Streamline permitting for domestic energy production' },
      { description: 'Maximize domestic fossil fuel production for energy independence' },
    ],
  },

  climate_permitting_speed: {
    axisId: 'climate_permitting_speed',
    question: 'How should we balance environmental review thoroughness with project speed?',
    currentPolicyIndex: 2,
    positions: [
      { description: 'Require full environmental and community impact assessment' },
      { description: 'Thorough review within defined time limits' },
      { description: 'Standard review with expedited paths for some projects', isCurrentPolicy: true },
      { description: 'Faster permitting for clean energy and housing projects' },
      { description: 'Rapid approval with only basic environmental safeguards' },
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
