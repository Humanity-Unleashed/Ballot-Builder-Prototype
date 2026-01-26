/**
 * Fine-Tuning Position Data for Smart Assessment
 *
 * Each axis can have multiple sub-dimensions for users who want to go deeper.
 * This allows for more nuanced position capture on specific policy aspects.
 *
 * NOTE: This file needs to be populated with fine-tuning sub-dimensions
 * for the new decoupled axis structure. The axes have been redesigned
 * to avoid false binaries.
 */

export interface SubDimensionPosition {
  title: string;
  description: string;
  isCurrentPolicy?: boolean;
}

export interface SubDimension {
  id: string;
  parentAxisId: string;
  name: string;
  question: string;
  poleALabel: string;
  poleBLabel: string;
  positions: SubDimensionPosition[];
  currentPolicyIndex: number;
  researchNote?: string;
}

export interface AxisFineTuning {
  axisId: string;
  axisName: string;
  subDimensions: SubDimension[];
}

// Fine-tuning configs for legacy axis IDs (matching backend spec)
// Each axis has sub-dimensions for more nuanced position capture

export const allFineTuningConfigs: Record<string, AxisFineTuning> = {
  // ============================================
  // ECONOMIC DOMAIN
  // ============================================

  econ_safetynet: {
    axisId: 'econ_safetynet',
    axisName: 'Government Support Programs',
    subDimensions: [
      {
        id: 'econ_safetynet_unemployment',
        parentAxisId: 'econ_safetynet',
        name: 'Unemployment Benefits',
        question: 'How generous should unemployment benefits be?',
        poleALabel: 'Generous\nBenefits',
        poleBLabel: 'Limited\nBenefits',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Extended duration, higher payments', description: 'Up to 2 years with 80% wage replacement' },
          { title: 'Moderate benefits with job training', description: '6-12 months with skills programs' },
          { title: 'Current standard benefits', description: '26 weeks at ~45% of prior wages', isCurrentPolicy: true },
          { title: 'Shorter duration, work requirements', description: 'Benefits tied to active job search' },
          { title: 'Minimal safety net', description: 'Short-term emergency assistance only' },
        ],
      },
      {
        id: 'econ_safetynet_food',
        parentAxisId: 'econ_safetynet',
        name: 'Food Assistance (SNAP)',
        question: 'Who should qualify for food assistance?',
        poleALabel: 'Broad\nEligibility',
        poleBLabel: 'Strict\nRequirements',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Universal food security', description: 'Available to anyone in need' },
          { title: 'Expanded income limits', description: 'Higher thresholds, fewer restrictions' },
          { title: 'Current eligibility rules', description: 'Income-based with work requirements for able-bodied adults', isCurrentPolicy: true },
          { title: 'Stricter verification', description: 'More documentation, shorter certification periods' },
          { title: 'Emergency-only assistance', description: 'Limited to acute crisis situations' },
        ],
      },
      {
        id: 'econ_safetynet_housing',
        parentAxisId: 'econ_safetynet',
        name: 'Housing Assistance',
        question: 'How much should government help with housing costs?',
        poleALabel: 'Universal\nHousing Aid',
        poleBLabel: 'Targeted\nAid Only',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Housing as a right', description: 'Guarantee affordable housing for all' },
          { title: 'Expanded voucher program', description: 'More Section 8 vouchers, higher limits' },
          { title: 'Current assistance levels', description: 'Vouchers for very low income, long waitlists', isCurrentPolicy: true },
          { title: 'Focus on working families', description: 'Prioritize those with employment' },
          { title: 'Emergency shelter only', description: 'Help only for homeless crisis' },
        ],
      },
      {
        id: 'econ_safetynet_childcare',
        parentAxisId: 'econ_safetynet',
        name: 'Childcare Support',
        question: 'Should government subsidize childcare?',
        poleALabel: 'Universal\nChildcare',
        poleBLabel: 'Family\nResponsibility',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Free universal pre-K and childcare', description: 'Available to all families regardless of income' },
          { title: 'Subsidized care for most families', description: 'Sliding scale based on income' },
          { title: 'Help for low-income families', description: 'Subsidies for those below poverty line', isCurrentPolicy: true },
          { title: 'Tax credits only', description: 'Families claim credits at tax time' },
          { title: 'No government role', description: 'Childcare is a private family matter' },
        ],
      },
    ],
  },

  econ_investment: {
    axisId: 'econ_investment',
    axisName: 'Taxes & Public Spending',
    subDimensions: [
      {
        id: 'econ_investment_income_tax',
        parentAxisId: 'econ_investment',
        name: 'Income Tax Rates',
        question: 'How progressive should income taxes be?',
        poleALabel: 'Higher Taxes\non Wealthy',
        poleBLabel: 'Lower Taxes\nFlat Rate',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Wealth tax + higher top rates', description: '50%+ on high incomes, tax on assets' },
          { title: 'Raise top brackets', description: 'Increase rates on incomes over $400K' },
          { title: 'Current progressive system', description: '10-37% brackets based on income', isCurrentPolicy: true },
          { title: 'Lower and simplify rates', description: 'Fewer brackets, lower top rate' },
          { title: 'Flat tax for all', description: 'Same rate for everyone' },
        ],
      },
      {
        id: 'econ_investment_corporate_tax',
        parentAxisId: 'econ_investment',
        name: 'Corporate Taxes',
        question: 'How should corporations be taxed?',
        poleALabel: 'Higher\nCorporate Tax',
        poleBLabel: 'Lower\nCorporate Tax',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Close loopholes, raise rate', description: '28%+ with minimum tax on profits' },
          { title: 'Modest increase', description: 'Raise to 25%, limit deductions' },
          { title: 'Current corporate rate', description: '21% federal rate', isCurrentPolicy: true },
          { title: 'Competitive lower rate', description: 'Reduce to attract business investment' },
          { title: 'Minimal corporate tax', description: 'Tax profits only when distributed' },
        ],
      },
      {
        id: 'econ_investment_infrastructure',
        parentAxisId: 'econ_investment',
        name: 'Infrastructure Spending',
        question: 'How much should we invest in infrastructure?',
        poleALabel: 'Major\nInvestment',
        poleBLabel: 'Limited\nSpending',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Massive infrastructure overhaul', description: 'Rebuild roads, bridges, broadband, transit' },
          { title: 'Significant new investment', description: 'Address backlog of needed repairs' },
          { title: 'Maintain current spending', description: 'Fund existing programs', isCurrentPolicy: true },
          { title: 'Prioritize essential repairs', description: 'Focus on safety-critical projects' },
          { title: 'Minimize federal role', description: 'Leave to states and private sector' },
        ],
      },
    ],
  },

  econ_school_choice: {
    axisId: 'econ_school_choice',
    axisName: 'Education Funding',
    subDimensions: [
      {
        id: 'econ_school_choice_vouchers',
        parentAxisId: 'econ_school_choice',
        name: 'School Vouchers',
        question: 'Should public funds pay for private school tuition?',
        poleALabel: 'Public\nSchools Only',
        poleBLabel: 'Full School\nChoice',
        currentPolicyIndex: 2,
        positions: [
          { title: 'No public funds for private schools', description: 'All education dollars to public system' },
          { title: 'Limited to low-income families', description: 'Vouchers for students in failing schools' },
          { title: 'State-by-state choice programs', description: 'Some states have vouchers, others don\'t', isCurrentPolicy: true },
          { title: 'Broad voucher availability', description: 'Most families can access vouchers' },
          { title: 'Universal school choice', description: 'Funding follows student to any school' },
        ],
      },
      {
        id: 'econ_school_choice_charter',
        parentAxisId: 'econ_school_choice',
        name: 'Charter Schools',
        question: 'What role should charter schools play?',
        poleALabel: 'Limit\nCharters',
        poleBLabel: 'Expand\nCharters',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Phase out charter schools', description: 'Return focus to traditional public schools' },
          { title: 'Cap charter growth', description: 'No new charters, improve oversight' },
          { title: 'Maintain current charter presence', description: 'Existing charters continue with accountability', isCurrentPolicy: true },
          { title: 'Encourage charter expansion', description: 'More options in underserved areas' },
          { title: 'Charter schools everywhere', description: 'Remove caps, let families choose' },
        ],
      },
      {
        id: 'econ_school_choice_funding',
        parentAxisId: 'econ_school_choice',
        name: 'School Funding Equity',
        question: 'How should school funding be distributed?',
        poleALabel: 'Equal Funding\nAll Schools',
        poleBLabel: 'Local\nControl',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Federal equalization', description: 'Same per-pupil spending nationwide' },
          { title: 'State-level equalization', description: 'Redistribute within state to reduce gaps' },
          { title: 'Mix of local and state funds', description: 'Property taxes plus state aid', isCurrentPolicy: true },
          { title: 'Primarily local funding', description: 'Communities fund their own schools' },
          { title: 'Full local control', description: 'Each district raises and spends independently' },
        ],
      },
    ],
  },

  // ============================================
  // HEALTH DOMAIN
  // ============================================

  health_coverage_model: {
    axisId: 'health_coverage_model',
    axisName: 'Health Insurance System',
    subDimensions: [
      {
        id: 'health_coverage_model_medicare',
        parentAxisId: 'health_coverage_model',
        name: 'Medicare Expansion',
        question: 'Should Medicare be available to more people?',
        poleALabel: 'Medicare\nFor All',
        poleBLabel: 'Keep 65+\nOnly',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Single-payer Medicare for All', description: 'Everyone covered by Medicare' },
          { title: 'Medicare at 50', description: 'Lower eligibility age, public option' },
          { title: 'Current Medicare for 65+', description: 'Seniors and disabled only', isCurrentPolicy: true },
          { title: 'Privatize more of Medicare', description: 'Expand Medicare Advantage' },
          { title: 'Premium support / vouchers', description: 'Fixed amount toward private plans' },
        ],
      },
      {
        id: 'health_coverage_model_medicaid',
        parentAxisId: 'health_coverage_model',
        name: 'Medicaid Eligibility',
        question: 'Who should qualify for Medicaid?',
        poleALabel: 'Expand\nMedicaid',
        poleBLabel: 'Limit\nMedicaid',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Medicaid for all low/middle income', description: 'Cover everyone under median income' },
          { title: 'Full ACA expansion nationwide', description: 'All states expand to 138% poverty' },
          { title: 'Current mixed expansion', description: 'Some states expanded, some not', isCurrentPolicy: true },
          { title: 'Add work requirements', description: 'Able-bodied adults must work to qualify' },
          { title: 'Block grants to states', description: 'Fixed federal funding, states decide eligibility' },
        ],
      },
      {
        id: 'health_coverage_model_employer',
        parentAxisId: 'health_coverage_model',
        name: 'Employer Insurance',
        question: 'Should health insurance be tied to employment?',
        poleALabel: 'Decouple from\nEmployment',
        poleBLabel: 'Keep Employer\nSystem',
        currentPolicyIndex: 2,
        positions: [
          { title: 'End employer-based insurance', description: 'Universal public coverage instead' },
          { title: 'Offer public alternative', description: 'Public option competes with employer plans' },
          { title: 'Current employer-based system', description: 'Most get insurance through work', isCurrentPolicy: true },
          { title: 'Strengthen employer incentives', description: 'More tax benefits for employer coverage' },
          { title: 'Fully private individual market', description: 'Everyone buys their own plan' },
        ],
      },
    ],
  },

  health_cost_control: {
    axisId: 'health_cost_control',
    axisName: 'Healthcare Costs',
    subDimensions: [
      {
        id: 'health_cost_control_drugs',
        parentAxisId: 'health_cost_control',
        name: 'Prescription Drug Prices',
        question: 'Should government negotiate drug prices?',
        poleALabel: 'Government\nNegotiation',
        poleBLabel: 'Market\nPricing',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Price caps on all drugs', description: 'Government sets maximum prices' },
          { title: 'Negotiate for all federal programs', description: 'Medicare, Medicaid, VA negotiate together' },
          { title: 'Limited Medicare negotiation', description: 'Negotiate for some high-cost drugs', isCurrentPolicy: true },
          { title: 'Import from other countries', description: 'Allow buying from Canada, etc.' },
          { title: 'Free market pricing', description: 'Let competition set prices' },
        ],
      },
      {
        id: 'health_cost_control_hospitals',
        parentAxisId: 'health_cost_control',
        name: 'Hospital Pricing',
        question: 'Should hospital prices be regulated?',
        poleALabel: 'Regulate\nPrices',
        poleBLabel: 'Market\nCompetition',
        currentPolicyIndex: 2,
        positions: [
          { title: 'All-payer rate setting', description: 'Government sets uniform hospital prices' },
          { title: 'Price caps for common procedures', description: 'Limit what hospitals can charge' },
          { title: 'Price transparency required', description: 'Hospitals must post prices publicly', isCurrentPolicy: true },
          { title: 'Encourage competition', description: 'More hospitals, consumer shopping' },
          { title: 'No government involvement', description: 'Hospitals set their own prices' },
        ],
      },
      {
        id: 'health_cost_control_surprise',
        parentAxisId: 'health_cost_control',
        name: 'Surprise Medical Bills',
        question: 'How should surprise bills be handled?',
        poleALabel: 'Ban All\nSurprise Bills',
        poleBLabel: 'Patient\nResponsibility',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Complete ban, patients held harmless', description: 'Never billed more than in-network rate' },
          { title: 'Strong protections with arbitration', description: 'No Surprises Act with fair resolution' },
          { title: 'Current federal protections', description: 'No Surprises Act in effect', isCurrentPolicy: true },
          { title: 'State-by-state rules', description: 'Let states decide protections' },
          { title: 'Patients responsible for research', description: 'Know your network before treatment' },
        ],
      },
    ],
  },

  health_public_health: {
    axisId: 'health_public_health',
    axisName: 'Public Health Policy',
    subDimensions: [
      {
        id: 'health_public_health_vaccines',
        parentAxisId: 'health_public_health',
        name: 'Vaccine Requirements',
        question: 'Should vaccines be required for school or work?',
        poleALabel: 'Strong\nMandates',
        poleBLabel: 'Personal\nChoice',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Universal vaccine mandates', description: 'Required for school, work, public spaces' },
          { title: 'School requirements, medical exemptions only', description: 'Limited exemptions available' },
          { title: 'State-set requirements with exemptions', description: 'Religious and medical exemptions vary', isCurrentPolicy: true },
          { title: 'Recommend but don\'t require', description: 'Education campaigns, no mandates' },
          { title: 'Complete personal choice', description: 'No requirements of any kind' },
        ],
      },
      {
        id: 'health_public_health_tobacco',
        parentAxisId: 'health_public_health',
        name: 'Tobacco & Vaping',
        question: 'How should tobacco and vaping be regulated?',
        poleALabel: 'Strict\nRegulation',
        poleBLabel: 'Minimal\nRestriction',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Phase out tobacco sales', description: 'Generational ban, heavily restrict vaping' },
          { title: 'Higher taxes, flavor bans', description: 'Aggressive measures to reduce use' },
          { title: 'Current regulations', description: 'Age limits, warning labels, some vape restrictions', isCurrentPolicy: true },
          { title: 'Focus on youth prevention', description: 'Adult access, strict youth enforcement' },
          { title: 'Treat as personal choice', description: 'Minimal restrictions for adults' },
        ],
      },
      {
        id: 'health_public_health_mental',
        parentAxisId: 'health_public_health',
        name: 'Mental Health Services',
        question: 'How much should government invest in mental health?',
        poleALabel: 'Major\nInvestment',
        poleBLabel: 'Private\nSector Focus',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Mental health parity + expansion', description: 'Fund community centers, crisis services' },
          { title: 'Increase funding significantly', description: 'More providers, better insurance coverage' },
          { title: 'Current funding with parity laws', description: 'Insurance must cover mental health', isCurrentPolicy: true },
          { title: 'Focus on severe cases', description: 'Government helps most serious conditions' },
          { title: 'Primarily private responsibility', description: 'Individuals seek their own care' },
        ],
      },
    ],
  },

  // ============================================
  // HOUSING DOMAIN
  // ============================================

  housing_supply_zoning: {
    axisId: 'housing_supply_zoning',
    axisName: 'Housing & Zoning',
    subDimensions: [
      {
        id: 'housing_supply_zoning_single',
        parentAxisId: 'housing_supply_zoning',
        name: 'Single-Family Zoning',
        question: 'Should cities allow apartments in single-family neighborhoods?',
        poleALabel: 'Allow\nDensity',
        poleBLabel: 'Protect\nNeighborhoods',
        currentPolicyIndex: 2,
        positions: [
          { title: 'End single-family-only zoning', description: 'Allow duplexes, small apartments everywhere' },
          { title: 'Allow duplexes and ADUs', description: 'Gentle density in all neighborhoods' },
          { title: 'Density near transit only', description: 'Upzone along major corridors', isCurrentPolicy: true },
          { title: 'Local neighborhood control', description: 'Communities decide their zoning' },
          { title: 'Preserve single-family character', description: 'Protect existing neighborhood types' },
        ],
      },
      {
        id: 'housing_supply_zoning_height',
        parentAxisId: 'housing_supply_zoning',
        name: 'Building Heights',
        question: 'Should height limits be relaxed to build more housing?',
        poleALabel: 'Build\nTaller',
        poleBLabel: 'Keep Height\nLimits',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Remove most height limits', description: 'Let market decide building heights' },
          { title: 'Raise limits in urban cores', description: 'Taller buildings in downtowns and transit areas' },
          { title: 'Moderate increases where appropriate', description: 'Case-by-case evaluation', isCurrentPolicy: true },
          { title: 'Maintain current limits', description: 'Protect views and neighborhood scale' },
          { title: 'Reduce heights in some areas', description: 'Preserve historic character' },
        ],
      },
      {
        id: 'housing_supply_zoning_approval',
        parentAxisId: 'housing_supply_zoning',
        name: 'Development Approval',
        question: 'How easy should it be to build new housing?',
        poleALabel: 'Streamline\nApprovals',
        poleBLabel: 'Community\nInput',
        currentPolicyIndex: 2,
        positions: [
          { title: 'By-right development', description: 'If it meets code, it gets built' },
          { title: 'Fast-track for housing', description: 'Expedited review for residential projects' },
          { title: 'Standard review process', description: 'Planning commission and public hearings', isCurrentPolicy: true },
          { title: 'Enhanced community review', description: 'More neighbor input on projects' },
          { title: 'Strong local veto power', description: 'Neighbors can block unwanted development' },
        ],
      },
    ],
  },

  housing_affordability_tools: {
    axisId: 'housing_affordability_tools',
    axisName: 'Rent & Affordability',
    subDimensions: [
      {
        id: 'housing_affordability_tools_rent',
        parentAxisId: 'housing_affordability_tools',
        name: 'Rent Control',
        question: 'Should cities limit how much landlords can raise rent?',
        poleALabel: 'Strong Rent\nControl',
        poleBLabel: 'No Rent\nControl',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Strict rent control everywhere', description: 'Cap increases at inflation for all units' },
          { title: 'Rent stabilization in high-cost areas', description: 'Limit increases in expensive markets' },
          { title: 'Local option for rent rules', description: 'Cities can choose to implement', isCurrentPolicy: true },
          { title: 'State ban on rent control', description: 'Preempt local rent regulations' },
          { title: 'No government rent limits', description: 'Let market set all rents' },
        ],
      },
      {
        id: 'housing_affordability_tools_public',
        parentAxisId: 'housing_affordability_tools',
        name: 'Public Housing',
        question: 'Should government build and own housing?',
        poleALabel: 'Build Public\nHousing',
        poleBLabel: 'Private\nMarket Only',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Major public housing expansion', description: 'Build new public housing at scale' },
          { title: 'Invest in existing public housing', description: 'Renovate and preserve current stock' },
          { title: 'Mixed approach with vouchers', description: 'Some public housing, mostly vouchers', isCurrentPolicy: true },
          { title: 'Convert to vouchers', description: 'Phase out public housing for vouchers' },
          { title: 'Exit public housing entirely', description: 'Sell off public housing stock' },
        ],
      },
      {
        id: 'housing_affordability_tools_inclusionary',
        parentAxisId: 'housing_affordability_tools',
        name: 'Affordable Housing Requirements',
        question: 'Should new developments include affordable units?',
        poleALabel: 'Require\nAffordable Units',
        poleBLabel: 'No\nRequirements',
        currentPolicyIndex: 2,
        positions: [
          { title: 'High mandatory percentages', description: '25%+ affordable units in all new buildings' },
          { title: 'Moderate requirements', description: '10-15% affordable, or pay in-lieu fee' },
          { title: 'Incentive-based programs', description: 'Density bonuses for including affordable', isCurrentPolicy: true },
          { title: 'Voluntary programs only', description: 'Encourage but don\'t mandate' },
          { title: 'No affordability mandates', description: 'Let market determine all prices' },
        ],
      },
    ],
  },

  housing_transport_priority: {
    axisId: 'housing_transport_priority',
    axisName: 'Transportation',
    subDimensions: [
      {
        id: 'housing_transport_priority_transit',
        parentAxisId: 'housing_transport_priority',
        name: 'Public Transit Investment',
        question: 'How much should we invest in buses and trains?',
        poleALabel: 'Major Transit\nInvestment',
        poleBLabel: 'Focus on\nRoads',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Transit-first policy', description: 'Prioritize buses, rail, and bike infrastructure' },
          { title: 'Significant transit expansion', description: 'New lines, more frequent service' },
          { title: 'Balanced investment', description: 'Fund both transit and roads', isCurrentPolicy: true },
          { title: 'Maintain existing transit', description: 'No expansion, focus on road capacity' },
          { title: 'Reduce transit subsidies', description: 'Transit should pay for itself' },
        ],
      },
      {
        id: 'housing_transport_priority_bike',
        parentAxisId: 'housing_transport_priority',
        name: 'Bike & Pedestrian Infrastructure',
        question: 'Should cities build more bike lanes and sidewalks?',
        poleALabel: 'Prioritize\nBikes/Walking',
        poleBLabel: 'Prioritize\nCars',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Protected bike network everywhere', description: 'Comprehensive safe cycling infrastructure' },
          { title: 'Expand bike lanes significantly', description: 'Connected network in urban areas' },
          { title: 'Add infrastructure where feasible', description: 'Bike lanes on some streets', isCurrentPolicy: true },
          { title: 'Bikes share existing roads', description: 'Minimal dedicated infrastructure' },
          { title: 'Roads are for cars', description: 'Don\'t reduce car lanes for bikes' },
        ],
      },
      {
        id: 'housing_transport_priority_parking',
        parentAxisId: 'housing_transport_priority',
        name: 'Parking Requirements',
        question: 'Should buildings be required to include parking?',
        poleALabel: 'Reduce Parking\nRequirements',
        poleBLabel: 'Require\nParking',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Eliminate parking minimums', description: 'Developers decide how much to build' },
          { title: 'Reduce requirements near transit', description: 'Less parking where alternatives exist' },
          { title: 'Standard parking requirements', description: 'Minimum spaces per unit/square foot', isCurrentPolicy: true },
          { title: 'Maintain or increase minimums', description: 'Ensure adequate parking supply' },
          { title: 'Require ample free parking', description: 'Abundant parking for all uses' },
        ],
      },
    ],
  },

  // ============================================
  // JUSTICE DOMAIN
  // ============================================

  justice_policing_accountability: {
    axisId: 'justice_policing_accountability',
    axisName: 'Policing & Accountability',
    subDimensions: [
      {
        id: 'justice_policing_oversight',
        parentAxisId: 'justice_policing_accountability',
        name: 'Civilian Oversight',
        question: 'How much civilian oversight should police have?',
        poleALabel: 'Strong\nOversight',
        poleBLabel: 'Department\nSelf-Governance',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Independent board with subpoena power', description: 'Civilians investigate and discipline' },
          { title: 'Civilian review with recommendations', description: 'Review complaints, recommend action' },
          { title: 'Advisory civilian board', description: 'Input on policies, limited authority', isCurrentPolicy: true },
          { title: 'Internal affairs handles complaints', description: 'Police investigate themselves' },
          { title: 'Minimal outside interference', description: 'Trust officers and commanders' },
        ],
      },
      {
        id: 'justice_policing_qualified',
        parentAxisId: 'justice_policing_accountability',
        name: 'Qualified Immunity',
        question: 'Should police be protected from lawsuits?',
        poleALabel: 'End Qualified\nImmunity',
        poleBLabel: 'Protect\nOfficers',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Eliminate qualified immunity', description: 'Officers personally liable for misconduct' },
          { title: 'Narrow immunity significantly', description: 'Only protect good-faith actions' },
          { title: 'Reform qualified immunity', description: 'Clarify standards, some limits', isCurrentPolicy: true },
          { title: 'Maintain current protections', description: 'Keep qualified immunity as-is' },
          { title: 'Strengthen officer protections', description: 'Expand immunity, limit lawsuits' },
        ],
      },
      {
        id: 'justice_policing_alternatives',
        parentAxisId: 'justice_policing_accountability',
        name: 'Crisis Response Alternatives',
        question: 'Should non-police respond to some 911 calls?',
        poleALabel: 'More\nAlternatives',
        poleBLabel: 'Police Handle\nAll Calls',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Many calls to non-police responders', description: 'Mental health, homeless, traffic to civilians' },
          { title: 'Mental health teams for crisis calls', description: 'Trained responders for behavioral crises' },
          { title: 'Co-responder model', description: 'Police and mental health together', isCurrentPolicy: true },
          { title: 'Police with crisis training', description: 'Officers handle all but get more training' },
          { title: 'Police respond to all calls', description: 'Sworn officers for any situation' },
        ],
      },
    ],
  },

  justice_sentencing_goals: {
    axisId: 'justice_sentencing_goals',
    axisName: 'Criminal Justice & Sentencing',
    subDimensions: [
      {
        id: 'justice_sentencing_mandatory',
        parentAxisId: 'justice_sentencing_goals',
        name: 'Mandatory Minimums',
        question: 'Should there be mandatory minimum sentences?',
        poleALabel: 'Eliminate\nMandatory Mins',
        poleBLabel: 'Keep Mandatory\nMinimums',
        currentPolicyIndex: 2,
        positions: [
          { title: 'End all mandatory minimums', description: 'Judges decide every sentence' },
          { title: 'Eliminate for non-violent offenses', description: 'Keep for violent crimes only' },
          { title: 'Reform and reduce some minimums', description: 'Case-by-case evaluation', isCurrentPolicy: true },
          { title: 'Maintain current minimums', description: 'Consistency in sentencing' },
          { title: 'Expand mandatory minimums', description: 'More crimes, longer sentences' },
        ],
      },
      {
        id: 'justice_sentencing_cash_bail',
        parentAxisId: 'justice_sentencing_goals',
        name: 'Cash Bail',
        question: 'Should people pay money to get out of jail before trial?',
        poleALabel: 'End Cash\nBail',
        poleBLabel: 'Keep Cash\nBail',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Eliminate cash bail entirely', description: 'Release or detain based on risk, not wealth' },
          { title: 'End cash bail for most offenses', description: 'Only hold for serious violent charges' },
          { title: 'Reform bail with risk assessment', description: 'Consider ability to pay, use alternatives', isCurrentPolicy: true },
          { title: 'Maintain bail with some reform', description: 'Keep system, address worst abuses' },
          { title: 'Strengthen bail requirements', description: 'Higher bail, fewer releases' },
        ],
      },
      {
        id: 'justice_sentencing_rehabilitation',
        parentAxisId: 'justice_sentencing_goals',
        name: 'Prison Programs',
        question: 'Should prisons focus on rehabilitation?',
        poleALabel: 'Rehabilitation\nFocus',
        poleBLabel: 'Punishment\nFocus',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Comprehensive rehabilitation', description: 'Education, job training, therapy for all' },
          { title: 'Expand programs significantly', description: 'More access to rehabilitation services' },
          { title: 'Programs for interested inmates', description: 'Available but not universal', isCurrentPolicy: true },
          { title: 'Basic programs only', description: 'Focus on security, some GED classes' },
          { title: 'Punishment is the point', description: 'Minimal programs, firm discipline' },
        ],
      },
    ],
  },

  justice_firearms: {
    axisId: 'justice_firearms',
    axisName: 'Gun Laws',
    subDimensions: [
      {
        id: 'justice_firearms_assault',
        parentAxisId: 'justice_firearms',
        name: 'Assault-Style Weapons',
        question: 'Should military-style rifles be restricted?',
        poleALabel: 'Ban Assault\nWeapons',
        poleBLabel: 'No Restrictions\non Type',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Ban and buyback', description: 'Prohibit sale and possession of assault weapons' },
          { title: 'Ban new sales', description: 'No new assault weapons, grandfather existing' },
          { title: 'State-by-state rules', description: 'Some states ban, others allow', isCurrentPolicy: true },
          { title: 'Regulate but don\'t ban', description: 'Age limits, waiting periods for these weapons' },
          { title: 'No restrictions by type', description: 'Law-abiding citizens can own any firearm' },
        ],
      },
      {
        id: 'justice_firearms_background',
        parentAxisId: 'justice_firearms',
        name: 'Background Checks',
        question: 'Should all gun sales require background checks?',
        poleALabel: 'Universal\nBackground Checks',
        poleBLabel: 'Current\nSystem',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Universal checks with registry', description: 'All sales tracked, waiting period' },
          { title: 'Universal background checks', description: 'All sales including private' },
          { title: 'Dealer checks only', description: 'Licensed dealers check, private sales exempt', isCurrentPolicy: true },
          { title: 'Streamline current system', description: 'Faster checks, fix database issues' },
          { title: 'Reduce check requirements', description: 'Less government involvement in sales' },
        ],
      },
      {
        id: 'justice_firearms_carry',
        parentAxisId: 'justice_firearms',
        name: 'Concealed Carry',
        question: 'How should concealed carry permits work?',
        poleALabel: 'Strict Permit\nRequirements',
        poleBLabel: 'Permitless\nCarry',
        currentPolicyIndex: 2,
        positions: [
          { title: 'May-issue with strict requirements', description: 'Permits only for demonstrated need' },
          { title: 'Shall-issue with training', description: 'Permits granted with training requirement' },
          { title: 'State-by-state rules vary', description: 'Mix of permit requirements', isCurrentPolicy: true },
          { title: 'Constitutional carry', description: 'No permit needed to carry concealed' },
          { title: 'Unrestricted carry everywhere', description: 'Carry openly or concealed without permit' },
        ],
      },
      {
        id: 'justice_firearms_redflags',
        parentAxisId: 'justice_firearms',
        name: 'Red Flag Laws',
        question: 'Should courts be able to temporarily remove guns from dangerous individuals?',
        poleALabel: 'Strong Red\nFlag Laws',
        poleBLabel: 'No Red\nFlag Laws',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Broad red flag authority', description: 'Many can petition, lower burden of proof' },
          { title: 'Standard red flag laws', description: 'Family/police can petition court' },
          { title: 'State-by-state red flag laws', description: 'Some states have them, others don\'t', isCurrentPolicy: true },
          { title: 'Very limited red flag use', description: 'Only for imminent documented threats' },
          { title: 'No red flag laws', description: 'Due process concerns, protect gun rights' },
        ],
      },
    ],
  },

  // ============================================
  // CLIMATE DOMAIN
  // ============================================

  climate_ambition: {
    axisId: 'climate_ambition',
    axisName: 'Climate Action',
    subDimensions: [
      {
        id: 'climate_ambition_timeline',
        parentAxisId: 'climate_ambition',
        name: 'Emissions Timeline',
        question: 'How quickly should we cut greenhouse gas emissions?',
        poleALabel: 'Aggressive\nTimeline',
        poleBLabel: 'Gradual\nTransition',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Net-zero by 2035', description: 'Emergency mobilization for rapid cuts' },
          { title: 'Net-zero by 2050', description: '50% cuts by 2030, full decarbonization by 2050' },
          { title: 'Moderate reduction goals', description: 'Meaningful cuts balanced with costs', isCurrentPolicy: true },
          { title: 'Technology-driven timeline', description: 'Reduce as clean tech becomes cheaper' },
          { title: 'No government mandates', description: 'Let market and innovation drive change' },
        ],
      },
      {
        id: 'climate_ambition_carbon_price',
        parentAxisId: 'climate_ambition',
        name: 'Carbon Pricing',
        question: 'Should there be a price on carbon emissions?',
        poleALabel: 'Strong Carbon\nPrice',
        poleBLabel: 'No Carbon\nPrice',
        currentPolicyIndex: 2,
        positions: [
          { title: 'High carbon tax with dividend', description: '$100+/ton, rebates to households' },
          { title: 'Moderate carbon price', description: 'Cap-and-trade or tax starting lower' },
          { title: 'Sector-specific policies', description: 'Regulations instead of pricing', isCurrentPolicy: true },
          { title: 'Voluntary carbon markets', description: 'Businesses choose to offset' },
          { title: 'No carbon pricing', description: 'Oppose taxes on energy' },
        ],
      },
      {
        id: 'climate_ambition_regulations',
        parentAxisId: 'climate_ambition',
        name: 'Environmental Regulations',
        question: 'How strict should environmental rules be?',
        poleALabel: 'Stricter\nRegulations',
        poleBLabel: 'Fewer\nRegulations',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Comprehensive new regulations', description: 'Strong limits on all major sources' },
          { title: 'Strengthen existing rules', description: 'Tighter standards, better enforcement' },
          { title: 'Maintain current regulations', description: 'Keep existing environmental protections', isCurrentPolicy: true },
          { title: 'Streamline regulations', description: 'Reduce burden while maintaining goals' },
          { title: 'Roll back regulations', description: 'Remove barriers to economic growth' },
        ],
      },
    ],
  },

  climate_energy_portfolio: {
    axisId: 'climate_energy_portfolio',
    axisName: 'Energy Sources',
    subDimensions: [
      {
        id: 'climate_energy_portfolio_renewables',
        parentAxisId: 'climate_energy_portfolio',
        name: 'Renewable Energy',
        question: 'How much should we invest in solar and wind?',
        poleALabel: 'Massive\nInvestment',
        poleBLabel: 'Market\nDecides',
        currentPolicyIndex: 2,
        positions: [
          { title: '100% renewable electricity', description: 'Phase out all fossil fuel power' },
          { title: 'Majority renewable with storage', description: '80%+ renewables, invest in batteries' },
          { title: 'Continue growing renewables', description: 'Tax credits, gradual expansion', isCurrentPolicy: true },
          { title: 'All-of-the-above energy', description: 'Renewables plus fossil fuels plus nuclear' },
          { title: 'No renewable subsidies', description: 'Let technologies compete without help' },
        ],
      },
      {
        id: 'climate_energy_portfolio_nuclear',
        parentAxisId: 'climate_energy_portfolio',
        name: 'Nuclear Power',
        question: 'Should we build more nuclear power plants?',
        poleALabel: 'Expand\nNuclear',
        poleBLabel: 'Phase Out\nNuclear',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Major nuclear expansion', description: 'New plants, advanced reactors' },
          { title: 'Support existing + some new', description: 'Keep plants running, selective new builds' },
          { title: 'Maintain existing plants', description: 'No closures, limited new construction', isCurrentPolicy: true },
          { title: 'Phase out over time', description: 'Don\'t extend licenses, no new plants' },
          { title: 'Close nuclear plants now', description: 'Too dangerous and expensive' },
        ],
      },
      {
        id: 'climate_energy_portfolio_fossil',
        parentAxisId: 'climate_energy_portfolio',
        name: 'Fossil Fuel Policy',
        question: 'What should we do about oil and gas production?',
        poleALabel: 'Reduce\nProduction',
        poleBLabel: 'Expand\nProduction',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Ban new drilling', description: 'No new fossil fuel extraction' },
          { title: 'No new leases on public land', description: 'Phase down federal drilling' },
          { title: 'Current production levels', description: 'Maintain domestic production', isCurrentPolicy: true },
          { title: 'Energy independence priority', description: 'Increase domestic production' },
          { title: 'Drill everywhere possible', description: 'Maximize fossil fuel output' },
        ],
      },
    ],
  },

  climate_permitting: {
    axisId: 'climate_permitting',
    axisName: 'Environmental Review',
    subDimensions: [
      {
        id: 'climate_permitting_nepa',
        parentAxisId: 'climate_permitting',
        name: 'Environmental Review Process',
        question: 'How thorough should environmental reviews be?',
        poleALabel: 'Comprehensive\nReview',
        poleBLabel: 'Streamlined\nApproval',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Strengthen environmental review', description: 'More analysis, more public input' },
          { title: 'Current NEPA process', description: 'Full environmental impact statements' },
          { title: 'Modest reforms for efficiency', description: 'Timelines and page limits', isCurrentPolicy: true },
          { title: 'Significant streamlining', description: 'Faster approvals, categorical exclusions' },
          { title: 'Minimal environmental review', description: 'Remove most requirements' },
        ],
      },
      {
        id: 'climate_permitting_transmission',
        parentAxisId: 'climate_permitting',
        name: 'Power Line Approval',
        question: 'How should we handle permits for new power lines?',
        poleALabel: 'Federal\nAuthority',
        poleBLabel: 'State/Local\nControl',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Federal transmission authority', description: 'Override state objections for major lines' },
          { title: 'Expedited federal process', description: 'Fast-track interstate transmission' },
          { title: 'Current mixed jurisdiction', description: 'Federal and state both involved', isCurrentPolicy: true },
          { title: 'State approval required', description: 'States control what crosses their land' },
          { title: 'Full local control', description: 'Communities can block transmission' },
        ],
      },
      {
        id: 'climate_permitting_clean',
        parentAxisId: 'climate_permitting',
        name: 'Clean Energy Project Permits',
        question: 'Should clean energy projects get faster permits?',
        poleALabel: 'Fast-Track\nClean Energy',
        poleBLabel: 'Same Rules\nFor All',
        currentPolicyIndex: 2,
        positions: [
          { title: 'Automatic approval for clean energy', description: 'Minimal review for renewables' },
          { title: 'Expedited clean energy review', description: 'Faster timelines, priority processing' },
          { title: 'Some acceleration for clean projects', description: 'Modest fast-tracking', isCurrentPolicy: true },
          { title: 'Same process for all energy', description: 'No preferential treatment' },
          { title: 'Stricter review for all projects', description: 'More scrutiny of environmental impacts' },
        ],
      },
    ],
  },
};

