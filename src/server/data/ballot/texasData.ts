/**
 * Texas 2026 Ballot Data
 *
 * Real-world scored data from the ballot-builder-agent pipeline.
 * Source: Texas 2026 — Primary: 2026-03-03, Runoff: 2026-05-26, General: 2026-11-03
 *
 * Contests:
 *   TX-US-SENATE-2026     — U.S. Senate (Likely Republican)
 *   TX-US-HOUSE-34-2026   — U.S. House TX-34 (Toss-up)
 *   TX-GOVERNOR-2026      — Governor (Solid Republican)
 *   TX-AG-2026            — Attorney General (Safe Republican)
 *   TX-28-US-HOUSE-2026   — U.S. House TX-28 (Lean Democratic)
 */

import type { Candidate, Contest, Ballot } from '../../types';
import { BALLOT_IDS, CONTEST_IDS } from './ids';

// ============================================
// Candidates — TX U.S. Senate
// ============================================

const candidatesTXSenate: Candidate[] = [
  {
    id: 'jasmine-crockett',
    contestId: CONTEST_IDS.TX_US_SENATE,
    name: {
      full: 'Jasmine Crockett',
      ballotDisplay: 'Jasmine Crockett',
    },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 1,
    profileSummary: 'Two-term congresswoman and former civil rights attorney with a strongly progressive House voting record; campaigns on affordability, healthcare, and climate while distancing herself from the progressive label and framing positions as common sense.',
    positions: [
      'Cosponsor of Medicare for All Act (HR 3421); also supports Medicaid expansion as an interim step',
      'LCV 97% lifetime; supports 100% renewable energy by 2035 and eliminating fossil fuel subsidies',
      'Cosponsor of Assault Weapons Ban of 2025; Giffords calls her one of the nation\'s foremost gun safety champions',
      'AFL-CIO / SEIU 100% pro-labor voting record; supports reinstating higher corporate tax rates',
      'Called ICE a rogue organization that should be cleaned out and rebuilt; introduced TRACK ICE Act',
    ],
    axisStances: {
      econ_safetynet: 1,
      econ_investment: 2,
      econ_tax_structure: 2,
      health_coverage_model: 0,
      health_cost_control: 2,
      justice_policing_accountability: 2,
      justice_sentencing_goals: 2,
      justice_firearms: 1,
      climate_ambition: 1,
      climate_energy_portfolio: 1,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'AFL-CIO 100% scorecard (2024)', url: 'https://aflcio.org/scorecard/legislators/jasmine-crockett' },
        { text: 'Heritage Action 0% (118th Congress)', url: 'https://heritageaction.com/scorecard/members/C001130/118' },
      ],
      econ_investment: [
        { text: 'Heritage Action 0%; supports major public investment', url: 'https://heritageaction.com/scorecard/members/C001130/118' },
      ],
      econ_tax_structure: [
        { text: 'Supports raising corporate tax rates to fund programs', url: 'https://www.jasmineforus.com/healthcare-you-need-when-you-need-it' },
      ],
      health_coverage_model: [
        { text: 'Cosponsor of Medicare for All Act (HR 3421)', url: 'https://www.congress.gov/bill/118th-congress/house-bill/3421/cosponsors' },
        { text: 'Campaign healthcare page', url: 'https://www.jasmineforus.com/healthcare-you-need-when-you-need-it' },
      ],
      health_cost_control: [
        { text: 'Supports Medicare drug price negotiation expansion', url: 'https://www.jasmineforus.com/healthcare-you-need-when-you-need-it' },
      ],
      justice_policing_accountability: [
        { text: 'Criminal justice reform page', url: 'https://crockett.house.gov/issues/criminal-justice' },
        { text: 'Former civil rights attorney; structural reform advocate' },
      ],
      justice_sentencing_goals: [
        { text: 'Criminal justice reform priorities', url: 'https://crockett.house.gov/issues/criminal-justice' },
      ],
      justice_firearms: [
        { text: 'Giffords A rating; cosponsor Assault Weapons Ban 2025', url: 'https://giffords.org/candidates/jasmine-crockett-2/' },
        { text: 'Community safety page', url: 'https://www.jasmineforus.com/community-safety' },
      ],
      climate_ambition: [
        { text: 'LCV 97% lifetime scorecard', url: 'https://www.lcv.org/moc/jasmine-crockett/' },
        { text: 'Energy and climate issues page', url: 'https://crockett.house.gov/issues/energy-climate-change' },
      ],
      climate_energy_portfolio: [
        { text: 'LCV 97%; supports 100% renewables by 2035', url: 'https://www.lcv.org/moc/jasmine-crockett/' },
        { text: 'Eliminate fossil fuel subsidies position', url: 'https://crockett.house.gov/issues/energy-climate-change' },
      ],
    },
    valueStances: {
      universalism: 0.7,
      benevolence: 0.7,
      tradition: -0.4,
      conformity: 0.1,
      security: 0.3,
      power: 0.0,
      achievement: 0.2,
      hedonism: 0.0,
      stimulation: 0.4,
      self_direction: 0.4,
    },
  },
  {
    id: 'james-talarico',
    contestId: CONTEST_IDS.TX_US_SENATE,
    name: {
      full: 'James Talarico',
      ballotDisplay: 'James Talarico',
    },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    profileSummary: 'Four-term Texas state representative, former public school teacher, and progressive populist running on healthcare access, public education, and corporate accountability with the strongest grassroots fundraising in Texas Democratic history.',
    positions: [
      'Advocates Medicare for Y\'all public option; says he would vote for Medicare for All if it reached the Senate floor',
      'Authored Texas insulin cap law (HB 82, $25/month) and drug importation bill; personal stake as a Type 1 diabetic',
      'Voted NO on Texas school voucher bill (SB 2); co-authored 2019 school finance reform; opposes vouchers as a former teacher',
      'Calls for raising taxes on billionaires and corporations to fund middle-class tax cuts',
      'Supports universal background checks and raising age for semi-auto rifle purchases; does not call for an assault weapons ban',
    ],
    axisStances: {
      econ_safetynet: 2,
      econ_investment: 3,
      econ_tax_structure: 1,
      econ_school_choice: 1,
      health_coverage_model: 2,
      health_cost_control: 1,
      housing_affordability_tools: 3,
      justice_policing_accountability: 3,
      justice_sentencing_goals: 2,
      justice_firearms: 3,
      climate_ambition: 4,
      climate_energy_portfolio: 5,
      climate_permitting: 5,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'AFL-CIO endorsed; pro-union voting record', url: 'https://jamestalarico.com/issue/labor-business/' },
        { text: 'Fortune interview: corporate welfare critique', url: 'https://fortune.com/2025/12/20/james-talarico-welfare-queens-corporations-income-tax-avoidance/' },
      ],
      econ_investment: [
        { text: 'YCT 0% (86th Legislature)', url: 'https://ratings.yct.org/legislators/james-talarico/86th-legislature' },
        { text: 'Labor and business priorities page', url: 'https://jamestalarico.com/issue/labor-business/' },
      ],
      econ_tax_structure: [
        { text: 'Fortune: raise taxes on billionaires and corporations', url: 'https://fortune.com/2025/12/20/james-talarico-welfare-queens-corporations-income-tax-avoidance/' },
      ],
      econ_school_choice: [
        { text: 'ATPE endorsed; voted NO on SB 2 voucher bill', url: 'https://teachthevote.atpe.org/candidates/james-talarico' },
      ],
      health_coverage_model: [
        { text: 'Healthcare priorities: Medicare for Y\'all public option', url: 'https://jamestalarico.com/issue/health-care/' },
      ],
      health_cost_control: [
        { text: 'Authored TX insulin cap law (HB 82, $25/month)', url: 'https://www.texastribune.org/2026/01/27/james-talarico-insulin-cap-texas-legislature-senate-primary-attacks/' },
        { text: 'Drug importation bill passage', url: 'https://thedailytexan.com/2023/04/13/texas-house-passes-bipartisan-bill-to-import-cheaper-prescription-drugs/' },
      ],
      housing_affordability_tools: [
        { text: 'Campaign priorities page', url: 'https://jamestalarico.com/issue/labor-business/' },
      ],
      justice_policing_accountability: [
        { text: 'Authored Javier Ambler\'s Law on police accountability', url: 'https://www.kxan.com/news/texas-politics/javier-amblers-law-passes-in-the-texas-house/' },
        { text: 'Public safety and justice priorities', url: 'https://jamestalarico.com/issue/public-safety-justice/' },
      ],
      justice_sentencing_goals: [
        { text: 'Public safety priorities: rehabilitation focus', url: 'https://jamestalarico.com/issue/public-safety-justice/' },
      ],
      justice_firearms: [
        { text: 'Supports universal background checks, age limits', url: 'https://jamestalarico.com/issue/public-safety-justice/' },
        { text: 'KUT debate: gun safety without assault weapons ban', url: 'https://www.kut.org/2026-01-24/texas-primary-debate-jasmine-crockett-james-talarico-senate-race' },
      ],
      climate_ambition: [
        { text: 'Energy and environment priorities page', url: 'https://jamestalarico.com/issue/energy-environment/' },
        { text: 'YCT 0%: consistent progressive environmental record', url: 'https://ratings.yct.org/legislators/james-talarico/86th-legislature' },
      ],
      climate_energy_portfolio: [
        { text: 'Energy priorities: balanced transition approach', url: 'https://jamestalarico.com/issue/energy-environment/' },
      ],
      climate_permitting: [
        { text: 'Energy and environment platform', url: 'https://jamestalarico.com/issue/energy-environment/' },
      ],
    },
    valueStances: {
      universalism: 0.6,
      benevolence: 0.8,
      tradition: 0.0,
      conformity: 0.4,
      security: 0.4,
      power: -0.6,
      achievement: 0.3,
      hedonism: 0.1,
      stimulation: 0.5,
      self_direction: 0.3,
    },
  },
  {
    id: 'john-cornyn',
    contestId: CONTEST_IDS.TX_US_SENATE,
    name: {
      full: 'John Cornyn',
      ballotDisplay: 'John Cornyn',
    },
    party: 'Republican',
    incumbencyStatus: 'incumbent',
    ballotOrder: 3,
    profileSummary: 'Four-term Texas senator and former Senate Majority Whip with a strongly conservative record tempered by occasional bipartisan dealmaking (Bipartisan Safer Communities Act, CHIPS Act, First Step Act). Campaign emphasizes 99.2% Trump voting alignment; facing hard-right primary challenge from Paxton and Hunt.',
    positions: [
      'Co-authored Bipartisan Safer Communities Act (2022) — first major federal gun safety law in 30 years; previously NRA A+; Texas GOP formally rebuked him',
      'Co-authored CHIPS Act ($280B semiconductor investment); voted NO on Infrastructure Act ($1.2T) and Inflation Reduction Act',
      '20+ votes to repeal or defund the ACA; voted three times in 2025 against ACA subsidy extensions',
      'Champion of 2017 TCJA tax cuts and permanent extension; supports school vouchers and ESAs',
      'Led First Step Act (2018) criminal justice reform: reduced mandatory minimums, expanded earned time credits',
    ],
    axisStances: {
      econ_safetynet: 8,
      econ_investment: 7,
      econ_tax_structure: 9,
      econ_school_choice: 9,
      health_coverage_model: 8,
      health_cost_control: 8,
      housing_transport_priority: 7,
      justice_policing_accountability: 7,
      justice_sentencing_goals: 6,
      justice_firearms: 7,
      climate_ambition: 9,
      climate_energy_portfolio: 9,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'AFL-CIO 11% lifetime; opposes safety net expansion', url: 'https://aflcio.org/scorecard/legislators/john-cornyn' },
        { text: 'Pushes Medicaid/SNAP work requirements', url: 'https://www.cornyn.senate.gov/news/cornyn-pushes-work-requirements-to-reduce-government-spending/' },
      ],
      econ_investment: [
        { text: 'Co-authored CHIPS Act ($280B semiconductors)', url: 'https://www.texastribune.org/2022/07/28/texas-chips-vote-semiconductors/' },
        { text: 'Voted NO on Infrastructure Act and IRA', url: 'https://www.texastribune.org/2021/08/10/ted-cruz-john-cornyn-infrastructure-bill/' },
      ],
      econ_tax_structure: [
        { text: 'Champion of 2017 TCJA; supports permanent extension', url: 'https://www.govtrack.us/congress/votes/115-2017/s303' },
        { text: 'Op-ed: tax cuts for working families', url: 'https://www.cornyn.senate.gov/news/cornyn-op-ed-republicans-solution-to-affordability-is-through-tax-cuts-for-working-families/' },
      ],
      econ_school_choice: [
        { text: 'Supports school vouchers and ESAs', url: 'https://www.cornyn.senate.gov/key-issues/education/' },
      ],
      health_coverage_model: [
        { text: '20+ votes to repeal or defund the ACA', url: 'https://www.uschamber.com/improving-government/u-s-chamber-endorses-senator-john-cornyn-for-u-s-senate-in-texas' },
      ],
      health_cost_control: [
        { text: 'Chamber of Commerce endorsed; market-based approach', url: 'https://www.uschamber.com/improving-government/u-s-chamber-endorses-senator-john-cornyn-for-u-s-senate-in-texas' },
      ],
      housing_transport_priority: [
        { text: 'Club for Growth 70% (car-centric infrastructure)', url: 'https://www.clubforgrowth.org/scorecards/legislator/C001056/John-Cornyn/' },
      ],
      justice_policing_accountability: [
        { text: 'Heritage Action 78%; backs law enforcement', url: 'https://heritageaction.com/scorecard/members/C001056/117' },
      ],
      justice_sentencing_goals: [
        { text: 'Led bipartisan First Step Act (2018)', url: 'https://www.texastribune.org/2018/12/18/John-Cornyn-First-Step-Act-US-federal-prison-reform-Senate-Texas/' },
      ],
      justice_firearms: [
        { text: 'Co-authored Bipartisan Safer Communities Act (2022)', url: 'https://www.cornyn.senate.gov/bipartisan-safer-communities-act/' },
        { text: 'NRA historically A+; downgraded after BSCA', url: 'https://justfacts.votesmart.org/candidate/evaluations/15375/john-cornyn/37/' },
      ],
      climate_ambition: [
        { text: 'LCV 7% lifetime scorecard', url: 'https://www.lcv.org/moc/john-cornyn/' },
        { text: 'CSIS energy talk: fossil-first energy security', url: 'https://www.csis.org/analysis/us-energy-resources-global-landscape-conversation-senator-john-cornyn' },
      ],
      climate_energy_portfolio: [
        { text: 'LCV 7%; all-of-the-above with fossil emphasis', url: 'https://www.lcv.org/moc/john-cornyn/' },
      ],
    },
    valueStances: {
      universalism: -0.5,
      benevolence: 0.3,
      tradition: 0.7,
      conformity: 0.5,
      security: 0.7,
      power: 0.6,
      achievement: 0.5,
      hedonism: -0.2,
      stimulation: -0.4,
      self_direction: 0.2,
    },
  },
  {
    id: 'ken-paxton',
    contestId: CONTEST_IDS.TX_US_SENATE,
    name: {
      full: 'Ken Paxton',
      ballotDisplay: 'Ken Paxton',
    },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 4,
    profileSummary: 'Ten-year Texas Attorney General running as the MAGA-aligned challenger to Sen. Cornyn; defined by an aggressive litigation record against federal agencies on climate, healthcare, immigration, and firearms, and by personal controversies including impeachment and a securities fraud settlement.',
    positions: [
      'Led 20-state coalition to repeal the entire Affordable Care Act; explicitly sought full repeal without replacement',
      'Filed 15+ lawsuits against EPA regulations on ozone, methane, emissions, and waterways; called climate change a matter of opinion',
      'NRA A-grade with three consecutive AG endorsements plus NAGR endorsement; sued ATF over pistol braces, suppressors, background checks, and State Fair gun ban',
      'Signed first TX immigration enforcement agreement with Trump administration; led DACA termination litigation; called for deporting every illegal immigrant',
      'Issued legal opinion clearing public funds for religious school choice (ESAs); vowed to defend TX school choice law',
    ],
    axisStances: {
      econ_safetynet: 9,
      econ_investment: 9,
      econ_tax_structure: 9,
      econ_school_choice: 9,
      health_coverage_model: 9,
      health_cost_control: 8,
      health_public_health: 9,
      justice_policing_accountability: 9,
      justice_sentencing_goals: 7,
      justice_firearms: 10,
      climate_ambition: 10,
      climate_energy_portfolio: 10,
      climate_permitting: 9,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'YCT 92-98% (TX Legislature); opposes safety net', url: 'https://ratings.yct.org/legislators/ken-paxton/82nd-legislature' },
        { text: 'Sued Biden over student loan forgiveness', url: 'https://www.texastribune.org/2023/02/15/texas-ken-paxton-sues-joe-biden-spending-bill/' },
      ],
      econ_investment: [
        { text: 'Sued to block Biden-era federal spending bills', url: 'https://www.texastribune.org/2023/02/15/texas-ken-paxton-sues-joe-biden-spending-bill/' },
      ],
      econ_tax_structure: [
        { text: 'Property tax investigation of cities', url: 'https://www.texastribune.org/2025/12/09/attorney-general-ken-paxton-cities-property-tax-investigation/' },
        { text: 'YCT 92-98% (pro-business tax stance)', url: 'https://ratings.yct.org/legislators/ken-paxton/82nd-legislature' },
      ],
      econ_school_choice: [
        { text: 'AG opinion clearing funds for religious ESAs', url: 'https://www.texasattorneygeneral.gov/news/releases/attorney-general-ken-paxton-celebrates-school-choice-texans-and-vows-defend-new-law' },
      ],
      health_coverage_model: [
        { text: 'Led 20-state lawsuit to repeal entire ACA', url: 'https://www.texasattorneygeneral.gov/news/releases/ag-paxton-and-wisconsin-ag-file-20-state-lawsuit-end-grip-obamacare-texas-and-nation' },
      ],
      health_cost_control: [
        { text: 'Market-based approach; opposes price controls' },
      ],
      health_public_health: [
        { text: 'Sued over gender-affirming care restrictions', url: 'https://www.washingtonpost.com/nation/2024/10/18/texas-transgender-healthcare-ken-paxton/' },
      ],
      justice_policing_accountability: [
        { text: 'Sued Dallas for insufficiently funding police', url: 'https://www.texasattorneygeneral.gov/news/releases/attorney-general-ken-paxton-sues-city-dallas-officials-insufficiently-funding-dallas-police' },
      ],
      justice_sentencing_goals: [
        { text: 'Co-led bipartisan AG coalition for First Step Act', url: 'https://texasattorneygeneral.gov/news/releases/ag-paxton-co-leads-bipartisan-coalition-38-attorneys-general-expressing-support-congressional-action' },
      ],
      justice_firearms: [
        { text: 'NRA A grade with 3 consecutive AG endorsements', url: 'https://www.nrapvf.org/articles/20220209/nra-endorses-texas-attorney-general-ken-paxton' },
        { text: 'Sued ATF over pistol braces and State Fair gun ban', url: 'https://www.nraila.org/articles/20240830/attorney-general-ken-paxton-sues-the-city-of-dallas-for-unlawfully-prohibiting-firearms-from-the-texas-state-fair' },
      ],
      climate_ambition: [
        { text: '15+ lawsuits against EPA climate regulations', url: 'https://texasattorneygeneral.gov/news/releases/ag-paxton-pushes-back-against-biden-epas-war-against-texas-oil-gas' },
        { text: 'Sierra Club: fights measures to reduce climate deaths', url: 'https://www.sierraclub.org/texas/blog/2024/03/texas-ag-paxton-fights-against-measures-would-reduce-deaths-and-climate-extremes' },
      ],
      climate_energy_portfolio: [
        { text: 'Sued EPA over oil and gas regulations', url: 'https://texasattorneygeneral.gov/news/releases/ag-paxton-pushes-back-against-biden-epas-war-against-texas-oil-gas' },
      ],
      climate_permitting: [
        { text: 'Anti-EPA litigation record; faster fossil approvals', url: 'https://texasattorneygeneral.gov/news/releases/ag-paxton-pushes-back-against-biden-epas-war-against-texas-oil-gas' },
      ],
    },
    valueStances: {
      universalism: -0.8,
      benevolence: 0.1,
      tradition: 0.8,
      conformity: -0.4,
      security: 0.7,
      power: 0.7,
      achievement: 0.4,
      hedonism: -0.3,
      stimulation: 0.3,
      self_direction: 0.1,
    },
  },
  {
    id: 'wesley-hunt',
    contestId: CONTEST_IDS.TX_US_SENATE,
    name: {
      full: 'Wesley Hunt',
      ballotDisplay: 'Wesley Hunt',
    },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 5,
    profileSummary: 'Two-term Houston-area congressman and Army veteran running hard-right in the TX Senate primary on border security, fossil energy expansion, and absolute Second Amendment positions. Heritage Action 96%, LCV 0% lifetime, NRA AQ — one of the most consistently conservative House voting records across all measured dimensions.',
    positions: [
      'Zero-compromise Second Amendment stance; would repeal the Bipartisan Safer Communities Act as his first Senate act',
      'Self-styled Energy Congressman of the World; opposes energy transition; sponsors LNG and offshore drilling bills',
      'Hardline immigration: military at border, end birthright citizenship, eliminate TPS, codify invasion declaration',
      'Supports DOGE spending cuts and Balanced Budget Amendment; voted against 2023 debt ceiling deal as too soft',
      'Pro-life with explicit religious framing; 100% National Right to Life rating',
    ],
    axisStances: {
      econ_safetynet: 9,
      econ_investment: 9,
      econ_tax_structure: 8,
      econ_school_choice: 8,
      health_coverage_model: 8,
      health_cost_control: 8,
      health_public_health: 9,
      justice_policing_accountability: 8,
      justice_firearms: 10,
      climate_ambition: 9,
      climate_energy_portfolio: 9,
      climate_permitting: 8,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Heritage Action 96% (118th Congress)', url: 'https://heritageaction.com/scorecard/members/H001095/118' },
        { text: 'AFL-CIO 0% scorecard', url: 'https://aflcio.org/scorecard/legislators/wesley-hunt' },
      ],
      econ_investment: [
        { text: 'Heritage Action 96%; opposes public investment', url: 'https://heritageaction.com/scorecard/members/H001095/118' },
      ],
      econ_tax_structure: [
        { text: 'VoteSmart political courage test', url: 'https://justfacts.votesmart.org/candidate/political-courage-test/188147/wesley-hunt' },
      ],
      econ_school_choice: [
        { text: 'Heritage Action 96%; supports school choice', url: 'https://heritageaction.com/scorecard/members/H001095/118' },
      ],
      health_coverage_model: [
        { text: 'Heritage Action 96%; opposes ACA expansion', url: 'https://heritageaction.com/scorecard/members/H001095/118' },
      ],
      health_cost_control: [
        { text: 'Market-based healthcare approach' },
      ],
      health_public_health: [
        { text: 'Opposes vaccine mandates and public health regs', url: 'https://heritageaction.com/scorecard/members/H001095/118' },
      ],
      justice_policing_accountability: [
        { text: 'Back the Blue; opposes police reform legislation', url: 'https://heritageaction.com/scorecard/members/H001095/118' },
      ],
      justice_firearms: [
        { text: 'NRA AQ rating; zero-compromise 2A stance', url: 'https://www.nrapvf.org/grades/texas/' },
        { text: 'Introduced 2A Restoration Act to repeal BSCA', url: 'https://www.congress.gov/bill/119th-congress/house-bill/6035' },
      ],
      climate_ambition: [
        { text: 'LCV 0% lifetime scorecard', url: 'https://www.lcv.org/moc/wesley-hunt/' },
        { text: 'Hart Energy: fossil fuel expansion champion', url: 'https://www.hartenergy.com/exclusives/energy-policy-watch-wesley-hunts-bid-energy-district-world-198337/' },
      ],
      climate_energy_portfolio: [
        { text: 'LCV 0%; sponsors Protect LNG Act', url: 'https://hunt.house.gov/media/press-releases/immediate-release-rep-wesley-hunt-introduces-protect-lng-act-2025' },
      ],
      climate_permitting: [
        { text: 'Protect LNG Act; faster fossil fuel permitting', url: 'https://hunt.house.gov/media/press-releases/immediate-release-rep-wesley-hunt-introduces-protect-lng-act-2025' },
      ],
    },
    valueStances: {
      universalism: -0.7,
      benevolence: 0.1,
      tradition: 0.7,
      conformity: 0.1,
      security: 0.8,
      power: 0.5,
      achievement: 0.7,
      hedonism: -0.2,
      stimulation: 0.2,
      self_direction: 0.2,
    },
  },
];

