/**
 * Blueprint Helpers
 *
 * Helper functions for managing the civic blueprint profile.
 * Handles scoring swipes via the backend API and updating the profile.
 */

import { civicAxesApi } from '../services/api';
import type { Spec } from '../types/civicAssessment';
import type {
  BlueprintProfile,
  DomainProfile,
  AxisProfile,
  ProfileSource,
  LearningMode,
} from '../types/blueprintProfile';
import { useUserStore, SwipeEvent, AxisScore } from './userStore';

const PROFILE_VERSION = '1.0.0';

// ===========================================
// Profile Creation
// ===========================================

/**
 * Create an initial blueprint profile from the civic axes spec
 */
export function createDefaultProfile(spec: Spec, userId: string): BlueprintProfile {
  const domains: DomainProfile[] = spec.domains.map((domain) => ({
    domain_id: domain.id,
    importance: {
      value_0_10: 5,
      source: 'default' as ProfileSource,
      confidence_0_1: 0,
      last_updated_at: new Date().toISOString(),
    },
    axes: domain.axes.map((axisId) => ({
      axis_id: axisId,
      value_0_10: 5,
      source: 'default' as ProfileSource,
      confidence_0_1: 0,
      locked: false,
      learning_mode: 'normal' as LearningMode,
      estimates: {
        learned_score: 0,
        learned_value_float: 5,
      },
      evidence: {
        n_items_answered: 0,
        n_unsure: 0,
        top_driver_item_ids: [],
      },
    })),
  }));

  return {
    profile_version: PROFILE_VERSION,
    user_id: userId,
    updated_at: new Date().toISOString(),
    domains,
  };
}

// ===========================================
// Profile Updates from Scores
// ===========================================

/**
 * Update a blueprint profile with axis scores from the backend
 */
export function updateProfileFromScores(
  profile: BlueprintProfile,
  scores: AxisScore[]
): BlueprintProfile {
  const scoresMap: Record<string, AxisScore> = {};
  for (const score of scores) {
    scoresMap[score.axis_id] = score;
  }

  const updatedDomains = profile.domains.map((domain) => ({
    ...domain,
    axes: domain.axes.map((axis) => {
      const score = scoresMap[axis.axis_id];
      if (!score || score.n_answered === 0) {
        return axis;
      }

      // Map shrunk score from [-1, 1] to [0, 10]
      // shrunk = -1 means full poleA, +1 means full poleB
      // We want: -1 -> 0, 0 -> 5, +1 -> 10
      const learnedValueFloat = 5 - 5 * score.shrunk;
      let displayValue: number;

      // Apply learning mode
      if (axis.learning_mode === 'frozen') {
        displayValue = axis.value_0_10;
      } else if (axis.learning_mode === 'dampened' && axis.source === 'user_edited') {
        displayValue = Math.round(0.8 * axis.value_0_10 + 0.2 * learnedValueFloat);
      } else {
        displayValue = Math.round(learnedValueFloat);
      }

      return {
        ...axis,
        value_0_10: displayValue,
        confidence_0_1: score.confidence,
        source:
          axis.source === 'user_edited'
            ? axis.source
            : ('learned_from_swipes' as ProfileSource),
        estimates: {
          learned_score: score.shrunk,
          learned_value_float: learnedValueFloat,
        },
        evidence: {
          n_items_answered: score.n_answered,
          n_unsure: score.n_unsure,
          top_driver_item_ids: score.top_drivers,
        },
      };
    }),
  }));

  return {
    ...profile,
    updated_at: new Date().toISOString(),
    domains: updatedDomains,
  };
}

// ===========================================
// Scoring Functions
// ===========================================

/**
 * Score swipes using the backend API and update the store
 */
export async function scoreAndUpdateProfile(spec: Spec): Promise<void> {
  const { swipes, blueprintProfile, setBlueprintProfile, setAxisScores } =
    useUserStore.getState();

  if (swipes.length === 0) return;

  try {
    // Convert SwipeEvent[] to the format expected by the API
    const apiSwipes = swipes.map((s) => ({
      item_id: s.item_id,
      response: s.response,
    }));

    // Score using backend API
    const { scores } = await civicAxesApi.scoreResponses(apiSwipes);

    // Update axis scores in store
    setAxisScores(scores);

    // Update or create profile
    const baseProfile =
      blueprintProfile ?? createDefaultProfile(spec, 'prototype-user');
    const updatedProfile = updateProfileFromScores(baseProfile, scores);
    setBlueprintProfile(updatedProfile);
  } catch (error) {
    console.error('Failed to score responses:', error);
    throw error;
  }
}

/**
 * Initialize profile from a batch of swipes (e.g., after completing assessment)
 */
export async function initializeProfileFromSwipes(
  spec: Spec,
  newSwipes: Omit<SwipeEvent, 'timestamp'>[]
): Promise<void> {
  const { recordSwipes } = useUserStore.getState();

  // Record the swipes
  recordSwipes(newSwipes);

  // Score and update profile
  await scoreAndUpdateProfile(spec);
}
