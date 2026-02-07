/**
 * Persona Default Preferences
 *
 * Pre-defined policy preferences for each test persona.
 * Based on each persona's story and concerns.
 *
 * intensity: -1 (strongly left/progressive) to +1 (strongly right/conservative)
 * importance: 1-5 (how much this topic matters to them)
 */

import type { UserPreference } from '../../types';

export const personaDefaultPreferences: Record<string, UserPreference> = {
  // Ashley: Young renter, concerned about housing costs, healthcare, staying in the city
  persona_ashley_fulton: {
    personaId: 'persona_ashley_fulton',
    items: [
      { topicId: 'housing', topicLabel: 'Housing & Zoning', stance: 'support', intensity: -0.8, importance: 5 },
      { topicId: 'healthcare', topicLabel: 'Healthcare', stance: 'support', intensity: -0.7, importance: 4 },
      { topicId: 'economy', topicLabel: 'Economy & Taxes', stance: 'mixed', intensity: -0.3, importance: 3 },
      { topicId: 'education', topicLabel: 'Education', stance: 'mixed', intensity: -0.3, importance: 2 },
      { topicId: 'climate', topicLabel: 'Climate & Environment', stance: 'mixed', intensity: -0.2, importance: 2 },
    ],
  },

  // Marcus: Suburban parent, focused on education, property taxes, public safety
  persona_marcus_dekalb: {
    personaId: 'persona_marcus_dekalb',
    items: [
      { topicId: 'education', topicLabel: 'Education', stance: 'support', intensity: 0.4, importance: 5 },
      { topicId: 'economy', topicLabel: 'Economy & Taxes', stance: 'support', intensity: 0.5, importance: 4 },
      { topicId: 'housing', topicLabel: 'Housing & Zoning', stance: 'mixed', intensity: 0.2, importance: 3 },
      { topicId: 'healthcare', topicLabel: 'Healthcare', stance: 'mixed', intensity: 0.1, importance: 3 },
      { topicId: 'climate', topicLabel: 'Climate & Environment', stance: 'mixed', intensity: 0.1, importance: 2 },
    ],
  },

  // Linda: Retiree on fixed income, concerned about utility rates, property taxes, healthcare
  persona_linda_cobb: {
    personaId: 'persona_linda_cobb',
    items: [
      { topicId: 'healthcare', topicLabel: 'Healthcare', stance: 'support', intensity: -0.5, importance: 5 },
      { topicId: 'economy', topicLabel: 'Economy & Taxes', stance: 'support', intensity: 0.4, importance: 5 },
      { topicId: 'climate', topicLabel: 'Climate & Environment', stance: 'mixed', intensity: 0.3, importance: 4 },
      { topicId: 'housing', topicLabel: 'Housing & Zoning', stance: 'mixed', intensity: 0.1, importance: 2 },
      { topicId: 'education', topicLabel: 'Education', stance: 'mixed', intensity: 0.1, importance: 2 },
    ],
  },

  // Daniel: High-income professional, wants efficiency, prefers concise info
  // Story doesn't specify policy concerns - preferences inferred from demographics
  persona_daniel_gwinnett: {
    personaId: 'persona_daniel_gwinnett',
    items: [
      { topicId: 'economy', topicLabel: 'Economy & Taxes', stance: 'support', intensity: 0.5, importance: 4 },
      { topicId: 'healthcare', topicLabel: 'Healthcare', stance: 'mixed', intensity: 0.2, importance: 3 },
      { topicId: 'education', topicLabel: 'Education', stance: 'mixed', intensity: 0.2, importance: 2 },
      { topicId: 'housing', topicLabel: 'Housing & Zoning', stance: 'mixed', intensity: 0.2, importance: 2 },
      { topicId: 'climate', topicLabel: 'Climate & Environment', stance: 'mixed', intensity: 0.1, importance: 2 },
    ],
  },

  // Robin: Community advocate, cares about equity, public services, local governance
  persona_robin_clayton: {
    personaId: 'persona_robin_clayton',
    items: [
      { topicId: 'housing', topicLabel: 'Housing & Zoning', stance: 'support', intensity: -0.8, importance: 5 },
      { topicId: 'healthcare', topicLabel: 'Healthcare', stance: 'support', intensity: -0.8, importance: 5 },
      { topicId: 'education', topicLabel: 'Education', stance: 'support', intensity: -0.7, importance: 4 },
      { topicId: 'economy', topicLabel: 'Economy & Taxes', stance: 'support', intensity: -0.5, importance: 4 },
      { topicId: 'climate', topicLabel: 'Climate & Environment', stance: 'support', intensity: -0.6, importance: 3 },
    ],
  },

  // Jordan: Service worker, housing-insecure, cares about healthcare, tenant protections
  persona_jordan_gwinnett: {
    personaId: 'persona_jordan_gwinnett',
    items: [
      { topicId: 'housing', topicLabel: 'Housing & Zoning', stance: 'support', intensity: -0.9, importance: 5 },
      { topicId: 'healthcare', topicLabel: 'Healthcare', stance: 'support', intensity: -0.8, importance: 5 },
      { topicId: 'economy', topicLabel: 'Economy & Taxes', stance: 'support', intensity: -0.6, importance: 4 },
      { topicId: 'climate', topicLabel: 'Climate & Environment', stance: 'support', intensity: -0.4, importance: 2 },
      { topicId: 'education', topicLabel: 'Education', stance: 'mixed', intensity: -0.3, importance: 2 },
    ],
  },

  // Default fallback for unknown personas
  default: {
    personaId: 'default',
    items: [
      { topicId: 'economy', topicLabel: 'Economy & Taxes', stance: 'mixed', intensity: 0, importance: 3 },
      { topicId: 'healthcare', topicLabel: 'Healthcare', stance: 'mixed', intensity: 0, importance: 3 },
      { topicId: 'housing', topicLabel: 'Housing & Zoning', stance: 'mixed', intensity: 0, importance: 3 },
      { topicId: 'education', topicLabel: 'Education', stance: 'mixed', intensity: 0, importance: 3 },
      { topicId: 'climate', topicLabel: 'Climate & Environment', stance: 'mixed', intensity: 0, importance: 3 },
    ],
  },
};

export function getPersonaPreferences(personaId: string): UserPreference {
  return personaDefaultPreferences[personaId] || personaDefaultPreferences['default'];
}