// ============================================
// Candidates — TX U.S. House District 34
// ============================================

const candidatesTXHouse34: Candidate[] = [
  {
    id: 'vicente-gonzalez-jr',
    contestId: CONTEST_IDS.TX_HOUSE_34,
    name: {
      full: 'Vicente Gonzalez Jr.',
      ballotDisplay: 'Vicente Gonzalez Jr.',
    },
    party: 'Democratic',
    incumbencyStatus: 'incumbent',
    ballotOrder: 1,
    profileSummary: 'Blue Dog Coalition co-chair and five-term border-district Democrat with a consistently pro-safety-net voting record, mixed firearms positions, fossil-fuel-protective energy votes, and socially conservative stances on transgender issues that place him among the most conservative House Democrats.',
    positions: [
      'Defends Medicare, Medicaid, Social Security expansion; voted against every Republican healthcare cut',
      'Voted YES on Bipartisan Safer Communities Act but NO on Assault Weapons Ban — supports background checks and red flag laws, protects hunting rifles',
      'All-of-the-above energy: voted for IRA climate investments AND Republican fossil fuel expansion bill; co-chairs Oil and Gas Caucus',
      'One of two House Democrats to vote for transgender sports ban and gender-affirming care Medicaid restrictions',
      'Moderate on immigration: opposes border wall and mandatory E-Verify but voted for DHS/ICE funding (later reversed under constituent pressure)',
    ],
    axisStances: {
      econ_safetynet: 2,
      econ_investment: 3,
      econ_tax_structure: 3,
      econ_school_choice: 1,
      health_coverage_model: 2,
      health_cost_control: 1,
      health_public_health: 4,
      justice_policing_accountability: 6,
      justice_sentencing_goals: 5,
      justice_firearms: 4,
      climate_ambition: 5,
      climate_energy_portfolio: 6,
      climate_permitting: 7,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Voted against every Republican healthcare cut', url: 'https://gonzalez.house.gov/media/press-releases/congressman-gonzalez-votes-against-shameful-republican-budget-bill' },
        { text: 'Heritage Action 27% (116th Congress)', url: 'https://heritageaction.com/scorecard/members/G000581/116' },
      ],
      econ_investment: [
        { text: 'Voted YES on Inflation Reduction Act', url: 'https://gonzalez.house.gov/media/press-releases/congressman-gonzalez-votes-favor-inflation-reduction-act-lowering-costs-south' },
      ],
      econ_tax_structure: [
        { text: 'Heritage Action 27%; moderate-progressive tax stance', url: 'https://heritageaction.com/scorecard/members/G000581/116' },
      ],
      econ_school_choice: [
        { text: 'Supports public school funding; opposes vouchers' },
      ],
      health_coverage_model: [
        { text: 'Defends Medicare, Medicaid, Social Security', url: 'https://gonzalez.house.gov/media/press-releases/congressman-gonzalez-votes-against-shameful-republican-budget-bill' },
      ],
      health_cost_control: [
        { text: 'Voted YES on H.R.3 Lower Drug Costs Act', url: 'https://gonzalez.house.gov/media/press-releases/congressman-gonzalez-votes-lower-prescription-drug-prices-house-passage-hr-3' },
        { text: 'Drug price control interview', url: 'https://riograndeguardian.com/stories/gonzalez-we-need-to-control-prescription-drug-prices,15920' },
      ],
      health_public_health: [
        { text: 'Mixed: supports some mandates, opposes others' },
      ],
      justice_policing_accountability: [
        { text: 'Blue Dog moderate; limited police reform record' },
      ],
      justice_sentencing_goals: [
        { text: 'Centrist on criminal justice; Blue Dog Coalition' },
      ],
      justice_firearms: [
        { text: 'Voted YES on BSCA but NO on Assault Weapons Ban', url: 'https://gonzalez.house.gov/media/press-releases/congressman-gonzalez-votes-bipartisan-safer-communities-act-keep-our-children' },
        { text: 'AWB No vote explanation', url: 'https://gonzalez.house.gov/media/press-releases/congressman-gonzalez-votes-no-assault-weapons-ban-calls-senate-take-house' },
      ],
      climate_ambition: [
        { text: 'LCV 66% lifetime; mixed climate record', url: 'https://www.lcv.org/moc/vicente-gonzalez/' },
        { text: 'Voted YES on GOP H.R.1 (one of four Democrats)', url: 'https://www.texastribune.org/2023/03/29/texas-democrats-vicente-gonzalez-henry-cuellar-climate/' },
      ],
      climate_energy_portfolio: [
        { text: 'Co-chairs Oil and Gas Caucus; all-of-the-above', url: 'https://www.texastribune.org/2023/03/29/texas-democrats-vicente-gonzalez-henry-cuellar-climate/' },
      ],
      climate_permitting: [
        { text: 'H.R.1 Yes vote: faster fossil fuel permitting', url: 'https://www.texastribune.org/2023/03/29/texas-democrats-vicente-gonzalez-henry-cuellar-climate/' },
      ],
    },
    valueStances: {
      universalism: 0.1,
      benevolence: 0.7,
      tradition: 0.5,
      conformity: 0.5,
      security: 0.6,
      power: 0.1,
      achievement: 0.4,
      hedonism: -0.2,
      stimulation: -0.3,
      self_direction: -0.1,
    },
  },
  {
    id: 'eric-flores',
    contestId: CONTEST_IDS.TX_HOUSE_34,
    name: {
      full: 'Eric Flores',
      ballotDisplay: 'Eric Flores',
    },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    profileSummary: 'First-time Republican candidate and former federal prosecutor running in a swing South Texas border district; Trump-endorsed with a law enforcement and military background, but notably more pragmatic on legal immigration than standard MAGA positioning.',
    positions: [
      'Border security as top priority, framed through prosecutorial and National Guard experience',
      'Supports efficient legal immigration pathways to address RGV labor shortages — softer than typical MAGA restrictionism',
      'Endorsed by Texas Alliance for Life, confirming anti-abortion stance',
      'Champions law enforcement funding and veteran support; endorsed by National Border Patrol Council',
      'Pledges to safeguard seniors\' benefits (Social Security/Medicare) — notable for a Trump-aligned Republican',
    ],
    axisStances: {
      econ_safetynet: 6,
      econ_investment: 7,
      econ_tax_structure: 7,
      justice_policing_accountability: 8,
      justice_sentencing_goals: 8,
      justice_firearms: 8,
      climate_ambition: 8,
      climate_energy_portfolio: 8,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Pledges to safeguard Social Security and Medicare', url: 'https://www.texastribune.org/2025/07/21/texas-congress-eric-flores-vicente-gonzalez-34th-district/' },
      ],
      econ_investment: [
        { text: 'Trump-endorsed; pro-business, anti-regulation', url: 'https://www.nrcc.org/2025/12/19/president-trump-endorses-eric-flores-for-congress/' },
      ],
      econ_tax_structure: [
        { text: 'Texas Voice forum: lower taxes position', url: 'https://www.thetexasvoice.com/flores-faceoff-cd-34-candidates-rumble-at-forum/' },
      ],
      justice_policing_accountability: [
        { text: 'Former federal prosecutor; law enforcement focus', url: 'https://www.texastribune.org/2025/07/21/texas-congress-eric-flores-vicente-gonzalez-34th-district/' },
      ],
      justice_sentencing_goals: [
        { text: 'Prosecutorial background; tough on crime', url: 'https://www.texastribune.org/2025/07/21/texas-congress-eric-flores-vicente-gonzalez-34th-district/' },
      ],
      justice_firearms: [
        { text: 'Texas Alliance for Life endorsed; pro-gun stance', url: 'https://www.texasallianceforlife.org/2026-primary-election-endorsements/' },
      ],
      climate_ambition: [
        { text: 'First-time candidate; no specific climate record' },
      ],
      climate_energy_portfolio: [
        { text: 'Texas Voice forum: pro-oil and gas', url: 'https://www.thetexasvoice.com/flores-faceoff-cd-34-candidates-rumble-at-forum/' },
      ],
    },
    valueStances: {
      universalism: -0.3,
      benevolence: 0.5,
      tradition: 0.7,
      conformity: 0.4,
      security: 0.8,
      power: 0.3,
      achievement: 0.5,
      hedonism: -0.2,
      stimulation: 0.2,
      self_direction: 0.1,
    },
  },
  {
    id: 'mayra-flores',
    contestId: CONTEST_IDS.TX_HOUSE_34,
    name: {
      full: 'Mayra Flores',
      ballotDisplay: 'Mayra Flores',
    },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 3,
    profileSummary: 'Former one-term congresswoman (TX-34, 2022) running for a third consecutive campaign for the seat; strong conservative record across all tracked issues with Heritage Action 92% and LCV 0%. First Mexican-born woman elected to U.S. House; emphasizes border security, school choice, pro-life stance, and pro-energy policies.',
    positions: [
      'Unapologetically pro-life; co-sponsored 20-week national abortion ban; 0% Reproductive Freedom score',
      'Voted NO on Bipartisan Safer Communities Act; NRA-PVF endorsed; strong gun rights position',
      '0% LCV score; voted NO on Inflation Reduction Act clean energy provisions; supports all-of-the-above energy with fossil fuel emphasis',
      'Explicit school choice advocate; endorsed by Texas Home School Coalition; families should have the freedom to choose',
      'Hardline border security; first bill was border security-focused; frames legal vs. illegal immigration through personal immigration story',
    ],
    axisStances: {
      econ_safetynet: 8,
      econ_investment: 8,
      econ_tax_structure: 8,
      econ_school_choice: 9,
      health_coverage_model: 8,
      health_cost_control: 7,
      health_public_health: 8,
      justice_firearms: 9,
      climate_ambition: 9,
      climate_energy_portfolio: 8,
      climate_permitting: 8,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Heritage Action 92% (117th Congress)', url: 'https://heritageaction.com/scorecard/members/F000473/117' },
      ],
      econ_investment: [
        { text: 'Heritage Action 92%; opposes public investment', url: 'https://heritageaction.com/scorecard/members/F000473/117' },
      ],
      econ_tax_structure: [
        { text: 'Heritage Action 92%; pro-business tax policy', url: 'https://heritageaction.com/scorecard/members/F000473/117' },
      ],
      econ_school_choice: [
        { text: 'Endorsed by TX Home School Coalition; pro-ESA', url: 'https://www.mayrafloresforcongress.com/real-solutions' },
      ],
      health_coverage_model: [
        { text: 'Voted NO on IRA healthcare provisions', url: 'https://justfacts.votesmart.org/bill/31958/87785/200995/mayra-flores-voted-nay-concurrence-vote-hr-5376-inflation-reduction-act-of-2022' },
      ],
      health_cost_control: [
        { text: 'Market-based approach; opposes price regulation', url: 'https://www.mayrafloresforcongress.com/real-solutions' },
      ],
      health_public_health: [
        { text: 'iVoterGuide: conservative public health positions', url: 'https://ivoterguide.com/candidate/58023/race/6592/election/943' },
      ],
      justice_firearms: [
        { text: 'NRA-PVF endorsed; voted NO on BSCA', url: 'https://www.nrapvf.org/grades/texas/' },
      ],
      climate_ambition: [
        { text: 'LCV 0% scorecard', url: 'https://www.lcv.org/moc/mayra-flores/' },
      ],
      climate_energy_portfolio: [
        { text: 'LCV 0%; voted NO on IRA clean energy', url: 'https://www.lcv.org/moc/mayra-flores/' },
        { text: 'Campaign: all-of-the-above with fossil emphasis', url: 'https://www.mayrafloresforcongress.com/real-solutions' },
      ],
      climate_permitting: [
        { text: 'Supports faster energy project approvals', url: 'https://www.mayrafloresforcongress.com/real-solutions' },
      ],
    },
    valueStances: {
      universalism: -0.5,
      benevolence: 0.3,
      tradition: 0.8,
      conformity: 0.3,
      security: 0.8,
      power: 0.3,
      achievement: 0.5,
      hedonism: -0.3,
      stimulation: -0.2,
      self_direction: 0.2,
    },
  },
];

