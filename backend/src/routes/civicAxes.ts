/**
 * Civic Axes Routes
 *
 * API endpoints for the civic axes assessment system.
 *
 * GET  /api/civic-axes/spec           - Get full specification
 * GET  /api/civic-axes/summary        - Get spec summary (counts)
 * GET  /api/civic-axes/domains        - Get all domains
 * GET  /api/civic-axes/domains/:id    - Get domain with axes
 * GET  /api/civic-axes/axes           - Get all axes
 * GET  /api/civic-axes/axes/:id       - Get single axis
 * GET  /api/civic-axes/items          - Get items (with filters)
 * GET  /api/civic-axes/items/:id      - Get single item
 * GET  /api/civic-axes/session        - Get items for assessment session
 * POST /api/civic-axes/score          - Score responses
 * GET  /api/civic-axes/tags           - Get all tags
 * GET  /api/civic-axes/response-scale - Get response scale
 */

import { Router } from 'express';
import { query, param, body } from 'express-validator';
import { validate } from '../middleware/validate';
import * as civicAxesController from '../controllers/civicAxesController';

const router = Router();

// Specification endpoints
router.get('/spec', civicAxesController.getSpec);
router.get('/summary', civicAxesController.getSummary);

// Domain endpoints
router.get('/domains', civicAxesController.getDomains);
router.get(
  '/domains/:domainId',
  [param('domainId').isString().notEmpty().withMessage('Domain ID is required'), validate],
  civicAxesController.getDomain
);

// Axis endpoints
router.get('/axes', civicAxesController.getAxes);
router.get(
  '/axes/:axisId',
  [param('axisId').isString().notEmpty().withMessage('Axis ID is required'), validate],
  civicAxesController.getAxis
);

// Item endpoints
router.get(
  '/items',
  [
    query('level')
      .optional()
      .isIn(['local', 'state', 'national', 'international', 'general'])
      .withMessage('Invalid government level'),
    query('tag').optional().isString(),
    query('axisId').optional().isString(),
    validate,
  ],
  civicAxesController.getItems
);

router.get(
  '/items/:itemId',
  [param('itemId').isString().notEmpty().withMessage('Item ID is required'), validate],
  civicAxesController.getItem
);

// Session endpoint (for starting an assessment)
router.get(
  '/session',
  [
    query('count')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Count must be between 1 and 50'),
    query('level')
      .optional()
      .isIn(['local', 'state', 'national', 'international', 'general'])
      .withMessage('Invalid government level'),
    query('excludeIds').optional().isString(),
    validate,
  ],
  civicAxesController.getSessionItems
);

// Scoring endpoint
router.post(
  '/score',
  [
    body('responses')
      .isArray({ min: 1 })
      .withMessage('Responses must be a non-empty array'),
    body('responses.*.item_id')
      .isString()
      .notEmpty()
      .withMessage('Each response must have an item_id'),
    body('responses.*.response')
      .isIn(['strong_disagree', 'disagree', 'agree', 'strong_agree', 'unsure'])
      .withMessage('Invalid response value'),
    validate,
  ],
  civicAxesController.scoreResponses
);

// Metadata endpoints
router.get('/tags', civicAxesController.getTags);
router.get('/response-scale', civicAxesController.getResponseScale);

export default router;
