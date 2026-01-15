/**
 * Blueprint Service
 *
 * Business logic for the Civic Blueprint feature.
 * Stateless design - frontend tracks user progress via Zustand.
 */

import { Statements, CATEGORIES, ISSUE_AREAS } from '../data';
import adaptiveFlowData from '../data/adaptiveFlow.json';
import logger from '../utils/logger';
import type {
  Statement,
  Category,
  ResponseType,
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
  excludeIds?: string[];
}

interface StatementResponse {
  id: string;
  text: string;
  category: Category;
  vector: number[];
}

/**
 * Get policy statements
 * Optionally filter by issue area and exclude already-answered statements
 */
export async function getStatements(
  options: GetStatementsOptions = {}
): Promise<StatementResponse[]> {
  const { limit = 10, issueArea = null, excludeIds = [] } = options;

  // Build query options
  const queryOptions: {
    excludeIds: string[];
    limit: number;
    issueArea?: string;
  } = {
    excludeIds,
    limit,
  };

  // Filter by issue area if specified
  if (issueArea && (ISSUE_AREAS as readonly string[]).includes(issueArea)) {
    queryOptions.issueArea = issueArea;
  }

  const statements = Statements.findAll(queryOptions);

  logger.debug('Fetched statements', { count: statements.length });

  return statements.map((s: Statement) => ({
    id: s.id,
    text: s.text,
    category: s.category,
    vector: s.vector,
  }));
}

/**
 * Get statements for a specific issue area
 */
export async function getStatementsForArea(
  issueArea: string,
  excludeIds: string[] = []
): Promise<StatementResponse[]> {
  if (!(ISSUE_AREAS as readonly string[]).includes(issueArea)) {
    throw new Error(`Invalid issue area. Must be one of: ${ISSUE_AREAS.join(', ')}`);
  }

  return getStatements({ issueArea, limit: 5, excludeIds });
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

/**
 * Get total statement count
 */
export function getTotalStatementCount(): number {
  return Statements.count();
}

// Re-export constants
export { CATEGORIES, ISSUE_AREAS };
