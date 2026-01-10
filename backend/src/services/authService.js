/**
 * Authentication Service
 *
 * Business logic for user authentication.
 */

const { PrismaClient } = require('@prisma/client');
const { hashPassword, verifyPassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Register a new user
 * @param {Object} data - { email, password }
 * @returns {Object} { user, accessToken, refreshToken }
 */
async function register({ email, password }) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with profile
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      profile: {
        create: {}, // Create empty profile
      },
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const { token: refreshToken, expiresAt } = generateRefreshToken();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  logger.info('User registered', { userId: user.id, email: user.email });

  return {
    user,
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
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

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
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Clean up old refresh tokens (keep last 5)
  const tokens = await prisma.refreshToken.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    skip: 5,
  });

  if (tokens.length > 0) {
    await prisma.refreshToken.deleteMany({
      where: {
        id: { in: tokens.map((t) => t.id) },
      },
    });
  }

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
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Check if expired
  if (storedToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    throw new UnauthorizedError('Refresh token expired');
  }

  // Generate new tokens
  const accessToken = generateAccessToken(storedToken.user);
  const { token: newRefreshToken, expiresAt } = generateRefreshToken();

  // Rotate refresh token (delete old, create new)
  await prisma.refreshToken.delete({
    where: { id: storedToken.id },
  });

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.userId,
      expiresAt,
    },
  });

  logger.debug('Token refreshed', { userId: storedToken.userId });

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
  try {
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
    logger.debug('User logged out');
  } catch {
    // Token might not exist, that's okay
  }
}

/**
 * Get the current user
 * @param {string} userId - User ID
 * @returns {Object} User data
 */
async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          ageRange: true,
          location: true,
        },
      },
      districts: {
        select: {
          districtType: true,
          districtId: true,
          districtName: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