// ============================================
// Candidates — TX Governor
// ============================================

const candidatesTXGovernor: Candidate[] = [
  {
    id: 'gina-hinojosa',
    contestId: CONTEST_IDS.TX_GOVERNOR,
    name: {
      full: 'Gina Hinojosa',
      ballotDisplay: 'Gina Hinojosa',
    },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 1,
    profileSummary: 'Five-term Texas state representative and former school board president running for governor on an anti-voucher, pro-public school, Medicaid expansion, and anti-corruption platform. Career union lawyer with a 9-year legislative record anchored in education, healthcare access, climate action, and labor rights.',
    positions: [
      'Led House Democrats in defeating school vouchers for four consecutive sessions; authored $40B Fully Fund Our Future Act for public schools',
      'Explicit Medicaid expansion commitment; sponsored $1B indigent healthcare funding bill (SB 1350)',
      'Spearheaded 41-bill Texas Climate Plan to reduce carbon emissions and regulate fossil fuel industry',
      'Supports universal background checks, red flag laws, and licensing for long guns; frames gun violence as public health issue',
      'Pro-labor: AFL-CIO endorsed, career union lawyer, supports right to organize in right-to-work Texas',
    ],
    axisStances: {
      econ_safetynet: 1,
      econ_investment: 1,
      econ_tax_structure: 2,
      econ_school_choice: 0,
      health_coverage_model: 2,
      health_cost_control: 2,
      health_public_health: 1,
      housing_supply_zoning: 3,
      housing_affordability_tools: 2,
      housing_transport_priority: 3,
      justice_policing_accountability: 3,
      justice_sentencing_goals: 1,
      justice_firearms: 2,
      climate_ambition: 2,
      climate_energy_portfolio: 3,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'AFL-CIO endorsed; career union lawyer', url: 'https://ginafortexas.com/2026/01/texas-afl-cio-endorses-gina-hinojosa-for-governor/' },
        { text: 'Authored $40B Fully Fund Our Future Act', url: 'https://ginafortexas.com/priorities/' },
      ],
      econ_investment: [
        { text: 'YCT 0% (86th Legislature); pro-investment record', url: 'https://ratings.yct.org/legislators/gina-hinojosa/86th-legislature' },
        { text: 'Campaign priorities page', url: 'https://ginafortexas.com/priorities/' },
      ],
      econ_tax_structure: [
        { text: 'Fiscal Responsibility Index: progressive tax stance', url: 'https://index.texastaxpayers.com/legislators/gina-hinojosa/' },
      ],
      econ_school_choice: [
        { text: 'Led House Dems defeating vouchers 4 sessions', url: 'https://ginafortexas.com/priorities/' },
        { text: 'ATPE endorsed; former school board president', url: 'https://teachthevote.org/candidates/GIna-Hinojosa' },
      ],
      health_coverage_model: [
        { text: 'Explicit Medicaid expansion commitment', url: 'https://ginafortexas.com/priorities/' },
        { text: 'EMILY\'s List endorsed', url: 'https://emilyslist.org/candidate/gina-hinojosa/' },
      ],
      health_cost_control: [
        { text: 'Sponsored $1B indigent healthcare funding bill', url: 'https://ginafortexas.com/priorities/' },
      ],
      health_public_health: [
        { text: 'Choice Tracker: pro-reproductive health stance', url: 'https://choicetracker.org/tx/people/gina-hinojosa/82706432' },
        { text: 'NORML cannabis reform support', url: 'https://vote.norml.org/politicians/166708' },
      ],
      housing_supply_zoning: [
        { text: 'Austin Monitor: inclusionary zoning efforts', url: 'https://www.austinmonitor.com/stories/2020/12/hinojosa-tries-again-for-inclusionary-zoning/' },
      ],
      housing_affordability_tools: [
        { text: 'Inclusionary zoning; government housing tools', url: 'https://www.austinmonitor.com/stories/2020/12/hinojosa-tries-again-for-inclusionary-zoning/' },
      ],
      housing_transport_priority: [
        { text: 'Campaign priorities: public transit investment', url: 'https://ginafortexas.com/priorities/' },
      ],
      justice_policing_accountability: [
        { text: 'Called on Abbott to stop facilitating ICE raids', url: 'https://ginafortexas.com/2026/01/hinojosa-calls-on-abbott-to-stop-facilitating-fatal-ice-operations/' },
      ],
      justice_sentencing_goals: [
        { text: 'Rehabilitation-focused criminal justice approach', url: 'https://ginafortexas.com/priorities/' },
      ],
      justice_firearms: [
        { text: 'TribTalk: gun violence as public health issue', url: 'https://www.tribtalk.org/2019/08/19/the-false-narrative-of-texas-gun-culture/' },
        { text: 'Supports universal background checks, red flag laws', url: 'https://www.tribtalk.org/2017/11/08/we-can-prevent-gun-violence-in-texas-now/' },
      ],
      climate_ambition: [
        { text: 'Spearheaded 41-bill Texas Climate Plan', url: 'https://www.austinchronicle.com/news/2021-04-16/texas-climate-plan-hopes-to-reduce-texas-carbon-emissions/' },
      ],
      climate_energy_portfolio: [
        { text: 'Texas Climate Plan: reduce carbon, regulate fossil', url: 'https://www.austinchronicle.com/news/2021-04-16/texas-climate-plan-hopes-to-reduce-texas-carbon-emissions/' },
      ],
    },
    valueStances: {
      universalism: 0.7,
      benevolence: 0.8,
      tradition: -0.5,
      conformity: 0.2,
      security: 0.3,
      power: -0.6,
      achievement: 0.2,
      hedonism: 0.2,
      stimulation: 0.5,
      self_direction: 0.5,
    },
  },
  {
    id: 'greg-abbott',
    contestId: CONTEST_IDS.TX_GOVERNOR,
    name: {
      full: 'Greg Abbott',
      ballotDisplay: 'Greg Abbott',
    },
    party: 'Republican',
    incumbencyStatus: 'incumbent',
    ballotOrder: 2,
    profileSummary: 'Three-term conservative Republican governor with an 11-year executive record defined by hardline border security, maximum gun rights, school choice, fossil fuel protection, and opposition to government-run healthcare. One of the most documented and ideologically consistent conservative governors in the country.',
    positions: [
      'Signed nation\'s largest school voucher program ($1B ESA), primarying 11 GOP opponents to pass it',
      'NRA A+ grade; signed constitutional carry and 24+ pro-gun bills',
      'Opposes Medicaid expansion; Texas has nation\'s highest uninsured rate (16%+)',
      'Launched Operation Lone Star ($11B+ border enforcement); bused migrants to sanctuary cities',
      'Signed constitutional ban on state income tax; $28B+ in property tax cuts across two sessions',
    ],
    axisStances: {
      econ_safetynet: 9,
      econ_investment: 8,
      econ_tax_structure: 9,
      econ_school_choice: 10,
      health_coverage_model: 9,
      health_cost_control: 8,
      health_public_health: 9,
      housing_supply_zoning: 4,
      housing_affordability_tools: 8,
      housing_transport_priority: 8,
      justice_policing_accountability: 9,
      justice_sentencing_goals: 9,
      justice_firearms: 10,
      climate_ambition: 9,
      climate_energy_portfolio: 9,
      climate_permitting: 9,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'SNAP restrictions signed into law', url: 'https://www.texastribune.org/2025/05/15/snap-benefits-texas-snap-restrictions/' },
        { text: 'Opposes Medicaid expansion; highest uninsured rate', url: 'https://www.texastribune.org/2022/11/07/texas-medicaid-expansion-republicans/' },
      ],
      econ_investment: [
        { text: 'Record $148B transportation investment', url: 'https://gov.texas.gov/news/post/governor-abbott-txdot-announce-record-148-billion-transportation-investment' },
      ],
      econ_tax_structure: [
        { text: 'Signed constitutional ban on state income tax', url: 'https://www.foxbusiness.com/politics/abbott-unveils-5-point-plan-overhaul-texas-property-taxes-targeting-relief-homeowners' },
        { text: 'Largest property tax cut in Texas history', url: 'https://gov.texas.gov/news/post/governor-abbott-signs-largest-property-tax-cut-in-texas-history' },
      ],
      econ_school_choice: [
        { text: 'Signed nation\'s largest $1B ESA voucher program', url: 'https://www.kut.org/politics/2025-05-02/abbott-billion-dollar-school-voucher-esa-law' },
      ],
      health_coverage_model: [
        { text: 'Opposes Medicaid expansion consistently', url: 'https://www.texastribune.org/2022/11/07/texas-medicaid-expansion-republicans/' },
      ],
      health_cost_control: [
        { text: 'Market-based approach to healthcare costs' },
      ],
      health_public_health: [
        { text: 'Banned COVID vaccine mandates statewide', url: 'https://gov.texas.gov/news/post/governor-abbott-issues-executive-order-39-prohibiting-vaccine-mandates-in-texas' },
      ],
      housing_supply_zoning: [
        { text: 'Signed laws to combat housing crisis in Austin', url: 'https://gov.texas.gov/news/post/governor-abbott-signs-laws-to-combat-statewide-housing-crisis-in-austin' },
      ],
      housing_affordability_tools: [
        { text: 'Market solutions focus; property tax cuts', url: 'https://gov.texas.gov/news/post/governor-abbott-signs-largest-property-tax-cut-in-texas-history' },
      ],
      housing_transport_priority: [
        { text: 'Record $148B in highway investment (car-centric)', url: 'https://gov.texas.gov/news/post/governor-abbott-txdot-announce-record-148-billion-transportation-investment' },
      ],
      justice_policing_accountability: [
        { text: 'Signed Back the Blue legislation', url: 'https://gov.texas.gov/news/post/governor-abbott-signs-back-the-blue-legislation' },
      ],
      justice_sentencing_goals: [
        { text: 'Signed strongest bail reform package in TX history', url: 'https://gov.texas.gov/news/post/governor-abbott-signs-strongest-bail-reform-package-in-texas-history' },
      ],
      justice_firearms: [
        { text: 'NRA A+ grade; signed constitutional carry', url: 'https://www.nrapvf.org/articles/20220216/nra-endorses-texas-governor-greg-abbott' },
        { text: 'Constitutional carry law', url: 'https://www.texastribune.org/2021/06/16/texas-constitutional-carry-greg-abbott/' },
      ],
      climate_ambition: [
        { text: 'Anti-ESG legislation; opposes climate regulation', url: 'https://www.texastribune.org/2023/03/01/chapter-313-texas-renewables-economic-development/' },
      ],
      climate_energy_portfolio: [
        { text: 'Fossil-first energy policy; anti-ESG divestment', url: 'https://www.texastribune.org/2023/03/01/chapter-313-texas-renewables-economic-development/' },
      ],
      climate_permitting: [
        { text: 'Fast-tracks fossil fuel and energy infrastructure', url: 'https://gov.texas.gov/news/post/governor-abbott-txdot-announce-record-148-billion-transportation-investment' },
      ],
    },
    valueStances: {
      universalism: -0.7,
      benevolence: 0.2,
      tradition: 0.8,
      conformity: 0.3,
      security: 0.8,
      power: 0.7,
      achievement: 0.5,
      hedonism: -0.3,
      stimulation: -0.4,
      self_direction: 0.1,
    },
  },
];

