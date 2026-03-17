/**
 * North Carolina 2026 Ballot Data
 *
 * Real-world scored data from the ballot-builder-agent pipeline.
 * Source: NC 2026 — Primary: 2026-03-03, Runoff: 2026-05-12, General: 2026-11-03
 *
 * Contests:
 *   NC-US-SENATE-2026 — U.S. Senate (Toss-up, open seat — Tillis retiring)
 */

import type { Candidate, Contest, Measure, Ballot } from '../../types';
import { BALLOT_IDS, CONTEST_IDS, MEASURE_IDS } from './ids';

// ============================================
// Candidates — NC U.S. Senate
// ============================================

const candidatesNCSenate: Candidate[] = [
  {
    id: 'roy-cooper',
    contestId: CONTEST_IDS.NC_US_SENATE,
    name: { full: 'Roy Cooper', ballotDisplay: 'Roy Cooper' },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 1,
    profileSummary: 'Former two-term North Carolina Governor (2017-2025) and six-time statewide winner with 38+ years in public office; a center-left pragmatist who expanded Medicaid, signed landmark clean energy legislation, and used the veto pen extensively against a Republican supermajority on guns, vouchers, and abortion.',
    positions: [
      'Signed Medicaid expansion covering 600,000+ North Carolinians; defends ACA subsidies and Medicare',
      'Signed HB 951 mandating 70% carbon reduction by 2030 and carbon neutrality by 2050',
      'Vetoed multiple gun bills including pistol permit repeal; created statewide Office of Violence Prevention',
      'Vetoed $6B+ school voucher expansion; strong pro-public school position',
      'Commuted 15 death row sentences (largest clemency action in NC history)',
    ],
    axisStances: {
      econ_safetynet: 2,
      econ_investment: 3,
      econ_tax_structure: 3,
      econ_school_choice: 2,
      health_coverage_model: 3,
      housing_affordability_tools: 3,
      justice_policing_accountability: 3,
      justice_sentencing_goals: 3,
      justice_firearms: 2,
      climate_ambition: 2,
      climate_energy_portfolio: 3,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Medicaid expansion signing (2023)', url: 'https://governor.nc.gov/news/press-releases/2023/03/27/governor-cooper-signs-medicaid-expansion-law' },
        { text: 'NC AFL-CIO endorsement', url: 'https://aflcionc.org/press/north-carolina-afl-cio-endorses-statewide-candidates-2026' },
      ],
      econ_investment: [
        { text: 'Teacher pay and education investment record', url: 'https://www.govroycooper.org/accomplishments' },
        { text: 'Medicaid expansion ($$ investment)', url: 'https://thehill.com/homenews/campaign/5428774-roy-cooper-medicaid-north-carolina-senate-campaign/' },
      ],
      econ_tax_structure: [
        { text: 'Multiple budget vetoes over broad corporate/income tax cuts', url: 'https://www.theassemblync.com/news/politics/roy-cooper-legacy-governor-north-carolina/' },
        { text: 'Called for freezing high-income tax cuts for education revenue', url: 'https://www.wfdd.org/health-safety/2026-02-19/u-s-senate-candidate-roy-cooper-talks-affordability-in-greensboro-on-campaign-trail' },
      ],
      econ_school_choice: [
        { text: 'Vetoed HB 10 ($6B+ voucher expansion, 2024)', url: 'https://governor.nc.gov/news/press-releases/2024/03/27/case-against-school-vouchers-steroids-governor-cooper-outlines-threats-extreme-gop-plan-poses-public' },
        { text: "Press release: 'Sending taxpayer dollars to private schools with no accountability'", url: 'https://governor.nc.gov/news/press-releases/2024/03/27/case-against-school-vouchers-steroids-governor-cooper-outlines-threats-extreme-gop-plan-poses-public' },
      ],
      health_coverage_model: [
        { text: 'Signed Medicaid expansion into law (2023, covering 600,000+)', url: 'https://governor.nc.gov/news/press-releases/2023/03/27/governor-cooper-signs-medicaid-expansion-law' },
        { text: '2026 campaign: defends ACA subsidies, Medicaid, Medicare', url: 'https://www.wfdd.org/health-safety/2026-02-19/u-s-senate-candidate-roy-cooper-talks-affordability-in-greensboro-on-campaign-trail' },
      ],
      housing_affordability_tools: [
        { text: 'Proposed $160M affordable housing investment (2019)', url: 'https://www.govroycooper.org/accomplishments' },
      ],
      justice_policing_accountability: [
        { text: 'Created TREC (Task Force for Racial Equity in Criminal Justice, 2020)', url: 'https://governor.nc.gov/news/press-releases/2021/09/02/governor-cooper-signs-criminal-justice-reform-bills-law' },
        { text: 'Signed SB 300 reform package: duty to intervene, early intervention systems', url: 'https://governor.nc.gov/news/press-releases/2021/09/02/governor-cooper-signs-criminal-justice-reform-bills-law' },
      ],
      justice_sentencing_goals: [
        { text: 'Commuted 15 death row sentences (largest in NC history, Dec 2024)', url: 'https://governor.nc.gov/news/press-releases/2024/12/31/governor-cooper-takes-capital-clemency-actions' },
        { text: 'Signed First Step Act-related reforms' },
      ],
      justice_firearms: [
        { text: 'Vetoed SB 41 (permit-to-purchase repeal, 2023)', url: 'https://www.nraila.org/articles/20210830/north-carolina-gov-cooper-vetoes-pistol-permit-repeal' },
        { text: 'Created statewide Office of Violence Prevention (2023)', url: 'https://governor.nc.gov/news/press-releases/2023/03/24/governor-cooper-vetoes-legislation-eliminating-sheriffs-background-checks-handguns' },
      ],
      climate_ambition: [
        { text: 'Signed HB 951: 70% carbon reduction by 2030, carbon neutral by 2050', url: 'https://www.all4inc.com/4-the-record-articles/house-bill-951-in-north-carolina-what-is-it-and-what-is-duke-energys-plan/' },
        { text: 'Executive Order 246 (2022): strengthened to 50% reduction by 2030', url: 'https://www.govroycooper.org/accomplishments' },
      ],
      climate_energy_portfolio: [
        { text: 'HB 951: clean energy targets working with Duke Energy', url: 'https://www.all4inc.com/4-the-record-articles/house-bill-951-in-north-carolina-what-is-it-and-what-is-duke-energys-plan/' },
        { text: 'NC became #9 nationally in clean energy jobs', url: 'https://nclcv.org/cib09292025-lcv-endorses-roy-cooper-for-us-senate/' },
      ],
    },
    valueStances: {
      universalism: 0.6,
      benevolence: 0.7,
      tradition: -0.2,
      conformity: 0.6,
      security: 0.5,
      power: 0.1,
      achievement: 0.3,
      hedonism: 0.0,
      stimulation: -0.1,
      self_direction: 0.4,
    },
  },
  {
    id: 'michael-whatley',
    contestId: CONTEST_IDS.NC_US_SENATE,
    name: { full: 'Michael Whatley', ballotDisplay: 'Michael Whatley' },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    profileSummary: 'Former RNC Chair and fossil fuel industry lobbyist with no prior elected office; Trump-endorsed frontrunner running on energy deregulation, immigration enforcement, and DOGE-style spending cuts.',
    positions: [
      'All-of-the-above energy including carbon; decade of fossil fuel industry advocacy',
      'Supports DOGE-style federal spending cuts, Medicaid work requirements, and deficit reduction',
      'Back the blue; eliminate sanctuary cities; full ICE cooperation and mass deportation support',
      'Celebrated Dobbs; supported NC 12-week abortion ban',
      'No-tax-on-tips, no-tax-on-overtime, no-tax-on-Social Security',
    ],
    axisStances: {
      econ_safetynet: 8,
      econ_investment: 8,
      econ_tax_structure: 7,
      health_coverage_model: 7,
      health_public_health: 9,
      justice_policing_accountability: 9,
      justice_sentencing_goals: 8,
      justice_firearms: 8,
      climate_ambition: 9,
      climate_energy_portfolio: 8,
      climate_permitting: 9,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Newsmax DOGE interview Jan 2026', url: 'https://www.newsmax.com/politics/whatley-doge-reduce/2026/01/16/id/1242466/' },
        { text: 'Campaign website', url: 'https://www.michaelwhatley.com' },
      ],
      econ_investment: [
        { text: 'Newsmax DOGE interview Jan 2026', url: 'https://www.newsmax.com/politics/whatley-doge-reduce/2026/01/16/id/1242466/' },
        { text: 'Career record at CEA (deregulation advocacy 2008-2019)', url: 'https://www.eenews.net/articles/republicans-oil-ties-a-focus-in-north-carolina-senate-race/' },
      ],
      econ_tax_structure: [
        { text: 'Washington Examiner campaign platform', url: 'https://www.washingtonexaminer.com/news/3488275/whatley-running-on-strong-economy-safe-communities-respected-america/' },
        { text: 'Campaign website', url: 'https://www.michaelwhatley.com' },
      ],
      health_coverage_model: [
        { text: 'Newsmax DOGE interview (Medicaid work requirements)', url: 'https://www.newsmax.com/politics/whatley-doge-reduce/2026/01/16/id/1242466/' },
        { text: 'Campaign website', url: 'https://www.michaelwhatley.com' },
      ],
      health_public_health: [
        { text: 'WRAL pastor summit interview 2026', url: 'https://www.wral.com/story/gop-senate-candidate-whatley-we-don-t-need-separation-of-church-and-state/22151351/' },
        { text: 'Campaign website (anti-transgender mandates)', url: 'https://www.michaelwhatley.com' },
      ],
      justice_policing_accountability: [
        { text: 'Fox News ICE/immigration interview 2026', url: 'https://www.foxnews.com/politics/nc-senate-candidate-says-ice-charlotte-ops-result-ex-gov-opponent-repeatedly-blunting-cooperation' },
        { text: 'Campaign website', url: 'https://www.michaelwhatley.com' },
      ],
      justice_sentencing_goals: [
        { text: 'Fox News interview (soft on crime framing)', url: 'https://www.foxnews.com/politics/nc-senate-candidate-says-ice-charlotte-ops-result-ex-gov-opponent-repeatedly-blunting-cooperation' },
        { text: 'Campaign website', url: 'https://www.michaelwhatley.com' },
      ],
      justice_firearms: [
        { text: 'Trump endorsement (inference)', url: 'https://www.nbcnews.com/politics/2026-election/michael-whatley-ties-trump-north-carolina-senate-race-rcna249551' },
        { text: 'No gun safety statements found in campaign materials', url: 'https://www.michaelwhatley.com' },
      ],
      climate_ambition: [
        { text: 'Consumer Energy Alliance career 2008-2019 (opposed emission rules)', url: 'https://www.eenews.net/articles/republicans-oil-ties-a-focus-in-north-carolina-senate-race/' },
        { text: 'E&E News reporting on oil ties', url: 'https://www.eenews.net/articles/republicans-tap-former-oil-lobbyist-for-national-chair/' },
      ],
      climate_energy_portfolio: [
        { text: 'Consumer Energy Alliance career record', url: 'https://www.sourcewatch.org/index.php/Michael_Whatley' },
        { text: 'CEA offshore drilling advocacy (2010)', url: 'https://consumerenergyalliance.org/2010/11/michael-whatley-we-need-offshore-drilling/' },
      ],
      climate_permitting: [
        { text: 'Consumer Energy Alliance career record (lobbied for expedited energy permitting)', url: 'https://www.eenews.net/articles/republicans-oil-ties-a-focus-in-north-carolina-senate-race/' },
        { text: 'Campaign website (deregulation framing)', url: 'https://www.michaelwhatley.com' },
      ],
    },
    valueStances: {
      universalism: -0.6,
      benevolence: 0.2,
      tradition: 0.8,
      conformity: -0.3,
      security: 0.7,
      power: 0.6,
      achievement: 0.4,
      hedonism: -0.3,
      stimulation: -0.2,
      self_direction: -0.1,
    },
  },
  {
    id: 'don-brown',
    contestId: CONTEST_IDS.NC_US_SENATE,
    name: { full: 'Don Brown', ballotDisplay: 'Don Brown' },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 3,
    profileSummary: 'Retired Navy JAG officer and January 6 defense attorney running a long-shot MAGA-wing Senate bid; platforms on eliminating the IRS, banning vaccine mandates, Constitutional Carry, and aggressive deficit reduction.',
    positions: [
      'Eliminate the IRS and replace income tax with a national consumption tax (FairTax)',
      'Ban all vaccine and mask mandates federally via proposed "Vax and Mask Freedom Act"',
      'National Constitutional Carry; opposes all gun regulations',
      'Personhood from conception; supports federal death penalty for fentanyl traffickers',
      'Reduce federal spending to attack the $38 trillion national debt',
    ],
    axisStances: {
      econ_safetynet: 9,
      econ_investment: 9,
      econ_tax_structure: 10,
      health_coverage_model: 9,
      health_cost_control: 8,
      health_public_health: 10,
      housing_affordability_tools: 8,
      justice_policing_accountability: 9,
      justice_sentencing_goals: 9,
      justice_firearms: 10,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'WCTI12 interview 2026', url: 'https://wcti12.com/news/local/meet-don-brown-candidate-for-us-senate' },
        { text: 'Campaign website policies page', url: 'https://www.donbrownfornc.com/policies' },
      ],
      econ_investment: [
        { text: 'Campaign website policies page', url: 'https://www.donbrownfornc.com/policies' },
        { text: 'WCTI12 interview 2026', url: 'https://wcti12.com/news/local/meet-don-brown-candidate-for-us-senate' },
      ],
      econ_tax_structure: [
        { text: 'Campaign website policies page', url: 'https://www.donbrownfornc.com/policies' },
      ],
      health_coverage_model: [
        { text: 'WSOC Political Beat Guide 2026', url: 'https://www.wsoctv.com/news/local/political-beat-candidate-guide-united-states-senate/AO4BCYOWQRGMDC35FBG3G3QWUI/' },
        { text: 'Campaign website', url: 'https://www.donbrownfornc.com/policies' },
      ],
      health_cost_control: [
        { text: 'WSOC Political Beat Guide 2026 (inferred from market philosophy)', url: 'https://www.wsoctv.com/news/local/political-beat-candidate-guide-united-states-senate/AO4BCYOWQRGMDC35FBG3G3QWUI/' },
      ],
      health_public_health: [
        { text: 'Campaign website policies page', url: 'https://www.donbrownfornc.com/policies' },
        { text: 'WCTI12 interview 2026', url: 'https://wcti12.com/news/local/meet-don-brown-candidate-for-us-senate' },
      ],
      housing_affordability_tools: [
        { text: 'WCTI12 interview 2026', url: 'https://wcti12.com/news/local/meet-don-brown-candidate-for-us-senate' },
      ],
      justice_policing_accountability: [
        { text: 'WUNC elections article 2026', url: 'https://www.wunc.org/elections/2026-02-24/in-north-carolinas-u-s-senate-gop-primary-contenders-try-to-topple-trump-endorsed-candidate' },
        { text: 'Campaign website', url: 'https://www.donbrownfornc.com/policies' },
      ],
      justice_sentencing_goals: [
        { text: 'Campaign website policies page', url: 'https://www.donbrownfornc.com/policies' },
        { text: 'WUNC elections article 2026', url: 'https://www.wunc.org/elections/2026-02-24/in-north-carolinas-u-s-senate-gop-primary-contenders-try-to-topple-trump-endorsed-candidate' },
      ],
      justice_firearms: [
        { text: 'BallotReady profile', url: 'https://www.ballotready.org/people/don-brown-3e66559c-c1c7-441a-ad50-67450812c85c' },
        { text: 'Campaign website policies page', url: 'https://www.donbrownfornc.com/policies' },
      ],
    },
    valueStances: {
      universalism: -0.6,
      benevolence: 0.2,
      tradition: 0.8,
      conformity: -0.5,
      security: 0.6,
      power: 0.3,
      achievement: 0.5,
      hedonism: -0.1,
      stimulation: 0.5,
      self_direction: 0.4,
    },
  },
  {
    id: 'michele-morrow',
    contestId: CONTEST_IDS.NC_US_SENATE,
    name: { full: 'Michele Morrow', ballotDisplay: 'Michele Morrow' },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 4,
    profileSummary: 'Conservative activist and former homeschool educator with no legislative record; best known for her 2024 Superintendent campaign centered on school choice, medical freedom, and anti-establishment rhetoric.',
    positions: [
      'Universal school choice advocate: supports vouchers, opposes public school "monopoly"',
      'Anti-vaccine mandate activist; "medical freedom" is a core campaign theme',
      'Replace ACA with market-based healthcare and health savings accounts',
      'Hardline immigration: mass deportation, self-deportation programs',
      'Strongly pro-2A: supports arming teachers',
    ],
    axisStances: {
      econ_safetynet: 8,
      econ_school_choice: 9,
      health_coverage_model: 8,
      health_public_health: 10,
      justice_firearms: 9,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Campaign website (morrow4nc.com)', url: 'https://www.morrow4nc.com' },
        { text: 'Anti-spending, eliminate-waste framing', url: 'https://www.morrow4nc.com' },
      ],
      econ_school_choice: [
        { text: '2024 Superintendent campaign platform', url: 'https://www.ednc.org/09-12-2024-nc-school-superintendent-candidates-mo-green-michele-morrow-first-debate/' },
        { text: 'EdNC debate September 2024', url: 'https://www.ednc.org/09-12-2024-nc-school-superintendent-candidates-mo-green-michele-morrow-first-debate/' },
      ],
      health_coverage_model: [
        { text: 'Campaign website (morrow4nc.com)', url: 'https://www.morrow4nc.com' },
      ],
      health_public_health: [
        { text: 'NPR October 2024', url: 'https://www.npr.org/2024/10/21/nx-s1-5154035/north-carolina-schools-candidate-michele-morrow-obama' },
        { text: 'CNN K-File', url: 'https://www.cnn.com/2024/03/14/politics/kfile-gop-nominee-north-carolina-public-schools-michele-morrow-executing-democrats/index.html' },
      ],
      justice_firearms: [
        { text: 'iVoterGuide profile', url: 'https://ivoterguide.com/candidate/71701/race/9793/election/1206' },
        { text: 'Campaign statements', url: 'https://www.morrow4nc.com' },
      ],
    },
    valueStances: {
      universalism: -0.8,
      benevolence: -0.1,
      tradition: 0.8,
      conformity: -0.9,
      security: 0.3,
      power: 0.3,
      achievement: 0.3,
      hedonism: -0.2,
      stimulation: 0.5,
      self_direction: 0.4,
    },
  },
  {
    id: 'shannon-bray',
    contestId: CONTEST_IDS.NC_US_SENATE,
    name: { full: 'Shannon Bray', ballotDisplay: 'Shannon Bray' },
    party: 'Libertarian',
    incumbencyStatus: 'challenger',
    ballotOrder: 5,
    profileSummary: 'Perennial Libertarian candidate (4th statewide race since 2020) with a cybersecurity background and Navy veteran status; combines extreme free-market economics with strong civil liberties positions on policing and criminal justice.',
    positions: [
      'Abolish the IRS and replace income tax with FairTax; phase out Social Security by 2035',
      'Repeal the ACA; replace with health savings accounts and patient data ownership',
      'Abolish qualified immunity, end civil asset forfeiture, ban no-knock warrants',
      'Full drug legalization and abolish the federal death penalty',
      'Repeal existing gun regulations; strong Second Amendment absolutist',
    ],
    axisStances: {
      econ_safetynet: 10,
      econ_investment: 9,
      econ_school_choice: 8,
      econ_tax_structure: 10,
      health_coverage_model: 9,
      health_cost_control: 9,
      health_public_health: 9,
      housing_affordability_tools: 9,
      justice_policing_accountability: 2,
      justice_sentencing_goals: 1,
      justice_firearms: 10,
      climate_ambition: 9,
      climate_energy_portfolio: 8,
      climate_permitting: 8,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Campaign website issues page (2026)', url: 'https://www.shannonbray.us/issues' },
        { text: 'Consistent position across 4 campaign cycles (2020-2026)', url: 'https://www.shannonbray.us/' },
      ],
      econ_investment: [
        { text: 'Campaign website issues page', url: 'https://www.shannonbray.us/issues' },
        { text: 'Consistent anti-subsidy stance across 4 cycles', url: 'https://www.shannonbray.us/a_government_that_works_in_the_real_world' },
      ],
      econ_school_choice: [
        { text: 'LPNC platform page', url: 'https://www.lpnc.org/shannon_bray_my_vision_for_nc' },
        { text: 'Consistent position 2024-2026', url: 'https://www.shannonbray.us/issues' },
      ],
      econ_tax_structure: [
        { text: 'Campaign website issues page (2020-2026)', url: 'https://www.shannonbray.us/issues' },
        { text: 'Book "Liberty Unleashed"', url: 'https://www.amazon.com/Liberty-Unleashed-Shannon-Prosperous-Carolina-ebook/dp/B0GCPLD6QX' },
      ],
      health_coverage_model: [
        { text: 'Campaign website healthcare/data policy page (2026)', url: 'https://www.shannonbray.us/healthcare_data' },
        { text: 'Consistent across campaigns', url: 'https://www.shannonbray.us/' },
      ],
      health_cost_control: [
        { text: 'Campaign website healthcare/data policy page (2026)', url: 'https://www.shannonbray.us/healthcare_data' },
      ],
      health_public_health: [
        { text: 'Campaign website issues page (2020-2026)', url: 'https://www.shannonbray.us/issues' },
        { text: 'Anti-mandate, anti-lockdown stance across COVID era', url: 'https://www.shannonbray.us/issues' },
      ],
      housing_affordability_tools: [
        { text: 'Inferred from consistent anti-subsidy philosophy across all policy areas' },
      ],
      justice_policing_accountability: [
        { text: 'BallotReady 2024 questionnaire responses', url: 'https://www.ballotready.org/people/shannon-w-bray' },
        { text: 'Campaign website issues page', url: 'https://www.shannonbray.us/issues' },
      ],
      justice_sentencing_goals: [
        { text: 'Campaign website issues page (2026)', url: 'https://www.shannonbray.us/issues' },
        { text: 'iSideWith policy responses', url: 'https://www.isidewith.com/candidates/shannon-bray/policies' },
      ],
      justice_firearms: [
        { text: 'Campaign website dedicated guns policy page', url: 'https://www.shannonbray.us/guns_and_social_media' },
        { text: 'Consistent position across all campaigns', url: 'https://www.shannonbray.us/' },
      ],
      climate_ambition: [
        { text: 'Campaign website energy/utilities policy page (2026)', url: 'https://www.shannonbray.us/cyber_resilient_energy_utilities' },
      ],
      climate_energy_portfolio: [
        { text: 'Campaign website energy/utilities policy page (2026)', url: 'https://www.shannonbray.us/cyber_resilient_energy_utilities' },
      ],
      climate_permitting: [
        { text: 'Campaign website energy/utilities page', url: 'https://www.shannonbray.us/cyber_resilient_energy_utilities' },
        { text: 'General deregulation philosophy', url: 'https://www.shannonbray.us/issues' },
      ],
    },
    valueStances: {
      universalism: 0.1,
      benevolence: -0.1,
      tradition: -0.2,
      conformity: -0.6,
      security: -0.5,
      power: -0.3,
      achievement: 0.3,
      hedonism: 0.2,
      stimulation: 0.5,
      self_direction: 0.9,
    },
  },
  {
    id: 'brian-mcginnis',
    contestId: CONTEST_IDS.NC_US_SENATE,
    name: { full: 'Brian McGinnis', ballotDisplay: 'Brian McGinnis' },
    party: 'Other',
    incumbencyStatus: 'challenger',
    ballotOrder: 6,
    profileSummary: 'First-time Green Party candidate; Iraq War veteran and active firefighter running on an anti-war, pro-social-services platform.',
    positions: [
      'Anti-war foreign policy: opposes "wars based on greed"',
      'Increased public education funding; opposes federal cuts to schools',
      'Solar energy investment in rural NC communities; supports manufacturing revival',
      'Expanded and better-staffed VA for veterans',
      'No corporate donations; term limits; pledges to serve only one term',
    ],
    axisStances: {
      econ_safetynet: 2,
      econ_investment: 2,
      econ_school_choice: 1,
      econ_tax_structure: 2,
      health_coverage_model: 1,
      health_cost_control: 2,
      climate_ambition: 1,
      climate_energy_portfolio: 1,
      housing_affordability_tools: 1,
      housing_transport_priority: 2,
      justice_policing_accountability: 2,
      justice_sentencing_goals: 2,
      justice_firearms: 1,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Campaign page: anti-war, pro social services perspective', url: 'https://www.gp.org/brian_mcginnis_4_us_senate' },
        { text: 'Green Party platform: expand all safety net programs', url: 'https://gpus.org/organizing-tools/the-green-new-deal/' },
      ],
      econ_investment: [
        { text: 'Campaign page: ramping up manufacturing and energy in NC with solar farms', url: 'https://www.gp.org/brian_mcginnis_4_us_senate' },
        { text: 'Campaign page: education system in dire need of increased funding', url: 'https://www.gp.org/brian_mcginnis_4_us_senate' },
      ],
      econ_school_choice: [
        { text: 'Campaign page: education system in dire need of increased funding', url: 'https://www.gp.org/brian_mcginnis_4_us_senate' },
        { text: 'Green Party platform: fully fund public schools, oppose vouchers', url: 'https://www.gp.org/the_green_party_on_education' },
      ],
      econ_tax_structure: [
        { text: 'Campaign page: no corporate donations pledge', url: 'https://www.gp.org/brian_mcginnis_4_us_senate' },
        { text: 'Green Party platform: highly progressive taxation', url: 'https://www.gp.org/economic_justice_and_sustainability' },
      ],
      health_coverage_model: [
        { text: 'Campaign page: pro social services', url: 'https://www.gp.org/brian_mcginnis_4_us_senate' },
        { text: 'Green Party platform: Medicare for All / single-payer', url: 'https://www.gp.org/single_payer' },
      ],
      health_cost_control: [
        { text: 'Green Party platform: single-payer system implies government price setting', url: 'https://www.gp.org/single_payer' },
      ],
      climate_ambition: [
        { text: 'Campaign page: solar farms in rural NC', url: 'https://www.gp.org/brian_mcginnis_4_us_senate' },
        { text: 'Green Party platform: Green New Deal, 100% clean energy by 2030', url: 'https://gpus.org/organizing-tools/the-green-new-deal/' },
      ],
      climate_energy_portfolio: [
        { text: 'Campaign page: solar farms in rural areas', url: 'https://www.gp.org/brian_mcginnis_4_us_senate' },
        { text: 'Green Party platform: 100% clean renewable energy by 2030', url: 'https://gpus.org/organizing-tools/the-green-new-deal/' },
      ],
      housing_affordability_tools: [
        { text: 'Green Party platform: housing as a human right, rent control, public housing investment', url: 'https://www.gp.org/green_party_demands_rent_control_an_end_to_homelessness' },
      ],
      housing_transport_priority: [
        { text: 'Green Party platform: mass transit expansion, reduce car dependence', url: 'https://www.gp.org/platform' },
      ],
      justice_policing_accountability: [
        { text: 'Green Party platform: demilitarize police, independent civilian review boards', url: 'https://www.gp.org/social_justice' },
      ],
      justice_sentencing_goals: [
        { text: 'Green Party platform: end war on drugs, oppose mandatory minimums', url: 'https://www.gp.org/social_justice' },
      ],
      justice_firearms: [
        { text: 'Green Party platform: ban on assault weapons, universal background checks', url: 'https://www.gp.org/on_gun_violence' },
      ],
    },
    valueStances: {
      universalism: 0.5,
      benevolence: 0.6,
      tradition: -0.2,
      conformity: -0.3,
      security: 0.1,
      power: -0.4,
      achievement: 0.0,
      hedonism: 0.0,
      stimulation: 0.2,
      self_direction: 0.4,
    },
  },
];

