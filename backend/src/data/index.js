/**
 * Mock Data Store
 *
 * In-memory data store for development without a database.
 * Data persists only for the lifetime of the server process.
 */

const { v4: uuidv4 } = require('uuid');
const statementsData = require('./statements.json');

// In-memory stores
const users = new Map();
const refreshTokens = new Map();
const userProfiles = new Map();
const userDistricts = new Map();
const userResponses = new Map();
const userConfidenceAreas = new Map();

// Load statements from JSON
const statements = new Map(
  statementsData.statements.map((s) => [s.id, s])
);

// Issue areas constant
const ISSUE_AREAS = [
  'healthcare',
  'education',
  'economy',
  'environment',
  'immigration',
  'criminal_justice',
  'taxes',
  'housing',
  'gun_policy',
  'social_issues',
];

/**
 * Generate a new UUID
 */
function generateId() {
  return uuidv4();
}

/**
 * Get current timestamp
 */
function now() {
  return new Date().toISOString();
}

// ============================================
// User Operations
// ============================================

const Users = {
  create(data) {
    const id = generateId();
    const user = {
      id,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: now(),
      updatedAt: now(),
    };
    users.set(id, user);
    return user;
  },

  findById(id) {
    return users.get(id) || null;
  },

  findByEmail(email) {
    for (const user of users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },

  update(id, data) {
    const user = users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data, updatedAt: now() };
    users.set(id, updated);
    return updated;
  },
};

// ============================================
// Refresh Token Operations
// ============================================

const RefreshTokens = {
  create(data) {
    const id = generateId();
    const token = {
      id,
      token: data.token,
      userId: data.userId,
      expiresAt: data.expiresAt,
      createdAt: now(),
    };
    refreshTokens.set(data.token, token);
    return token;
  },

  findByToken(token) {
    return refreshTokens.get(token) || null;
  },

  delete(token) {
    return refreshTokens.delete(token);
  },

  deleteAllForUser(userId) {
    for (const [token, data] of refreshTokens) {
      if (data.userId === userId) {
        refreshTokens.delete(token);
      }
    }
  },
};

// ============================================
// User Profile Operations
// ============================================

const UserProfiles = {
  upsert(userId, data) {
    const existing = userProfiles.get(userId);
    const profile = {
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

  findByUserId(userId) {
    return userProfiles.get(userId) || null;
  },
};

// ============================================
// User District Operations
// ============================================

const UserDistricts = {
  upsert(userId, districtType, data) {
    const key = `${userId}:${districtType}`;
    const existing = userDistricts.get(key);
    const district = {
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

  findByUserId(userId) {
    const results = [];
    for (const [key, district] of userDistricts) {
      if (district.userId === userId) {
        results.push(district);
      }
    }
    return results;
  },

  deleteAllForUser(userId) {
    for (const [key, district] of userDistricts) {
      if (district.userId === userId) {
        userDistricts.delete(key);
      }
    }
  },
};

// ============================================
// Policy Statement Operations
// ============================================

const Statements = {
  findAll(options = {}) {
    let results = Array.from(statements.values());

    if (options.isActive !== undefined) {
      results = results.filter((s) => s.isActive === options.isActive);
    }

    if (options.issueArea) {
      results = results.filter((s) => s.issueArea === options.issueArea);
    }

    if (options.excludeIds?.length) {
      results = results.filter((s) => !options.excludeIds.includes(s.id));
    }

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  },

  findById(id) {
    return statements.get(id) || null;
  },

  count(options = {}) {
    return this.findAll(options).length;
  },
};

// ============================================
// User Response Operations
// ============================================

const UserResponses = {
  upsert(userId, statementId, response) {
    const key = `${userId}:${statementId}`;
    const existing = userResponses.get(key);
    const record = {
      id: existing?.id || generateId(),
      userId,
      statementId,
      response,
      respondedAt: now(),
    };
    userResponses.set(key, record);
    return record;
  },

  findByUserId(userId) {
    const results = [];
    for (const record of userResponses.values()) {
      if (record.userId === userId) {
        results.push(record);
      }
    }
    return results;
  },

  findByUserIdWithStatements(userId) {
    const results = [];
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

  countByUserIdAndArea(userId, issueArea) {
    let count = 0;
    for (const record of userResponses.values()) {
      if (record.userId === userId) {
        const statement = statements.get(record.statementId);
        if (statement?.issueArea === issueArea) {
          count++;
        }
      }
    }
    return count;
  },

  getRespondedStatementIds(userId) {
    const ids = [];
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

const UserConfidenceAreas = {
  upsert(userId, issueArea, data) {
    const key = `${userId}:${issueArea}`;
    const existing = userConfidenceAreas.get(key);
    const record = {
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

  findByUserId(userId) {
    const results = [];
    for (const record of userConfidenceAreas.values()) {
      if (record.userId === userId) {
        results.push(record);
      }
    }
    return results;
  },
};

module.exports = {
  // Stores
  Users,
  RefreshTokens,
  UserProfiles,
  UserDistricts,
  Statements,
  UserResponses,
  UserConfidenceAreas,

  // Constants
  ISSUE_AREAS,

  // Utilities
  generateId,
};
