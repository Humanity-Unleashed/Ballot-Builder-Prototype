import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import civicSpec from '../../data/civic_axes_spec_v1.json';
import { scoreAxes, SwipeEvent, AxisScore } from '../../utils/civicScoring';
import {
  selectNextQuestion,
  shouldStopEarly,
  initializeAdaptiveState,
  updateAdaptiveState,
  getAdaptiveProgress,
} from '../../utils/adaptiveSelection';
import type { Spec, Item, SwipeResponse } from '../../types/civicAssessment';

type Direction = 'strong_agree' | 'agree' | 'disagree' | 'strong_disagree' | 'unsure';

export default function AdaptiveCivicAssessmentScreen() {
  const spec = civicSpec as Spec;
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [swipes, setSwipes] = useState<SwipeEvent[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [axisScores, setAxisScores] = useState<Record<string, AxisScore>>({});
  const [adaptiveState, setAdaptiveState] = useState(() => initializeAdaptiveState(spec));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  // Select first question on mount
  useEffect(() => {
    const firstItem = selectNextQuestion(spec, [], adaptiveState);
    setCurrentItem(firstItem);
  }, []);

  const progress = getAdaptiveProgress(adaptiveState, spec);

  const handleResponse = (response: SwipeResponse) => {
    if (!currentItem) return;

    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Record the swipe
      const newSwipe: SwipeEvent = {
        item_id: currentItem.id,
        response,
      };
      const updatedSwipes = [...swipes, newSwipe];
      setSwipes(updatedSwipes);

      // Update adaptive state
      const newState = updateAdaptiveState(spec, { ...adaptiveState }, updatedSwipes, currentItem.id);
      setAdaptiveState(newState);

      // Check if we should stop
      if (shouldStopEarly(newState)) {
        const scores = scoreAxes(spec, updatedSwipes);
        setAxisScores(scores);
        setShowResults(true);
        return;
      }

      // Select next question
      const nextItem = selectNextQuestion(spec, updatedSwipes, newState);

      if (!nextItem) {
        // No more questions available
        const scores = scoreAxes(spec, updatedSwipes);
        setAxisScores(scores);
        setShowResults(true);
        return;
      }

      // Show transition message at certain milestones
      const shouldShowTransition = checkForTransition(newState);
      if (shouldShowTransition) {
        setTransitionMessage(shouldShowTransition);
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
          setCurrentItem(nextItem);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }, 1500);
      } else {
        setCurrentItem(nextItem);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  if (showResults) {
    return <ResultsScreen spec={spec} axisScores={axisScores} swipes={swipes} />;
  }

  if (showTransition) {
    return (
      <View style={styles.transitionContainer}>
        <Ionicons name="bulb" size={64} color="#4CAF50" />
        <Text style={styles.transitionText}>{transitionMessage}</Text>
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Adaptive Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressStrategy}>{progress.dominantStrategy}</Text>
          <Text style={styles.progressCount}>
            {progress.questionsAnswered} / ~{progress.estimatedTotal}
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
        </View>
        <Text style={styles.progressHint}>
          We adapt based on your responses • Usually 15-30 questions
        </Text>
      </View>

      {/* Card */}
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          {/* Level Badge */}
          <View style={[styles.levelBadge, getLevelBadgeStyle(currentItem.level)]}>
            <Text style={styles.levelText}>{currentItem.level.toUpperCase()}</Text>
          </View>

          {/* Statement */}
          <Text style={styles.statementText}>{currentItem.text}</Text>

          {/* Tradeoff */}
          {currentItem.tradeoff && (
            <View style={styles.tradeoffContainer}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
              <Text style={styles.tradeoffText}>{currentItem.tradeoff}</Text>
            </View>
          )}

          {/* Response Buttons */}
          <View style={styles.responseContainer}>
            <TouchableOpacity
              style={[styles.responseButton, styles.strongDisagreeButton]}
              onPress={() => handleResponse('strong_disagree')}
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
              <Text style={styles.responseButtonText}>Strongly{'\n'}Disagree</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.responseButton, styles.disagreeButton]}
              onPress={() => handleResponse('disagree')}
            >
              <Ionicons name="close" size={28} color="#fff" />
              <Text style={styles.responseButtonText}>Disagree</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.responseButton, styles.unsureButton]}
              onPress={() => handleResponse('unsure')}
            >
              <Ionicons name="help" size={24} color="#666" />
              <Text style={[styles.responseButtonText, { color: '#666' }]}>Unsure</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.responseButton, styles.agreeButton]}
              onPress={() => handleResponse('agree')}
            >
              <Ionicons name="checkmark" size={28} color="#fff" />
              <Text style={styles.responseButtonText}>Agree</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.responseButton, styles.strongAgreeButton]}
              onPress={() => handleResponse('strong_agree')}
            >
              <Ionicons name="checkmark-circle" size={32} color="#fff" />
              <Text style={styles.responseButtonText}>Strongly{'\n'}Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Domain Context */}
      <View style={styles.domainContext}>
        <Text style={styles.domainTitle}>
          {getDomainForItem(spec, currentItem)?.name || 'Policy Statement'}
        </Text>
        <Text style={styles.domainSubtext}>
          Questions adapt based on your responses
        </Text>
      </View>
    </View>
  );
}

