import type { Spec, Item, SwipeResponse } from '../types/civicAssessment';
import { scoreAxes, SwipeEvent, AxisScore } from './civicScoring';

interface AdaptiveState {
  answeredItems: Set<string>;
  axisScores: Record<string, AxisScore>;
  domainCoverage: Record<string, number>;
  totalQuestions: number;
}

/**
 * Adaptive question selection algorithm
 * Selects the next most informative question based on current state
 */
export function selectNextQuestion(
  spec: Spec,
  swipes: SwipeEvent[],
  state: AdaptiveState
): Item | null {
  const availableItems = spec.items.filter(item => !state.answeredItems.has(item.id));

  if (availableItems.length === 0) {
    return null;
  }

  // Strategy 1: Early rounds - ensure domain coverage (first 10 questions)
  if (state.totalQuestions < 10) {
    const underrepresentedDomains = getUnderrepresentedDomains(spec, state);
    if (underrepresentedDomains.length > 0) {
      const item = selectItemFromDomains(availableItems, spec, underrepresentedDomains);
      if (item) return item;
    }
  }

  // Strategy 2: Mid rounds - target uncertain axes (questions 10-20)
  if (state.totalQuestions < 20) {
    const uncertainAxes = getUncertainAxes(state.axisScores);
    if (uncertainAxes.length > 0) {
      const item = selectItemForAxes(availableItems, uncertainAxes);
      if (item) return item;
    }
  }

  // Strategy 3: Late rounds - fill gaps and maximize information
  const item = selectMostInformativeItem(availableItems, state);
  return item || availableItems[0]; // Fallback to first available
}

/**
 * Check if we should stop early
 */
export function shouldStopEarly(
  state: AdaptiveState,
  minQuestions: number = 15,
  maxQuestions: number = 30,
  targetConfidence: number = 0.7
): boolean {
  // Always ask at least minQuestions
  if (state.totalQuestions < minQuestions) {
    return false;
  }

  // Stop at maxQuestions regardless
  if (state.totalQuestions >= maxQuestions) {
    return true;
  }

  // Check if all axes have sufficient confidence
  const axisScores = Object.values(state.axisScores);
  if (axisScores.length === 0) {
    return false;
  }

  const allAxisConfident = axisScores.every(score => {
    // Need at least 2 answers per axis
    if (score.n_answered < 2) return false;
    return score.confidence >= targetConfidence;
  });

  return allAxisConfident;
}

/**
 * Initialize adaptive state
 */
export function initializeAdaptiveState(spec: Spec): AdaptiveState {
  const domainCoverage: Record<string, number> = {};
  spec.domains.forEach(domain => {
    domainCoverage[domain.id] = 0;
  });

  return {
    answeredItems: new Set(),
    axisScores: {},
    domainCoverage,
    totalQuestions: 0,
  };
}

/**
 * Update adaptive state after a response
 */
export function updateAdaptiveState(
  spec: Spec,
  state: AdaptiveState,
  swipes: SwipeEvent[],
  lastItemId: string
): AdaptiveState {
  // Mark item as answered
  state.answeredItems.add(lastItemId);
  state.totalQuestions++;

  // Update domain coverage
  const item = spec.items.find(i => i.id === lastItemId);
  if (item) {
    const axisIds = Object.keys(item.axis_keys);
    axisIds.forEach(axisId => {
      const axis = spec.axes.find(a => a.id === axisId);
      if (axis) {
        state.domainCoverage[axis.domain_id] = (state.domainCoverage[axis.domain_id] || 0) + 1;
      }
    });
  }

  // Recalculate axis scores
  state.axisScores = scoreAxes(spec, swipes);

  return state;
}

// Helper functions

function getUnderrepresentedDomains(spec: Spec, state: AdaptiveState): string[] {
  const avgCoverage = Object.values(state.domainCoverage).reduce((a, b) => a + b, 0) / spec.domains.length;

  return spec.domains
    .filter(domain => state.domainCoverage[domain.id] < avgCoverage + 1)
    .map(d => d.id);
}