// ============================================
// Candidates — NC-02 U.S. House
// ============================================

const candidatesNC02: Candidate[] = [
  {
    id: 'deborah-ross',
    contestId: CONTEST_IDS.NC_HOUSE_02,
    name: { full: 'Deborah K. Ross', ballotDisplay: 'Deborah K. Ross' },
    party: 'Democratic',
    incumbencyStatus: 'incumbent',
    ballotOrder: 1,
    profileSummary: 'Three-term progressive congresswoman and former NC-ACLU director with near-perfect environmental and gun safety records; champions public transit investment, prescription drug price reform, and police accountability from a reform-oriented but establishment-aligned posture.',
    positions: [
      'LCV 100% (2024), 99% lifetime; authored IRA offshore wind provision',
      'Supports public option and ACA expansion, explicitly not Medicare for All; authored PBM Reform Act (passed House Jan 2026)',
      'Voted for assault weapons ban and Bipartisan Safer Communities Act; endorsed by Brady PAC and Everytown',
      'Co-sponsored George Floyd Justice in Policing Act; former NC-ACLU director',
      'Voted for ARP, Infrastructure Act, CHIPS Act, and IRA',
    ],
    axisStances: {
      econ_safetynet: 1,
      econ_investment: 1,
      econ_tax_structure: 2,
      econ_school_choice: 2,
      health_coverage_model: 3,
      health_cost_control: 1,
      health_public_health: 3,
      housing_affordability_tools: 3,
      housing_transport_priority: 1,
      justice_policing_accountability: 2,
      justice_sentencing_goals: 2,
      justice_firearms: 1,
      climate_ambition: 1,
      climate_energy_portfolio: 1,
      climate_permitting: 3,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'ARP vote (2021) — expanded Child Tax Credit', url: 'https://en.wikipedia.org/wiki/Deborah_Ross_(politician)' },
        { text: 'No vote on 2025 GOP budget resolution cutting Medicaid/SNAP', url: 'https://ross.house.gov/2025/2/congresswoman-ross-votes-against-house-budget-resolution-that-would-cut-billions-in-funding-for-medicaid-snap-and-other-critical-services' },
      ],
      econ_investment: [
        { text: 'Infrastructure Investment and Jobs Act vote (2021)', url: 'https://ross.house.gov/2021/11/congresswoman-ross-applauds-passage-bipartisan-infrastructure-package' },
        { text: 'CHIPS and Science Act vote ($280B, 2022)', url: 'https://en.wikipedia.org/wiki/Deborah_Ross_(politician)' },
      ],
      econ_tax_structure: [
        { text: 'No vote on 2025 GOP budget resolution ($4.5T in tax cuts)', url: 'https://ross.house.gov/2025/2/congresswoman-ross-votes-against-house-budget-resolution-that-would-cut-billions-in-funding-for-medicaid-snap-and-other-critical-services' },
        { text: 'IRA vote (corporate minimum tax and stock buyback excise tax)', url: 'https://ross.house.gov/2022/8/congresswoman-ross-secures-historic-support-north-carolinas-clean-energy' },
      ],
      econ_school_choice: [
        { text: 'Campaign website: public education, reducing class sizes, teacher pay', url: 'https://deborahross.com/priorities/education-and-opportunity/' },
        { text: 'AFL-CIO endorsement', url: 'https://aflcionc.org/news/endorsements-november-5-2024-general-elections' },
      ],
      health_coverage_model: [
        { text: 'Wake County Dems candidate info: explicit public option support', url: 'https://www.wakedems.org/election-central-2024/candidate-info-deborah-ross/' },
        { text: 'Campaign website: lower Medicare eligibility from 65 to 60', url: 'https://deborahross.com/priorities/' },
      ],
      health_cost_control: [
        { text: 'Authored PBM Reform Act (passed House Jan 2026)', url: 'https://ross.house.gov/2026/1/house-passes-congresswoman-ross-bill-to-combat-harmful-pbm-practices-lower-prescription-drug-prices' },
        { text: 'IRA vote (Medicare drug price negotiation provisions)', url: 'https://ross.house.gov/2022/8/congresswoman-ross-secures-historic-support-north-carolinas-clean-energy' },
      ],
      housing_affordability_tools: [
        { text: 'Letter to FHFA/CFPB urging investigation of institutional investors in housing (2024)', url: 'https://foushee.house.gov/media/press-releases/foushee-ross-call-for-greater-accountability-in-housing-amid-concerns-over-wall-street-influence' },
        { text: 'Secured federal affordable housing appropriations for Wake County' },
      ],
      housing_transport_priority: [
        { text: 'Secured $19.3M for Raleigh BRT', url: 'https://ross.house.gov/transportation-and-infrastructure' },
        { text: 'Secured $176M+ for NC transit overall', url: 'https://ross.house.gov/transportation-and-infrastructure' },
      ],
      justice_policing_accountability: [
        { text: 'Co-sponsored George Floyd Justice in Policing Act', url: 'https://www.congress.gov/bill/117th-congress/house-bill/1280/cosponsors' },
        { text: 'Former NC-ACLU Director: pushed police to collect race-based stop statistics', url: 'https://ross.house.gov/equality-and-justice' },
      ],
      justice_sentencing_goals: [
        { text: 'Overhauled NC youth offender system as ACLU director', url: 'https://en.wikipedia.org/wiki/Deborah_Ross_(politician)' },
        { text: 'Introduced End Prison Gerrymandering Act (Feb 2026)', url: 'https://www.billtrack50.com/legislatordetail/2351' },
      ],
      justice_firearms: [
        { text: 'Voted for assault weapons ban (2022)', url: 'https://georgiarecorder.com/2022/07/29/u-s-house-passes-ban-on-assault-weapons-after-spate-of-gun-violence/' },
        { text: 'Brady PAC and Everytown endorsements', url: 'https://elections.bradyunited.org/press/brady-campaign-endorses-deborah-ross-for-u-s-house-of-representatives' },
      ],
      climate_ambition: [
        { text: 'LCV 100% (2024), 99% lifetime', url: 'https://www.lcv.org/moc/deborah-ross/' },
        { text: 'Authored IRA offshore wind provision', url: 'https://ross.house.gov/2022/8/congresswoman-ross-secures-historic-support-north-carolinas-clean-energy' },
      ],
      climate_energy_portfolio: [
        { text: 'Authored offshore wind moratorium repeal (IRA provision)', url: 'https://ross.house.gov/2023/7/reps-ross-ocasio-cortez-kamlager-dove-introduce-clean-energy-now-acts' },
        { text: 'Introduced Defend Our Coast Act' },
      ],
      climate_permitting: [
        { text: 'Introduced NOW Act: decouple offshore wind from oil/gas lease sales', url: 'https://ross.house.gov/2023/7/reps-ross-ocasio-cortez-kamlager-dove-introduce-clean-energy-now-acts' },
        { text: 'Defend Our Coast Act: block fossil fuel permitting off Atlantic coast' },
      ],
    },
    valueStances: {
      universalism: 0.8,
      benevolence: 0.7,
      tradition: -0.4,
      conformity: -0.3,
      security: 0.1,
      power: -0.2,
      achievement: 0.3,
      hedonism: 0.0,
      stimulation: 0.2,
      self_direction: 0.4,
    },
  },
  {
    id: 'eugene-douglass',
    contestId: CONTEST_IDS.NC_HOUSE_02,
    name: { full: 'Eugene F. Douglass', ballotDisplay: 'Eugene F. Douglass' },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    profileSummary: 'Serial Republican candidate (since 1998, never elected) and retired chemistry professor running on three explicit pillars: abolish the Department of Education, protect life from conception, and shrink the federal government.',
    positions: [
      'Abolish the Department of Education and return all education authority to states',
      'Protect life from conception to natural death; opposes all public funding for abortion',
      'Small federal government, lower taxes, balanced budget amendment, less regulation',
      'GRNC-PVF 96% rating and four-star recommendation on firearms',
      'Strict immigration enforcement: immediate deportation, border wall, end sanctuary cities',
    ],
    axisStances: {
      econ_safetynet: 8,
      econ_investment: 9,
      econ_tax_structure: 8,
      econ_school_choice: 9,
      health_coverage_model: 8,
      health_public_health: 9,
      justice_firearms: 9,
      climate_ambition: 8,
      climate_energy_portfolio: 8,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Ballotpedia Candidate Connection Survey 2023', url: 'https://news.ballotpedia.org/2024/02/23/all-candidates-for-u-s-house-north-carolina-district-2-republican-primary-complete-ballotpedias-candidate-connection-survey/' },
        { text: 'News & Observer questionnaire 2024', url: 'https://www.aol.com/candidate-us-house-district-2-010829234.html' },
      ],
      econ_investment: [
        { text: 'Ballotpedia Survey 2023: small federal government, less regulation', url: 'https://news.ballotpedia.org/2024/02/23/all-candidates-for-u-s-house-north-carolina-district-2-republican-primary-complete-ballotpedias-candidate-connection-survey/' },
        { text: 'Balanced budget amendment support', url: 'https://www.aol.com/candidate-us-house-district-2-010829234.html' },
      ],
      econ_tax_structure: [
        { text: 'OpenCampaign profile 2024: huge tax decreases to end overspending', url: 'https://www.opencampaign.com/politicians-in-united-states/192927/eugene-douglass' },
        { text: 'OnTheIssues: voted YES on FY99 GOP budget, $792B tax cuts', url: 'https://www.ontheissues.org/Senate/Eugene_Douglass.htm' },
      ],
      econ_school_choice: [
        { text: 'Ballotpedia Survey 2023: disband the Department of Education', url: 'https://news.ballotpedia.org/2024/02/23/all-candidates-for-u-s-house-north-carolina-district-2-republican-primary-complete-ballotpedias-candidate-connection-survey/' },
        { text: 'OnTheIssues: voted YES on school vouchers (DC)', url: 'https://www.ontheissues.org/Senate/Eugene_Douglass.htm' },
      ],
      health_coverage_model: [
        { text: 'Full endorsement of 2016 GOP platform (ACA repeal)', url: 'https://www.aol.com/candidate-us-house-district-2-010829234.html' },
        { text: 'OnTheIssues: voted YES on Medicare means-testing', url: 'https://www.ontheissues.org/Senate/Eugene_Douglass.htm' },
      ],
      health_public_health: [
        { text: 'Ballotpedia Survey 2023: protect life from conception to natural death', url: 'https://news.ballotpedia.org/2024/02/23/all-candidates-for-u-s-house-north-carolina-district-2-republican-primary-complete-ballotpedias-candidate-connection-survey/' },
        { text: 'Opposition to gender-affirming care for minors', url: 'https://efdouglass.substack.com/p/nc-second-congressional-district-be7' },
      ],
      justice_firearms: [
        { text: 'GRNC-PVF 96% score and four-star recommendation (2024)', url: 'https://www.grnc.org/grnc-pvf/grnc-pvf-alertsupdates/1429-grnc-pvf-2022-general-election-candidate-recommendations' },
        { text: 'Full endorsement of 2016 GOP platform', url: 'https://www.aol.com/candidate-us-house-district-2-010829234.html' },
      ],
      climate_ambition: [
        { text: 'General anti-regulation, small-government philosophy', url: 'https://ballotpedia.org/Eugene_Douglass' },
      ],
      climate_energy_portfolio: [
        { text: 'General anti-regulation, small-government philosophy', url: 'https://ballotpedia.org/Eugene_Douglass' },
      ],
    },
    valueStances: {
      universalism: -0.5,
      benevolence: 0.2,
      tradition: 0.9,
      conformity: 0.6,
      security: 0.7,
      power: -0.3,
      achievement: 0.2,
      hedonism: -0.2,
      stimulation: -0.3,
      self_direction: 0.3,
    },
  },
  {
    id: 'matthew-laszacs',
    contestId: CONTEST_IDS.NC_HOUSE_02,
    name: { full: 'Matthew F. Laszacs', ballotDisplay: 'Matthew F. Laszacs' },
    party: 'Libertarian',
    incumbencyStatus: 'challenger',
    ballotOrder: 3,
    profileSummary: 'IT executive and three-time Libertarian candidate; strongest documented positions are universal school choice (ESAs/vouchers), healthcare deregulation (CON law elimination, Medicaid-to-HSA conversion), and full cannabis legalization.',
    positions: [
      'Universal ESAs and vouchers for all NC families; calls for dismantling district-based school assignment',
      'Convert Medicaid to state-funded health savings accounts; eliminate Certificate of Need laws',
      'Full cannabis legalization with no criminal or civil penalties (NORML A-)',
      'Core philosophy: low taxes, deregulation, individual freedom over government programs',
      'No-victim-no-crime criminal justice philosophy; decriminalization of victimless offenses',
    ],
    axisStances: {
      econ_safetynet: 8,
      econ_investment: 9,
      econ_tax_structure: 8,
      econ_school_choice: 9,
      health_coverage_model: 8,
      health_cost_control: 8,
      health_public_health: 7,
      housing_supply_zoning: 3,
      housing_affordability_tools: 9,
      justice_sentencing_goals: 2,
      justice_firearms: 9,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: '2024 campaign website (matt4nc.us)', url: 'https://matt4nc.us/' },
        { text: 'Yahoo News interview 2024', url: 'https://www.yahoo.com/news/libertarian-matthew-laszacs-candidate-nc-175746762.html' },
      ],
      econ_investment: [
        { text: '2024 campaign website (matt4nc.us)', url: 'https://matt4nc.us/' },
        { text: 'Yahoo News interview 2024', url: 'https://www.yahoo.com/news/libertarian-matthew-laszacs-candidate-nc-175746762.html' },
      ],
      econ_tax_structure: [
        { text: '2024 campaign website (matt4nc.us)', url: 'https://matt4nc.us/' },
        { text: 'LP national platform', url: 'https://lp.org/platform-page/' },
      ],
      econ_school_choice: [
        { text: '2024 campaign website: detailed ESA/voucher policy page', url: 'https://matt4nc.us/' },
      ],
      health_coverage_model: [
        { text: '2024 campaign website (matt4nc.us)', url: 'https://matt4nc.us/' },
      ],
      health_cost_control: [
        { text: '2024 campaign website (matt4nc.us)', url: 'https://matt4nc.us/' },
        { text: 'Yahoo News interview 2024', url: 'https://www.yahoo.com/news/libertarian-matthew-laszacs-candidate-nc-175746762.html' },
      ],
      health_public_health: [
        { text: 'NORML A- grade 2024', url: 'https://vote.norml.org/politicians/207126' },
        { text: 'Yahoo News interview 2024', url: 'https://www.yahoo.com/news/libertarian-matthew-laszacs-candidate-nc-175746762.html' },
      ],
      housing_supply_zoning: [
        { text: '2024 campaign website (matt4nc.us)', url: 'https://matt4nc.us/' },
      ],
      housing_affordability_tools: [
        { text: 'LP national platform', url: 'https://lp.org/platform-page/' },
        { text: 'Overall deregulation philosophy' },
      ],
      justice_sentencing_goals: [
        { text: 'NORML A- grade 2024', url: 'https://vote.norml.org/politicians/207126' },
        { text: 'Yahoo News interview 2024', url: 'https://www.yahoo.com/news/libertarian-matthew-laszacs-candidate-nc-175746762.html' },
      ],
      justice_firearms: [
        { text: 'LP national platform (Section 1.9)', url: 'https://lp.org/platform-page/' },
      ],
    },
    valueStances: {
      universalism: -0.2,
      benevolence: 0.2,
      tradition: -0.4,
      conformity: -0.6,
      security: -0.3,
      power: -0.2,
      achievement: 0.5,
      hedonism: 0.0,
      stimulation: 0.3,
      self_direction: 0.8,
    },
  },
];

