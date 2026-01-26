/**
 * Fine-Tuning Controller
 *
 * Handles fine-tuning operations for civic axis positions.
 * Fine-tuning allows users to specify more granular positions
 * on sub-dimensions within each axis.
 */

import { Request, Response } from 'express';
import {
  AxisFineTuningData,
  FineTuningSession,
  SubmitFineTuningRequest,
  SubmitFineTuningResponse,
  GetFineTuningResponse,
  SubDimensionResponse,
} from '../types';

// In-memory storage for fine-tuning sessions (for prototype)
// In production, this would be stored in a database
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
 *
 * POST /api/fine-tuning/submit
 */
export async function submitFineTuning(req: Request, res: Response): Promise<void> {
  try {
    const { axisId, responses } = req.body as SubmitFineTuningRequest;

    // Get or create session
    let sessionId = req.headers['x-fine-tuning-session'] as string;
    let session: FineTuningSession;

    if (sessionId && fineTuningSessions.has(sessionId)) {
      session = fineTuningSessions.get(sessionId)!;
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
    // Note: In a full implementation, we'd look up sub-dimension names from the spec
    const breakdown = responses.map((r) => {
      const score = ((r.position / 4) * 2) - 1; // Assuming 5 positions (0-4)
      return {
        subDimensionId: r.subDimensionId,
        name: r.subDimensionId.split('_').slice(-1)[0], // Simplified name extraction
        position: r.position,
        positionTitle: `Position ${r.position + 1}`, // Would come from spec in full impl
        score,
      };
    });

    const response: SubmitFineTuningResponse = {
      axisId,
      aggregatedScore,
      aggregatedValue_0_10: aggregatedValue,
      breakdown,
    };

    res.set('X-Fine-Tuning-Session', sessionId);
    res.json(response);
  } catch (error) {
    console.error('Error submitting fine-tuning:', error);
    res.status(500).json({ error: 'Failed to submit fine-tuning responses' });
  }
}

/**
 * Get fine-tuning session data.
 *
 * GET /api/fine-tuning/:sessionId
 */
export async function getFineTuningSession(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.params;

    const session = fineTuningSessions.get(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Fine-tuning session not found' });
      return;
    }

    const response: GetFineTuningResponse = {
      sessionId: session.id,
      axes: session.axes,
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting fine-tuning session:', error);
    res.status(500).json({ error: 'Failed to get fine-tuning session' });
  }
}

/**
 * Get fine-tuning data for a specific axis in a session.
 *
 * GET /api/fine-tuning/:sessionId/axis/:axisId
 */
export async function getAxisFineTuning(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId, axisId } = req.params;

    const session = fineTuningSessions.get(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Fine-tuning session not found' });
      return;
    }

    const axisData = session.axes[axisId];
    if (!axisData) {
      res.status(404).json({ error: 'No fine-tuning data for this axis' });
      return;
    }

    res.json(axisData);
  } catch (error) {
    console.error('Error getting axis fine-tuning:', error);
    res.status(500).json({ error: 'Failed to get axis fine-tuning data' });
  }
}

/**
 * Delete a fine-tuning session.
 *
 * DELETE /api/fine-tuning/:sessionId
 */
export async function deleteFineTuningSession(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.params;

    if (!fineTuningSessions.has(sessionId)) {
      res.status(404).json({ error: 'Fine-tuning session not found' });
      return;
    }

    fineTuningSessions.delete(sessionId);
    res.json({ message: 'Fine-tuning session deleted', sessionId });
  } catch (error) {
    console.error('Error deleting fine-tuning session:', error);
    res.status(500).json({ error: 'Failed to delete fine-tuning session' });
  }
}

/**
 * Clear fine-tuning data for a specific axis.
 *
 * DELETE /api/fine-tuning/:sessionId/axis/:axisId
 */
export async function clearAxisFineTuning(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId, axisId } = req.params;

    const session = fineTuningSessions.get(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Fine-tuning session not found' });
      return;
    }

    if (!session.axes[axisId]) {
      res.status(404).json({ error: 'No fine-tuning data for this axis' });
      return;
    }

    delete session.axes[axisId];
    session.updatedAt = new Date().toISOString();
    fineTuningSessions.set(sessionId, session);

    res.json({ message: 'Axis fine-tuning data cleared', axisId });
  } catch (error) {
    console.error('Error clearing axis fine-tuning:', error);
    res.status(500).json({ error: 'Failed to clear axis fine-tuning data' });
  }
}

/**
 * Get all fine-tuning sessions (for debugging/admin).
 *
 * GET /api/fine-tuning/sessions
 */
export async function listSessions(req: Request, res: Response): Promise<void> {
  try {
    const sessions = Array.from(fineTuningSessions.values()).map((s) => ({
      id: s.id,
      axisCount: Object.keys(s.axes).length,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    res.json({ sessions, total: sessions.length });
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
}
