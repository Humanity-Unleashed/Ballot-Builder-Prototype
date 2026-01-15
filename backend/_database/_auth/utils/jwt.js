/**
 * JWT Utility Functions
 *
 * Handles token generation and verification for authentication.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate an access token for a user
 * @param {Object} user - User object with id and email
 * @returns {string} JWT access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generate a refresh token
 * @returns {Object} { token, expiresAt }
 */
function generateRefreshToken() {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();

  // Parse duration string (e.g., '7d' -> 7 days)
  const match = REFRESH_TOKEN_EXPIRES_IN.match(/^(\d+)([dhms])$/);
  if (match) {
    const [, amount, unit] = match;
    const multipliers = {
      d: 24 * 60 * 60 * 1000, // days
      h: 60 * 60 * 1000, // hours
      m: 60 * 1000, // minutes
      s: 1000, // seconds
    };
    expiresAt.setTime(expiresAt.getTime() + parseInt(amount) * multipliers[unit]);
  } else {
    // Default to 7 days
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  return { token, expiresAt };
}

/**
 * Verify an access token
 * @param {string} token - JWT access token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Decode a token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  decodeToken,
  JWT_SECRET,
};
