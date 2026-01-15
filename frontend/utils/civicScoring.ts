import type { Spec, SwipeResponse } from './types';

export interface SwipeEvent {
  item_id: string;
  response: SwipeResponse;
}

export interface AxisScore {
  axis_id: string;
  raw_sum: number;
  n_answered: number;      // excludes 'unsure'
  n_unsure: number;
  normalized: number;      // [-1, +1]
  shrunk: number;          // [-1, +1] after shrinkage
  confidence: number;      // simple heuristic in [0,1)
  top_drivers: Array<{ item_id: string; contribution: number }>; // signed contributions
}

/**
 * Prototype scoring:
 * - maps responses to integers (-2,-1,+1,+2; unsure=0)
 * - multiplies by per-item axis key (+1 means Agree pushes toward poleA; -1 means Agree pushes toward poleB)
 * - normalizes by max possible given answered items
 * - applies shrinkage so early estimates aren’t overconfident
 */
export function scoreAxes(spec: Spec, swipes: SwipeEvent[]): Record<string, AxisScore> {
  const responseScale = spec.response_scale;
  const shrinkK = spec.scoring.shrinkage_k;

  const itemById = new Map(spec.items.map(i => [i.id, i]));

  // Initialize
  const axisScores: Record<string, AxisScore> = {};
  for (const axis of spec.axes) {
    axisScores[axis.id] = {
      axis_id: axis.id,
      raw_sum: 0,
      n_answered: 0,
      n_unsure: 0,
      normalized: 0,
      shrunk: 0,
      confidence: 0,
      top_drivers: []
    };
  }

  const contributions: Record<string, Array<{ item_id: string; contribution: number }>> = {};
  for (const axis of spec.axes) contributions[axis.id] = [];

  for (const s of swipes) {
    const item = itemById.get(s.item_id);
    if (!item) continue;

    const r = responseScale[s.response] ?? 0;

    for (const [axisId, key] of Object.entries(item.axis_keys)) {
      const axis = axisScores[axisId];
      if (!axis) continue;

      if (s.response === 'unsure') {
        axis.n_unsure += 1;
        continue;
      }

      const contrib = key * r;
      axis.raw_sum += contrib;
      axis.n_answered += 1;
      contributions[axisId].push({ item_id: item.id, contribution: contrib });
    }
  }

  for (const axisId of Object.keys(axisScores)) {
    const a = axisScores[axisId];
    if (a.n_answered > 0) {
      // Max absolute sum = 2 * n_answered
      a.normalized = a.raw_sum / (2 * a.n_answered);
      a.shrunk = a.normalized * (a.n_answered / (a.n_answered + shrinkK));
      a.confidence = a.n_answered / (a.n_answered + shrinkK);

      // Top drivers: largest absolute contributions
      a.top_drivers = contributions[axisId]
        .sort((x, y) => Math.abs(y.contribution) - Math.abs(x.contribution))
        .slice(0, 5);
    } else {
      a.normalized = 0;
      a.shrunk = 0;
      a.confidence = 0;
      a.top_drivers = [];
    }
  }

  return axisScores;
}