/**
 * Get fine-tuning configuration for a specific axis
 */
export function getFineTuningConfig(axisId: string): AxisFineTuning | undefined {
  return allFineTuningConfigs[axisId];
}

/**
 * Get all fine-tuning sub-dimensions for a domain
 */
export function getFineTuningForDomain(domainId: string): AxisFineTuning[] {
  // Legacy axis IDs matching backend spec
  const domainAxes: Record<string, string[]> = {
    econ: ['econ_safetynet', 'econ_investment', 'econ_school_choice'],
    health: ['health_coverage_model', 'health_cost_control', 'health_public_health'],
    housing: ['housing_supply_zoning', 'housing_affordability_tools', 'housing_transport_priority'],
    justice: ['justice_policing_accountability', 'justice_sentencing_goals', 'justice_firearms'],
    climate: ['climate_ambition', 'climate_energy_portfolio', 'climate_permitting'],
  };

  const axes = domainAxes[domainId] || [];
  return axes.map(axisId => allFineTuningConfigs[axisId]).filter(Boolean);
}

/**
 * Count total fine-tuning questions for a domain
 */
export function countFineTuningQuestions(domainId: string): number {
  const configs = getFineTuningForDomain(domainId);
  return configs.reduce((total, config) => total + config.subDimensions.length, 0);
}

