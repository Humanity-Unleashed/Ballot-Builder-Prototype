/**
 * Blueprint Service (Archived - User State Version)
 *
 * ARCHIVED: This version tracks user state server-side.
 * The current prototype uses frontend state management (Zustand).
 *
 * To re-enable:
 * 1. Restore UserResponses and UserConfidenceAreas from _database/_user/data/stores.ts
 * 2. Copy this file to src/services/blueprintService.ts
 * 3. Update the imports in data/index.ts to include user stores
 */

import {
  Statements,
  UserResponses,
  UserConfidenceAreas,
  CATEGORIES,
  ISSUE_AREAS,
} from '../data';
import adaptiveFlowData from '../data/adaptiveFlow.json';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';
import type {
  Statement,
  Category,
  ResponseType,
  BlueprintProgress,
  BlueprintSummary,
  CategoryStats,
  ConfidenceAreaSummary,
  NextStatementResult,
  AdaptiveStatement,
} from '../types';

// Type for adaptive flow data
interface AdaptiveFlowMap {
  start: string;
  [key: string]: AdaptiveStatement | string;
}

// Load adaptive flow for branching statement logic
const adaptiveFlow = adaptiveFlowData.flow as AdaptiveFlowMap;

interface GetStatementsOptions {
  limit?: number;
  issueArea?: string | null;
}

interface StatementResponse {
  id: string;
  text: string;
  category: Category;
  vector: number[];
}

/**
 * Get policy statements for a user to respond to
 * Returns statements the user hasn't responded to yet
 */
export async function getStatements(
  userId: string,
  options: GetStatementsOptions = {}
): Promise<StatementResponse[]> {
  const { limit = 10, issueArea = null } = options;

  // Get IDs of statements user has already responded to
  const respondedIds = UserResponses.getRespondedStatementIds(userId);

  // Build query options
  const queryOptions: {
    excludeIds: string[];
    limit: number;
    issueArea?: string;
  } = {
    excludeIds: respondedIds,
    limit,
  };

  // Filter by issue area if specified
  if (issueArea && (ISSUE_AREAS as readonly string[]).includes(issueArea)) {
    queryOptions.issueArea = issueArea;
  }

  const statements = Statements.findAll(queryOptions);

  logger.debug('Fetched statements for user', { userId, count: statements.length });

  return statements.map((s: Statement) => ({
    id: s.id,
    text: s.text,
    category: s.category,
    vector: s.vector,
  }));
}

/**
 * Record a user's response to a policy statement
 */
export async function recordResponse(
  userId: string,
  statementId: string,
  response: ResponseType
): Promise<BlueprintProgress> {
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

  // Update confidence area for this category
  await updateConfidenceArea(userId, statement.category);

  logger.info('Response recorded', { userId, statementId, response });

  // Return updated progress
  return getProgress(userId);
}

/**
 * Update the confidence score for an issue area
 */
async function updateConfidenceArea(userId: string, issueArea: string): Promise<void> {
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
 */
export async function getProgress(userId: string): Promise<BlueprintProgress> {
  // Get user responses with statements
  const userResponses = UserResponses.findByUserIdWithStatements(userId);
  const totalResponses = userResponses.length;

  // Get total available statements
  const totalStatements = Statements.count();

  // Count by category
  const byCategory = {} as Record<Category, number>;
  for (const area of ISSUE_AREAS) {
    byCategory[area] = userResponses.filter((r) => r.statement.category === area).length;
  }

  // Get confidence areas
  const confidenceAreas: ConfidenceAreaSummary[] = UserConfidenceAreas.findByUserId(userId).map((a) => ({
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
    byCategory,
    confidenceAreas,
    remainingStatements: totalStatements - totalResponses,
  };
}

/**
 * Get a summary of the user's civic blueprint
 */
export async function getSummary(userId: string): Promise<BlueprintSummary> {
  // Get all user responses with statement details
  const responses = UserResponses.findByUserIdWithStatements(userId);

  // Get confidence areas
  const confidenceAreas = UserConfidenceAreas.findByUserId(userId).sort(
    (a, b) => b.confidenceScore - a.confidenceScore
  );

  // Calculate approve/disapprove counts per category
  const categoryStats = {} as Record<Category, CategoryStats>;
  for (const area of ISSUE_AREAS) {
    const categoryResponses = responses.filter((r) => r.statement.category === area);
    categoryStats[area] = {
      total: categoryResponses.length,
      approve: categoryResponses.filter((r) => r.response === 'approve').length,
      disapprove: categoryResponses.filter((r) => r.response === 'disapprove').length,
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
    categoryStats,
    confidenceAreas: confidenceAreas.map((a) => ({
      issueArea: a.issueArea,
      confidenceScore: a.confidenceScore,
      responseCount: a.responseCount,
    })),
    strongestAreas,
    needsInput,
    recentResponses: responses.slice(0, 10).map((r) => ({
      text: r.statement.text,
      category: r.statement.category,
      response: r.response,
      respondedAt: r.respondedAt,
    })),
  };
}

/**
 * Get statements for a specific issue area to improve confidence
 */
export async function getStatementsForArea(
  userId: string,
  issueArea: string
): Promise<StatementResponse[]> {
  if (!(ISSUE_AREAS as readonly string[]).includes(issueArea)) {
    throw new Error(`Invalid issue area. Must be one of: ${ISSUE_AREAS.join(', ')}`);
  }

  return getStatements(userId, { issueArea, limit: 5 });
}

/**
 * Get the next statement based on the previous statement and response
 * Uses adaptive flow logic to determine branching
 */
export async function getNextStatement(
  currentStatementId: string | null = null,
  response: ResponseType | null = null
): Promise<NextStatementResult | null> {
  let nextStatementId: string | null | undefined;

  // If no current statement, start from the beginning
  if (!currentStatementId) {
    nextStatementId = adaptiveFlow.start;
    logger.debug('Starting adaptive flow', { nextStatementId });
  } else {
    // Get current statement from adaptive flow
    const currentStatement = adaptiveFlow[currentStatementId] as AdaptiveStatement | undefined;

    if (!currentStatement || typeof currentStatement === 'string') {
      // Statement not in adaptive flow - fall back to returning null
      logger.warn('Statement not found in adaptive flow', { currentStatementId });
      return null;
    }

    // Determine next statement based on response
    if (response === 'approve') {
      nextStatementId = currentStatement.agree;
    } else if (response === 'disapprove') {
      nextStatementId = currentStatement.disagree;
    } else {
      // Invalid response - default to agree path
      nextStatementId = currentStatement.agree;
    }

    logger.debug('Determined next statement', {
      currentStatementId,
      response,
      nextStatementId,
    });
  }

  // If no next statement, flow is complete
  if (!nextStatementId) {
    return {
      complete: true,
      message: 'You have completed the adaptive questionnaire!',
    };
  }

  // Get the next statement details
  const nextStatement = adaptiveFlow[nextStatementId] as AdaptiveStatement | undefined;

  if (!nextStatement || typeof nextStatement === 'string') {
    logger.error('Next statement not found in flow', { nextStatementId });
    return null;
  }

  return {
    complete: false,
    statement: {
      id: nextStatement.id,
      text: nextStatement.text,
      category: nextStatement.category,
      vector: nextStatement.vector,
      round: nextStatement.round,
    },
    transitionText: nextStatement.transitionBefore || null,
  };
}

/**
 * Get the starting statement for the adaptive flow
 */
export async function getStartStatement(): Promise<NextStatementResult | null> {
  return getNextStatement(null, null);
}

// Re-export constants
export { CATEGORIES, ISSUE_AREAS };