// ============================================
// Candidates — TX Attorney General
// ============================================

const candidatesTXAG: Candidate[] = [
  {
    id: 'nathan-johnson',
    contestId: CONTEST_IDS.TX_AG,
    name: {
      full: 'Nathan Johnson',
      ballotDisplay: 'Nathan Johnson',
    },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 1,
    profileSummary: 'Seven-year Texas state senator and commercial trial lawyer running for AG on institutional restoration, rule of law, and consumer protection. Pragmatic progressive who passed 135 bills in a GOP-supermajority legislature, with standout records on Medicaid expansion, public education defense, gun safety, and reproductive rights.',
    positions: [
      'Lead voice on Medicaid expansion in Texas; authored SB 1296 extending coverage to ~350K low-income Texans',
      'Voted NO three times on school voucher bills; endorsed by ATPE and Texas Parent PAC',
      'Self-reported NRA F grade; explicitly supports meaningful gun safety laws',
      'Would use AG enforcement discretion to decline enforcing SB 8 (transgender bathroom bill) and unconstitutional laws',
      'Authored four pro-choice bills including medication abortion legalization and abortion travel protections',
    ],
    axisStances: {
      econ_safetynet: 2,
      econ_investment: 3,
      econ_tax_structure: 3,
      econ_school_choice: 1,
      health_coverage_model: 2,
      health_cost_control: 3,
      health_public_health: 3,
      housing_supply_zoning: 3,
      housing_affordability_tools: 4,
      justice_policing_accountability: 3,
      justice_sentencing_goals: 3,
      justice_firearms: 1,
      climate_ambition: 3,
      climate_energy_portfolio: 4,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'AFL-CIO endorsed', url: 'https://texasaflcio.org/news/lone-star-labor-our-slate-statewide-endorsements' },
        { text: 'YCT 0% (86th Legislature)', url: 'https://ratings.yct.org/legislators/nathan-johnson/86th-legislature' },
      ],
      econ_investment: [
        { text: 'Campaign priorities: public investment focus', url: 'https://nathanfortexas.com/priorities' },
      ],
      econ_tax_structure: [
        { text: 'YCT 0%; progressive tax stance', url: 'https://ratings.yct.org/legislators/nathan-johnson/86th-legislature' },
      ],
      econ_school_choice: [
        { text: 'ATPE endorsed; voted NO 3x on voucher bills', url: 'https://teachthevote.atpe.org/Candidates/Nathan-Johnson' },
      ],
      health_coverage_model: [
        { text: 'Lead voice on Medicaid expansion (SB 1296)', url: 'https://www.dmagazine.com/healthcare-business/2020/10/how-texas-could-expand-medicaid-and-not-break-the-bank/' },
      ],
      health_cost_control: [
        { text: 'Supports drug price regulation and expansion', url: 'https://www.dmagazine.com/healthcare-business/2020/10/how-texas-could-expand-medicaid-and-not-break-the-bank/' },
      ],
      health_public_health: [
        { text: 'Cannabis reform bills in TX special session', url: 'https://texaspolitics.com/2025/07/30/senator-nathan-johnson-unveils-cannabis-reform-bills-in-texas-special-session/' },
      ],
      housing_supply_zoning: [
        { text: 'SB 2835: flexible apartment building standards', url: 'https://citizenportal.ai/articles/3111993/Texas/Senate-Bill-2835-promotes-flexible-single-staircase-apartment-buildings-in-Texas' },
      ],
      housing_affordability_tools: [
        { text: 'Campaign priorities: housing affordability', url: 'https://nathanfortexas.com/priorities' },
      ],
      justice_policing_accountability: [
        { text: 'TX Tribune Q&A: AG enforcement discretion', url: 'https://www.texastribune.org/2026/01/28/texas-attorney-general-democrats-2026-primary-qa-voter-guide/' },
      ],
      justice_sentencing_goals: [
        { text: 'VoteSmart key votes on criminal justice', url: 'https://justfacts.votesmart.org/candidate/key-votes/177585/nathan-johnson' },
      ],
      justice_firearms: [
        { text: 'Self-reported NRA F grade; supports gun safety', url: 'https://www.texastribune.org/2026/01/28/texas-attorney-general-democrats-2026-primary-qa-voter-guide/' },
      ],
      climate_ambition: [
        { text: 'Energy priorities: clean energy transition', url: 'https://senatornathanjohnson.com/priorities-powering-the-future-improving-the-environment/' },
      ],
      climate_energy_portfolio: [
        { text: 'Powering the future priorities page', url: 'https://senatornathanjohnson.com/priorities-powering-the-future-improving-the-environment/' },
      ],
    },
    valueStances: {
      universalism: 0.5,
      benevolence: 0.7,
      tradition: -0.3,
      conformity: 0.7,
      security: 0.4,
      power: -0.3,
      achievement: 0.4,
      hedonism: 0.0,
      stimulation: 0.2,
      self_direction: 0.5,
    },
  },
  {
    id: 'joe-jaworski',
    contestId: CONTEST_IDS.TX_AG,
    name: {
      full: 'Joe Jaworski',
      ballotDisplay: 'Joe Jaworski',
    },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    profileSummary: 'Third-generation trial attorney and former Galveston mayor running for Texas AG a second time; centers campaign on voter rights, consumer protection, and pivoting the office away from culture wars toward constituent advocacy.',
    positions: [
      'Replace Paxton\'s voter suppression unit with a Voter Enhancement Division; enforce laws expanding voter access',
      'Fight school vouchers as unconstitutional; use AG office to defend public school funding',
      'Expand Medicaid; dismiss Paxton-era ACA lawsuits; hold insurance companies accountable on claims',
      'Legalize personal-use marijuana; end for-profit prisons; create rehabilitation-focused courts',
      'Protect reproductive rights to the Roe v. Wade viability standard; declares SB8 unconstitutional',
    ],
    axisStances: {
      econ_safetynet: 3,
      econ_school_choice: 1,
      health_coverage_model: 2,
      health_cost_control: 2,
      health_public_health: 2,
      housing_affordability_tools: 2,
      justice_policing_accountability: 3,
      justice_sentencing_goals: 1,
      justice_firearms: 3,
      climate_ambition: 3,
      climate_energy_portfolio: 4,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'TX Tribune Q&A: consumer protection focus', url: 'https://www.texastribune.org/2026/01/28/texas-attorney-general-democrats-2026-primary-qa-voter-guide/' },
      ],
      econ_school_choice: [
        { text: 'Fight vouchers as unconstitutional', url: 'https://www.texastribune.org/2026/01/28/texas-attorney-general-democrats-2026-primary-qa-voter-guide/' },
      ],
      health_coverage_model: [
        { text: 'Expand Medicaid; dismiss Paxton-era ACA lawsuits', url: 'https://www.texastribune.org/2026/01/28/texas-attorney-general-democrats-2026-primary-qa-voter-guide/' },
      ],
      health_cost_control: [
        { text: 'Hold insurance companies accountable on claims', url: 'https://communityimpact.com/austin/south-central-austin/election/2026/01/21/qa-meet-the-democratic-primary-candidates-for-texas-attorney-general/' },
      ],
      health_public_health: [
        { text: 'Protect reproductive rights to Roe viability', url: 'https://www.jaworskifortexas.com' },
      ],
      housing_affordability_tools: [
        { text: 'Galveston public housing advocacy as mayor', url: 'https://texashousers.org/2011/07/15/hud-pointedly-directs-galveston-to-rebuild-its-public-housing/' },
      ],
      justice_policing_accountability: [
        { text: 'Community Impact Q&A: reform-oriented AG vision', url: 'https://communityimpact.com/austin/south-central-austin/election/2026/01/21/qa-meet-the-democratic-primary-candidates-for-texas-attorney-general/' },
      ],
      justice_sentencing_goals: [
        { text: 'Legalize marijuana; end for-profit prisons', url: 'https://www.kxan.com/news/texas-politics/texas-democratic-ag-candidate-profiles-trial-attorney-joe-jaworski/' },
      ],
      justice_firearms: [
        { text: 'KXAN profile: supports gun safety measures', url: 'https://www.kxan.com/news/texas-politics/texas-democratic-ag-candidate-profiles-trial-attorney-joe-jaworski/' },
      ],
      climate_ambition: [
        { text: 'TX Tribune Q&A: climate-conscious AG approach', url: 'https://www.texastribune.org/2026/01/28/texas-attorney-general-democrats-2026-primary-qa-voter-guide/' },
      ],
      climate_energy_portfolio: [
        { text: 'Campaign website priorities', url: 'https://www.jaworskifortexas.com' },
      ],
    },
    valueStances: {
      universalism: 0.5,
      benevolence: 0.7,
      tradition: -0.3,
      conformity: 0.5,
      security: 0.3,
      power: -0.5,
      achievement: 0.3,
      hedonism: 0.2,
      stimulation: 0.4,
      self_direction: 0.5,
    },
  },
  {
    id: 'chip-roy',
    contestId: CONTEST_IDS.TX_AG,
    name: {
      full: 'Chip Roy',
      ballotDisplay: 'Chip Roy',
    },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 3,
    profileSummary: 'Three-term Freedom Caucus firebrand with a near-perfect conservative voting record leaving Congress to run for Texas AG; a fiscal hawk who has blocked his own party\'s spending bills and whose libertarian-leaning federalism occasionally produces surprising cross-partisan positions on overcriminalization and federal overreach.',
    positions: [
      'Heritage Action 100%, CPAC 98%, LCV 2% lifetime — among the most conservative members of Congress by every major scorecard',
      'Introduced the Energy Freedom Act to repeal all Inflation Reduction Act clean energy subsidies',
      'Introduced the SCHOOL Act for universal school choice with federal funds following the student',
      'Voted Yes on One Big Beautiful Bill only after demanding deeper Medicaid/SNAP cuts and accelerated work requirements',
      'NRA A grade; opposes red flag laws, background check expansions, and all major gun regulations',
      'Would pursue overturning Plyler v. Doe and Obergefell v. Hodges as Texas AG',
    ],
    axisStances: {
      econ_safetynet: 9,
      econ_investment: 9,
      econ_tax_structure: 9,
      econ_school_choice: 9,
      health_coverage_model: 9,
      health_cost_control: 9,
      health_public_health: 9,
      housing_transport_priority: 8,
      justice_policing_accountability: 8,
      justice_sentencing_goals: 7,
      justice_firearms: 9,
      climate_ambition: 10,
      climate_energy_portfolio: 10,
      climate_permitting: 7,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Heritage Action 100%; AFL-CIO 0%', url: 'https://heritageaction.com/scorecard/members/R000614/' },
        { text: 'Demanded deeper Medicaid/SNAP cuts in OBBB', url: 'https://roy.house.gov/media/press-releases/rep-roy-statement-house-passage-one-big-beautiful-bill-act-0' },
      ],
      econ_investment: [
        { text: 'Heritage Action 100%; opposes public investment', url: 'https://heritageaction.com/scorecard/members/R000614/' },
        { text: 'Voted NO on Infrastructure Act', url: 'https://roy.house.gov/media/press-releases/rep-roy-issues-statement-infrastructure-bill-vote' },
      ],
      econ_tax_structure: [
        { text: 'Heritage Action 100%; pro-business tax policy', url: 'https://heritageaction.com/scorecard/members/R000614/' },
      ],
      econ_school_choice: [
        { text: 'Introduced SCHOOL Act for universal vouchers', url: 'https://roy.house.gov/media/press-releases/rep-roy-rolls-out-education-bills-defund-racist-curricula-and-put-parents-back' },
      ],
      health_coverage_model: [
        { text: 'Personalized Care Act: replace ACA with HSAs', url: 'https://roy.house.gov/media/press-releases/rep-roy-reintroduces-personalized-care-act-help-restore-americans-healthcare' },
        { text: 'Daily Signal: healthcare system overhaul plan', url: 'https://www.dailysignal.com/2025/01/22/exclusive-chip-roy-unveils-cure-health-care-system/' },
      ],
      health_cost_control: [
        { text: 'Market-based: eliminate ACA, expand HSAs', url: 'https://www.dailysignal.com/2025/01/22/exclusive-chip-roy-unveils-cure-health-care-system/' },
      ],
      health_public_health: [
        { text: 'Bill to protect against vaccine mandates', url: 'https://roy.house.gov/media/press-releases/rep-roy-sen-lee-team-protect-individuals-businesses-tyrannical-vaccine-mandate' },
      ],
      housing_transport_priority: [
        { text: 'Opposes federal transit spending', url: 'https://roy.house.gov/media/press-releases/rep-roy-issues-statement-infrastructure-bill-vote' },
      ],
      justice_policing_accountability: [
        { text: 'Voted NO on George Floyd Act', url: 'https://www.govtrack.us/congress/votes/117-2021/h60' },
      ],
      justice_sentencing_goals: [
        { text: 'Federal criminal code reform (bipartisan)', url: 'https://roy.house.gov/media/press-releases/reps-roy-mcbath-biggs-and-cohen-lead-bipartisan-effort-simplify-federal-criminal-code' },
        { text: 'Anti-Medicaid discrimination bill', url: 'https://roy.house.gov/media/press-releases/reps-roy-fitzgerald-introduce-legislation-end-medicaid-discrimination-against' },
      ],
      justice_firearms: [
        { text: 'NRA A grade; No Backdoor Gun Control Act', url: 'https://roy.house.gov/media/press-releases/rep-roy-introduces-bill-close-loophole-national-firearms-act' },
        { text: 'Voted NO on BSCA', url: 'https://www.govtrack.us/congress/votes/117-2022/h299' },
      ],
      climate_ambition: [
        { text: 'LCV 2% lifetime scorecard', url: 'https://www.lcv.org/moc/chip-roy/' },
        { text: 'Energy Freedom Act: repeal all IRA subsidies', url: 'https://brecheen.house.gov/news/documentsingle.aspx?DocumentID=1447' },
      ],
      climate_energy_portfolio: [
        { text: 'LCV 2%; Energy Freedom Act repeals clean energy', url: 'https://www.lcv.org/moc/chip-roy/' },
        { text: 'AFL-CIO 0%: fossil fuel-first energy policy', url: 'https://aflcio.org/scorecard/legislators/chip-roy' },
      ],
      climate_permitting: [
        { text: 'Libertarian federalism: reduce federal oversight', url: 'https://heritageaction.com/scorecard/members/R000614/' },
      ],
    },
    valueStances: {
      universalism: -0.7,
      benevolence: 0.1,
      tradition: 0.8,
      conformity: 0.2,
      security: 0.7,
      power: 0.3,
      achievement: 0.5,
      hedonism: -0.1,
      stimulation: 0.3,
      self_direction: 0.4,
    },
  },
  {
    id: 'mayes-middleton',
    contestId: CONTEST_IDS.TX_AG,
    name: {
      full: 'Mayes Middleton',
      ballotDisplay: 'Mayes Middleton',
    },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 4,
    profileSummary: 'Third-generation oil executive and Freedom Caucus state senator running for Texas AG on an explicitly Christian nationalist, MAGA-aligned platform. Seven-year legislative record is among the most conservative in the Texas Legislature, anchored by culture-war bills (transgender bans, vaccine mandate ban, school prayer) and aggressive school choice advocacy.',
    positions: [
      'Authored Texas\'s COVID vaccine mandate ban for all private employers including hospitals (SB 7) — strongest such ban in the country',
      'Filed universal Education Savings Account (ESA/voucher) bill; authored school chaplain and school prayer bills',
      'Oil and gas executive who opposes renewable energy subsidies and led anti-ESG legislation',
      'Signed all eight Texas Right to Life Pro-Life Pledge commitments; opposes elective abortion under all circumstances',
      'Pledges to deport all illegal immigrants and criminally prosecute sanctuary city officials as AG',
    ],
    axisStances: {
      econ_safetynet: 8,
      econ_investment: 9,
      econ_tax_structure: 9,
      econ_school_choice: 10,
      health_coverage_model: 8,
      health_public_health: 10,
      housing_supply_zoning: 4,
      justice_policing_accountability: 8,
      justice_sentencing_goals: 8,
      justice_firearms: 9,
      climate_ambition: 9,
      climate_energy_portfolio: 9,
      climate_permitting: 8,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'YCT 100% (88th Legislature)', url: 'https://ratings.yct.org/legislators/mayes-middleton/88th-legislature' },
        { text: 'Fiscal Responsibility Index: max conservative', url: 'https://index.texastaxpayers.com/legislators/mayes-middleton/2023-index' },
      ],
      econ_investment: [
        { text: 'YCT 100%; opposes government spending programs', url: 'https://ratings.yct.org/legislators/mayes-middleton/88th-legislature' },
      ],
      econ_tax_structure: [
        { text: 'Fiscal Responsibility Index: anti-tax position', url: 'https://index.texastaxpayers.com/legislators/mayes-middleton/2023-index' },
      ],
      econ_school_choice: [
        { text: 'Filed universal ESA/voucher bill', url: 'https://teachthevote.atpe.org/Our-Blog/Latest-Posts/TTexas-Senate-predictably-passes-its-private-schoo' },
        { text: 'School prayer and chaplain bills authored', url: 'https://www.houstonpublicmedia.org/articles/news/religion/2025/05/22/522105/school-prayer-bible-reading-bill-authored-by-houston-area-senator-passes-texas-house/' },
      ],
      health_coverage_model: [
        { text: 'iVoterGuide: opposes Medicaid expansion', url: 'https://ivoterguide.com/candidate/39321/race/23525/election/1343' },
      ],
      health_public_health: [
        { text: 'Authored COVID vaccine mandate ban (SB 7)', url: 'https://www.texastribune.org/2023/10/31/texas-legislature-covid-vaccine-mandates-ban-bill/' },
        { text: 'Transgender bathroom ban legislation', url: 'https://thehill.com/homenews/lgbtq/5487156-texas-transgender-bathroom-ban/' },
      ],
      housing_supply_zoning: [
        { text: 'Texas Values Action: local control emphasis', url: 'https://txvaluesaction.org/legislator/mayes-middleton/' },
      ],
      justice_policing_accountability: [
        { text: 'Pro-law enforcement; tough on crime stance', url: 'https://ivoterguide.com/candidate/39321/race/23525/election/1343' },
      ],
      justice_sentencing_goals: [
        { text: 'Punitive justice approach; anti-reform', url: 'https://ivoterguide.com/candidate/39321/race/23525/election/1343' },
      ],
      justice_firearms: [
        { text: 'NRA-ILA: 2A legislation signed into law', url: 'https://www.nraila.org/articles/20250623/texas-second-amendment-legislation-signed-by-governor' },
        { text: 'Texas Right to Life endorsed', url: 'https://www.texasrighttolifepac.com/texas-right-to-life-endorses-mayes-middleton-for-texas-attorney-general/' },
      ],
      climate_ambition: [
        { text: 'Anti-ESG legislation and fossil fuel advocacy', url: 'https://www.texastribune.org/2026/02/04/texas-investment-divest-boycott-fossil-fuels-lawsuit-ruling-esg/' },
      ],
      climate_energy_portfolio: [
        { text: 'Oil exec; opposes renewable subsidies', url: 'https://austinjournal.com/middleton-believes-proposed-legislation-will-go-a-long-way-to-provide-reliable-dispatchable-energy-for-texans/' },
        { text: 'Anti-ESG divestment legislation', url: 'https://www.texastribune.org/2026/02/04/texas-investment-divest-boycott-fossil-fuels-lawsuit-ruling-esg/' },
      ],
      climate_permitting: [
        { text: 'Dispatchable energy legislation for fossil fuels', url: 'https://austinjournal.com/middleton-believes-proposed-legislation-will-go-a-long-way-to-provide-reliable-dispatchable-energy-for-texans/' },
      ],
    },
    valueStances: {
      universalism: -0.8,
      benevolence: 0.2,
      tradition: 0.9,
      conformity: -0.3,
      security: 0.7,
      power: 0.7,
      achievement: 0.5,
      hedonism: -0.5,
      stimulation: -0.3,
      self_direction: -0.1,
    },
  },
];

