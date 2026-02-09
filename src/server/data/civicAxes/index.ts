/**
 * Civic Axes Data Module
 *
 * Provides access to the civic axes specification including domains, axes, and assessment items.
 * This is the backend equivalent of the frontend's civic assessment system.
 */

import type {
  CivicAxesSpec,
  CivicDomain,
  CivicAxis,
  CivicItem,
  GovernmentLevel,
  SwipeResponse,
  AxisScore,
} from '../../types';

// Load the spec from TypeScript module
import { civicAxesSpec as spec } from './spec';

// ============================================
// Spec Access
// ============================================

export function getSpec(): CivicAxesSpec {
  return spec;
}

export function getSpecVersion(): string {
  return spec.spec_version;
}

// ============================================
// Domain Functions
// ============================================

export function getAllDomains(): CivicDomain[] {
  return spec.domains;
}

export function getDomainById(domainId: string): CivicDomain | null {
  return spec.domains.find((d) => d.id === domainId) || null;
}

export function getDomainIds(): string[] {
  return spec.domains.map((d) => d.id);
}

// ============================================
// Axis Functions
// ============================================

export function getAllAxes(): CivicAxis[] {
  return spec.axes;
}

export function getAxisById(axisId: string): CivicAxis | null {
  return spec.axes.find((a) => a.id === axisId) || null;
}

export function getAxesByDomainId(domainId: string): CivicAxis[] {
  return spec.axes.filter((a) => a.domain_id === domainId);
}

export function getAxisIds(): string[] {
  return spec.axes.map((a) => a.id);
}

// ============================================
// Item Functions
// ============================================

export function getAllItems(): CivicItem[] {
  return spec.items;
}

export function getItemById(itemId: string): CivicItem | null {
  return spec.items.find((i) => i.id === itemId) || null;
}

export function getItemsByLevel(level: GovernmentLevel): CivicItem[] {
  return spec.items.filter((i) => i.level === level);
}

export function getItemsByAxisId(axisId: string): CivicItem[] {
  return spec.items.filter((i) => axisId in i.axis_keys);
}

export function getItemsByTag(tag: string): CivicItem[] {
  return spec.items.filter((i) => i.tags.includes(tag));
}

export function getItemCount(): number {
  return spec.items.length;
}

/**
 * Get a random selection of items for an assessment session
 * Optionally filter by level or tags
 */
export function getRandomItems(
  count: number,
  options: { level?: GovernmentLevel; tags?: string[]; excludeIds?: string[] } = {}
): CivicItem[] {
  let items = spec.items;

  if (options.level) {
    items = items.filter((i) => i.level === options.level);
  }

  if (options.tags && options.tags.length > 0) {
    items = items.filter((i) => options.tags!.some((tag) => i.tags.includes(tag)));
  }

  if (options.excludeIds && options.excludeIds.length > 0) {
    items = items.filter((i) => !options.excludeIds!.includes(i.id));
  }

  // Shuffle and take count
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get items balanced across all axes
 * Returns roughly equal number of items per axis
 */
export function getBalancedItems(totalCount: number, excludeIds: string[] = []): CivicItem[] {
  const axisIds = getAxisIds();
  const itemsPerAxis = Math.ceil(totalCount / axisIds.length);
  const selectedItems: CivicItem[] = [];
  const selectedIds = new Set(excludeIds);

  for (const axisId of axisIds) {
    const axisItems = getItemsByAxisId(axisId).filter((i) => !selectedIds.has(i.id));
    const shuffled = [...axisItems].sort(() => Math.random() - 0.5);
    const toAdd = shuffled.slice(0, itemsPerAxis);

    for (const item of toAdd) {
      if (!selectedIds.has(item.id)) {
        selectedItems.push(item);
        selectedIds.add(item.id);
      }
    }
  }

  // Shuffle final selection and trim to exact count
  return selectedItems.sort(() => Math.random() - 0.5).slice(0, totalCount);
}

// ============================================
// Scoring Functions
// ============================================

export function getResponseScale(): Record<SwipeResponse, number> {
  return spec.response_scale;
}

export function getScoringConfig(): CivicAxesSpec['scoring'] {
  return spec.scoring;
}

/**
 * Score axes based on swipe responses
 * Implements the same algorithm as frontend civicScoring.ts
 */
export function scoreAxes(
  responses: Array<{ item_id: string; response: SwipeResponse }>
): AxisScore[] {
  const responseScale = spec.response_scale;
  const shrinkageK = spec.scoring.shrinkage_k;
  const axisIds = getAxisIds();

  // Initialize accumulators for each axis
  const axisData: Record<
    string,
    {
      rawSum: number;
      nAnswered: number;
      nUnsure: number;
      maxPossible: number;
      contributions: Array<{ itemId: string; contribution: number }>;
    }
  > = {};

  for (const axisId of axisIds) {
    axisData[axisId] = {
      rawSum: 0,
      nAnswered: 0,
      nUnsure: 0,
      maxPossible: 0,
      contributions: [],
    };
  }

  // Process each response
  for (const { item_id, response } of responses) {
    const item = getItemById(item_id);
    if (!item) continue;

    const responseValue = responseScale[response];

    // For each axis this item affects
    for (const [axisId, direction] of Object.entries(item.axis_keys)) {
      if (!(axisId in axisData)) continue;

      const data = axisData[axisId];

      if (response === 'unsure') {
        data.nUnsure++;
      } else {
        const contribution = responseValue * direction;
        data.rawSum += contribution;
        data.nAnswered++;
        data.maxPossible += 2; // Max response is 2
        data.contributions.push({ itemId: item_id, contribution: Math.abs(contribution) });
      }
    }
  }

  // Calculate final scores for each axis
  const results: AxisScore[] = [];

  for (const axisId of axisIds) {
    const data = axisData[axisId];

    // Normalize by max possible
    const normalized = data.maxPossible > 0 ? data.rawSum / data.maxPossible : 0;

    // Apply shrinkage
    const shrunk = normalized * (data.nAnswered / (data.nAnswered + shrinkageK));

    // Calculate confidence
    const confidence = data.nAnswered / (data.nAnswered + shrinkageK);

    // Get top 5 driver items (highest absolute contribution)
    const topDrivers = data.contributions
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 5)
      .map((c) => c.itemId);

    results.push({
      axis_id: axisId,
      raw_sum: data.rawSum,
      n_answered: data.nAnswered,
      n_unsure: data.nUnsure,
      normalized,
      shrunk,
      confidence,
      top_drivers: topDrivers,
    });
  }

  return results;
}

// ============================================
// Summary Stats
// ============================================

export function getSpecSummary(): {
  version: string;
  domainCount: number;
  axisCount: number;
  itemCount: number;
  domains: Array<{ id: string; name: string; axisCount: number }>;
} {
  return {
    version: spec.spec_version,
    domainCount: spec.domains.length,
    axisCount: spec.axes.length,
    itemCount: spec.items.length,
    domains: spec.domains.map((d) => ({
      id: d.id,
      name: d.name,
      axisCount: d.axes.length,
    })),
  };
}

// Re-export the spec for direct access if needed
export { spec as civicAxesSpec };
