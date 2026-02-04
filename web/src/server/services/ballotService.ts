/**
 * Ballot Service
 *
 * Business logic for ballot data operations.
 */

import {
  ballots,
  getBallotById,
  getBallotByCounty,
  getDefaultBallot,
  getBallotItemById,
  isContest,
  isMeasure,
  getAllContests,
  getContestById,
  getAllMeasures,
  getMeasureById,
  allCandidates,
  getCandidateById,
  getCandidatesByContest,
  allCandidateContext,
  getContextByCandidateId,
  getContextByCandidateAndTopic,
  getSourcesByCandidateId,
} from '../data';
import type {
  Ballot,
  BallotItem,
  Contest,
  Measure,
  Candidate,
  CandidateContext,
  SourceRef,
  PolicyTopicId,
} from '../types';

// ============================================
// Ballot Operations
// ============================================

export function listBallots(): Ballot[] {
  return ballots;
}

export function findBallotById(id: string): Ballot | null {
  return getBallotById(id);
}

export function findBallotByCounty(county: string): Ballot | null {
  return getBallotByCounty(county);
}

export function getDefaultBallotData(): Ballot {
  return getDefaultBallot();
}

export function findBallotItem(ballotId: string, itemId: string): BallotItem | null {
  return getBallotItemById(ballotId, itemId);
}

export function getBallotContests(ballotId: string): Contest[] {
  const ballot = getBallotById(ballotId);
  if (!ballot) return [];
  return ballot.items.filter(isContest);
}

export function getBallotMeasures(ballotId: string): Measure[] {
  const ballot = getBallotById(ballotId);
  if (!ballot) return [];
  return ballot.items.filter(isMeasure);
}

// ============================================
// Contest Operations
// ============================================

export function listContests(): Contest[] {
  return getAllContests();
}

export function findContestById(id: string): Contest | null {
  return getContestById(id);
}

export function getContestWithCandidates(contestId: string): Contest | null {
  return getContestById(contestId);
}

// ============================================
// Measure Operations
// ============================================

export function listMeasures(): Measure[] {
  return getAllMeasures();
}

export function findMeasureById(id: string): Measure | null {
  return getMeasureById(id);
}

// ============================================
// Candidate Operations
// ============================================

export function listCandidates(contestId?: string): Candidate[] {
  if (contestId) {
    return getCandidatesByContest(contestId);
  }
  return allCandidates;
}

export function findCandidateById(id: string): Candidate | null {
  return getCandidateById(id);
}

export interface CandidateWithContext extends Candidate {
  context: CandidateContext[];
  sources: SourceRef[];
}

export function getCandidateWithContext(candidateId: string): CandidateWithContext | null {
  const candidate = getCandidateById(candidateId);
  if (!candidate) return null;

  return {
    ...candidate,
    context: getContextByCandidateId(candidateId),
    sources: getSourcesByCandidateId(candidateId),
  };
}

// ============================================
// Candidate Context Operations
// ============================================

export function listCandidateContext(candidateId?: string, topicId?: PolicyTopicId): CandidateContext[] {
  if (candidateId && topicId) {
    return getContextByCandidateAndTopic(candidateId, topicId);
  }
  if (candidateId) {
    return getContextByCandidateId(candidateId);
  }
  return allCandidateContext;
}

export function getCandidateSources(candidateId: string): SourceRef[] {
  return getSourcesByCandidateId(candidateId);
}

// ============================================
// Summary/Stats Operations
// ============================================

export interface BallotSummary {
  id: string;
  electionDate: string;
  electionType: string;
  state: string;
  county: string;
  contestCount: number;
  measureCount: number;
  totalItems: number;
}

export function getBallotSummary(ballotId: string): BallotSummary | null {
  const ballot = getBallotById(ballotId);
  if (!ballot) return null;

  const contests = ballot.items.filter(isContest);
  const measures = ballot.items.filter(isMeasure);

  return {
    id: ballot.id,
    electionDate: ballot.electionDate,
    electionType: ballot.electionType || 'Election',
    state: ballot.state,
    county: ballot.county,
    contestCount: contests.length,
    measureCount: measures.length,
    totalItems: ballot.items.length,
  };
}

export interface OverallSummary {
  ballotCount: number;
  contestCount: number;
  measureCount: number;
  candidateCount: number;
  contextRecordCount: number;
}

export function getOverallSummary(): OverallSummary {
  return {
    ballotCount: ballots.length,
    contestCount: getAllContests().length,
    measureCount: getAllMeasures().length,
    candidateCount: allCandidates.length,
    contextRecordCount: allCandidateContext.length,
  };
}