// ============================================
// Candidates — NC State Senate District 8
// ============================================

const candidatesNCSenateD8: Candidate[] = [
  {
    id: 'william-rabon',
    contestId: CONTEST_IDS.NC_SENATE_D8,
    name: { full: 'William (Bill) Rabon', ballotDisplay: 'Bill Rabon' },
    party: 'Republican',
    incumbencyStatus: 'incumbent',
    ballotOrder: 1,
    profileSummary: 'Fourteen-year NC Senate veteran and Rules Committee chairman; anchored by a 99.3 NCFREE free-enterprise score, aggressive tax-cut agenda, and strong pro-gun record, with a distinctive personal break from party orthodoxy on medical marijuana.',
    positions: [
      'Co-sponsored SB266 rolling back NC\'s 2030 carbon-reduction target; voted to override governor\'s veto',
      'Sponsored SB651 to cut personal income tax below 2.5%; led multi-year tax-rate glide path',
      'Voted YES on SB50 (permitless carry) on passage and veto override',
      'Led party-line expansion of Opportunity Scholarships (school vouchers) to $463.5M',
      'Primary sponsor of SB3 (medical cannabis) motivated by personal cancer experience; NORML B+',
    ],
    axisStances: {
      econ_safetynet: 8,
      econ_investment: 9,
      econ_tax_structure: 9,
      econ_school_choice: 9,
      health_coverage_model: 7,
      health_cost_control: 8,
      health_public_health: 7,
      housing_supply_zoning: 3,
      housing_affordability_tools: 8,
      justice_firearms: 9,
      climate_ambition: 8,
      climate_energy_portfolio: 8,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'NC Senate budget votes 2023-2025', url: 'https://www.wral.com/story/nc-senate-votes-to-approve-budget-plan-with-tax-cuts-employee-raises-helene-aid-and-doge-style-review/21962982/' },
        { text: 'Conditional Medicaid expansion via HB76', url: 'https://www.affordablecarenc.com/general-assembly-members/senate-district-8' },
      ],
      econ_investment: [
        { text: 'NC FREE Foundation 99.3 score (2023-2024)', url: 'https://nsjonline.com/article/2024/08/nonprofit-ncfree-releases-2023-24-legislative-business-ratings/' },
        { text: 'SB651 sponsor (income tax below 2.5%)', url: 'https://www.carolinajournal.com/senate-republicans-signal-new-tax-relief-for-all-north-carolinians/' },
      ],
      econ_tax_structure: [
        { text: 'SB651 sponsor: personal income tax below 2.5% by 2026', url: 'https://www.carolinajournal.com/senate-republicans-signal-new-tax-relief-for-all-north-carolinians/' },
        { text: 'NC FREE Foundation 99.3 score', url: 'https://nsjonline.com/article/2024/08/nonprofit-ncfree-releases-2023-24-legislative-business-ratings/' },
      ],
      econ_school_choice: [
        { text: 'HB10 Opportunity Scholarship expansion (party-line vote, $463.5M)', url: 'https://www.wunc.org/politics/2024-09-09/nc-senate-override-veto-private-school-vouchers' },
        { text: 'Veto override vote on HB10 (30-19)', url: 'https://www.wunc.org/politics/2024-09-09/nc-senate-override-veto-private-school-vouchers' },
      ],
      health_coverage_model: [
        { text: 'AffordableCareNC: HB76 Medicaid expansion support', url: 'https://www.affordablecarenc.com/general-assembly-members/senate-district-8' },
        { text: 'NC FREE Foundation 99.3 score', url: 'https://nsjonline.com/article/2024/08/nonprofit-ncfree-releases-2023-24-legislative-business-ratings/' },
      ],
      health_cost_control: [
        { text: 'Drug transparency bills (SB479, SB316, SB315, SB537)', url: 'https://www.affordablecarenc.com/general-assembly-members/senate-district-8' },
        { text: 'CON law reform advocacy', url: 'https://www.affordablecarenc.com/general-assembly-members/senate-district-8' },
      ],
      health_public_health: [
        { text: 'SB3 medical cannabis primary sponsorship (NORML B+)', url: 'https://vote.norml.org/politicians/117772' },
        { text: 'The Assembly NC profile on marijuana advocacy', url: 'https://www.theassemblync.com/politics/bill-rabon-medical-marijuanas-conservative-champion/' },
      ],
      housing_supply_zoning: [
        { text: 'SB382 downzoning ban (2024)', url: 'https://www.newsargus.com/brunswick_beacon/news/s-b-382-has-local-town-concerned-over-zoning-implications/article_ccb20390-d4b3-5c69-a292-ea2f667cf26e.html' },
        { text: 'NC Home Builders Association endorsement of SB382' },
      ],
      housing_affordability_tools: [
        { text: 'General free-enterprise record (99.3 NCFREE)', url: 'https://nsjonline.com/article/2024/08/nonprofit-ncfree-releases-2023-24-legislative-business-ratings/' },
        { text: 'SB382 property-rights framing', url: 'https://www.newsargus.com/brunswick_beacon/news/s-b-382-has-local-town-concerned-over-zoning-implications/article_ccb20390-d4b3-5c69-a292-ea2f667cf26e.html' },
      ],
      justice_firearms: [
        { text: 'SB50 permitless carry: YES on passage and veto override', url: 'https://www.ncleg.gov/Legislation/Votes/RollCallVoteTranscript/2025/S/50' },
        { text: 'Sunday hunting expansion: primary sponsor (2017)', url: 'https://congressionalsportsmen.org/news/north-carolina-caucus-member-honored-with-prestigious-conservation-award/' },
      ],
      climate_ambition: [
        { text: 'SB266 co-sponsor: eliminates 2030 70% carbon reduction target', url: 'https://www.ncleg.gov/BillLookUp/2025/S266' },
        { text: 'SB266 veto override vote', url: 'https://www.ncleg.gov/BillLookUp/2025/S266' },
      ],
      climate_energy_portfolio: [
        { text: 'SB266 allows cost-recovery for new carbon-emitting generation', url: 'https://ncchamber.com/2025/07/02/veto-of-sb-266-threatens-affordable-reliable-energy-for-nc/' },
        { text: 'NC Sustainable Energy Association criticism of SB266', url: 'https://www.ncleg.gov/BillLookUp/2025/S266' },
      ],
    },
    valueStances: {
      universalism: -0.5,
      benevolence: 0.1,
      tradition: 0.4,
      conformity: 0.3,
      security: 0.5,
      power: 0.8,
      achievement: 0.5,
      hedonism: 0.2,
      stimulation: 0.0,
      self_direction: 0.3,
    },
  },
  {
    id: 'richard-combes',
    contestId: CONTEST_IDS.NC_SENATE_D8,
    name: { full: 'Richard Combes', ballotDisplay: 'Rick Combes' },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    profileSummary: 'First-time Democratic challenger with no public policy record, no campaign website, and no stated positions on any issue. Appears to be a placeholder candidacy in a heavily Republican district.',
    positions: [],
    axisStances: {},
    valueStances: {},
  },
  {
    id: 'tim-white-nc-s8',
    contestId: CONTEST_IDS.NC_SENATE_D8,
    name: { full: 'Tim White', ballotDisplay: 'Tim White' },
    party: 'Libertarian',
    incumbencyStatus: 'challenger',
    ballotOrder: 3,
    profileSummary: 'First-time Libertarian candidate with no public campaign presence or documented issue positions. All scoring inferred from LPNC party platform.',
    positions: [
      'LPNC platform: opposes government welfare programs, healthcare regulation, and public school monopoly',
      'LPNC platform: opposes all firearms regulation including background checks and licensing',
      'LPNC platform: supports repealing all zoning ordinances based on property rights',
      'LPNC platform: opposes government-led climate policy and energy subsidies',
    ],
    axisStances: {
      econ_safetynet: 9,
      econ_investment: 9,
      econ_tax_structure: 9,
      econ_school_choice: 9,
      health_coverage_model: 10,
      health_cost_control: 9,
      health_public_health: 10,
      housing_supply_zoning: 1,
      housing_affordability_tools: 10,
      housing_transport_priority: 9,
      justice_policing_accountability: 3,
      justice_firearms: 10,
      climate_ambition: 8,
      climate_energy_portfolio: 8,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'LPNC platform (lpnc.org)', url: 'https://www.lpnc.org/our-principles/platform-of-the-libertarian-party-of-north-carolina/' },
      ],
      econ_investment: [
        { text: 'LPNC platform (lpnc.org)', url: 'https://www.lpnc.org/our-principles/platform-of-the-libertarian-party-of-north-carolina/' },
      ],
      econ_tax_structure: [
        { text: 'LPNC platform (lpnc.org)', url: 'https://www.lpnc.org/our-principles/platform-of-the-libertarian-party-of-north-carolina/' },
        { text: 'LP national platform (lp.org)', url: 'https://lp.org/platform-page/' },
      ],
      econ_school_choice: [
        { text: 'LPNC platform (lpnc.org)', url: 'https://www.lpnc.org/our-principles/platform-of-the-libertarian-party-of-north-carolina/' },
        { text: 'LPNC educational opportunity issue paper', url: 'https://www.lpnc.org/educational_opportunity' },
      ],
      health_coverage_model: [
        { text: 'LPNC healthcare position (lpnc.org/healthcare)', url: 'https://www.lpnc.org/healthcare' },
      ],
      health_cost_control: [
        { text: 'LPNC healthcare position (lpnc.org/healthcare)', url: 'https://www.lpnc.org/healthcare' },
      ],
      health_public_health: [
        { text: 'LPNC healthcare position', url: 'https://www.lpnc.org/healthcare' },
        { text: 'LP national platform', url: 'https://lp.org/platform-page/' },
      ],
      housing_supply_zoning: [
        { text: 'LPNC platform (lpnc.org)', url: 'https://www.lpnc.org/our-principles/platform-of-the-libertarian-party-of-north-carolina/' },
      ],
      housing_affordability_tools: [
        { text: 'LPNC platform (lpnc.org)', url: 'https://www.lpnc.org/our-principles/platform-of-the-libertarian-party-of-north-carolina/' },
      ],
      housing_transport_priority: [
        { text: 'LPNC platform (lpnc.org)', url: 'https://www.lpnc.org/our-principles/platform-of-the-libertarian-party-of-north-carolina/' },
      ],
      justice_policing_accountability: [
        { text: 'LPNC platform (lpnc.org)', url: 'https://www.lpnc.org/our-principles/platform-of-the-libertarian-party-of-north-carolina/' },
      ],
      justice_firearms: [
        { text: 'LPNC 2nd Amendment position (lpnc.org/gun-control)', url: 'https://www.lpnc.org/gun-control' },
      ],
      climate_ambition: [
        { text: 'LPNC platform (lpnc.org)', url: 'https://www.lpnc.org/our-principles/platform-of-the-libertarian-party-of-north-carolina/' },
        { text: 'LP national platform', url: 'https://lp.org/platform-page/' },
      ],
      climate_energy_portfolio: [
        { text: 'LP national platform: Environment/Energy Resources', url: 'https://lp.org/environment-energy-resources/' },
      ],
    },
    valueStances: {
      universalism: -0.2,
      benevolence: -0.1,
      tradition: -0.3,
      conformity: -0.6,
      security: -0.4,
      power: -0.5,
      achievement: -0.1,
      hedonism: 0.1,
      stimulation: 0.2,
      self_direction: 0.8,
    },
  },
];