// ============================================
// Candidates — TX U.S. House District 28
// ============================================

const candidatesTXHouse28: Candidate[] = [
  {
    id: 'henry-cuellar',
    contestId: CONTEST_IDS.TX_HOUSE_28,
    name: {
      full: 'Henry Roberto Cuellar',
      ballotDisplay: 'Henry Cuellar',
    },
    party: 'Democratic',
    incumbencyStatus: 'incumbent',
    ballotOrder: 1,
    profileSummary: 'Eleven-term Blue Dog Democrat representing a heavily Hispanic border district; widely described as the most conservative House Democrat, with a 20-year record of breaking from his party on abortion, energy, labor, and immigration enforcement. Pardoned by Trump in December 2025 on federal bribery charges; House Ethics investigation ongoing.',
    positions: [
      'Self-identifies as pro-life; last anti-abortion Democrat in the House; voted against Women\'s Health Protection Act',
      'Explicit all-of-the-above energy advocate; one of four Democrats to vote for GOP Lower Energy Costs Act (2023)',
      'Strong border enforcement advocate; launched Democratic border security caucus; one of seven Democrats to vote for Republican DHS/ICE funding bill (Jan 2026)',
      'Chamber of Commerce 92-93% rating; voted against PRO Act; stated $7.25 federal minimum wage might be too much',
      'Voted for ACA, Bipartisan Infrastructure Law, IRA (reluctantly), and George Floyd Justice in Policing Act',
    ],
    axisStances: {
      econ_safetynet: 6,
      econ_investment: 5,
      econ_tax_structure: 6,
      econ_school_choice: 4,
      health_coverage_model: 4,
      health_cost_control: 3,
      justice_policing_accountability: 3,
      justice_firearms: 4,
      climate_ambition: 7,
      climate_energy_portfolio: 7,
      climate_permitting: 8,
    },
    axisEvidence: {
      econ_safetynet: [
        { text: 'Chamber of Commerce 92-93%; voted against PRO Act', url: 'https://www.uschamber.com/improving-government/release-us-chamber-endorsed-candidate-henry-cuellar-wins-democratic-primary-tx-28' },
        { text: 'AFL-CIO 64% (2024); high variance across years', url: 'https://aflcio.org/scorecard/legislators/henry-cuellar' },
      ],
      econ_investment: [
        { text: 'Voted YES on IRA (reluctantly)', url: 'https://cuellar.house.gov/news/documentsingle.aspx?DocumentID=407352' },
        { text: 'Blue Dog Coalition fiscal hawk' },
      ],
      econ_tax_structure: [
        { text: 'Chamber of Commerce aligned; Blue Dog member', url: 'https://www.uschamber.com/improving-government/release-us-chamber-endorsed-candidate-henry-cuellar-wins-democratic-primary-tx-28' },
      ],
      econ_school_choice: [
        { text: 'Education issues page; created TEXAS Grant', url: 'https://cuellar.house.gov/issues/issue/?IssueID=45897' },
      ],
      health_coverage_model: [
        { text: 'Voted YES on ACA (2010)', url: 'https://www.healthreformvotes.org/congress/400657' },
      ],
      health_cost_control: [
        { text: 'Voted YES on H.R.3 Lower Drug Costs Act', url: 'https://cuellar.house.gov/news/documentsingle.aspx?DocumentID=404924' },
      ],
      justice_policing_accountability: [
        { text: 'Voted YES on George Floyd Justice in Policing Act', url: 'https://cuellar.house.gov/news/documentsingle.aspx?DocumentID=405467' },
      ],
      justice_firearms: [
        { text: 'NRA C grade (downgraded from A after BSCA)', url: 'https://justfacts.votesmart.org/candidate/evaluations/5486/henry-cuellar/37' },
        { text: 'Voted YES on Bipartisan Safer Communities Act', url: 'https://cuellar.house.gov/news/documentsingle.aspx?DocumentID=407217' },
      ],
      climate_ambition: [
        { text: 'LCV 42% (2025); 51% lifetime', url: 'https://www.lcv.org/moc/henry-cuellar/' },
        { text: 'One of 4 Dems to vote for GOP H.R.1 energy bill', url: 'https://www.texastribune.org/2023/03/29/texas-democrats-vicente-gonzalez-henry-cuellar-climate/' },
      ],
      climate_energy_portfolio: [
        { text: 'All-of-the-above energy; top oil/gas district', url: 'https://cuellar.house.gov/issues/issue/?IssueID=3998' },
        { text: 'Lobbied Senate to drop methane fee from BBB', url: 'https://www.texastribune.org/2023/03/29/texas-democrats-vicente-gonzalez-henry-cuellar-climate/' },
      ],
      climate_permitting: [
        { text: 'H.R.1 Yes vote: faster fossil fuel permitting', url: 'https://www.texastribune.org/2023/03/29/texas-democrats-vicente-gonzalez-henry-cuellar-climate/' },
      ],
    },
    valueStances: {
      universalism: -0.1,
      benevolence: 0.1,
      tradition: 0.5,
      conformity: 0.5,
      security: 0.6,
      power: 0.5,
      achievement: 0.5,
      hedonism: 0.0,
      stimulation: 0.0,
      self_direction: 0.3,
    },
  },
  {
    id: 'tano-tijerina',
    contestId: CONTEST_IDS.TX_HOUSE_28,
    name: {
      full: 'Gustavo \'Tano\' Tijerina Jr.',
      ballotDisplay: 'Tano Tijerina',
    },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    profileSummary: 'Three-term Webb County Judge who switched from Democrat to Republican in December 2024; first-time congressional candidate running on border security, oil and gas, and America First framing with a Trump endorsement, but whose county-level governing record includes strict COVID mandates and voting-access expansion that conflict with current partisan positioning.',
    positions: [
      'Explicit, repeated support for the oil and gas industry; cited Democratic attacks on oil and gas as a reason for party switch',
      'Border security as top priority with a pivot to true immigration reform — more moderate than enforcement-only but vague on specifics',
      'Low taxes, infrastructure investment, and affordability as core campaign pillars',
      'Full embrace of Trump endorsement and America First branding',
      'Faith, family, and conservative cultural values as stated governing principles',
    ],
    axisStances: {
      econ_tax_structure: 7,
      econ_investment: 5,
      health_public_health: 4,
      climate_ambition: 8,
      climate_energy_portfolio: 8,
    },
    axisEvidence: {
      econ_tax_structure: [
        { text: 'Low taxes as core campaign pillar', url: 'https://www.tanoforcongress.com/' },
        { text: 'TX Tribune: fiscal conservative positioning', url: 'https://www.texastribune.org/2025/12/02/webb-county-judge-tano-tijerina-congressional-run/' },
      ],
      econ_investment: [
        { text: 'Infrastructure investment as county judge', url: 'https://www.ksat.com/news/texas/2025/12/02/webb-county-judge-tano-tijerina-launches-run-for-congress-seeking-to-flip-south-texas-district-red/' },
      ],
      health_public_health: [
        { text: 'Strict COVID lockdown as Webb County Judge', url: 'https://www.borderreport.com/news/breaking-laredo-going-into-lockdown-saturday-due-to-covid-19/' },
        { text: 'Washington Examiner: liberal COVID-era record', url: 'https://www.washingtonexaminer.com/news/campaigns/4428447/gop-recruit-against-henry-cuellar-is-trump-backed-challenger-with-liberal-past/' },
      ],
      climate_ambition: [
        { text: 'Dem attacks on oil and gas cited for party switch', url: 'https://www.texastribune.org/2025/12/02/webb-county-judge-tano-tijerina-congressional-run/' },
      ],
      climate_energy_portfolio: [
        { text: 'Explicit oil and gas industry support', url: 'https://www.tanoforcongress.com/' },
        { text: 'Fox & Friends: energy independence framing', url: 'https://www.foxnews.com/video/6365801922112' },
      ],
    },
    valueStances: {
      universalism: -0.2,
      benevolence: 0.5,
      tradition: 0.6,
      conformity: 0.1,
      security: 0.7,
      power: 0.4,
      achievement: 0.5,
      hedonism: 0.0,
      stimulation: 0.1,
      self_direction: 0.0,
    },
  },
];

