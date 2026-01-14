/**
 * Authentication Service
 *
 * Business logic for user authentication.
 * Uses in-memory mock data store.
 */

const { Users, RefreshTokens, UserProfiles, UserDistricts } = require('../data');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Register a new user
 * @param {Object} data - { email, password }
 * @returns {Object} { user, accessToken, refreshToken }
 */
async function register({ email, password }) {
  // Check if user already exists
  const existingUser = Users.findByEmail(email.toLowerCase());

  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = Users.create({
    email: email.toLowerCase(),
    passwordHash,
  });

  // Create empty profile
  UserProfiles.upsert(user.id, {});

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const { token: refreshToken, expiresAt } = generateRefreshToken();

  // Store refresh token
  RefreshTokens.create({
    token: refreshToken,
    userId: user.id,
    expiresAt,
  });

  logger.info('User registered', { userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Login a user
 * @param {Object} data - { email, password }
 * @returns {Object} { user, accessToken, refreshToken }
 */
async function login({ email, password }) {
  // Find user
  const user = Users.findByEmail(email.toLowerCase());

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const { token: refreshToken, expiresAt } = generateRefreshToken();

  // Store refresh token
  RefreshTokens.create({
    token: refreshToken,
    userId: user.id,
    expiresAt,
  });

  logger.info('User logged in', { userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh an access token
 * @param {string} refreshToken - The refresh token
 * @returns {Object} { accessToken, refreshToken }
 */
async function refreshAccessToken(refreshToken) {
  // Find the refresh token
  const storedToken = RefreshTokens.findByToken(refreshToken);

  if (!storedToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Check if expired
  if (new Date(storedToken.expiresAt) < new Date()) {
    // Delete expired token
    RefreshTokens.delete(refreshToken);
    throw new UnauthorizedError('Refresh token expired');
  }

  // Get user
  const user = Users.findById(storedToken.userId);
  if (!user) {
    RefreshTokens.delete(refreshToken);
    throw new UnauthorizedError('User not found');
  }

  // Generate new tokens
  const accessToken = generateAccessToken(user);
  const { token: newRefreshToken, expiresAt } = generateRefreshToken();

  // Rotate refresh token (delete old, create new)
  RefreshTokens.delete(refreshToken);
  RefreshTokens.create({
    token: newRefreshToken,
    userId: user.id,
    expiresAt,
  });

  logger.debug('Token refreshed', { userId: user.id });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Logout a user (invalidate refresh token)
 * @param {string} refreshToken - The refresh token to invalidate
 */
async function logout(refreshToken) {
  RefreshTokens.delete(refreshToken);
  logger.debug('User logged out');
}

/**
 * Get the current user
 * @param {string} userId - User ID
 * @returns {Object} User data
 */
async function getCurrentUser(userId) {
  const user = Users.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const profile = UserProfiles.findByUserId(userId);
  const districts = UserDistricts.findByUserId(userId);

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: profile
      ? {
          ageRange: profile.ageRange,
          location: profile.location,
        }
      : null,
    districts: districts.map((d) => ({
      districtType: d.districtType,
      districtId: d.districtId,
      districtName: d.districtName,
    })),
  };
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
