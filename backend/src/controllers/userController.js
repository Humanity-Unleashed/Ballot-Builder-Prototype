/**
 * User Controller
 *
 * Handles HTTP requests for user management endpoints.
 */

const userService = require('../services/userService');

/**
 * POST /api/users/profile
 * Update user profile
 */
async function updateProfile(req, res, next) {
  try {
    const { ageRange, location } = req.body;

    const profile = await userService.updateProfile(req.user.id, {
      ageRange,
      location,
    });

    res.json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/districts
 * Set user districts
 */
async function setDistricts(req, res, next) {
  try {
    const { districts } = req.body;

    const result = await userService.setDistricts(req.user.id, districts);

    res.json({
      message: 'Districts updated successfully',
      districts: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/initial-preferences
 * Set initial preferences (during onboarding)
 */
async function setInitialPreferences(req, res, next) {
  try {
    const { preferences } = req.body;

    const result = await userService.setInitialPreferences(req.user.id, preferences);

    res.json({
      message: 'Preferences saved successfully',
      confidenceAreas: result.confidenceAreas,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateProfile,
  setDistricts,
  setInitialPreferences,
};
