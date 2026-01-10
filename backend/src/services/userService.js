/**
 * User Service
 *
 * Business logic for user management.
 */

const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} data - { ageRange, location }
 * @returns {Object} Updated profile
 */
async function updateProfile(userId, { ageRange, location }) {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      ageRange,
      location,
    },
    create: {
      userId,
      ageRange,
      location,
    },
    select: {
      ageRange: true,
      location: true,
      updatedAt: true,
    },
  });

  logger.info('Profile updated', { userId });
  return profile;
}

/**
 * Set user districts
 * @param {string} userId - User ID
 * @param {Array} districts - Array of district objects
 * @returns {Array} Created districts
 */
async function setDistricts(userId, districts) {
  // Delete existing districts
  await prisma.userDistrict.deleteMany({
    where: { userId },
  });

  // Create new districts
  const created = await prisma.userDistrict.createMany({
    data: districts.map((d) => ({
      userId,
      districtType: d.districtType,
      districtId: d.districtId,
      districtName: d.districtName,
    })),
  });

  // Fetch and return the created districts
  const result = await prisma.userDistrict.findMany({
    where: { userId },
    select: {
      districtType: true,
      districtId: true,
      districtName: true,
    },
  });

  logger.info('Districts updated', { userId, count: created.count });
  return result;
}

/**
 * Set initial preferences (during onboarding)
 * @param {string} userId - User ID
 * @param {Array} preferences - Array of { issueArea, importance }
 * @returns {Object} { confidenceAreas }
 */
async function setInitialPreferences(userId, preferences) {
  // Map preferences to confidence areas
  // Higher importance = higher initial confidence
  const confidenceAreas = preferences.map((pref) => ({
    userId,
    issueArea: pref.issueArea,
    confidenceScore: pref.importance * 20, // Scale 1-5 to 20-100
    responseCount: 1,
  }));

  // Upsert confidence areas
  for (const area of confidenceAreas) {
    await prisma.userConfidenceArea.upsert({
      where: {
        userId_issueArea: {
          userId: area.userId,
          issueArea: area.issueArea,
        },
      },
      update: {
        confidenceScore: area.confidenceScore,
        responseCount: area.responseCount,
      },
      create: area,
    });
  }

  // Fetch and return the created areas
  const result = await prisma.userConfidenceArea.findMany({
    where: { userId },
    select: {
      issueArea: true,
      confidenceScore: true,
      responseCount: true,
    },
  });

  logger.info('Initial preferences set', { userId, count: preferences.length });
  return { confidenceAreas: result };
}

/**
 * Get user by ID with full profile
 * @param {string} userId - User ID
 * @returns {Object} User with profile, districts, confidence areas
 */
async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
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
      confidenceAreas: {
        select: {
          issueArea: true,
          confidenceScore: true,
          responseCount: true,
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
  updateProfile,
  setDistricts,
  setInitialPreferences,
  getUserById,
};
