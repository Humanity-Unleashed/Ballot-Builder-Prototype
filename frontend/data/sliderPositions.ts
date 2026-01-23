/**
 * Slider Position Data for Smart Assessment
 *
 * Each axis has 5 positions (or more). The center position (index 2 for 5 positions)
 * represents current US policy and gets the grey color.
 *
 * Pole labels use positive framing rather than partisan language.
 */

export interface SliderPosition {
  title: string;
  description: string;
  isCurrentPolicy?: boolean;
}

export interface AxisSliderConfig {
  axisId: string;
  question: string;
  poleALabel: string; // Purple side - positive framing
  poleBLabel: string; // Teal side - positive framing
  positions: SliderPosition[];
  currentPolicyIndex: number; // Which position represents current policy
}

export const axisSliderConfigs: Record<string, AxisSliderConfig> = {
  // ============================================
  // ECONOMIC OPPORTUNITY & TAXES
  // ============================================
  econ_safetynet: {
    axisId: 'econ_safetynet',
    question: 'How should assistance programs be structured to help people in need?',
    poleALabel: 'Expanded\nSupport',
    poleBLabel: 'Personal\nInitiative',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Universal basic support for all',
        description: 'Everyone receives baseline assistance regardless of circumstances',
      },
      {
        title: 'Broad eligibility with minimal requirements',
        description: 'Most people in need can access help with simple qualifications',
      },
      {
        title: 'Targeted assistance with moderate requirements',
        description: 'Balances support access with accountability measures',
        isCurrentPolicy: true,
      },
      {
        title: 'Focused aid with work incentives',
        description: 'Encourages self-sufficiency through employment pathways',
      },
      {
        title: 'Emergency-only assistance',
        description: 'Reserves public resources for critical situations only',
      },
    ],
  },

  econ_investment: {
    axisId: 'econ_investment',
    question: 'How should we balance public services and taxes?',
    poleALabel: 'Invest in\nServices',
    poleBLabel: 'Keep More\nEarnings',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Significantly increase public investment',
        description: 'Major expansion of schools, infrastructure, and services',
      },
      {
        title: 'Moderate tax increases for key services',
        description: 'Targeted investments in high-priority community needs',
      },
      {
        title: 'Maintain current balance',
        description: 'Keep existing service levels with current tax rates',
        isCurrentPolicy: true,
      },
      {
        title: 'Reduce taxes while maintaining essentials',
        description: 'Focus spending on core services, return savings to taxpayers',
      },
      {
        title: 'Minimize taxes and government services',
        description: 'Maximum individual choice in how to spend earnings',
      },
    ],
  },

  econ_school_choice: {
    axisId: 'econ_school_choice',
    question: 'How should we improve education for children?',
    poleALabel: 'Strengthen\nPublic Schools',
    poleBLabel: 'Family\nChoice',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Fully fund public schools exclusively',
        description: 'Concentrate all resources on neighborhood public schools',
      },
      {
        title: 'Prioritize public schools with limited alternatives',
        description: 'Strong public system with some magnet and charter options',
      },
      {
        title: 'Mixed system with public and charter options',
        description: 'Public schools alongside regulated school choice programs',
        isCurrentPolicy: true,
      },
      {
        title: 'Expand school choice significantly',
        description: 'More charter schools and voucher programs available',
      },
      {
        title: 'Full educational freedom',
        description: 'Families choose any school with portable funding',
      },
    ],
  },

  // ============================================
  // HEALTHCARE & PUBLIC HEALTH
  // ============================================
  health_coverage_model: {
    axisId: 'health_coverage_model',
    question: 'How should health insurance be provided to people?',
    poleALabel: 'Universal\nAccess',
    poleBLabel: 'Personal\nChoice',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Universal healthcare for all citizens',
        description: 'Everyone gets coverage regardless of employment or income',
      },
      {
        title: 'Public option available to everyone',
        description: 'Government plan competes alongside private insurance',
      },
      {
        title: 'Public programs plus employer-based coverage',
        description: 'Medicare/Medicaid for some, private plans for most workers',
        isCurrentPolicy: true,
      },
      {
        title: 'Private insurance with subsidies for those in need',
        description: 'Market-based system with targeted government assistance',
      },
      {
        title: 'Private market with maximum flexibility',
        description: 'Individuals choose plans that fit their needs and budget',
      },
    ],
  },

  health_cost_control: {
    axisId: 'health_cost_control',
    question: 'What\'s the best way to make healthcare more affordable?',
    poleALabel: 'Price\nProtections',
    poleBLabel: 'Market\nCompetition',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Government sets all healthcare prices',
        description: 'Comprehensive price controls across the system',
      },
      {
        title: 'Negotiate drug prices and cap surprise bills',
        description: 'Targeted protections for the most costly areas',
      },
      {
        title: 'Mix of regulation and market incentives',
        description: 'Some price limits combined with transparency requirements',
        isCurrentPolicy: true,
      },
      {
        title: 'Promote competition and price transparency',
        description: 'Help consumers shop for better value care',
      },
      {
        title: 'Full market pricing with consumer choice',
        description: 'Competition drives innovation and value',
      },
    ],
  },

  health_public_health: {
    axisId: 'health_public_health',
    question: 'How should we address public health and substance use challenges?',
    poleALabel: 'Prevention\n& Treatment',
    poleBLabel: 'Personal\nResponsibility',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Comprehensive public health programs',
        description: 'Proactive prevention, treatment, and harm reduction',
      },
      {
        title: 'Expand treatment and mental health services',
        description: 'Health-focused responses with community support',
      },
      {
        title: 'Balanced treatment and enforcement',
        description: 'Both health services and accountability measures',
        isCurrentPolicy: true,
      },
      {
        title: 'Emphasize personal choices with available services',
        description: 'Resources available for those who seek help',
      },
      {
        title: 'Individual responsibility with minimal intervention',
        description: 'People make their own health decisions',
      },
    ],
  },

  // ============================================
  // HOUSING & LOCAL GROWTH
  // ============================================
  housing_supply_zoning: {
    axisId: 'housing_supply_zoning',
    question: 'How should cities approach housing development?',
    poleALabel: 'Build\nMore',
    poleBLabel: 'Preserve\nNeighborhoods',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Allow housing everywhere by right',
        description: 'Remove most zoning restrictions to maximize supply',
      },
      {
        title: 'Significantly expand where housing can be built',
        description: 'Allow apartments near transit and job centers',
      },
      {
        title: 'Moderate growth in appropriate areas',
        description: 'Some density increases while protecting some neighborhoods',
        isCurrentPolicy: true,
      },
      {
        title: 'Careful growth with strong community input',
        description: 'New development requires neighborhood approval',
      },
      {
        title: 'Preserve existing neighborhood character',
        description: 'Protect communities from unwanted development',
      },
    ],
  },

  housing_affordability_tools: {
    axisId: 'housing_affordability_tools',
    question: 'What\'s the best approach to housing affordability?',
    poleALabel: 'Rent\nProtections',
    poleBLabel: 'Build\nMore Supply',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Strong rent control and public housing',
        description: 'Direct government intervention to ensure affordability',
      },
      {
        title: 'Rent stabilization with affordable housing requirements',
        description: 'Limit rent increases and require affordable units',
      },
      {
        title: 'Mix of protections and housing production',
        description: 'Some rent limits plus incentives to build more',
        isCurrentPolicy: true,
      },
      {
        title: 'Focus on increasing housing supply',
        description: 'More construction brings prices down naturally',
      },
      {
        title: 'Let the market determine housing costs',
        description: 'Remove regulations that limit housing production',
      },
    ],
  },

  housing_transport_priority: {
    axisId: 'housing_transport_priority',
    question: 'How should cities invest in transportation?',
    poleALabel: 'Transit &\nBikes',
    poleBLabel: 'Roads &\nParking',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Prioritize transit, walking, and biking',
        description: 'Transform streets for sustainable transportation',
      },
      {
        title: 'Invest heavily in transit with some road improvements',
        description: 'Expand bus and rail while maintaining roads',
      },
      {
        title: 'Balanced investment in all transportation modes',
        description: 'Fund transit, roads, and active transportation',
        isCurrentPolicy: true,
      },
      {
        title: 'Maintain roads with some transit where needed',
        description: 'Focus on road capacity with selective transit',
      },
      {
        title: 'Prioritize roads and parking availability',
        description: 'Ensure drivers can get where they need to go',
      },
    ],
  },

  // ============================================
  // PUBLIC SAFETY & JUSTICE
  // ============================================
  justice_policing_accountability: {
    axisId: 'justice_policing_accountability',
    question: 'How should communities approach public safety?',
    poleALabel: 'Community\nSolutions',
    poleBLabel: 'Strong\nEnforcement',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Community-led safety with alternatives to police',
        description: 'Mental health responders and community programs lead',
      },
      {
        title: 'Strong oversight with alternative responders',
        description: 'Civilian review plus non-police crisis response',
      },
      {
        title: 'Reformed policing with accountability',
        description: 'Professional police with oversight and some alternatives',
        isCurrentPolicy: true,
      },
      {
        title: 'Well-resourced police with community engagement',
        description: 'More officers focused on building trust',
      },
      {
        title: 'Strong police presence and proactive enforcement',
        description: 'Visible policing to deter and respond to crime',
      },
    ],
  },

  justice_sentencing_goals: {
    axisId: 'justice_sentencing_goals',
    question: 'What should the justice system prioritize?',
    poleALabel: 'Second\nChances',
    poleBLabel: 'Public\nSafety',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Focus on rehabilitation and reentry',
        description: 'Treatment and support to help people change',
      },
      {
        title: 'Emphasize treatment with shorter sentences',
        description: 'Reduce incarceration, invest in programs',
      },
      {
        title: 'Balance accountability and rehabilitation',
        description: 'Appropriate sentences with reentry support',
        isCurrentPolicy: true,
      },
      {
        title: 'Firm sentencing with some rehabilitation',
        description: 'Clear consequences with available programs',
      },
      {
        title: 'Strong sentences to protect communities',
        description: 'Keep dangerous individuals away from society',
      },
    ],
  },

  justice_firearms: {
    axisId: 'justice_firearms',
    question: 'How should we approach firearm policies?',
    poleALabel: 'Community\nSafety',
    poleBLabel: 'Individual\nRights',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Comprehensive firearm regulations',
        description: 'Strict licensing, training, and ownership requirements',
      },
      {
        title: 'Universal background checks with waiting periods',
        description: 'Thorough screening helps keep communities safer',
      },
      {
        title: 'Current federal standards with state flexibility',
        description: 'Background checks for dealers, states set additional rules',
        isCurrentPolicy: true,
      },
      {
        title: 'Protect rights with basic safety requirements',
        description: 'Reasonable access with minimal barriers',
      },
      {
        title: 'Maximum freedom for law-abiding citizens',
        description: 'Constitutional rights with few restrictions',
      },
    ],
  },

  // ============================================
  // CLIMATE, ENERGY & ENVIRONMENT
  // ============================================
  climate_ambition: {
    axisId: 'climate_ambition',
    question: 'How quickly should we address climate change?',
    poleALabel: 'Rapid\nAction',
    poleBLabel: 'Steady\nProgress',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Emergency action on climate',
        description: 'Aggressive targets even with significant short-term costs',
      },
      {
        title: 'Ambitious goals with major investments',
        description: 'Strong commitments to cut emissions this decade',
      },
      {
        title: 'Moderate targets balancing economy and environment',
        description: 'Steady progress without major economic disruption',
        isCurrentPolicy: true,
      },
      {
        title: 'Gradual transition prioritizing affordability',
        description: 'Protect energy costs while making progress',
      },
      {
        title: 'Slow change to maintain economic stability',
        description: 'Keep energy affordable and reliable',
      },
    ],
  },

  climate_energy_portfolio: {
    axisId: 'climate_energy_portfolio',
    question: 'What energy sources should we prioritize?',
    poleALabel: 'Clean\nEnergy',
    poleBLabel: 'Energy\nDiversity',
    currentPolicyIndex: 2,
    positions: [
      {
        title: '100% renewable energy goal',
        description: 'Solar and wind power for all our energy needs',
      },
      {
        title: 'Prioritize renewables, phase out fossil fuels',
        description: 'Rapid transition to clean energy sources',
      },
      {
        title: 'Growing clean energy with all options',
        description: 'Expand renewables while keeping reliable baseload',
        isCurrentPolicy: true,
      },
      {
        title: 'All-of-the-above energy strategy',
        description: 'Use every available source including nuclear and gas',
      },
      {
        title: 'Energy security and affordability first',
        description: 'Maintain domestic oil, gas, and diverse sources',
      },
    ],
  },

  climate_permitting: {
    axisId: 'climate_permitting',
    question: 'How should we balance development speed and environmental review?',
    poleALabel: 'Thorough\nReview',
    poleBLabel: 'Faster\nBuilding',
    currentPolicyIndex: 2,
    positions: [
      {
        title: 'Comprehensive environmental review for all projects',
        description: 'Protect ecosystems even if projects take longer',
      },
      {
        title: 'Strong review with community input',
        description: 'Thorough process ensures projects are done right',
      },
      {
        title: 'Balanced review process',
        description: 'Reasonable timelines with environmental safeguards',
        isCurrentPolicy: true,
      },
      {
        title: 'Streamlined approval for clean energy and housing',
        description: 'Faster building for priority projects',
      },
      {
        title: 'Quick approvals to get projects built',
        description: 'Minimize delays to meet urgent needs',
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
