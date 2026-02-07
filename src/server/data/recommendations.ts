/**
 * Mock Recommendations
 *
 * Pre-computed alignment recommendations for prototype.
 * In production, these would be calculated based on user preferences.
 */

import type { MockRecommendation } from '../types';
import { BALLOT_IDS, CONTEST_IDS } from './ballot/ids';

export const mockRecommendations: Record<string, MockRecommendation[]> = {
  [BALLOT_IDS.SAMPLE]: [
    {
      contestId: CONTEST_IDS.MAYOR,
      recommendedCandidateId: 'martinez',
      confidence: 78,
      confidenceLevel: 'high',
      summary:
        "Based on your housing and climate priorities, this candidate's focus on affordable housing, transit expansion, and climate action aligns well with your preferences.",
    },
    {
      contestId: CONTEST_IDS.COUNCIL_D5,
      recommendedCandidateId: 'oconnor',
      confidence: 82,
      confidenceLevel: 'high',
      summary:
        "Strong alignment with your housing and tenant priorities. This candidate's rent stabilization and oversight positions match your stated preferences.",
    },
  ],
};

export function getRecommendationsForBallot(ballotId: string): MockRecommendation[] {
  return mockRecommendations[ballotId] || [];
}

export function getRecommendationForContest(
  ballotId: string,
  contestId: string
): MockRecommendation | null {
  const recs = mockRecommendations[ballotId] || [];
  return recs.find((r) => r.contestId === contestId) || null;
}
