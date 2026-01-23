/**
 * Blueprint Controller
 *
 * Handles HTTP requests for the Civic Blueprint feature.
 * Stateless design - frontend tracks user progress via Zustand.
 */

import { Request, Response, NextFunction } from 'express';
import * as blueprintService from '../services/blueprintService';
import type { ResponseType } from '../types';

/**
 * GET /api/blueprint/statements
 * Get policy statements
 * Query params:
 *   - limit: max number of statements (default 10)
 *   - issueArea: filter by category
 *   - excludeIds: comma-separated list of IDs to exclude (already answered)
 */
export async function getStatements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { limit, issueArea, excludeIds } = req.query;

    const statements = await blueprintService.getStatements({
      limit: limit ? parseInt(limit as string, 10) : 10,
      issueArea: (issueArea as string) || null,
      excludeIds: excludeIds ? (excludeIds as string).split(',') : [],
    });

    res.json({
      statements,
      count: statements.length,
      total: blueprintService.getTotalStatementCount(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blueprint/statements/:issueArea
 * Get statements for a specific issue area
 * Query params:
 *   - excludeIds: comma-separated list of IDs to exclude
 */
export async function getStatementsForArea(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { issueArea } = req.params;
    const { excludeIds } = req.query;

    const statements = await blueprintService.getStatementsForArea(
      issueArea,
      excludeIds ? (excludeIds as string).split(',') : []
    );

    res.json({
      issueArea,
      statements,
      count: statements.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blueprint/areas
 * Get all available issue areas
 */
export async function getIssueAreas(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json({
      areas: blueprintService.ISSUE_AREAS,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blueprint/next
 * Get the next statement based on current statement and response
 * Query params: currentStatementId (optional), response (optional: 'approve' or 'disapprove')
 * If no params provided, returns the starting statement
 */
export async function getNextStatement(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { currentStatementId, response } = req.query;

    const result = await blueprintService.getNextStatement(
      (currentStatementId as string) || null,
      (response as ResponseType) || null
    );

    if (!result) {
      res.status(404).json({
        error: 'Statement not found in adaptive flow',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blueprint/start
 * Get the starting statement for the adaptive flow
 */
export async function getStartStatement(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await blueprintService.getStartStatement();

    res.json(result);
  } catch (error) {
    next(error);
  }
}
