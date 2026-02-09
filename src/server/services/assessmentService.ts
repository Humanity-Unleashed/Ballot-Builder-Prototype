/**
 * Assessment Service
 *
 * Handles assessment session management and adaptive question selection.
 * Implements the same adaptive algorithm as frontend/utils/adaptiveSelection.ts
 * but on the server side for session persistence and consistency.
 */

import { v4 as uuidv4 } from 'uuid';
import * as civicAxesData from '../data/civicAxes';
import type {
  AssessmentSession,
  AssessmentProgress,
  AdaptiveState,
  AxisScore,
  CivicItem,
  SwipeEvent,
  SwipeResponse,
} from '../types';

// ============================================
// In-Memory Session Storage
// ============================================

const sessions: Map<string, AssessmentSession> = new Map();

// ============================================
// Session Management
// ============================================

/**
 * Create a new assessment session
 */
export function createSession(
  selectedDomains?: string[],
  userId?: string
): AssessmentSession {
  const spec = civicAxesData.getSpec();
  const allDomainIds = spec.domains.map(d => d.id);
  const domains = selectedDomains && selectedDomains.length > 0
    ? selectedDomains.filter(id => allDomainIds.includes(id))
    : allDomainIds;

  // Initialize domain coverage
  const domainCoverage: Record<string, number> = {};
  for (const domainId of domains) {
    domainCoverage[domainId] = 0;
  }

  const session: AssessmentSession = {
    id: uuidv4(),
    userId,
    status: 'in_progress',
    selectedDomains: domains,
    adaptiveState: {
      answeredItems: [],
      axisScores: {},
      domainCoverage,
      totalQuestions: 0,
      selectedDomains: domains,
    },
    swipes: [],
    currentItemId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  sessions.set(session.id, session);
  return session;
}

/**
 * Get a session by ID
 */
export function getSession(sessionId: string): AssessmentSession | null {
  return sessions.get(sessionId) || null;
}

/**
 * Update a session
 */
export function updateSession(session: AssessmentSession): void {
  session.updatedAt = new Date().toISOString();
  sessions.set(session.id, session);
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

// ============================================
// Adaptive Question Selection
// ============================================

/**
 * Get axes that belong to the selected domains
 */
function getAxesForDomains(selectedDomains: string[]): Set<string> {
  const spec = civicAxesData.getSpec();
  if (selectedDomains.length === spec.domains.length) {
    return new Set(spec.axes.map(a => a.id));
  }

  const axisIds = new Set<string>();
  for (const domain of spec.domains) {
    if (selectedDomains.includes(domain.id)) {
      for (const axisId of domain.axes) {
        axisIds.add(axisId);
      }
    }
  }
  return axisIds;
}

/**
 * Filter items to only those belonging to selected domains
 */
function filterItemsByDomains(items: CivicItem[], selectedDomains: string[]): CivicItem[] {
  const spec = civicAxesData.getSpec();
  if (selectedDomains.length === spec.domains.length) {
    return items;
  }

  const validAxes = getAxesForDomains(selectedDomains);
  return items.filter(item => {
    const itemAxes = Object.keys(item.axis_keys);
    return itemAxes.some(axisId => validAxes.has(axisId));
  });
}

/**
 * Get underrepresented domains based on coverage
 */
function getUnderrepresentedDomains(
  domainCoverage: Record<string, number>,
  selectedDomains: string[]
): string[] {
  const coverageValues = Object.values(domainCoverage);
  const avgCoverage = coverageValues.length > 0
    ? coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length
    : 0;

  return selectedDomains.filter(domainId =>
    (domainCoverage[domainId] || 0) < avgCoverage + 1
  );
}

/**
 * Select an item from underrepresented domains
 */
function selectItemFromDomains(
  items: CivicItem[],
  domainIds: string[]
): CivicItem | null {
  const spec = civicAxesData.getSpec();

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

/**
 * Get axes with low confidence
 */
function getUncertainAxes(axisScores: Record<string, AxisScore>): string[] {
  return Object.entries(axisScores)
    .filter(([_, score]) => score.confidence < 0.7 || score.n_answered < 3)
    .map(([axisId]) => axisId);
}

/**
 * Select an item targeting uncertain axes
 */
function selectItemForAxes(items: CivicItem[], axisIds: string[]): CivicItem | null {
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

/**
 * Select the most informative item based on current state
 */
function selectMostInformativeItem(
  items: CivicItem[],
  axisScores: Record<string, AxisScore>
): CivicItem | null {
  if (items.length === 0) return null;

  const scoredItems = items.map(item => {
    let score = 0;

    // Bonus for informing multiple axes
    const numAxes = Object.keys(item.axis_keys).length;
    score += numAxes * 2;

    // Bonus for targeting uncertain axes
    for (const axisId of Object.keys(item.axis_keys)) {
      const axisScore = axisScores[axisId];
      if (!axisScore || axisScore.n_answered < 3) {
        score += 3; // High priority for axes with few answers
      } else if (axisScore.confidence < 0.7) {
        score += 2; // Medium priority for low confidence
      }
    }

    return { item, score };
  });

  scoredItems.sort((a, b) => b.score - a.score);
  return scoredItems[0]?.item || null;
}

/**
 * Select the next most informative question based on adaptive state
 */
export function selectNextQuestion(state: AdaptiveState): CivicItem | null {
  const spec = civicAxesData.getSpec();
  const answeredSet = new Set(state.answeredItems);

  // Filter items by answered status and selected domains
  let availableItems = spec.items.filter(item => !answeredSet.has(item.id));
  availableItems = filterItemsByDomains(availableItems, state.selectedDomains);

  if (availableItems.length === 0) {
    return null;
  }

  // Strategy 1: Early rounds - ensure domain coverage (first 10 questions)
  if (state.totalQuestions < 10) {
    const underrepresentedDomains = getUnderrepresentedDomains(
      state.domainCoverage,
      state.selectedDomains
    );
    if (underrepresentedDomains.length > 0) {
      const item = selectItemFromDomains(availableItems, underrepresentedDomains);
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
  const item = selectMostInformativeItem(availableItems, state.axisScores);
  return item || availableItems[0]; // Fallback to first available
}

/**
 * Check if we should stop the assessment early
 */
export function shouldStopEarly(
  state: AdaptiveState,
  targetConfidence: number = 0.7
): boolean {
  const numDomains = state.selectedDomains.length;
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

// ============================================
// State Updates
// ============================================

/**
 * Update adaptive state after a response
 */
export function updateStateWithResponse(
  state: AdaptiveState,
  itemId: string,
  _response: SwipeResponse
): AdaptiveState {
  const spec = civicAxesData.getSpec();
  const item = civicAxesData.getItemById(itemId);

  if (!item) {
    return state;
  }

  // Mark item as answered
  state.answeredItems.push(itemId);
  state.totalQuestions++;

  // Update domain coverage
  const axisIds = Object.keys(item.axis_keys);
  for (const axisId of axisIds) {
    const axis = spec.axes.find(a => a.id === axisId);
    if (axis && state.selectedDomains.includes(axis.domain_id)) {
      state.domainCoverage[axis.domain_id] = (state.domainCoverage[axis.domain_id] || 0) + 1;
    }
  }

  return state;
}

/**
 * Update adaptive state with new scores from scoring
 */
export function updateStateWithScores(
  state: AdaptiveState,
  scores: AxisScore[]
): AdaptiveState {
  const scoresMap: Record<string, AxisScore> = {};
  for (const score of scores) {
    scoresMap[score.axis_id] = score;
  }
  state.axisScores = scoresMap;
  return state;
}

// ============================================
// Progress Calculation
// ============================================

/**
 * Calculate progress information for display
 */
export function getProgress(state: AdaptiveState): AssessmentProgress {
  const numDomains = state.selectedDomains.length;
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

// ============================================
// Session Operations
// ============================================

/**
 * Start a new assessment and get the first question
 */
export function startAssessment(
  selectedDomains?: string[],
  userId?: string
): { session: AssessmentSession; firstQuestion: CivicItem | null } {
  const session = createSession(selectedDomains, userId);
  const firstQuestion = selectNextQuestion(session.adaptiveState);

  if (firstQuestion) {
    session.currentItemId = firstQuestion.id;
    updateSession(session);
  }

  return { session, firstQuestion };
}

/**
 * Submit an answer and get the next question
 */
export function submitAnswer(
  sessionId: string,
  itemId: string,
  response: SwipeResponse
): {
  session: AssessmentSession;
  nextQuestion: CivicItem | null;
  scores: AxisScore[];
  isComplete: boolean;
} | null {
  const session = getSession(sessionId);
  if (!session || session.status !== 'in_progress') {
    return null;
  }

  // Record the swipe
  const swipe: SwipeEvent = {
    item_id: itemId,
    response,
    timestamp: new Date().toISOString(),
  };
  session.swipes.push(swipe);

  // Update adaptive state
  updateStateWithResponse(session.adaptiveState, itemId, response);

  // Score all responses
  const scores = civicAxesData.scoreAxes(session.swipes.map(s => ({
    item_id: s.item_id,
    response: s.response,
  })));
  updateStateWithScores(session.adaptiveState, scores);

  // Check if we should stop
  const shouldStop = shouldStopEarly(session.adaptiveState);
  let nextQuestion: CivicItem | null = null;

  if (!shouldStop) {
    nextQuestion = selectNextQuestion(session.adaptiveState);
  }

  // Update session status
  if (shouldStop || !nextQuestion) {
    session.status = 'completed';
    session.currentItemId = null;
  } else {
    session.currentItemId = nextQuestion.id;
  }

  updateSession(session);

  return {
    session,
    nextQuestion,
    scores,
    isComplete: session.status === 'completed',
  };
}

/**
 * Complete an assessment session
 */
export function completeAssessment(
  sessionId: string,
  _saveToProfile: boolean = false
): { session: AssessmentSession; finalScores: AxisScore[] } | null {
  const session = getSession(sessionId);
  if (!session) {
    return null;
  }

  session.status = 'completed';
  session.currentItemId = null;
  updateSession(session);

  const finalScores = civicAxesData.scoreAxes(session.swipes.map(s => ({
    item_id: s.item_id,
    response: s.response,
  })));

  // TODO: If saveToProfile is true and userId exists, save to user's profile
  // This would require a user profile service

  return { session, finalScores };
}

/**
 * Get current question for a session
 */
export function getCurrentQuestion(sessionId: string): CivicItem | null {
  const session = getSession(sessionId);
  if (!session || !session.currentItemId) {
    return null;
  }
  return civicAxesData.getItemById(session.currentItemId);
}

/**
 * Get scores for a session
 */
export function getSessionScores(sessionId: string): AxisScore[] {
  const session = getSession(sessionId);
  if (!session || session.swipes.length === 0) {
    return [];
  }

  return civicAxesData.scoreAxes(session.swipes.map(s => ({
    item_id: s.item_id,
    response: s.response,
  })));
}
