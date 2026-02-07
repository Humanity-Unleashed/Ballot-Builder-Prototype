/**
 * Scoring utilities for the Ballot Builder prototype
 * These functions handle preference vector calculations and matching
 */

export interface Response {
  statementId: string;
  response: 'agree' | 'disagree';
  vector: number[];
}

/**
 * Calculates the user's preference vector from their responses
 * @param responses - Array of user responses with statement vectors
 * @returns Normalized preference vector
 */
export const calculateUserVector = (responses: Response[]): number[] => {
  if (responses.length === 0) {
    return [0, 0, 0, 0, 0]; // Neutral vector
  }

  // Start with zero vector
  const userVector = [0, 0, 0, 0, 0];

  // Accumulate responses
  responses.forEach(({ response, vector }) => {
    const multiplier = response === 'agree' ? 1 : -1;
    vector.forEach((val, idx) => {
      userVector[idx] += val * multiplier;
    });
  });

  // Average (normalize by count)
  userVector.forEach((_, idx) => {
    userVector[idx] /= responses.length;
  });

  return userVector;
};

/**
 * Calculates cosine similarity between two vectors
 * Returns value between -1 (opposite) and 1 (identical)
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Similarity score (-1 to 1)
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be the same length');
  }

  if (vecA.length === 0) {
    throw new Error('Vectors cannot be empty');
  }

  // Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Calculate magnitude of A
  let magnitudeA = 0;
  for (let i = 0; i < vecA.length; i++) {
    magnitudeA += vecA[i] * vecA[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);

  // Calculate magnitude of B
  let magnitudeB = 0;
  for (let i = 0; i < vecB.length; i++) {
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeB = Math.sqrt(magnitudeB);

  // Avoid division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Return cosine similarity
  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Converts cosine similarity (-1 to 1) to confidence percentage (0 to 100)
 * @param similarity - Cosine similarity score
 * @returns Confidence percentage (0-100)
 */
export const similarityToConfidence = (similarity: number): number => {
  // Convert from [-1, 1] to [0, 100]
  const confidence = ((similarity + 1) / 2) * 100;

  // Round to whole number
  return Math.round(confidence);
};

/**
 * Determines confidence level label based on percentage
 * @param confidence - Confidence percentage (0-100)
 * @returns Label describing confidence level
 */
export const getConfidenceLevel = (
  confidence: number
): 'low' | 'moderate' | 'high' => {
  if (confidence < 50) return 'low';
  if (confidence < 75) return 'moderate';
  return 'high';
};

/**
 * Gets color for confidence visualization
 * @param confidence - Confidence percentage (0-100)
 * @returns Hex color code
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence < 50) return '#FF3B30'; // Red
  if (confidence < 75) return '#FF9500'; // Orange
  return '#34C759'; // Green
};

/**
 * Calculates how many more responses are needed to reach target confidence
 * @param currentResponses - Number of responses so far
 * @param targetConfidence - Desired confidence level (0-100)
 * @returns Estimated number of additional responses needed
 */
export const responsesNeededForConfidence = (
  currentResponses: number,
  targetConfidence: number
): number => {
  // Simple heuristic: need roughly 10-15 responses for 50% confidence
  // and 20-30 for 75%+ confidence
  const targetResponses = targetConfidence < 50 ? 10 : targetConfidence < 75 ? 20 : 30;

  const needed = Math.max(0, targetResponses - currentResponses);
  return needed;
};
