/**
 * Mock Data Store
 *
 * In-memory data store for prototype development.
 *
 * Note: User-related stores moved to _database/_user/data/stores.ts
 * Note: Auth-related stores moved to _database/_auth/
 */

import type { Statement, Category, GetStatementsOptions } from '../types';

// Re-export modular data
export * from './ballot';
export * from './personas';
export * from './policyTopics';
export * from './recommendations';
export * from './civicAxes';
export * from './adaptiveFlow';

// Import statements data
import { statements as statementsData } from './statements';

// Load statements into Map
const statements = new Map<string, Statement>(
  statementsData.map((s) => [s.id, s])
);

// Categories from the statements
export const CATEGORIES: Category[] = [
  'healthcare',
  'environment',
  'education',
  'economy',
  'infrastructure',
  'criminal-justice',
  'immigration',
  'foreign-policy',
  'civil-rights',
  'technology',
];

// Alias for backwards compatibility
export const ISSUE_AREAS = CATEGORIES;

// ============================================
// Policy Statement Operations
// ============================================

export const Statements = {
  findAll(options: GetStatementsOptions = {}): Statement[] {
    let results = Array.from(statements.values());

    if (options.category) {
      results = results.filter((s) => s.category === options.category);
    }

    // Alias: issueArea maps to category for backwards compatibility
    if (options.issueArea) {
      results = results.filter((s) => s.category === options.issueArea);
    }

    if (options.excludeIds?.length) {
      results = results.filter((s) => !options.excludeIds!.includes(s.id));
    }

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  },

  findById(id: string): Statement | null {
    return statements.get(id) || null;
  },

  count(options: GetStatementsOptions = {}): number {
    return this.findAll(options).length;
  },
};
