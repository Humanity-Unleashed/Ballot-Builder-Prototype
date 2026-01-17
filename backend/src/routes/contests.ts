/**
 * Contest Routes
 *
 * API endpoints for candidate races.
 *
 * GET  /api/contests            - List all contests
 * GET  /api/contests/:contestId - Get contest with candidates
 * GET  /api/contests/:contestId/candidates - Get candidates for contest
 */

import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../middleware/validate';
import * as ballotController from '../controllers/ballotController';

const router = Router();

// List all contests
router.get('/', ballotController.listContests);

// Get specific contest
router.get(
  '/:contestId',
  [param('contestId').isString().notEmpty().withMessage('Contest ID is required'), validate],
  ballotController.getContest
);

// Get candidates for contest
router.get(
  '/:contestId/candidates',
  [param('contestId').isString().notEmpty().withMessage('Contest ID is required'), validate],
  ballotController.getContestCandidates
);

export default router;