function selectItemFromDomains(items: Item[], spec: Spec, domainIds: string[]): Item | null {
  // Find items that belong to axes in the underrepresented domains
  const candidateItems = items.filter(item => {
    const axisIds = Object.keys(item.axis_keys);
    return axisIds.some(axisId => {
      const axis = spec.axes.find(a => a.id === axisId);
      return axis && domainIds.includes(axis.domain_id);
    });
  });

  if (candidateItems.length === 0) return null;

  // Prefer items that inform multiple axes
  candidateItems.sort((a, b) => {
    const aAxes = Object.keys(a.axis_keys).length;
    const bAxes = Object.keys(b.axis_keys).length;
    return bAxes - aAxes;
  });

  return candidateItems[0];
}

function getUncertainAxes(axisScores: Record<string, AxisScore>): string[] {
  return Object.entries(axisScores)
    .filter(([_, score]) => score.confidence < 0.7 || score.n_answered < 3)
    .map(([axisId, _]) => axisId);
}

function selectItemForAxes(items: Item[], axisIds: string[]): Item | null {
  const candidateItems = items.filter(item => {
    const itemAxes = Object.keys(item.axis_keys);
    return itemAxes.some(axisId => axisIds.includes(axisId));
  });

  if (candidateItems.length === 0) return null;

  // Prefer items that target multiple uncertain axes
  candidateItems.sort((a, b) => {
    const aMatches = Object.keys(a.axis_keys).filter(id => axisIds.includes(id)).length;
    const bMatches = Object.keys(b.axis_keys).filter(id => axisIds.includes(id)).length;
    return bMatches - aMatches;
  });

  return candidateItems[0];
}

function selectMostInformativeItem(items: Item[], state: AdaptiveState): Item | null {
  // Select items that:
  // 1. Inform axes with low confidence
  // 2. Cover multiple axes
  // 3. From domains with less coverage

  const scoredItems = items.map(item => {
    let score = 0;

    // Bonus for informing multiple axes
    const numAxes = Object.keys(item.axis_keys).length;
    score += numAxes * 2;

    // Bonus for targeting uncertain axes
    Object.keys(item.axis_keys).forEach(axisId => {
      const axisScore = state.axisScores[axisId];
      if (!axisScore || axisScore.n_answered < 3) {
        score += 3; // High priority for axes with few answers
      } else if (axisScore.confidence < 0.7) {
        score += 2; // Medium priority for low confidence
      }
    });

    // Small bonus for underrepresented domains
    // (not as important in late rounds)
    const avgDomainCoverage = Object.values(state.domainCoverage).reduce((a, b) => a + b, 0) / Object.keys(state.domainCoverage).length;
    Object.keys(item.axis_keys).forEach(axisId => {
      // Would need spec here to look up domain, skip for now
    });

    return { item, score };
  });

  scoredItems.sort((a, b) => b.score - a.score);
  return scoredItems[0]?.item || null;
}

/**
 * Get progress information for display
 */
export function getAdaptiveProgress(state: AdaptiveState, spec: Spec): {
  percentage: number;
  questionsAnswered: number;
  estimatedTotal: number;
  dominantStrategy: string;
} {
  const minQ = 15;
  const maxQ = 30;
  const current = state.totalQuestions;

  // Estimate how many more questions we'll need
  let estimatedTotal = maxQ;

  if (current < minQ) {
    estimatedTotal = Math.max(minQ, current + 10);
  } else {
    // Check confidence levels
    const axisScores = Object.values(state.axisScores);
    const avgConfidence = axisScores.length > 0
      ? axisScores.reduce((sum, s) => sum + s.confidence, 0) / axisScores.length
      : 0;

    if (avgConfidence > 0.7) {
      estimatedTotal = Math.min(current + 3, maxQ);
    } else {
      estimatedTotal = Math.min(current + 8, maxQ);
    }
  }

  let strategy = 'Exploring your civic values';
  if (current < 10) {
    strategy = 'Building your civic profile';
  } else if (current < 20) {
    strategy = 'Refining your positions';
  } else {
    strategy = 'Finalizing your blueprint';
  }

  return {
    percentage: Math.min((current / estimatedTotal) * 100, 100),
    questionsAnswered: current,
    estimatedTotal,
    dominantStrategy: strategy,
  };
}
