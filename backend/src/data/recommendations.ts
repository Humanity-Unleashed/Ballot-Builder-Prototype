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
      contestId: CONTEST_IDS.GOVERNOR,
      recommendedCandidateId: 'cand_gov_jane_smith',
      confidence: 78,
      confidenceLevel: 'high',
      summary:
        "Based on your healthcare and climate priorities, this candidate's focus on universal healthcare and clean energy investment aligns well with your preferences.",
    },
    {
      contestId: CONTEST_IDS.STATE_SENATE_D10,
      recommendedCandidateId: 'cand_senate_maria_garcia',
      confidence: 82,
      confidenceLevel: 'high',
      summary:
        "Strong alignment with your housing and healthcare priorities. This candidate's rent control and healthcare expansion positions match your stated preferences.",
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
