/**
 * Authentication Routes
 *
 * POST /api/auth/register - Register a new user
 * POST /api/auth/login    - Login a user
 * POST /api/auth/refresh  - Refresh access token
 * POST /api/auth/logout   - Logout (invalidate refresh token)
 */

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const authController = require('../controllers/authController');
const { validatePasswordStrength } = require('../utils/password');

const router = express.Router();

// Custom password validator
const passwordValidator = (value) => {
  const result = validatePasswordStrength(value);
  if (!result.valid) {
    throw new Error(result.errors[0]);
  }
  return true;
};

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .custom(passwordValidator),
    validate,
  ],
  authController.register
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  authController.login
);

/**
 * POST /api/auth/refresh
 */
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required'), validate],
  authController.refresh
);

/**
 * POST /api/auth/logout
 */
router.post(
  '/logout',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required'), validate],
  authController.logout
);

module.exports = router;
