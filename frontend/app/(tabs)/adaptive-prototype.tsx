import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { SwipeCard } from '../../components/SwipeCard';
import { ConfidenceGauge } from '../../components/ConfidenceGauge';
import { adaptiveFlowApi, ballotApi, AdaptiveStatement, BallotItem } from '../../services/api';
import {
  Response,
  calculateUserVector,
  cosineSimilarity,
  similarityToConfidence,
} from '../../utils/scoring';

/**
 * Adaptive Prototype Screen
 * Questions adapt based on user responses, becoming more specific over time
 */
export default function AdaptivePrototypeScreen() {
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveStatement | null>(null);
  const [ballotItems, setBallotItems] = useState<BallotItem[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {   
      setIsLoading(true);
      setError(null);
      const [startResult, ballotData] = await Promise.all([
        adaptiveFlowApi.getStart(),
        ballotApi.getDefault(),
      ]);
      if (startResult.statement) {
        setCurrentQuestion(startResult.statement);
      }
      setBallotItems(ballotData.items);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction: 'agree' | 'disagree') => {
    if (!currentQuestion) return;

    // Save response
    const newResponse: Response = {
      statementId: currentQuestion.id,
      response: direction,
      vector: currentQuestion.vector,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);
    setQuestionsAnswered(questionsAnswered + 1);

    try {
      // Get next question from API
      const apiResponse = direction === 'agree' ? 'approve' : 'disapprove';
      const result = await adaptiveFlowApi.getNext(currentQuestion.id, apiResponse);

      // Check if we're done
      if (result.complete || !result.statement) {
        setShowResults(true);
        return;
      }

      // Show transition message if exists
      if (result.transitionText) {
        setTransitionMessage(result.transitionText);
        setShowTransition(true);

        // After 1.5 seconds, hide transition and show next question
        setTimeout(() => {
          setShowTransition(false);
          setCurrentQuestion(result.statement!);
        }, 1500);
      } else {
        // Go straight to next question
        setCurrentQuestion(result.statement);
      }
    } catch (err) {
      console.error('Failed to get next question:', err);
      setShowResults(true);
    }
  };

  const handleReset = async () => {
    setResponses([]);
    setShowResults(false);
    setQuestionsAnswered(0);
    // Reload the starting question
    try {
      const result = await adaptiveFlowApi.getStart();
      if (result.statement) {
        setCurrentQuestion(result.statement);
      }
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  // Calculate recommendations
  const getRecommendations = () => {
    const userVector = calculateUserVector(responses);

    return ballotItems.map((item) => {
      if (item.type === 'candidate' && item.candidates) {
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
      } else if (item.type === 'measure') {
        const similarity = cosineSimilarity(userVector, item.vector || []);
        const confidence = similarityToConfidence(similarity);
        const recommendation = confidence > 50 ? 'Yes' : 'No';

        return {
          ...item,
          confidence,
          recommendation,
        };
      } else {
        return item;
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3AAFA9" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Transition Modal
  if (showTransition) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.transitionContainer}>
          <View style={styles.transitionCard}>
            <Text style={styles.transitionEmoji}>💡</Text>
            <Text style={styles.transitionText}>{transitionMessage}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Results Screen
  if (showResults) {
    const recommendations = getRecommendations();

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Ballot Recommendations</Text>
            <Text style={styles.headerSubtitle}>
              Based on {responses.length} adaptive responses
            </Text>
            <View style={styles.adaptiveBadge}>
              <Text style={styles.adaptiveBadgeText}>
                ✨ Personalized to your views
              </Text>
            </View>
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

  // Main Swipe Screen
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text>Error loading questions</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with round info */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🧭 Adaptive Civic Blueprint</Text>
          <View style={styles.roundBadge}>
            <Text style={styles.roundBadgeText}>
              Round {currentQuestion.round} • {questionsAnswered} answered
            </Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Questions adapt based on your responses
          </Text>
        </View>

        {/* Swipe Card */}
        <View style={styles.cardContainer}>
          <SwipeCard
            key={currentQuestion.id}
            statement={currentQuestion.text}
            category={currentQuestion.category}
            onSwipe={handleSwipe}
          />
        </View>

        {/* Progress hint */}
        <View style={styles.progressHint}>
          <Text style={styles.progressHintText}>
            {currentQuestion.round === 1 && '📊 Exploring broad topics...'}
            {currentQuestion.round === 2 && '🔍 Diving deeper into your interests...'}
            {currentQuestion.round === 3 && '🎯 Fine-tuning your blueprint...'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  roundBadge: {
    backgroundColor: '#3AAFA9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  roundBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  adaptiveBadge: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  adaptiveBadgeText: {
    color: '#B8860B',
    fontSize: 13,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressHint: {
    padding: 20,
    alignItems: 'center',
  },
  progressHintText: {
    fontSize: 14,
    color: '#3AAFA9',
    fontWeight: '500',
  },
  transitionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  transitionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  transitionEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  transitionText: {
    fontSize: 18,
    color: '#3AAFA9',
    textAlign: 'center',
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
