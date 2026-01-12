/**
 * Blueprint Service
 *
 * Business logic for the Civic Blueprint feature.
 * Handles policy statements, user responses, and confidence tracking.
 */

const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Issue areas for the Civic Blueprint
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
 * Get policy statements for a user to respond to
 * Returns statements the user hasn't responded to yet
 * @param {string} userId - User ID
 * @param {Object} options - { limit, issueArea }
 * @returns {Array} Array of policy statements
 */
async function getStatements(userId, options = {}) {
  const { limit = 10, issueArea = null } = options;

  // Get IDs of statements user has already responded to
  const respondedStatements = await prisma.userResponse.findMany({
    where: { userId },
    select: { statementId: true },
  });

  const respondedIds = respondedStatements.map((r) => r.statementId);

  // Build query for statements user hasn't seen
  const where = {
    isActive: true,
    id: { notIn: respondedIds },
  };

  // Filter by issue area if specified
  if (issueArea && ISSUE_AREAS.includes(issueArea)) {
    where.issueArea = issueArea;
  }

  // Get statements, prioritizing areas with fewer responses
  const statements = await prisma.policyStatement.findMany({
    where,
    take: limit,
    orderBy: [
      { issueArea: 'asc' }, // Group by area for variety
      { createdAt: 'asc' }, // Older statements first
    ],
    select: {
      id: true,
      statementText: true,
      issueArea: true,
      specificityLevel: true,
    },
  });

  logger.debug('Fetched statements for user', { userId, count: statements.length });

  return statements;
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
  const statement = await prisma.policyStatement.findUnique({
    where: { id: statementId },
  });

  if (!statement) {
    throw new NotFoundError('Statement not found');
  }

  // Create or update the response (upsert)
  await prisma.userResponse.upsert({
    where: {
      userId_statementId: {
        userId,
        statementId,
      },
    },
    create: {
      userId,
      statementId,
      response,
    },
    update: {
      response,
      respondedAt: new Date(),
    },
  });

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
  const responseCount = await prisma.userResponse.count({
    where: {
      userId,
      statement: {
        issueArea,
      },
    },
  });

  // Calculate confidence score (simple formula: more responses = higher confidence)
  // Max out at 100% after 5 responses per area
  const confidenceScore = Math.min((responseCount / 5) * 100, 100);

  // Upsert the confidence area record
  await prisma.userConfidenceArea.upsert({
    where: {
      userId_issueArea: {
        userId,
        issueArea,
      },
    },
    create: {
      userId,
      issueArea,
      confidenceScore,
      responseCount,
    },
    update: {
      confidenceScore,
      responseCount,
    },
  });
}

/**
 * Get user's blueprint progress
 * @param {string} userId - User ID
 * @returns {Object} Progress information
 */
async function getProgress(userId) {
  // Get total responses
  const totalResponses = await prisma.userResponse.count({
    where: { userId },
  });

  // Get total available statements
  const totalStatements = await prisma.policyStatement.count({
    where: { isActive: true },
  });

  // Get responses by issue area
  const responsesByArea = await prisma.userResponse.groupBy({
    by: ['statementId'],
    where: { userId },
    _count: true,
  });

  // Get statement issue areas for the user's responses
  const userResponses = await prisma.userResponse.findMany({
    where: { userId },
    include: {
      statement: {
        select: { issueArea: true },
      },
    },
  });

  // Count by area
  const byArea = {};
  for (const area of ISSUE_AREAS) {
    byArea[area] = userResponses.filter((r) => r.statement.issueArea === area).length;
  }

  // Get confidence areas
  const confidenceAreas = await prisma.userConfidenceArea.findMany({
    where: { userId },
    select: {
      issueArea: true,
      confidenceScore: true,
      responseCount: true,
    },
  });

  // Calculate overall completion percentage
  const completionPercentage = totalStatements > 0
    ? Math.round((totalResponses / totalStatements) * 100)
    : 0;

  // Calculate overall confidence (average of all areas)
  const overallConfidence = confidenceAreas.length > 0
    ? Math.round(confidenceAreas.reduce((sum, a) => sum + a.confidenceScore, 0) / ISSUE_AREAS.length)
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
  const responses = await prisma.userResponse.findMany({
    where: { userId },
    include: {
      statement: {
        select: {
          statementText: true,
          issueArea: true,
          specificityLevel: true,
        },
      },
    },
    orderBy: { respondedAt: 'desc' },
  });

  // Get confidence areas
  const confidenceAreas = await prisma.userConfidenceArea.findMany({
    where: { userId },
    orderBy: { confidenceScore: 'desc' },
  });

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
    confidenceAreas,
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
