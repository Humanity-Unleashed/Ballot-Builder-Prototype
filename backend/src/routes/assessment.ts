/**
 * Assessment Routes
 *
 * API endpoints for adaptive assessment sessions.
 *
 * POST   /api/assessment/start              - Start a new assessment session
 * GET    /api/assessment/:sessionId         - Get session state (for resuming)
 * POST   /api/assessment/:sessionId/answer  - Submit an answer, get next question
 * POST   /api/assessment/:sessionId/complete - Manually complete assessment
 * DELETE /api/assessment/:sessionId         - Abandon/delete a session
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import * as assessmentController from '../controllers/assessmentController';

const router = Router();

/**
 * POST /api/assessment/start
 * Start a new assessment session
 *
 * Body:
 *   - selectedDomains?: string[] - Domain IDs to include (defaults to all)
 *   - userId?: string - Optional user ID for persistence
 *
 * Response:
 *   - sessionId: string
 *   - firstQuestion: CivicItem
 *   - progress: AssessmentProgress
 *   - selectedDomains: string[]
 */
router.post(
  '/start',
  [
    body('selectedDomains')
      .optional()
      .isArray()
      .withMessage('selectedDomains must be an array'),
    body('selectedDomains.*')
      .optional()
      .isString()
      .withMessage('Each domain ID must be a string'),
    body('userId')
      .optional()
      .isString()
      .withMessage('userId must be a string'),
    validate,
  ],
  assessmentController.startAssessment
);

/**
 * GET /api/assessment/:sessionId
 * Get current session state for resuming
 *
 * Response:
 *   - sessionId: string
 *   - status: 'in_progress' | 'completed' | 'abandoned'
 *   - currentQuestion: CivicItem | null
 *   - answeredItems: string[]
 *   - scores: AxisScore[]
 *   - progress: AssessmentProgress
 *   - selectedDomains: string[]
 */
router.get(
  '/:sessionId',
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    validate,
  ],
  assessmentController.getSession
);

/**
 * POST /api/assessment/:sessionId/answer
 * Submit an answer and get the next question
 *
 * Body:
 *   - itemId: string - The item that was answered
 *   - response: SwipeResponse - The user's response
 *
 * Response:
 *   - nextQuestion: CivicItem | null
 *   - scores: AxisScore[]
 *   - progress: AssessmentProgress
 *   - isComplete: boolean
 */
router.post(
  '/:sessionId/answer',
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    body('itemId')
      .isString()
      .notEmpty()
      .withMessage('Item ID is required'),
    body('response')
      .isIn(['strong_disagree', 'disagree', 'agree', 'strong_agree', 'unsure'])
      .withMessage('Invalid response value'),
    validate,
  ],
  assessmentController.submitAnswer
);

/**
 * POST /api/assessment/:sessionId/complete
 * Manually complete an assessment session
 *
 * Body:
 *   - saveToProfile?: boolean - Whether to save results to user profile
 *
 * Response:
 *   - sessionId: string
 *   - finalScores: AxisScore[]
 *   - profileSaved: boolean
 */
router.post(
  '/:sessionId/complete',
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    body('saveToProfile')
      .optional()
      .isBoolean()
      .withMessage('saveToProfile must be a boolean'),
    validate,
  ],
  assessmentController.completeAssessment
);

/**
 * DELETE /api/assessment/:sessionId
 * Abandon/delete an assessment session
 */
router.delete(
  '/:sessionId',
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    validate,
  ],
  assessmentController.deleteSession
);

export default router;
