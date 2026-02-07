/**
 * Civic Axes Service
 *
 * Business logic for the civic axes assessment system.
 * Provides APIs for fetching spec data, items for assessment, and scoring.
 */

import * as civicAxesData from '../data/civicAxes';
import type {
  CivicAxesSpec,
  CivicDomain,
  CivicAxis,
  CivicItem,
  GovernmentLevel,
  SwipeResponse,
  AxisScore,
} from '../types';

// ============================================
// Spec & Metadata
// ============================================

/**
 * Get the full civic axes specification
 */
export function getSpec(): CivicAxesSpec {
  return civicAxesData.getSpec();
}

/**
 * Get a summary of the spec (counts, domain names)
 */
export function getSpecSummary() {
  return civicAxesData.getSpecSummary();
}

// ============================================
// Domains
// ============================================

/**
 * Get all policy domains
 */
export function getAllDomains(): CivicDomain[] {
  return civicAxesData.getAllDomains();
}

/**
 * Get a domain by ID with its axes
 */
export function getDomainWithAxes(domainId: string): {
  domain: CivicDomain;
  axes: CivicAxis[];
} | null {
  const domain = civicAxesData.getDomainById(domainId);
  if (!domain) return null;

  const axes = civicAxesData.getAxesByDomainId(domainId);
  return { domain, axes };
}

// ============================================
// Axes
// ============================================

/**
 * Get all axes
 */
export function getAllAxes(): CivicAxis[] {
  return civicAxesData.getAllAxes();
}

/**
 * Get a single axis by ID
 */
export function getAxis(axisId: string): CivicAxis | null {
  return civicAxesData.getAxisById(axisId);
}

// ============================================
// Items (Assessment Cards)
// ============================================

/**
 * Get all assessment items
 */
export function getAllItems(): CivicItem[] {
  return civicAxesData.getAllItems();
}

/**
 * Get items for an assessment session
 * Returns a balanced selection of items across all axes
 */
export function getItemsForSession(options: {
  count?: number;
  level?: GovernmentLevel;
  excludeIds?: string[];
} = {}): CivicItem[] {
  const { count = 15, level, excludeIds = [] } = options;

  if (level) {
    return civicAxesData.getRandomItems(count, { level, excludeIds });
  }

  return civicAxesData.getBalancedItems(count, excludeIds);
}

/**
 * Get items for a specific axis (for drilling down)
 */
export function getItemsForAxis(
  axisId: string,
  options: { count?: number; excludeIds?: string[] } = {}
): CivicItem[] {
  const { count = 5, excludeIds = [] } = options;
  const axisItems = civicAxesData.getItemsByAxisId(axisId);

  const filtered = excludeIds.length > 0
    ? axisItems.filter((i) => !excludeIds.includes(i.id))
    : axisItems;

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get a single item by ID
 */
export function getItem(itemId: string): CivicItem | null {
  return civicAxesData.getItemById(itemId);
}

// ============================================
// Scoring
// ============================================

/**
 * Score all axes based on swipe responses
 */
export function scoreResponses(
  responses: Array<{ item_id: string; response: SwipeResponse }>
): AxisScore[] {
  return civicAxesData.scoreAxes(responses);
}

/**
 * Get the response scale mapping
 */
export function getResponseScale(): Record<SwipeResponse, number> {
  return civicAxesData.getResponseScale();
}

/**
 * Get scoring configuration
 */
export function getScoringConfig() {
  return civicAxesData.getScoringConfig();
}

// ============================================
// Filtering & Search
// ============================================

/**
 * Get items by government level
 */
export function getItemsByLevel(level: GovernmentLevel): CivicItem[] {
  return civicAxesData.getItemsByLevel(level);
}

/**
 * Get items by tag
 */
export function getItemsByTag(tag: string): CivicItem[] {
  return civicAxesData.getItemsByTag(tag);
}

/**
 * Get all unique tags across all items
 */
export function getAllTags(): string[] {
  const items = civicAxesData.getAllItems();
  const tagSet = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}
