import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { SwipeCard } from '../../components/SwipeCard';
import { ConfidenceGauge } from '../../components/ConfidenceGauge';
import statementsData from '../../data/statements.json';
import ballotData from '../../data/ballot.json';
import {
  Response,
  calculateUserVector,
  cosineSimilarity,
  similarityToConfidence,
} from '../../utils/scoring';

/**
 * Prototype Screen - Test the swipe functionality and confidence calculation
 */
export default function PrototypeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentStatement = statementsData.statements[currentIndex];
  const totalStatements = statementsData.statements.length;
  const progress = ((currentIndex + 1) / totalStatements) * 100;

  const handleSwipe = (direction: 'agree' | 'disagree') => {
    // Save response
    const newResponse: Response = {
      statementId: currentStatement.id,
      response: direction,
      vector: currentStatement.vector,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Move to next card or show results
    if (currentIndex < totalStatements - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setResponses([]);
    setShowResults(false);
  };

  // Calculate recommendations for results screen
  const getRecommendations = () => {
    const userVector = calculateUserVector(responses);

    return ballotData.ballot.map((item) => {
      if (item.type === 'candidate' && item.candidates) {
        // For candidates, find best match
        const candidateMatches = item.candidates.map((candidate) => {
          const similarity = cosineSimilarity(userVector, candidate.vector);
          const confidence = similarityToConfidence(similarity);
          return { ...candidate, confidence };
        });

        candidateMatches.sort((a, b) => b.confidence - a.confidence);

        return {
          ...item,
          topCandidate: candidateMatches[0],
          allCandidates: candidateMatches,
        };
      } else {
        // For measures
        const similarity = cosineSimilarity(userVector, item.vector || []);
        const confidence = similarityToConfidence(similarity);
        const recommendation = confidence > 50 ? 'Yes' : 'No';

        return {
          ...item,
          confidence,
          recommendation,
        };
      }
    });
  };

  if (showResults) {
    const recommendations = getRecommendations();

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Ballot Recommendations</Text>
            <Text style={styles.headerSubtitle}>
              Based on {responses.length} responses
            </Text>
          </View>

          {recommendations.map((item: any) => (
            <View key={item.id} style={styles.ballotItem}>
              <Text style={styles.ballotTitle}>{item.title}</Text>

              {item.type === 'candidate' ? (
                <>
                  <Text style={styles.recommendation}>
                    Recommended: {item.topCandidate.name}
                  </Text>
                  <ConfidenceGauge
                    confidence={item.topCandidate.confidence}
                    label="Match"
                  />
                  <View style={styles.candidatesList}>
                    {item.allCandidates.map((candidate: any) => (
                      <View key={candidate.name} style={styles.candidateRow}>
                        <Text style={styles.candidateName}>
                          {candidate.name} ({candidate.party})
                        </Text>
                        <Text style={styles.candidateConfidence}>
                          {candidate.confidence}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.description}>{item.description}</Text>
                  <Text style={styles.recommendation}>
                    Recommendation: Vote {item.recommendation}
                  </Text>
                  <ConfidenceGauge confidence={item.confidence} />
                  <View style={styles.outcomes}>
                    <Text style={styles.outcomeLabel}>If Yes:</Text>
                    <Text style={styles.outcomeText}>{item.outcomes.yes}</Text>
                    <Text style={styles.outcomeLabel}>If No:</Text>
                    <Text style={styles.outcomeText}>{item.outcomes.no}</Text>
                  </View>
                </>
              )}
            </View>
          ))}

          <View style={styles.resetButtonContainer}>
            <Text style={styles.resetButton} onPress={handleReset}>
              Start Over
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Build Your Civic Blueprint</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {totalStatements}
          </Text>
        </View>

        {/* Swipe Card */}
        <View style={styles.cardContainer}>
          <SwipeCard
            statement={currentStatement.text}
            category={currentStatement.category}
            onSwipe={handleSwipe}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  ballotItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ballotTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  recommendation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  candidatesList: {
    marginTop: 12,
  },
  candidateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  candidateName: {
    fontSize: 14,
    color: '#333',
  },
  candidateConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  outcomes: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  outcomeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  outcomeText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  resetButtonContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resetButton: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
});
