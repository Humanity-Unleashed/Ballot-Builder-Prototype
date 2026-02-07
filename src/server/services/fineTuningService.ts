/**
 * Fine-Tuning Service
 *
 * Business logic for fine-tuning civic axis positions.
 * Ported from backend/src/controllers/fineTuningController.ts
 */

import type {
  FineTuningSession,
  AxisFineTuningData,
  SubDimensionResponse,
  SubmitFineTuningRequest,
  SubmitFineTuningResponse,
} from '../types';

// In-memory storage for fine-tuning sessions (prototype)
const fineTuningSessions: Map<string, FineTuningSession> = new Map();

/**
 * Calculate aggregated score from fine-tuning responses.
 * Each position (0-4) maps to a score (-1 to +1).
 */
function calculateAggregatedScore(positions: number[], totalPositions: number = 5): number {
  if (positions.length === 0) return 0;
  const scores = positions.map((pos) => ((pos / (totalPositions - 1)) * 2) - 1);
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return sum / scores.length;
}

/**
 * Convert aggregated score (-1 to +1) to 0-10 scale.
 */
function scoreToValue010(score: number): number {
  return Math.round(5 - 5 * score);
}

/**
 * Generate a unique session ID.
 */
function generateSessionId(): string {
  return `ft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Submit fine-tuning responses for an axis.
 */
export function submitFineTuning(
  data: SubmitFineTuningRequest,
  existingSessionId?: string | null
): { response: SubmitFineTuningResponse; sessionId: string } {
  const { axisId, responses } = data;

  // Get or create session
  let sessionId: string;
  let session: FineTuningSession;

  if (existingSessionId && fineTuningSessions.has(existingSessionId)) {
    sessionId = existingSessionId;
    session = fineTuningSessions.get(existingSessionId)!;
  } else {
    sessionId = generateSessionId();
    session = {
      id: sessionId,
      axes: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Process responses
  const now = new Date().toISOString();
  const subDimensionResponses: SubDimensionResponse[] = responses.map((r) => ({
    subDimensionId: r.subDimensionId,
    position: r.position,
    timestamp: now,
  }));

  // Calculate aggregated score
  const positions = responses.map((r) => r.position);
  const aggregatedScore = calculateAggregatedScore(positions);
  const aggregatedValue = scoreToValue010(aggregatedScore);

  // Store axis fine-tuning data
  const axisData: AxisFineTuningData = {
    axisId,
    responses: subDimensionResponses,
    aggregatedScore,
    aggregatedValue_0_10: aggregatedValue,
    completedAt: now,
  };

  session.axes[axisId] = axisData;
  session.updatedAt = now;
  fineTuningSessions.set(sessionId, session);

  // Build breakdown response
  const breakdown = responses.map((r) => {
    const score = ((r.position / 4) * 2) - 1;
    return {
      subDimensionId: r.subDimensionId,
      name: r.subDimensionId.split('_').slice(-1)[0],
      position: r.position,
      positionTitle: `Position ${r.position + 1}`,
      score,
    };
  });

  const response: SubmitFineTuningResponse = {
    axisId,
    aggregatedScore,
    aggregatedValue_0_10: aggregatedValue,
    breakdown,
  };

  return { response, sessionId };
}

/**
 * Get a fine-tuning session by ID.
 */
export function getFineTuningSession(sessionId: string): FineTuningSession | null {
  return fineTuningSessions.get(sessionId) || null;
}

/**
 * Get fine-tuning data for a specific axis in a session.
 */
export function getFineTuningAxisData(
  sessionId: string,
  axisId: string
): AxisFineTuningData | null {
  const session = fineTuningSessions.get(sessionId);
  if (!session) return null;
  return session.axes[axisId] || null;
}

/**
 * Delete a fine-tuning session.
 */
export function deleteFineTuningSession(sessionId: string): boolean {
  return fineTuningSessions.delete(sessionId);
}

/**
 * List all fine-tuning sessions (admin/debug).
 */
export function listFineTuningSessions(): {
  sessions: Array<{
    id: string;
    axisCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
} {
  const sessions = Array.from(fineTuningSessions.values()).map((s) => ({
    id: s.id,
    axisCount: Object.keys(s.axes).length,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return { sessions, total: sessions.length };
}