// ============================================
// Measures — NC Voter ID Amendment
// ============================================

const ncMeasures: Measure[] = [
  {
    id: MEASURE_IDS.NC_VOTER_ID,
    type: 'measure',
    title: 'NC Require Voter Identification Amendment (SB 921)',
    shortTitle: 'Voter ID for All Voting',
    description: 'Amends the NC Constitution to require photo identification for all voting methods, including absentee/mail-in ballots. Extends the current in-person photo ID mandate to cover all voters.',
    yesAxisEffects: {
      justice_policing_accountability: 0.4,
    },
    yesValueEffects: {
      security: 0.7,
      conformity: 0.6,
      tradition: 0.4,
      power: 0.3,
      universalism: -0.7,
      self_direction: -0.5,
      benevolence: -0.4,
      stimulation: -0.1,
    },
    relevantAxes: ['justice_policing_accountability'],
    outcomes: {
      yes: 'Photo ID required for all voting methods including absentee/mail-in ballots via constitutional amendment.',
      no: 'Current rules maintained — photo ID required only for in-person voting; absentee voters may use driver\'s license number or last-4 SSN.',
    },
    explanation: 'This legislatively referred constitutional amendment was passed on a strictly partisan vote in a December 2024 lame-duck session. Courts have found prior NC voter ID laws targeted Black voters "with almost surgical precision." Black voters are approximately 39% less likely to have qualifying photo ID. If passed, the requirement can only be removed by another constitutional amendment.',
    supporters: ['NC Republican legislative caucus', 'Sen. Warren Daniel (sponsor)'],
    opponents: ['Democracy NC', 'NAACP', 'ACLU of NC', 'NC Democratic Party'],
  },
];

