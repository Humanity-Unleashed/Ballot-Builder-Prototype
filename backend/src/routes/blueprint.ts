/**
 * Blueprint Routes
 *
 * Stateless API - frontend tracks user progress via Zustand.
 *
 * GET  /api/blueprint/statements          - Get policy statements
 * GET  /api/blueprint/statements/:area    - Get statements for a specific issue area
 * GET  /api/blueprint/areas               - Get all issue areas
 * GET  /api/blueprint/start               - Get the starting statement for adaptive flow
 * GET  /api/blueprint/next                - Get next statement based on current + response
 */

import { Router } from 'express';
import { query, param } from 'express-validator';
import { validate } from '../middleware/validate';
import * as blueprintController from '../controllers/blueprintController';

const router = Router();

/**
 * GET /api/blueprint/areas
 * Get all available issue areas
 */
router.get('/areas', blueprintController.getIssueAreas);

/**
 * GET /api/blueprint/statements
 * Get policy statements
 * Query params:
 *   - limit: max number of statements (default 10)
 *   - issueArea: filter by category
 *   - excludeIds: comma-separated list of IDs to exclude (already answered)
 */
router.get(
  '/statements',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('issueArea')
      .optional()
      .isString()
      .withMessage('Issue area must be a string'),
    query('excludeIds')
      .optional()
      .isString()
      .withMessage('Exclude IDs must be a comma-separated string'),
    validate,
  ],
  blueprintController.getStatements
);

/**
 * GET /api/blueprint/statements/:issueArea
 * Get statements for a specific issue area
 * Query params:
 *   - excludeIds: comma-separated list of IDs to exclude
 */
router.get(
  '/statements/:issueArea',
  [
    param('issueArea')
      .isString()
      .notEmpty()
      .withMessage('Issue area is required'),
    query('excludeIds')
      .optional()
      .isString()
      .withMessage('Exclude IDs must be a comma-separated string'),
    validate,
  ],
  blueprintController.getStatementsForArea
);

/**
 * GET /api/blueprint/start
 * Get the starting statement for the adaptive flow
 */
router.get('/start', blueprintController.getStartStatement);

/**
 * GET /api/blueprint/next
 * Get the next statement based on current statement and response
 * Query params:
 *   - currentStatementId: ID of the current statement
 *   - response: 'approve' or 'disapprove'
 */
router.get(
  '/next',
  [
    query('currentStatementId')
      .optional()
      .isString()
      .withMessage('Current statement ID must be a string'),
    query('response')
      .optional()
      .isIn(['approve', 'disapprove'])
      .withMessage('Response must be "approve" or "disapprove"'),
    validate,
  ],
  blueprintController.getNextStatement
);

export default router;
