/**
 * Ballot Routes
 *
 * API endpoints for ballot, contest, measure, and candidate data.
 *
 * Ballot endpoints:
 * GET  /api/ballot              - Get the default ballot
 * GET  /api/ballot/summary      - Get overall data summary
 * GET  /api/ballot/all          - List all ballots
 * GET  /api/ballot/:ballotId    - Get a specific ballot
 * GET  /api/ballot/:ballotId/summary   - Get ballot summary
 * GET  /api/ballot/:ballotId/contests  - Get contests from ballot
 * GET  /api/ballot/:ballotId/measures  - Get measures from ballot
 * GET  /api/ballot/:ballotId/items/:itemId - Get specific item
 *
 * Contest endpoints:
 * GET  /api/contests            - List all contests
 * GET  /api/contests/:contestId - Get contest with candidates
 * GET  /api/contests/:contestId/candidates - Get candidates for contest
 *
 * Measure endpoints:
 * GET  /api/measures            - List all measures
 * GET  /api/measures/:measureId - Get specific measure
 *
 * Candidate endpoints:
 * GET  /api/candidates          - List all candidates (?contestId=)
 * GET  /api/candidates/:candidateId - Get candidate with context
 * GET  /api/candidates/:candidateId/context - Get context records
 * GET  /api/candidates/:candidateId/sources - Get source references
 */

import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../middleware/validate';
import * as ballotController from '../controllers/ballotController';

const router = Router();

// ============================================
// Ballot Routes
// ============================================

// Get default ballot
router.get('/', ballotController.getDefaultBallot);

// Get overall summary
router.get('/summary', ballotController.getSummary);

// List all ballots
router.get('/all', ballotController.listBallots);

// Get specific ballot
router.get(
  '/:ballotId',
  [param('ballotId').isString().notEmpty().withMessage('Ballot ID is required'), validate],
  ballotController.getBallot
);

// Get ballot summary
router.get(
  '/:ballotId/summary',
  [param('ballotId').isString().notEmpty().withMessage('Ballot ID is required'), validate],
  ballotController.getBallotSummary
);

// Get contests from ballot
router.get(
  '/:ballotId/contests',
  [param('ballotId').isString().notEmpty().withMessage('Ballot ID is required'), validate],
  ballotController.getBallotContests
);

// Get measures from ballot
router.get(
  '/:ballotId/measures',
  [param('ballotId').isString().notEmpty().withMessage('Ballot ID is required'), validate],
  ballotController.getBallotMeasures
);

// Get specific item from ballot
router.get(
  '/:ballotId/items/:itemId',
  [
    param('ballotId').isString().notEmpty().withMessage('Ballot ID is required'),
    param('itemId').isString().notEmpty().withMessage('Item ID is required'),
    validate,
  ],
  ballotController.getBallotItem
);

export default router;
