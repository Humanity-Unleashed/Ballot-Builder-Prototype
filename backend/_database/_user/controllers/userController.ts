/**
 * User Controller
 *
 * Handles HTTP requests for user management endpoints.
 * Prototype: Uses mock user ID (no authentication)
 *
 * ARCHIVED: This file is kept for future use when authentication is re-enabled.
 * See _database/_auth/ for the full auth implementation.
 */

import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import type { AgeRange, DistrictInput, PreferenceInput } from '../../src/types';

// Prototype: Use a fixed mock user ID
const MOCK_USER_ID = 'prototype-user';

/**
 * GET /api/users/me
 * Get current user info
 */
export async function getCurrentUser(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // For prototype, return mock user data
    res.json({
      id: MOCK_USER_ID,
      email: 'prototype@ballotbuilder.local',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/profile
 * Update user profile
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { ageRange, location } = req.body as {
      ageRange?: AgeRange;
      location?: string;
    };

    const profile = await userService.updateProfile(MOCK_USER_ID, {
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
export async function setDistricts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { districts } = req.body as { districts: DistrictInput[] };

    const result = await userService.setDistricts(MOCK_USER_ID, districts);

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
export async function setInitialPreferences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { preferences } = req.body as { preferences: PreferenceInput[] };

    const result = await userService.setInitialPreferences(MOCK_USER_ID, preferences);

    res.json({
      message: 'Preferences saved successfully',
      confidenceAreas: result.confidenceAreas,
    });
  } catch (error) {
    next(error);
  }
}
