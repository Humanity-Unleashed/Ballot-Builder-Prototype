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
          { title: 'Up to 2 years of benefits at 80% wage replacement', description: '' },
          { title: '6-12 months of benefits with job training programs', description: '' },
          { title: '26 weeks at ~45% of prior wages', description: '', isCurrentPolicy: true },
          { title: 'Shorter benefits tied to active job search', description: '' },
          { title: 'Short-term emergency assistance only', description: '' },
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
          { title: 'Available to anyone in need', description: '' },
          { title: 'Higher income limits with fewer restrictions', description: '' },
          { title: 'Income-based with work requirements for able-bodied adults', description: '', isCurrentPolicy: true },
          { title: 'Stricter documentation and shorter certification periods', description: '' },
          { title: 'Limited to acute crisis situations only', description: '' },
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
          { title: 'Guarantee affordable housing for all', description: '' },
          { title: 'More Section 8 vouchers with higher income limits', description: '' },
          { title: 'Vouchers for very low income with long waitlists', description: '', isCurrentPolicy: true },
          { title: 'Prioritize assistance for working families', description: '' },
          { title: 'Help only for homeless crisis situations', description: '' },
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
          { title: 'Free pre-K and childcare for all families', description: '' },
          { title: 'Subsidized care on a sliding scale based on income', description: '' },
          { title: 'Subsidies for families below poverty line', description: '', isCurrentPolicy: true },
          { title: 'Tax credits families claim at tax time', description: '' },
          { title: 'No government involvement in childcare', description: '' },
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
          { title: '50%+ on high incomes plus a wealth tax on assets', description: '' },
          { title: 'Increase rates on incomes over $400K', description: '' },
          { title: '10-37% brackets based on income', description: '', isCurrentPolicy: true },
          { title: 'Fewer brackets with a lower top rate', description: '' },
          { title: 'Same flat rate for everyone', description: '' },
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
          { title: '28%+ rate with minimum tax on profits', description: '' },
          { title: '25% rate with limited deductions', description: '' },
          { title: '21% federal rate', description: '', isCurrentPolicy: true },
          { title: 'Lower rate to attract business investment', description: '' },
          { title: 'Tax profits only when distributed to shareholders', description: '' },
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
          { title: 'Major rebuild of roads, bridges, broadband, and transit', description: '' },
          { title: 'Significant investment to address the repair backlog', description: '' },
          { title: 'Continue funding existing programs', description: '', isCurrentPolicy: true },
          { title: 'Focus only on safety-critical repairs', description: '' },
          { title: 'Leave infrastructure to states and private sector', description: '' },
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
          { title: 'All education dollars go to public schools only', description: '' },
          { title: 'Vouchers only for low-income students in failing schools', description: '' },
          { title: 'Some states have vouchers, others don\'t', description: '', isCurrentPolicy: true },
          { title: 'Most families can access school vouchers', description: '' },
          { title: 'Funding follows student to any school they choose', description: '' },
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
          { title: 'Phase out charter schools entirely', description: '' },
          { title: 'No new charters, better oversight of existing ones', description: '' },
          { title: 'Existing charters continue with accountability measures', description: '', isCurrentPolicy: true },
          { title: 'More charter options in underserved areas', description: '' },
          { title: 'Remove caps and let families choose any school', description: '' },
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
          { title: 'Same per-pupil spending nationwide', description: '' },
          { title: 'State redistributes funds to reduce gaps between districts', description: '' },
          { title: 'Property taxes plus state aid', description: '', isCurrentPolicy: true },
          { title: 'Communities primarily fund their own schools', description: '' },
          { title: 'Each district raises and spends independently', description: '' },
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
          { title: 'Single-payer Medicare covering everyone', description: '' },
          { title: 'Medicare available at age 50 with a public option', description: '' },
          { title: 'Medicare for seniors 65+ and disabled only', description: '', isCurrentPolicy: true },
          { title: 'Expand private Medicare Advantage plans', description: '' },
          { title: 'Fixed voucher amount toward private plans', description: '' },
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
          { title: 'Cover everyone under median income', description: '' },
          { title: 'All states expand to 138% of poverty level', description: '' },
          { title: 'Some states expanded, some have not', description: '', isCurrentPolicy: true },
          { title: 'Able-bodied adults must work to qualify', description: '' },
          { title: 'Fixed federal funding with states deciding eligibility', description: '' },
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
          { title: 'Universal public coverage replacing employer insurance', description: '' },
          { title: 'Public option competes with employer plans', description: '' },
          { title: 'Most people get insurance through their employer', description: '', isCurrentPolicy: true },
          { title: 'More tax benefits to encourage employer coverage', description: '' },
          { title: 'Everyone buys their own plan on the private market', description: '' },
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
          { title: 'Government sets maximum prices on all drugs', description: '' },
          { title: 'Medicare, Medicaid, and VA negotiate together for all drugs', description: '' },
          { title: 'Medicare negotiates for some high-cost drugs', description: '', isCurrentPolicy: true },
          { title: 'Allow importing drugs from Canada and other countries', description: '' },
          { title: 'Let market competition set drug prices', description: '' },
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
          { title: 'Government sets uniform hospital prices', description: '' },
          { title: 'Cap prices on common procedures', description: '' },
          { title: 'Hospitals must post prices publicly', description: '', isCurrentPolicy: true },
          { title: 'More hospitals and consumer price shopping', description: '' },
          { title: 'Hospitals set their own prices without regulation', description: '' },
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
          { title: 'Patients never billed more than in-network rate', description: '' },
          { title: 'Strong protections with fair arbitration for disputes', description: '' },
          { title: 'No Surprises Act in effect', description: '', isCurrentPolicy: true },
          { title: 'Let states decide their own protections', description: '' },
          { title: 'Patients responsible for knowing their network', description: '' },
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
          { title: 'Required for school, work, and public spaces', description: '' },
          { title: 'Required for school with medical exemptions only', description: '' },
          { title: 'State-set requirements with religious and medical exemptions', description: '', isCurrentPolicy: true },
          { title: 'Recommend vaccines but don\'t require them', description: '' },
          { title: 'No vaccine requirements of any kind', description: '' },
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
          { title: 'Generational ban on tobacco sales, heavy vaping restrictions', description: '' },
          { title: 'Higher taxes and flavor bans to reduce use', description: '' },
          { title: 'Age limits, warning labels, some vape restrictions', description: '', isCurrentPolicy: true },
          { title: 'Adult access with strict youth enforcement only', description: '' },
          { title: 'Minimal restrictions for adults', description: '' },
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
          { title: 'Fund community centers and crisis services', description: '' },
          { title: 'More providers and better insurance coverage', description: '' },
          { title: 'Insurance must cover mental health equally', description: '', isCurrentPolicy: true },
          { title: 'Government helps only the most serious conditions', description: '' },
          { title: 'Individuals seek their own care privately', description: '' },
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
          { title: 'Allow duplexes and small apartments everywhere', description: '' },
          { title: 'Allow duplexes and backyard cottages in all neighborhoods', description: '' },
          { title: 'Upzone along major transit corridors only', description: '', isCurrentPolicy: true },
          { title: 'Communities decide their own zoning', description: '' },
          { title: 'Protect existing single-family neighborhood character', description: '' },
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
          { title: 'Let market decide building heights', description: '' },
          { title: 'Taller buildings allowed in downtowns and transit areas', description: '' },
          { title: 'Case-by-case evaluation for height increases', description: '', isCurrentPolicy: true },
          { title: 'Maintain current limits to protect views and scale', description: '' },
          { title: 'Reduce heights in some areas to preserve character', description: '' },
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
          { title: 'If it meets code, it gets built automatically', description: '' },
          { title: 'Expedited review for residential projects', description: '' },
          { title: 'Planning commission review and public hearings', description: '', isCurrentPolicy: true },
          { title: 'More neighbor input required on projects', description: '' },
          { title: 'Neighbors can block unwanted development', description: '' },
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
          { title: 'Cap rent increases at inflation for all units', description: '' },
          { title: 'Limit rent increases in expensive markets', description: '' },
          { title: 'Cities can choose whether to implement rent rules', description: '', isCurrentPolicy: true },
          { title: 'State bans local rent control laws', description: '' },
          { title: 'Let market set all rents without limits', description: '' },
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
          { title: 'Build new public housing at scale', description: '' },
          { title: 'Renovate and preserve existing public housing', description: '' },
          { title: 'Some public housing with mostly vouchers', description: '', isCurrentPolicy: true },
          { title: 'Phase out public housing in favor of vouchers', description: '' },
          { title: 'Sell off public housing stock entirely', description: '' },
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
          { title: '25%+ affordable units required in all new buildings', description: '' },
          { title: '10-15% affordable units required, or pay a fee', description: '' },
          { title: 'Density bonuses for including affordable units', description: '', isCurrentPolicy: true },
          { title: 'Encourage affordable units but don\'t mandate them', description: '' },
          { title: 'Let market determine all prices without mandates', description: '' },
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
          { title: 'Prioritize buses, rail, and bike infrastructure', description: '' },
          { title: 'New transit lines with more frequent service', description: '' },
          { title: 'Fund both transit and roads equally', description: '', isCurrentPolicy: true },
          { title: 'No transit expansion, focus on road capacity', description: '' },
          { title: 'Transit should pay for itself without subsidies', description: '' },
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
          { title: 'Comprehensive protected bike network everywhere', description: '' },
          { title: 'Connected bike lane network in urban areas', description: '' },
          { title: 'Bike lanes on some streets where feasible', description: '', isCurrentPolicy: true },
          { title: 'Bikes share existing roads with minimal dedicated space', description: '' },
          { title: 'Don\'t reduce car lanes for bikes', description: '' },
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
          { title: 'Developers decide how much parking to build', description: '' },
          { title: 'Less required parking where transit alternatives exist', description: '' },
          { title: 'Minimum parking spaces per unit or square foot', description: '', isCurrentPolicy: true },
          { title: 'Maintain or increase parking minimums', description: '' },
          { title: 'Require abundant free parking for all uses', description: '' },
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
          { title: 'Civilian board investigates and disciplines officers', description: '' },
          { title: 'Civilian board reviews complaints and recommends action', description: '' },
          { title: 'Advisory civilian board with limited authority', description: '', isCurrentPolicy: true },
          { title: 'Police internal affairs investigates complaints', description: '' },
          { title: 'Trust officers and commanders without outside oversight', description: '' },
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
          { title: 'Officers personally liable for misconduct', description: '' },
          { title: 'Immunity only for good-faith actions', description: '' },
          { title: 'Clarify standards with some immunity limits', description: '', isCurrentPolicy: true },
          { title: 'Keep qualified immunity as-is', description: '' },
          { title: 'Expand immunity and limit lawsuits against officers', description: '' },
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
          { title: 'Mental health, homeless, and traffic calls go to civilians', description: '' },
          { title: 'Trained mental health responders for behavioral crises', description: '' },
          { title: 'Police and mental health professionals respond together', description: '', isCurrentPolicy: true },
          { title: 'Police handle all calls with more crisis training', description: '' },
          { title: 'Sworn police officers respond to every situation', description: '' },
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
          { title: 'Judges decide every sentence without minimums', description: '' },
          { title: 'Mandatory minimums only for violent crimes', description: '' },
          { title: 'Reduce some minimums on a case-by-case basis', description: '', isCurrentPolicy: true },
          { title: 'Maintain current mandatory minimums for consistency', description: '' },
          { title: 'More mandatory minimums with longer sentences', description: '' },
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
          { title: 'Release or detain based on risk, not wealth', description: '' },
          { title: 'Cash bail only for serious violent charges', description: '' },
          { title: 'Risk assessment with ability-to-pay considerations', description: '', isCurrentPolicy: true },
          { title: 'Keep bail system while addressing worst abuses', description: '' },
          { title: 'Higher bail amounts with fewer pretrial releases', description: '' },
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
          { title: 'Education, job training, and therapy for all inmates', description: '' },
          { title: 'Expanded access to rehabilitation services', description: '' },
          { title: 'Programs available for interested inmates', description: '', isCurrentPolicy: true },
          { title: 'Focus on security with basic GED classes', description: '' },
          { title: 'Minimal programs with firm discipline', description: '' },
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
          { title: 'Ban sale and possession with buyback program', description: '' },
          { title: 'Ban new sales but grandfather existing weapons', description: '' },
          { title: 'Some states ban assault weapons, others allow them', description: '', isCurrentPolicy: true },
          { title: 'Age limits and waiting periods, but no ban', description: '' },
          { title: 'Law-abiding citizens can own any firearm type', description: '' },
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
          { title: 'All sales tracked in registry with waiting period', description: '' },
          { title: 'Background checks for all sales including private', description: '' },
          { title: 'Dealer checks required, private sales exempt', description: '', isCurrentPolicy: true },
          { title: 'Faster checks with improved database', description: '' },
          { title: 'Less government involvement in gun sales', description: '' },
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
          { title: 'Permits only for those with demonstrated need', description: '' },
          { title: 'Permits granted to anyone who completes training', description: '' },
          { title: 'Mix of permit requirements varies by state', description: '', isCurrentPolicy: true },
          { title: 'No permit needed to carry concealed', description: '' },
          { title: 'Carry openly or concealed without any permit', description: '' },
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
          { title: 'Many people can petition with lower burden of proof', description: '' },
          { title: 'Family and police can petition court to remove guns', description: '' },
          { title: 'Some states have red flag laws, others don\'t', description: '', isCurrentPolicy: true },
          { title: 'Red flags only for imminent documented threats', description: '' },
          { title: 'No red flag laws to protect due process rights', description: '' },
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
          { title: 'Emergency mobilization for net-zero by 2035', description: '' },
          { title: '50% cuts by 2030, net-zero by 2050', description: '' },
          { title: 'Meaningful cuts balanced with economic costs', description: '', isCurrentPolicy: true },
          { title: 'Reduce emissions as clean tech becomes cheaper', description: '' },
          { title: 'Let market and innovation drive change without mandates', description: '' },
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
          { title: '$100+/ton carbon tax with household rebates', description: '' },
          { title: 'Cap-and-trade or modest carbon tax', description: '' },
          { title: 'Sector-specific regulations instead of carbon pricing', description: '', isCurrentPolicy: true },
          { title: 'Voluntary carbon offsets for businesses', description: '' },
          { title: 'No taxes or pricing on carbon emissions', description: '' },
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
          { title: 'Strong new limits on all major emission sources', description: '' },
          { title: 'Tighter standards with better enforcement', description: '' },
          { title: 'Keep existing environmental protections', description: '', isCurrentPolicy: true },
          { title: 'Reduce regulatory burden while maintaining goals', description: '' },
          { title: 'Remove regulations that limit economic growth', description: '' },
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
          { title: 'Phase out all fossil fuel power generation', description: '' },
          { title: '80%+ renewables with battery storage investment', description: '' },
          { title: 'Tax credits and gradual renewable expansion', description: '', isCurrentPolicy: true },
          { title: 'All-of-the-above: renewables, fossil fuels, and nuclear', description: '' },
          { title: 'No subsidies; let energy technologies compete freely', description: '' },
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
          { title: 'Build new plants and advanced reactors', description: '' },
          { title: 'Keep plants running with selective new builds', description: '' },
          { title: 'Maintain existing plants with limited new construction', description: '', isCurrentPolicy: true },
          { title: 'Don\'t extend licenses or build new plants', description: '' },
          { title: 'Close nuclear plants as too dangerous and expensive', description: '' },
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
          { title: 'Ban all new fossil fuel extraction', description: '' },
          { title: 'No new drilling leases on public land', description: '' },
          { title: 'Maintain current domestic production levels', description: '', isCurrentPolicy: true },
          { title: 'Increase domestic production for energy independence', description: '' },
          { title: 'Maximize fossil fuel output everywhere possible', description: '' },
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
          { title: 'More analysis and public input required', description: '' },
          { title: 'Full environmental impact statements required', description: '' },
          { title: 'Timeline and page limits for efficiency', description: '', isCurrentPolicy: true },
          { title: 'Faster approvals with categorical exclusions', description: '' },
          { title: 'Remove most environmental review requirements', description: '' },
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
          { title: 'Federal authority can override state objections', description: '' },
          { title: 'Fast-track federal process for interstate lines', description: '' },
          { title: 'Both federal and state approval involved', description: '', isCurrentPolicy: true },
          { title: 'States control what crosses their land', description: '' },
          { title: 'Communities can block transmission lines', description: '' },
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
          { title: 'Minimal review for renewable projects', description: '' },
          { title: 'Faster timelines and priority processing for clean energy', description: '' },
          { title: 'Modest fast-tracking for clean energy projects', description: '', isCurrentPolicy: true },
          { title: 'Same review process for all energy types', description: '' },
          { title: 'More scrutiny of environmental impacts for all projects', description: '' },
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
