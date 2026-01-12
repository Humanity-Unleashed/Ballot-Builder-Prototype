/**
 * Blueprint Routes
 *
 * GET  /api/blueprint/statements          - Get policy statements to respond to
 * GET  /api/blueprint/statements/:area    - Get statements for a specific issue area
 * POST /api/blueprint/response            - Record a response to a statement
 * GET  /api/blueprint/progress            - Get blueprint completion progress
 * GET  /api/blueprint/summary             - Get blueprint summary
 * GET  /api/blueprint/areas               - Get all issue areas
 */

const express = require('express');
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const blueprintController = require('../controllers/blueprintController');

const router = express.Router();

// All blueprint routes require authentication
router.use(requireAuth);

/**
 * GET /api/blueprint/areas
 * Get all available issue areas
 */
router.get('/areas', blueprintController.getIssueAreas);

/**
 * GET /api/blueprint/statements
 * Get policy statements for the user to respond to
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
    validate,
  ],
  blueprintController.getStatements
);

/**
 * GET /api/blueprint/statements/:issueArea
 * Get statements for a specific issue area
 */
router.get(
  '/statements/:issueArea',
  [
    param('issueArea')
      .isString()
      .notEmpty()
      .withMessage('Issue area is required'),
    validate,
  ],
  blueprintController.getStatementsForArea
);

/**
 * POST /api/blueprint/response
 * Record a user's response to a policy statement
 */
router.post(
  '/response',
  [
    body('statementId')
      .isUUID()
      .withMessage('Valid statement ID is required'),
    body('response')
      .isIn(['approve', 'disapprove'])
      .withMessage('Response must be "approve" or "disapprove"'),
    validate,
  ],
  blueprintController.recordResponse
);

/**
 * GET /api/blueprint/progress
 * Get the user's blueprint completion progress
 */
router.get('/progress', blueprintController.getProgress);

/**
 * GET /api/blueprint/summary
 * Get a summary of the user's civic blueprint
 */
router.get('/summary', blueprintController.getSummary);

module.exports = router;
