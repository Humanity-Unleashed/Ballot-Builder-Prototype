/**
 * User Routes
 *
 * GET  /api/users/me              - Get current user
 * POST /api/users/profile         - Update user profile
 * POST /api/users/districts       - Set user districts
 * POST /api/users/initial-preferences - Set initial preferences
 *
 * ARCHIVED: This file is kept for future use when authentication is re-enabled.
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../src/middleware/validate';
import * as userController from '../controllers/userController';

const router = Router();

// Prototype: No authentication required

/**
 * GET /api/users/me
 */
router.get('/me', userController.getCurrentUser);

/**
 * POST /api/users/profile
 */
router.post(
  '/profile',
  [
    body('ageRange')
      .optional()
      .isIn(['18-24', '25-34', '35-44', '45-54', '55-64', '65+'])
      .withMessage('Invalid age range'),
    body('location').optional().isString().trim(),
    validate,
  ],
  userController.updateProfile
);

/**
 * POST /api/users/districts
 */
router.post(
  '/districts',
  [
    body('districts')
      .isArray({ min: 1 })
      .withMessage('Districts must be an array'),
    body('districts.*.districtType')
      .isIn(['local', 'county', 'state_house', 'state_senate', 'congressional'])
      .withMessage('Invalid district type'),
    body('districts.*.districtId').notEmpty().withMessage('District ID is required'),
    body('districts.*.districtName').optional().isString(),
    validate,
  ],
  userController.setDistricts
);

/**
 * POST /api/users/initial-preferences
 */
router.post(
  '/initial-preferences',
  [
    body('preferences')
      .isArray({ min: 1 })
      .withMessage('Preferences must be an array'),
    body('preferences.*.issueArea').notEmpty().withMessage('Issue area is required'),
    body('preferences.*.importance')
      .isInt({ min: 1, max: 5 })
      .withMessage('Importance must be 1-5'),
    validate,
  ],
  userController.setInitialPreferences
);

export default router;
