/**
 * User Data Stores
 *
 * In-memory stores for user-related data.
 *
 * ARCHIVED: These stores are kept for future use when user management is re-enabled.
 * They were removed from the prototype since we use personas instead of authenticated users.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  UserProfile,
  UserDistrict,
  UserResponse,
  UserResponseWithStatement,
  UserConfidenceArea,
  Statement,
  AgeRange,
  DistrictType,
  ResponseType,
} from '../../../src/types';

// In-memory stores
const userProfiles = new Map<string, UserProfile>();
const userDistricts = new Map<string, UserDistrict>();
const userResponses = new Map<string, UserResponse>();
const userConfidenceAreas = new Map<string, UserConfidenceArea>();

/**
 * Generate a new UUID
 */
function generateId(): string {
  return uuidv4();
}

/**
 * Get current timestamp
 */
function now(): string {
  return new Date().toISOString();
}

// ============================================
// User Profile Operations
// ============================================

interface ProfileUpsertData {
  ageRange?: AgeRange | null;
  location?: string | null;
  preferenceVector?: number[];
}

export const UserProfiles = {
  upsert(userId: string, data: ProfileUpsertData): UserProfile {
    const existing = userProfiles.get(userId);
    const profile: UserProfile = {
      id: existing?.id || generateId(),
      userId,
      ageRange: data.ageRange ?? existing?.ageRange ?? null,
      location: data.location ?? existing?.location ?? null,
      preferenceVector: data.preferenceVector ?? existing?.preferenceVector ?? [],
      createdAt: existing?.createdAt || now(),
      updatedAt: now(),
    };
    userProfiles.set(userId, profile);
    return profile;
  },

  findByUserId(userId: string): UserProfile | null {
    return userProfiles.get(userId) || null;
  },
};

// ============================================
// User District Operations
// ============================================

interface DistrictUpsertData {
  districtId: string;
  districtName?: string | null;
}

export const UserDistricts = {
  upsert(userId: string, districtType: DistrictType, data: DistrictUpsertData): UserDistrict {
    const key = `${userId}:${districtType}`;
    const existing = userDistricts.get(key);
    const district: UserDistrict = {
      id: existing?.id || generateId(),
      userId,
      districtType,
      districtId: data.districtId,
      districtName: data.districtName || null,
      createdAt: existing?.createdAt || now(),
    };
    userDistricts.set(key, district);
    return district;
  },

  findByUserId(userId: string): UserDistrict[] {
    const results: UserDistrict[] = [];
    for (const [, district] of userDistricts) {
      if (district.userId === userId) {
        results.push(district);
      }
    }
    return results;
  },

  deleteAllForUser(userId: string): void {
    for (const [key, district] of userDistricts) {
      if (district.userId === userId) {
        userDistricts.delete(key);
      }
    }
  },
};

// ============================================
// User Response Operations
// ============================================

// Note: Requires a statements Map to be passed in for findByUserIdWithStatements
export const UserResponses = {
  upsert(userId: string, statementId: string, response: ResponseType): UserResponse {
    const key = `${userId}:${statementId}`;
    const existing = userResponses.get(key);
    const record: UserResponse = {
      id: existing?.id || generateId(),
      userId,
      statementId,
      response,
      respondedAt: now(),
    };
    userResponses.set(key, record);
    return record;
  },

  findByUserId(userId: string): UserResponse[] {
    const results: UserResponse[] = [];
    for (const record of userResponses.values()) {
      if (record.userId === userId) {
        results.push(record);
      }
    }
    return results;
  },

  findByUserIdWithStatements(
    userId: string,
    statements: Map<string, Statement>
  ): UserResponseWithStatement[] {
    const results: UserResponseWithStatement[] = [];
    for (const record of userResponses.values()) {
      if (record.userId === userId) {
        const statement = statements.get(record.statementId);
        if (statement) {
          results.push({ ...record, statement });
        }
      }
    }
    return results;
  },

  countByUserIdAndArea(userId: string, category: string, statements: Map<string, Statement>): number {
    let count = 0;
    for (const record of userResponses.values()) {
      if (record.userId === userId) {
        const statement = statements.get(record.statementId);
        if (statement?.category === category) {
          count++;
        }
      }
    }
    return count;
  },

  getRespondedStatementIds(userId: string): string[] {
    const ids: string[] = [];
    for (const record of userResponses.values()) {
      if (record.userId === userId) {
        ids.push(record.statementId);
      }
    }
    return ids;
  },
};

// ============================================
// User Confidence Area Operations
// ============================================

interface ConfidenceUpsertData {
  confidenceScore: number;
  responseCount: number;
}

export const UserConfidenceAreas = {
  upsert(userId: string, issueArea: string, data: ConfidenceUpsertData): UserConfidenceArea {
    const key = `${userId}:${issueArea}`;
    const existing = userConfidenceAreas.get(key);
    const record: UserConfidenceArea = {
      id: existing?.id || generateId(),
      userId,
      issueArea,
      confidenceScore: data.confidenceScore,
      responseCount: data.responseCount,
      updatedAt: now(),
    };
    userConfidenceAreas.set(key, record);
    return record;
  },

  findByUserId(userId: string): UserConfidenceArea[] {
    const results: UserConfidenceArea[] = [];
    for (const record of userConfidenceAreas.values()) {
      if (record.userId === userId) {
        results.push(record);
      }
    }
    return results;
  },
};
