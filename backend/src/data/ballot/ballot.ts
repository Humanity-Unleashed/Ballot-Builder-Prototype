/**
 * Assembled Ballot
 *
 * Combines contests and measures into a complete ballot.
 */

import type { Ballot, BallotItem, Contest, Measure } from '../../types';
import { BALLOT_IDS } from './ids';
import { contests } from './contests';
import { measures } from './measures';

// ============================================
// All Ballot Items (in ballot order)
// ============================================

const allBallotItems: BallotItem[] = [
  contests[0], // Governor
  measures[0], // Prop 42
  measures[1], // Measure A
  measures[2], // Prop 15
  contests[1], // State Senate
];

// ============================================
// Assembled Ballot
// ============================================

export const sampleBallot: Ballot = {
  id: BALLOT_IDS.SAMPLE,
  electionDate: '2025-11-04T00:00:00.000Z',
  electionType: 'General Election',
  state: 'Sample State',
  county: 'Fulton', // Using Fulton as default
  items: allBallotItems,
};

export const ballots: Ballot[] = [sampleBallot];

// ============================================
// Ballot Access Functions
// ============================================

export function getBallotById(id: string): Ballot | null {
  return ballots.find((b) => b.id === id) || null;
}

export function getBallotByCounty(county: string): Ballot | null {
  return ballots.find((b) => b.county.toLowerCase() === county.toLowerCase()) || null;
}

export function getDefaultBallot(): Ballot {
  return sampleBallot;
}

export function getBallotItemById(ballotId: string, itemId: string): BallotItem | null {
  const ballot = getBallotById(ballotId);
  if (!ballot) return null;
  return ballot.items.find((item) => item.id === itemId) || null;
}

export function getContestFromBallot(ballotId: string, contestId: string): Contest | null {
  const item = getBallotItemById(ballotId, contestId);
  if (!item || item.type !== 'candidate') return null;
  return item;
}

export function getMeasureFromBallot(ballotId: string, measureId: string): Measure | null {
  const item = getBallotItemById(ballotId, measureId);
  if (!item || item.type !== 'measure') return null;
  return item;
}

// ============================================
// Type Guards
// ============================================

export function isContest(item: BallotItem): item is Contest {
  return item.type === 'candidate';
}

export function isMeasure(item: BallotItem): item is Measure {
  return item.type === 'measure';
}