// ============================================
// Contests
// ============================================

const ncContests: Contest[] = [
  {
    id: CONTEST_IDS.NC_US_SENATE,
    type: 'candidate',
    office: 'U.S. Senate',
    jurisdiction: 'federal',
    officeRef: 'us_senator_federal',
    termInfo: 'Open seat — North Carolina\'s next U.S. Senator will vote on judicial confirmations, federal spending, healthcare policy, and immigration reform. This seat helps determine which party controls the Senate.',
    votingFor: 1,
    candidates: candidatesNCSenate,
  },
  {
    id: CONTEST_IDS.NC_HOUSE_02,
    type: 'candidate',
    office: 'U.S. House — NC-02',
    jurisdiction: 'federal',
    officeRef: 'us_representative_federal',
    termInfo: 'Your U.S. Representative votes on federal legislation including taxes, healthcare, immigration, and the federal budget. NC-02 covers most of Wake County including Raleigh.',
    votingFor: 1,
    candidates: candidatesNC02,
  },
  {
    id: CONTEST_IDS.NC_SENATE_D8,
    type: 'candidate',
    office: 'NC State Senate — District 8',
    jurisdiction: 'state',
    termInfo: 'This State Senator will vote on North Carolina\'s budget, education funding, Medicaid policy, and redistricting. District 8 covers Brunswick County, Columbus County, and part of New Hanover County — areas facing coastal development, hurricane resilience, and rural healthcare access decisions.',
    votingFor: 1,
    candidates: candidatesNCSenateD8,
  },
];

// ============================================
// Assembled Ballot
// ============================================

export const northCarolinaBallot: Ballot = {
  id: BALLOT_IDS.NC_2026,
  electionDate: '2026-11-03T00:00:00.000Z',
  electionType: 'General Election',
  state: 'North Carolina',
  county: 'Wake',
  items: [...ncContests, ...ncMeasures],
};