/**
 * Convert a fine-tuning slider position (0-4) to a score (-1 to +1)
 */
export function fineTuningPositionToScore(position: number, totalPositions: number = 5): number {
  return ((position / (totalPositions - 1)) * 2) - 1;
}

/**
 * Calculate aggregated score from fine-tuning responses for an axis
 * Returns the average of all sub-dimension scores
 */
export function calculateFineTunedScore(
  axisId: string,
  responses: Record<string, number>
): number | null {
  const config = getFineTuningConfig(axisId);
  if (!config) return null;

  const subDimensionIds = config.subDimensions.map(sd => sd.id);
  const scores: number[] = [];

  for (const id of subDimensionIds) {
    if (responses[id] !== undefined) {
      const subDimension = config.subDimensions.find(sd => sd.id === id);
      const totalPositions = subDimension?.positions.length || 5;
      scores.push(fineTuningPositionToScore(responses[id], totalPositions));
    }
  }

  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Get detailed breakdown of fine-tuning responses with scores
 */
export interface FineTuningBreakdown {
  subDimensionId: string;
  name: string;
  position: number;
  score: number;
  positionTitle: string;
}

export function getFineTuningBreakdown(
  axisId: string,
  responses: Record<string, number>
): FineTuningBreakdown[] {
  const config = getFineTuningConfig(axisId);
  if (!config) return [];

  const breakdown: FineTuningBreakdown[] = [];

  for (const subDimension of config.subDimensions) {
    const position = responses[subDimension.id];
    if (position !== undefined) {
      const totalPositions = subDimension.positions.length;
      breakdown.push({
        subDimensionId: subDimension.id,
        name: subDimension.name,
        position,
        score: fineTuningPositionToScore(position, totalPositions),
        positionTitle: subDimension.positions[position]?.title || '',
      });
    }
  }

  return breakdown;
}
