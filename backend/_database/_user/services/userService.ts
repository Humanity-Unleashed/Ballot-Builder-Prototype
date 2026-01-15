/**
 * User Service
 *
 * Business logic for user management.
 * Uses in-memory mock data store.
 *
 * ARCHIVED: This file is kept for future use when authentication is re-enabled.
 * Requires UserProfiles, UserDistricts, UserConfidenceAreas stores from data/index.ts
 */

import { UserProfiles, UserDistricts, UserConfidenceAreas } from '../../src/data';
import logger from '../../src/utils/logger';
import type { AgeRange, DistrictType, DistrictInput, PreferenceInput, ConfidenceAreaSummary } from '../../src/types';

interface ProfileUpdateData {
  ageRange?: AgeRange | null;
  location?: string | null;
}

interface ProfileResponse {
  ageRange: AgeRange | null;
  location: string | null;
  updatedAt: string;
}

interface DistrictResponse {
  districtType: DistrictType;
  districtId: string;
  districtName: string | null;
}

interface PreferencesResponse {
  confidenceAreas: ConfidenceAreaSummary[];
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  { ageRange, location }: ProfileUpdateData
): Promise<ProfileResponse> {
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
 */
export async function setDistricts(
  userId: string,
  districts: DistrictInput[]
): Promise<DistrictResponse[]> {
  // Delete existing districts
  UserDistricts.deleteAllForUser(userId);

  // Create new districts
  const created: DistrictResponse[] = [];
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
 */
export async function setInitialPreferences(
  userId: string,
  preferences: PreferenceInput[]
): Promise<PreferencesResponse> {
  // Map preferences to confidence areas
  // Higher importance = higher initial confidence
  const results: ConfidenceAreaSummary[] = [];

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
