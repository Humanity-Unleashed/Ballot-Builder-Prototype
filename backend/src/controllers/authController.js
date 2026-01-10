/**
 * Authentication Controller
 *
 * Handles HTTP requests for authentication endpoints.
 */

const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.register({ email, password });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Login a user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 * Refresh an access token
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 * Logout a user (invalidate refresh token)
 */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    await authService.logout(refreshToken);

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/me
 * Get the current authenticated user
 */
async function getCurrentUser(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.json({
      user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
};