function checkForTransition(state: any): string | null {
  const q = state.totalQuestions;

  if (q === 5) {
    return "Great start! Now we're diving deeper into your views...";
  } else if (q === 10) {
    return "You're halfway there! Refining your civic profile...";
  } else if (q === 15) {
    return "Almost done! Just a few more to perfect your blueprint...";
  }

  return null;
}

function ResultsScreen({
  spec,
  axisScores,
  swipes,
}: {
  spec: Spec;
  axisScores: Record<string, AxisScore>;
  swipes: SwipeEvent[];
}) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Group axes by domain
  const domainAxes = spec.domains.map(domain => ({
    domain,
    axes: domain.axes.map(axisId => ({
      axis: spec.axes.find(a => a.id === axisId)!,
      score: axisScores[axisId],
    })),
  }));

  return (
    <ScrollView style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Ionicons name="sparkles" size={48} color="#4CAF50" />
        <Text style={styles.resultsTitle}>Your Adaptive Civic Blueprint</Text>
        <Text style={styles.resultsSubtitle}>
          Created from {swipes.length} intelligently selected questions
        </Text>
      </View>

      {/* Efficiency Stats */}
      <View style={styles.efficiencyCard}>
        <View style={styles.efficiencyRow}>
          <View style={styles.efficiencyStat}>
            <Text style={styles.efficiencyNumber}>{swipes.length}</Text>
            <Text style={styles.efficiencyLabel}>Questions</Text>
          </View>
          <View style={styles.efficiencyStat}>
            <Text style={styles.efficiencyNumber}>
              {Object.values(axisScores).filter(s => s.confidence >= 0.7).length}
            </Text>
            <Text style={styles.efficiencyLabel}>High Confidence Axes</Text>
          </View>
          <View style={styles.efficiencyStat}>
            <Text style={styles.efficiencyNumber}>
              {Math.round(
                (Object.values(axisScores).reduce((sum, s) => sum + s.confidence, 0) /
                  Object.keys(axisScores).length) *
                  100
              )}
              %
            </Text>
            <Text style={styles.efficiencyLabel}>Avg Confidence</Text>
          </View>
        </View>
        <Text style={styles.efficiencyHint}>
          Adaptive selection saved you ~{90 - swipes.length} questions!
        </Text>
      </View>

      {domainAxes.map(({ domain, axes }) => (
        <View key={domain.id} style={styles.domainCard}>
          <TouchableOpacity
            onPress={() => setSelectedDomain(selectedDomain === domain.id ? null : domain.id)}
          >
            <View style={styles.domainHeader}>
              <View>
                <Text style={styles.domainName}>{domain.name}</Text>
                <Text style={styles.domainWhy}>{domain.why}</Text>
              </View>
              <Ionicons
                name={selectedDomain === domain.id ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#666"
              />
            </View>
          </TouchableOpacity>

          {selectedDomain === domain.id && (
            <View style={styles.axesContainer}>
              {axes.map(({ axis, score }) => (
                <View key={axis.id} style={styles.axisCard}>
                  <Text style={styles.axisName}>{axis.name}</Text>
                  <Text style={styles.axisDescription}>{axis.description}</Text>

                  {/* Axis Spectrum Visualization */}
                  <View style={styles.spectrumContainer}>
                    <View style={styles.spectrumLabels}>
                      <Text style={styles.poleLabel}>{axis.poleA.label}</Text>
                      <Text style={styles.poleLabel}>{axis.poleB.label}</Text>
                    </View>
                    <View style={styles.spectrumBar}>
                      <View style={styles.spectrumMidpoint} />
                      {score && (
                        <View
                          style={[
                            styles.spectrumIndicator,
                            {
                              left: `${((score.shrunk + 1) / 2) * 100}%`,
                              opacity: Math.max(score.confidence, 0.3),
                            },
                          ]}
                        />
                      )}
                    </View>
                  </View>

                  {/* Confidence & Stats */}
                  {score && (
                    <>
                      <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Confidence</Text>
                          <Text style={styles.statValue}>{Math.round(score.confidence * 100)}%</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Answered</Text>
                          <Text style={styles.statValue}>{score.n_answered}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Unsure</Text>
                          <Text style={styles.statValue}>{score.n_unsure}</Text>
                        </View>
                      </View>

                      {/* Interpretation */}
                      <View style={styles.interpretationBox}>
                        <Text style={styles.interpretationTitle}>Your Position:</Text>
                        <Text style={styles.interpretationText}>
                          {getInterpretation(axis, score)}
                        </Text>
                      </View>
                    </>
                  )}

                  {!score && (
                    <Text style={styles.noDataText}>
                      Not enough data to determine position on this axis
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.ballotPreview}>
        <Ionicons name="ballot" size={32} color="#2196F3" />
        <Text style={styles.ballotPreviewTitle}>Ready for Ballot Matching</Text>
        <Text style={styles.ballotPreviewText}>
          Your adaptive civic blueprint efficiently captured your priorities and can now match you
          with candidates and ballot measures.
        </Text>
      </View>
    </ScrollView>
  );
}

function getDomainForItem(spec: Spec, item: Item) {
  const axisId = Object.keys(item.axis_keys)[0];
  const axis = spec.axes.find(a => a.id === axisId);
  if (!axis) return null;
  return spec.domains.find(d => d.id === axis.domain_id);
}

function getInterpretation(axis: any, score: AxisScore): string {
  if (score.n_answered < 2) {
    return 'Not enough responses to determine position';
  }

  if (Math.abs(score.shrunk) < 0.2) {
    return 'You appear to be balanced between both perspectives on this issue.';
  }

  if (score.shrunk > 0) {
    return axis.poleA.interpretation;
  } else {
    return axis.poleB.interpretation;
  }
}

function getLevelBadgeStyle(level: string) {
  switch (level) {
    case 'local':
      return { backgroundColor: '#4CAF50' };
    case 'state':
      return { backgroundColor: '#2196F3' };
    case 'national':
      return { backgroundColor: '#9C27B0' };
    case 'international':
      return { backgroundColor: '#FF5722' };
    default:
      return { backgroundColor: '#757575' };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transitionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 40,
  },
  transitionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginTop: 24,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStrategy: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  progressCount: {
    fontSize: 14,
    color: '#666',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  levelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statementText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#212121',
    marginBottom: 16,
  },
  tradeoffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  tradeoffText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  responseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  responseButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strongDisagreeButton: {
    backgroundColor: '#D32F2F',
  },
  disagreeButton: {
    backgroundColor: '#F57C00',
  },
  unsureButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  agreeButton: {
    backgroundColor: '#388E3C',
  },
  strongAgreeButton: {
    backgroundColor: '#1976D2',
  },
  responseButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
  domainContext: {
    marginTop: 16,
    alignItems: 'center',
  },
  domainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  domainSubtext: {
    fontSize: 13,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  resultsHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginTop: 16,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  efficiencyCard: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
  },
  efficiencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  efficiencyStat: {
    alignItems: 'center',
  },
  efficiencyNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
  },
  efficiencyLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  efficiencyHint: {
    fontSize: 13,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '500',
  },
  domainCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  domainName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  domainWhy: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  axesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  axisCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  axisName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  axisDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  spectrumContainer: {
    marginVertical: 16,
  },
  spectrumLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  poleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  spectrumBar: {
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    position: 'relative',
  },
  spectrumMidpoint: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#999',
  },
  spectrumIndicator: {
    position: 'absolute',
    top: 4,
    width: 24,
    height: 24,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
    marginLeft: -12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  interpretationBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  interpretationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  interpretationText: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 18,
  },
  noDataText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  ballotPreview: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  ballotPreviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
  },
  ballotPreviewText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
