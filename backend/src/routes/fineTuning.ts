/**
 * Fine-Tuning Routes
 *
 * API endpoints for fine-tuning civic axis positions.
 *
 * POST   /api/fine-tuning/submit              - Submit fine-tuning responses for an axis
 * GET    /api/fine-tuning/sessions            - List all sessions (admin/debug)
 * GET    /api/fine-tuning/:sessionId          - Get session data
 * GET    /api/fine-tuning/:sessionId/axis/:axisId - Get axis fine-tuning data
 * DELETE /api/fine-tuning/:sessionId          - Delete session
 * DELETE /api/fine-tuning/:sessionId/axis/:axisId - Clear axis fine-tuning
 */

import { Router } from 'express';
import { param, body } from 'express-validator';
import { validate } from '../middleware/validate';
import * as fineTuningController from '../controllers/fineTuningController';

const router = Router();

// Submit fine-tuning responses
router.post(
  '/submit',
  [
    body('axisId')
      .isString()
      .notEmpty()
      .withMessage('Axis ID is required'),
    body('responses')
      .isArray({ min: 1 })
      .withMessage('Responses must be a non-empty array'),
    body('responses.*.subDimensionId')
      .isString()
      .notEmpty()
      .withMessage('Each response must have a subDimensionId'),
    body('responses.*.position')
      .isInt({ min: 0, max: 4 })
      .withMessage('Position must be between 0 and 4'),
    validate,
  ],
  fineTuningController.submitFineTuning
);

// List all sessions (admin/debug)
router.get('/sessions', fineTuningController.listSessions);

// Get session data
router.get(
  '/:sessionId',
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    validate,
  ],
  fineTuningController.getFineTuningSession
);

// Get axis fine-tuning data
router.get(
  '/:sessionId/axis/:axisId',
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    param('axisId')
      .isString()
      .notEmpty()
      .withMessage('Axis ID is required'),
    validate,
  ],
  fineTuningController.getAxisFineTuning
);

// Delete session
router.delete(
  '/:sessionId',
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    validate,
  ],
  fineTuningController.deleteFineTuningSession
);

// Clear axis fine-tuning
router.delete(
  '/:sessionId/axis/:axisId',
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    param('axisId')
      .isString()
      .notEmpty()
      .withMessage('Axis ID is required'),
    validate,
  ],
  fineTuningController.clearAxisFineTuning
);

export default router;
