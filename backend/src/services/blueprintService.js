/**
 * Blueprint Service
 *
 * Business logic for the Civic Blueprint feature.
 * Handles policy statements, user responses, and confidence tracking.
 * Uses in-memory mock data store.
 */

const {
  Statements,
  UserResponses,
  UserConfidenceAreas,
  ISSUE_AREAS,
} = require('../data');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Get policy statements for a user to respond to
 * Returns statements the user hasn't responded to yet
 * @param {string} userId - User ID
 * @param {Object} options - { limit, issueArea }
 * @returns {Array} Array of policy statements
 */
async function getStatements(userId, options = {}) {
  const { limit = 10, issueArea = null } = options;

  // Get IDs of statements user has already responded to
  const respondedIds = UserResponses.getRespondedStatementIds(userId);

  // Build query options
  const queryOptions = {
    isActive: true,
    excludeIds: respondedIds,
    limit,
  };

  // Filter by issue area if specified
  if (issueArea && ISSUE_AREAS.includes(issueArea)) {
    queryOptions.issueArea = issueArea;
  }

  const statements = Statements.findAll(queryOptions);

  logger.debug('Fetched statements for user', { userId, count: statements.length });

  return statements.map((s) => ({
    id: s.id,
    statementText: s.statementText,
    issueArea: s.issueArea,
    specificityLevel: s.specificityLevel,
  }));
}

/**
 * Record a user's response to a policy statement
 * @param {string} userId - User ID
 * @param {string} statementId - Statement ID
 * @param {string} response - 'approve' or 'disapprove'
 * @returns {Object} Updated progress info
 */
async function recordResponse(userId, statementId, response) {
  // Validate response value
  if (!['approve', 'disapprove'].includes(response)) {
    throw new Error('Response must be "approve" or "disapprove"');
  }

  // Verify statement exists
  const statement = Statements.findById(statementId);

  if (!statement) {
    throw new NotFoundError('Statement not found');
  }

  // Create or update the response
  UserResponses.upsert(userId, statementId, response);

  // Update confidence area for this issue
  await updateConfidenceArea(userId, statement.issueArea);

  logger.info('Response recorded', { userId, statementId, response });

  // Return updated progress
  return getProgress(userId);
}

/**
 * Update the confidence score for an issue area
 * @param {string} userId - User ID
 * @param {string} issueArea - Issue area to update
 */
async function updateConfidenceArea(userId, issueArea) {
  // Count responses in this area
  const responseCount = UserResponses.countByUserIdAndArea(userId, issueArea);

  // Calculate confidence score (simple formula: more responses = higher confidence)
  // Max out at 100% after 5 responses per area
  const confidenceScore = Math.min((responseCount / 5) * 100, 100);

  // Upsert the confidence area record
  UserConfidenceAreas.upsert(userId, issueArea, {
    confidenceScore,
    responseCount,
  });
}

/**
 * Get user's blueprint progress
 * @param {string} userId - User ID
 * @returns {Object} Progress information
 */
async function getProgress(userId) {
  // Get user responses with statements
  const userResponses = UserResponses.findByUserIdWithStatements(userId);
  const totalResponses = userResponses.length;

  // Get total available statements
  const totalStatements = Statements.count({ isActive: true });

  // Count by area
  const byArea = {};
  for (const area of ISSUE_AREAS) {
    byArea[area] = userResponses.filter((r) => r.statement.issueArea === area).length;
  }

  // Get confidence areas
  const confidenceAreas = UserConfidenceAreas.findByUserId(userId).map((a) => ({
    issueArea: a.issueArea,
    confidenceScore: a.confidenceScore,
    responseCount: a.responseCount,
  }));

  // Calculate overall completion percentage
  const completionPercentage =
    totalStatements > 0 ? Math.round((totalResponses / totalStatements) * 100) : 0;

  // Calculate overall confidence (average of all areas)
  const overallConfidence =
    confidenceAreas.length > 0
      ? Math.round(
          confidenceAreas.reduce((sum, a) => sum + a.confidenceScore, 0) / ISSUE_AREAS.length
        )
      : 0;

  return {
    totalResponses,
    totalStatements,
    completionPercentage,
    overallConfidence,
    byArea,
    confidenceAreas,
    remainingStatements: totalStatements - totalResponses,
  };
}

/**
 * Get a summary of the user's civic blueprint
 * @param {string} userId - User ID
 * @returns {Object} Blueprint summary
 */
async function getSummary(userId) {
  // Get all user responses with statement details
  const responses = UserResponses.findByUserIdWithStatements(userId);

  // Get confidence areas
  const confidenceAreas = UserConfidenceAreas.findByUserId(userId).sort(
    (a, b) => b.confidenceScore - a.confidenceScore
  );

  // Calculate approve/disapprove counts per area
  const areaStats = {};
  for (const area of ISSUE_AREAS) {
    const areaResponses = responses.filter((r) => r.statement.issueArea === area);
    areaStats[area] = {
      total: areaResponses.length,
      approve: areaResponses.filter((r) => r.response === 'approve').length,
      disapprove: areaResponses.filter((r) => r.response === 'disapprove').length,
    };
  }

  // Find strongest areas (most responses with clear preference)
  const strongestAreas = confidenceAreas
    .filter((a) => a.confidenceScore >= 60)
    .map((a) => a.issueArea);

  // Find areas needing more input
  const needsInput = ISSUE_AREAS.filter((area) => {
    const conf = confidenceAreas.find((c) => c.issueArea === area);
    return !conf || conf.confidenceScore < 40;
  });

  return {
    totalResponses: responses.length,
    areaStats,
    confidenceAreas: confidenceAreas.map((a) => ({
      issueArea: a.issueArea,
      confidenceScore: a.confidenceScore,
      responseCount: a.responseCount,
    })),
    strongestAreas,
    needsInput,
    recentResponses: responses.slice(0, 10).map((r) => ({
      statementText: r.statement.statementText,
      issueArea: r.statement.issueArea,
      response: r.response,
      respondedAt: r.respondedAt,
    })),
  };
}

/**
 * Get statements for a specific issue area to improve confidence
 * @param {string} userId - User ID
 * @param {string} issueArea - Issue area to get statements for
 * @returns {Array} Statements for the area
 */
async function getStatementsForArea(userId, issueArea) {
  if (!ISSUE_AREAS.includes(issueArea)) {
    throw new Error(`Invalid issue area. Must be one of: ${ISSUE_AREAS.join(', ')}`);
  }

  return getStatements(userId, { issueArea, limit: 5 });
}

module.exports = {
  getStatements,
  recordResponse,
  getProgress,
  getSummary,
  getStatementsForArea,
  ISSUE_AREAS,
};
