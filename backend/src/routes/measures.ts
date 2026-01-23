/**
 * Measure Routes
 *
 * API endpoints for ballot measures (propositions).
 *
 * GET  /api/measures            - List all measures
 * GET  /api/measures/:measureId - Get specific measure
 */

import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../middleware/validate';
import * as ballotController from '../controllers/ballotController';

const router = Router();

// List all measures
router.get('/', ballotController.listMeasures);

// Get specific measure
router.get(
  '/:measureId',
  [param('measureId').isString().notEmpty().withMessage('Measure ID is required'), validate],
  ballotController.getMeasure
);

export default router;
