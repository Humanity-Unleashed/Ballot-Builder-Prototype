/**
 * Authentication Middleware
 *
 * Verifies JWT tokens and attaches user info to requests.
 */

const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Require authentication for a route
 * Extracts and verifies the JWT from the Authorization header
 */
function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    // Expect format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    logger.debug('Auth successful', { userId: decoded.userId });
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication
 * Attaches user info if token is present and valid, but doesn't require it
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];
    const decoded = verifyAccessToken(token);

    if (decoded) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
    }

    next();
  } catch {
    // Silently continue without auth
    next();
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
};
