/**
 * Candidate Routes
 *
 * API endpoints for candidate data.
 *
 * GET  /api/candidates          - List all candidates (?contestId=)
 * GET  /api/candidates/:candidateId - Get candidate with context
 * GET  /api/candidates/:candidateId/context - Get context records (?topicId=)
 * GET  /api/candidates/:candidateId/sources - Get source references
 */

import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validate';
import * as ballotController from '../controllers/ballotController';

const router = Router();

// List all candidates (optionally filter by contest)
router.get(
  '/',
  [query('contestId').optional().isString(), validate],
  ballotController.listCandidates
);

// Get specific candidate with context and sources
router.get(
  '/:candidateId',
  [param('candidateId').isString().notEmpty().withMessage('Candidate ID is required'), validate],
  ballotController.getCandidate
);

// Get context records for candidate
router.get(
  '/:candidateId/context',
  [
    param('candidateId').isString().notEmpty().withMessage('Candidate ID is required'),
    query('topicId')
      .optional()
      .isIn(['housing', 'economy', 'climate', 'education', 'healthcare'])
      .withMessage('Invalid topic ID'),
    validate,
  ],
  ballotController.getCandidateContext
);

// Get source references for candidate
router.get(
  '/:candidateId/sources',
  [param('candidateId').isString().notEmpty().withMessage('Candidate ID is required'), validate],
  ballotController.getCandidateSources
);

export default router;