// ============================================
// Contests
// ============================================

const txContests: Contest[] = [
  {
    id: CONTEST_IDS.TX_US_SENATE,
    type: 'candidate',
    office: 'U.S. Senate',
    jurisdiction: 'federal',
    officeRef: 'us_senator_federal',
    termInfo: 'Texas\'s next U.S. Senator will vote on immigration reform, federal spending, judicial confirmations, and whether to extend the 2017 tax cuts. This seat also helps determine which party controls the Senate.',
    votingFor: 1,
    candidates: candidatesTXSenate,
  },
  {
    id: CONTEST_IDS.TX_HOUSE_34,
    type: 'candidate',
    office: 'U.S. House TX-34',
    jurisdiction: 'federal',
    officeRef: 'us_representative_federal',
    termInfo: 'Your U.S. Representative votes on federal legislation including taxes, healthcare, immigration, and the federal budget. TX-34 covers the Rio Grande Valley — a region where border policy, trade, and healthcare access are central issues.',
    votingFor: 1,
    candidates: candidatesTXHouse34,
  },
  {
    id: CONTEST_IDS.TX_GOVERNOR,
    type: 'candidate',
    office: 'Governor',
    jurisdiction: 'state',
    officeRef: 'tx_governor_statewide',
    termInfo: 'The Governor sets the legislative agenda, signs or vetoes bills, and controls the Texas National Guard. Key issues this term include border security, property tax relief, school vouchers, and the state\'s power grid.',
    votingFor: 1,
    candidates: candidatesTXGovernor,
  },
  {
    id: CONTEST_IDS.TX_AG,
    type: 'candidate',
    office: 'Attorney General',
    jurisdiction: 'state',
    officeRef: 'tx_attorney_general_statewide',
    termInfo: 'The Attorney General is the state\'s top lawyer — they decide which federal policies to challenge in court, enforce consumer protection laws, and set the tone on issues like immigration enforcement, abortion access, and voting rights.',
    votingFor: 1,
    candidates: candidatesTXAG,
  },
  {
    id: CONTEST_IDS.TX_HOUSE_28,
    type: 'candidate',
    office: 'U.S. House TX-28',
    jurisdiction: 'federal',
    officeRef: 'us_representative_federal',
    termInfo: 'Your U.S. Representative votes on federal legislation including taxes, healthcare, immigration, and the federal budget. TX-28 stretches from San Antonio to Laredo along the border — a region where trade, border security, and energy policy are top issues.',
    votingFor: 1,
    candidates: candidatesTXHouse28,
  },
];

// ============================================
// Assembled Ballot
// ============================================

export const texasBallot: Ballot = {
  id: BALLOT_IDS.TX_2026,
  electionDate: '2026-11-03T00:00:00.000Z',
  electionType: 'General Election',
  state: 'Texas',
  county: 'Harris',
  items: [...txContests],
};
