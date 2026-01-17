/**
 * Civic Axes Controller
 *
 * Handles HTTP requests for the civic axes assessment system.
 */

import { Request, Response, NextFunction } from 'express';
import * as civicAxesService from '../services/civicAxesService';
import type { GovernmentLevel, SwipeResponse } from '../types';

/**
 * GET /api/civic-axes/spec
 * Get the full civic axes specification
 */
export async function getSpec(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const spec = civicAxesService.getSpec();
    res.json(spec);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/summary
 * Get a summary of the spec (counts, domain names)
 */
export async function getSummary(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const summary = civicAxesService.getSpecSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/domains
 * Get all policy domains
 */
export async function getDomains(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const domains = civicAxesService.getAllDomains();
    res.json({ domains, count: domains.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/domains/:domainId
 * Get a single domain with its axes
 */
export async function getDomain(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { domainId } = req.params;
    const result = civicAxesService.getDomainWithAxes(domainId);

    if (!result) {
      res.status(404).json({ error: 'Domain not found', code: 'NOT_FOUND' });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/axes
 * Get all axes
 */
export async function getAxes(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const axes = civicAxesService.getAllAxes();
    res.json({ axes, count: axes.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/axes/:axisId
 * Get a single axis
 */
export async function getAxis(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { axisId } = req.params;
    const axis = civicAxesService.getAxis(axisId);

    if (!axis) {
      res.status(404).json({ error: 'Axis not found', code: 'NOT_FOUND' });
      return;
    }

    res.json(axis);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/items
 * Get all assessment items or filter by query params
 * Query params:
 *   - level: filter by government level
 *   - tag: filter by tag
 *   - axisId: filter by axis
 */
export async function getItems(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { level, tag, axisId } = req.query;

    let items;
    if (level) {
      items = civicAxesService.getItemsByLevel(level as GovernmentLevel);
    } else if (tag) {
      items = civicAxesService.getItemsByTag(tag as string);
    } else if (axisId) {
      items = civicAxesService.getItemsForAxis(axisId as string);
    } else {
      items = civicAxesService.getAllItems();
    }

    res.json({ items, count: items.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/items/:itemId
 * Get a single item
 */
export async function getItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { itemId } = req.params;
    const item = civicAxesService.getItem(itemId);

    if (!item) {
      res.status(404).json({ error: 'Item not found', code: 'NOT_FOUND' });
      return;
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/session
 * Get items for an assessment session
 * Query params:
 *   - count: number of items (default 15)
 *   - level: filter by government level
 *   - excludeIds: comma-separated list of item IDs to exclude
 */
export async function getSessionItems(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { count, level, excludeIds } = req.query;

    const items = civicAxesService.getItemsForSession({
      count: count ? parseInt(count as string, 10) : 15,
      level: level as GovernmentLevel | undefined,
      excludeIds: excludeIds ? (excludeIds as string).split(',') : [],
    });

    res.json({
      items,
      count: items.length,
      responseScale: civicAxesService.getResponseScale(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/civic-axes/score
 * Score responses and return axis scores
 * Body: { responses: [{ item_id: string, response: SwipeResponse }] }
 */
export async function scoreResponses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { responses } = req.body as {
      responses: Array<{ item_id: string; response: SwipeResponse }>;
    };

    const scores = civicAxesService.scoreResponses(responses);

    res.json({
      scores,
      scoringConfig: civicAxesService.getScoringConfig(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/tags
 * Get all unique tags
 */
export async function getTags(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tags = civicAxesService.getAllTags();
    res.json({ tags, count: tags.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/civic-axes/response-scale
 * Get the response scale mapping
 */
export async function getResponseScale(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const scale = civicAxesService.getResponseScale();
    res.json(scale);
  } catch (error) {
    next(error);
  }
}
