/**
 * Ballot Ordering Service
 *
 * Determines the optimal order to present ballot items in conversation mode.
 * Prioritizes items where we need the most profile information, and puts
 * measures before candidate races as a tiebreaker.
 */

import type { BallotItem } from '@/lib/ballotHelpers';
import type { ProgressiveAxisValue } from '@/types/conversation';

/**
 * Score how much we already know about the axes relevant to an item.
 * Lower score = we know less = should present first.
 */
function computeKnowledgeScore(
  item: BallotItem,
  profile: Record<string, ProgressiveAxisValue>
): number {
  const relevant = item.relevantAxes || [];
  if (relevant.length === 0) return 0.5; // neutral if no axes mapped

  let knownCount = 0;
  for (const axisId of relevant) {
    const axis = profile[axisId];
    if (axis && axis.confidence > 0.3) {
      knownCount++;
    }
  }

  return knownCount / relevant.length; // 0 = know nothing, 1 = know everything
}

/**
 * Order ballot items for conversational presentation.
 * Items where we lack profile data come first.
 * Measures before candidate races as tiebreaker.
 */
export function orderBallotItems(
  items: BallotItem[],
  profile: Record<string, ProgressiveAxisValue>
): BallotItem[] {
  return [...items].sort((a, b) => {
    const scoreA = computeKnowledgeScore(a, profile);
    const scoreB = computeKnowledgeScore(b, profile);

    // Sort by knowledge score ascending (least known first)
    if (Math.abs(scoreA - scoreB) > 0.01) {
      return scoreA - scoreB;
    }

    // Tiebreaker: measures before candidate races
    if (a.type !== b.type) {
      return a.type === 'proposition' ? -1 : 1;
    }

    return 0;
  });
}
