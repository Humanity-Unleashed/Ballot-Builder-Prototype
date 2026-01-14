/**
 * User Service
 *
 * Business logic for user management.
 * Uses in-memory mock data store.
 */

const { Users, UserProfiles, UserDistricts, UserConfidenceAreas } = require('../data');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} data - { ageRange, location }
 * @returns {Object} Updated profile
 */
async function updateProfile(userId, { ageRange, location }) {
  const profile = UserProfiles.upsert(userId, {
    ageRange,
    location,
  });

  logger.info('Profile updated', { userId });

  return {
    ageRange: profile.ageRange,
    location: profile.location,
    updatedAt: profile.updatedAt,
  };
}

/**
 * Set user districts
 * @param {string} userId - User ID
 * @param {Array} districts - Array of district objects
 * @returns {Array} Created districts
 */
async function setDistricts(userId, districts) {
  // Delete existing districts
  UserDistricts.deleteAllForUser(userId);

  // Create new districts
  const created = [];
  for (const d of districts) {
    const district = UserDistricts.upsert(userId, d.districtType, {
      districtId: d.districtId,
      districtName: d.districtName,
    });
    created.push({
      districtType: district.districtType,
      districtId: district.districtId,
      districtName: district.districtName,
    });
  }

  logger.info('Districts updated', { userId, count: created.length });
  return created;
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
  const results = [];

  for (const pref of preferences) {
    const area = UserConfidenceAreas.upsert(userId, pref.issueArea, {
      confidenceScore: pref.importance * 20, // Scale 1-5 to 20-100
      responseCount: 1,
    });
    results.push({
      issueArea: area.issueArea,
      confidenceScore: area.confidenceScore,
      responseCount: area.responseCount,
    });
  }

  logger.info('Initial preferences set', { userId, count: preferences.length });
  return { confidenceAreas: results };
}

/**
 * Get user by ID with full profile
 * @param {string} userId - User ID
 * @returns {Object} User with profile, districts, confidence areas
 */
async function getUserById(userId) {
  const user = Users.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const profile = UserProfiles.findByUserId(userId);
  const districts = UserDistricts.findByUserId(userId);
  const confidenceAreas = UserConfidenceAreas.findByUserId(userId);

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
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
    confidenceAreas: confidenceAreas.map((a) => ({
      issueArea: a.issueArea,
      confidenceScore: a.confidenceScore,
      responseCount: a.responseCount,
    })),
  };
}

module.exports = {
  updateProfile,
  setDistricts,
  setInitialPreferences,
  getUserById,
};
