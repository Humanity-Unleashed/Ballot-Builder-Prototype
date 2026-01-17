/**
 * Ballot Controller
 *
 * HTTP handlers for ballot-related endpoints.
 */

import type { Request, Response } from 'express';
import * as ballotService from '../services/ballotService';
import { NotFoundError } from '../utils/errors';
import type { PolicyTopicId } from '../types';

// ============================================
// Ballot Endpoints
// ============================================

/**
 * GET /api/ballot
 * Get the default ballot (sample ballot)
 */
export function getDefaultBallot(_req: Request, res: Response): void {
  const ballot = ballotService.getDefaultBallotData();
  res.json(ballot);
}

/**
 * GET /api/ballot/summary
 * Get overall ballot data summary
 */
export function getSummary(_req: Request, res: Response): void {
  const summary = ballotService.getOverallSummary();
  res.json(summary);
}

/**
 * GET /api/ballot/all
 * List all available ballots
 */
export function listBallots(_req: Request, res: Response): void {
  const ballots = ballotService.listBallots();
  res.json(ballots);
}

/**
 * GET /api/ballot/:ballotId
 * Get a specific ballot by ID
 */
export function getBallot(req: Request, res: Response): void {
  const { ballotId } = req.params;
  const ballot = ballotService.findBallotById(ballotId);

  if (!ballot) {
    throw new NotFoundError(`Ballot not found: ${ballotId}`);
  }

  res.json(ballot);
}

/**
 * GET /api/ballot/:ballotId/summary
 * Get ballot summary (item counts)
 */
export function getBallotSummary(req: Request, res: Response): void {
  const { ballotId } = req.params;
  const summary = ballotService.getBallotSummary(ballotId);

  if (!summary) {
    throw new NotFoundError(`Ballot not found: ${ballotId}`);
  }

  res.json(summary);
}

/**
 * GET /api/ballot/:ballotId/contests
 * Get all contests from a ballot
 */
export function getBallotContests(req: Request, res: Response): void {
  const { ballotId } = req.params;
  const ballot = ballotService.findBallotById(ballotId);

  if (!ballot) {
    throw new NotFoundError(`Ballot not found: ${ballotId}`);
  }

  const contests = ballotService.getBallotContests(ballotId);
  res.json(contests);
}

/**
 * GET /api/ballot/:ballotId/measures
 * Get all measures from a ballot
 */
export function getBallotMeasures(req: Request, res: Response): void {
  const { ballotId } = req.params;
  const ballot = ballotService.findBallotById(ballotId);

  if (!ballot) {
    throw new NotFoundError(`Ballot not found: ${ballotId}`);
  }

  const measures = ballotService.getBallotMeasures(ballotId);
  res.json(measures);
}

/**
 * GET /api/ballot/:ballotId/items/:itemId
 * Get a specific item from a ballot
 */
export function getBallotItem(req: Request, res: Response): void {
  const { ballotId, itemId } = req.params;
  const item = ballotService.findBallotItem(ballotId, itemId);

  if (!item) {
    throw new NotFoundError(`Ballot item not found: ${itemId} in ballot ${ballotId}`);
  }

  res.json(item);
}

// ============================================
// Contest Endpoints
// ============================================

/**
 * GET /api/contests
 * List all contests
 */
export function listContests(_req: Request, res: Response): void {
  const contests = ballotService.listContests();
  res.json(contests);
}

/**
 * GET /api/contests/:contestId
 * Get a specific contest with candidates
 */
export function getContest(req: Request, res: Response): void {
  const { contestId } = req.params;
  const contest = ballotService.findContestById(contestId);

  if (!contest) {
    throw new NotFoundError(`Contest not found: ${contestId}`);
  }

  res.json(contest);
}

/**
 * GET /api/contests/:contestId/candidates
 * Get candidates for a specific contest
 */
export function getContestCandidates(req: Request, res: Response): void {
  const { contestId } = req.params;
  const contest = ballotService.findContestById(contestId);

  if (!contest) {
    throw new NotFoundError(`Contest not found: ${contestId}`);
  }

  res.json(contest.candidates);
}

// ============================================
// Measure Endpoints
// ============================================

/**
 * GET /api/measures
 * List all measures
 */
export function listMeasures(_req: Request, res: Response): void {
  const measures = ballotService.listMeasures();
  res.json(measures);
}

/**
 * GET /api/measures/:measureId
 * Get a specific measure
 */
export function getMeasure(req: Request, res: Response): void {
  const { measureId } = req.params;
  const measure = ballotService.findMeasureById(measureId);

  if (!measure) {
    throw new NotFoundError(`Measure not found: ${measureId}`);
  }

  res.json(measure);
}

// ============================================
// Candidate Endpoints
// ============================================

/**
 * GET /api/candidates
 * List all candidates, optionally filtered by contest
 */
export function listCandidates(req: Request, res: Response): void {
  const { contestId } = req.query;
  const candidates = ballotService.listCandidates(contestId as string | undefined);
  res.json(candidates);
}

/**
 * GET /api/candidates/:candidateId
 * Get a specific candidate with context and sources
 */
export function getCandidate(req: Request, res: Response): void {
  const { candidateId } = req.params;
  const candidate = ballotService.getCandidateWithContext(candidateId);

  if (!candidate) {
    throw new NotFoundError(`Candidate not found: ${candidateId}`);
  }

  res.json(candidate);
}

/**
 * GET /api/candidates/:candidateId/context
 * Get all context records for a candidate
 */
export function getCandidateContext(req: Request, res: Response): void {
  const { candidateId } = req.params;
  const { topicId } = req.query;

  const candidate = ballotService.findCandidateById(candidateId);
  if (!candidate) {
    throw new NotFoundError(`Candidate not found: ${candidateId}`);
  }

  const context = ballotService.listCandidateContext(
    candidateId,
    topicId as PolicyTopicId | undefined
  );
  res.json(context);
}

/**
 * GET /api/candidates/:candidateId/sources
 * Get source references for a candidate
 */
export function getCandidateSources(req: Request, res: Response): void {
  const { candidateId } = req.params;

  const candidate = ballotService.findCandidateById(candidateId);
  if (!candidate) {
    throw new NotFoundError(`Candidate not found: ${candidateId}`);
  }

  const sources = ballotService.getCandidateSources(candidateId);
  res.json(sources);
}
