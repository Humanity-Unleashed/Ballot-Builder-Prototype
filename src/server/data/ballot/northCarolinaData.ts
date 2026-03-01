/**
 * North Carolina 2026 Ballot Data
 *
 * Real-world scored data from the ballot-builder-agent pipeline.
 * Source: NC 2026 — Primary: 2026-03-03, Runoff: 2026-05-12, General: 2026-11-03
 *
 * Contests:
 *   NC-US-SENATE-2026 — U.S. Senate (Toss-up, open seat — Tillis retiring)
 */

import type { Candidate, Contest, Ballot } from '../../types';
import { BALLOT_IDS, CONTEST_IDS } from './ids';

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
// Contests
// ============================================

const ncContests: Contest[] = [
  {
    id: CONTEST_IDS.NC_US_SENATE,
    type: 'candidate',
    office: 'U.S. Senate',
    jurisdiction: 'federal',
    termInfo: 'Open seat — Thom Tillis (R) is retiring. This is a toss-up race (Cook, Sabato\'s, Inside Elections) that will help determine control of the U.S. Senate. Cooper (D) leads Whatley (R) by +6 in early polling. The primary is March 3, 2026.',
    votingFor: 1,
    candidates: candidatesNCSenate,
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
  items: [...ncContests],
};
