import type { Spec, Item, SwipeResponse } from '../types/civicAssessment';
import { scoreAxes, SwipeEvent, AxisScore } from './civicScoring';

interface AdaptiveState {
  answeredItems: Set<string>;
  axisScores: Record<string, AxisScore>;
  domainCoverage: Record<string, number>;
  totalQuestions: number;
  selectedDomains?: Set<string>;
}

/**
 * Get axes that belong to the selected domains
 */
function getAxesForDomains(spec: Spec, selectedDomains?: Set<string>): Set<string> {
  if (!selectedDomains || selectedDomains.size === spec.domains.length) {
    return new Set(spec.axes.map(a => a.id));
  }
  const axisIds = new Set<string>();
  spec.domains
    .filter(d => selectedDomains.has(d.id))
    .forEach(d => d.axes.forEach(axisId => axisIds.add(axisId)));
  return axisIds;
}

/**
 * Filter items to only those belonging to selected domains
 */
function filterItemsByDomains(items: Item[], spec: Spec, selectedDomains?: Set<string>): Item[] {
  if (!selectedDomains || selectedDomains.size === spec.domains.length) {
    return items;
  }
  const validAxes = getAxesForDomains(spec, selectedDomains);
  return items.filter(item => {
    const itemAxes = Object.keys(item.axis_keys);
    return itemAxes.some(axisId => validAxes.has(axisId));
  });
}

/**
 * Adaptive question selection algorithm
 * Selects the next most informative question based on current state
 */
export function selectNextQuestion(
  spec: Spec,
  swipes: SwipeEvent[],
  state: AdaptiveState,
  selectedDomains?: Set<string>
): Item | null {
  // Filter items by answered status and selected domains
  let availableItems = spec.items.filter(item => !state.answeredItems.has(item.id));
  availableItems = filterItemsByDomains(availableItems, spec, selectedDomains);

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
  selectedDomains?: Set<string>,
  targetConfidence: number = 0.7
): boolean {
  // Adjust min/max based on number of selected domains
  const numDomains = selectedDomains?.size || 5;
  const minQuestions = Math.max(8, Math.round(numDomains * 3));
  const maxQuestions = Math.max(15, Math.round(numDomains * 6));

  // Always ask at least minQuestions
  if (state.totalQuestions < minQuestions) {
    return false;
  }

  // Stop at maxQuestions regardless
  if (state.totalQuestions >= maxQuestions) {
    return true;
  }

  // Check if all relevant axes have sufficient confidence
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
export function initializeAdaptiveState(spec: Spec, selectedDomains?: Set<string>): AdaptiveState {
  const domainCoverage: Record<string, number> = {};
  const domainsToTrack = selectedDomains || new Set(spec.domains.map(d => d.id));
  spec.domains
    .filter(d => domainsToTrack.has(d.id))
    .forEach(domain => {
      domainCoverage[domain.id] = 0;
    });

  return {
    answeredItems: new Set(),
    axisScores: {},
    domainCoverage,
    totalQuestions: 0,
    selectedDomains,
  };
}

/**
 * Update adaptive state after a response
 */
export function updateAdaptiveState(
  spec: Spec,
  state: AdaptiveState,
  swipes: SwipeEvent[],
  lastItemId: string,
  selectedDomains?: Set<string>
): AdaptiveState {
  // Mark item as answered
  state.answeredItems.add(lastItemId);
  state.totalQuestions++;

  // Update domain coverage (only for selected domains)
  const item = spec.items.find(i => i.id === lastItemId);
  if (item) {
    const axisIds = Object.keys(item.axis_keys);
    axisIds.forEach(axisId => {
      const axis = spec.axes.find(a => a.id === axisId);
      if (axis && (!selectedDomains || selectedDomains.has(axis.domain_id))) {
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
  // Adjust min/max based on number of selected domains
  const numDomains = state.selectedDomains?.size || spec.domains.length;
  const minQ = Math.max(8, Math.round(numDomains * 3));
  const maxQ = Math.max(15, Math.round(numDomains * 6));
  const current = state.totalQuestions;

  // Estimate how many more questions we'll need
  let estimatedTotal = maxQ;

  if (current < minQ) {
    estimatedTotal = Math.max(minQ, current + Math.round(numDomains * 2));
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
  if (current < Math.round(numDomains * 2)) {
    strategy = 'Building your civic profile';
  } else if (current < Math.round(numDomains * 4)) {
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
