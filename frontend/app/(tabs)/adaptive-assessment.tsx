import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { civicAxesApi, AxisScore, SwipeEvent } from '../../services/api';
import {
  selectNextQuestion,
  shouldStopEarly,
  initializeAdaptiveState,
  updateAdaptiveStateBasic,
  updateAdaptiveStateWithScores,
  getAdaptiveProgress,
} from '../../utils/adaptiveSelection';
import { useBlueprint } from '@/context/BlueprintContext';
import type { Spec, Item, SwipeResponse } from '../../types/civicAssessment';

type AssessmentMode = 'intro' | 'assessment' | 'results';

export default function AdaptiveCivicAssessmentScreen() {
  const [spec, setSpec] = useState<Spec | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { initializeFromSwipes } = useBlueprint();
  const [mode, setMode] = useState<AssessmentMode>('intro');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [swipes, setSwipes] = useState<SwipeEvent[]>([]);
  const [axisScores, setAxisScores] = useState<Record<string, AxisScore>>({});
  const [adaptiveState, setAdaptiveState] = useState<ReturnType<typeof initializeAdaptiveState> | null>(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Fetch spec from backend on mount
  useEffect(() => {
    async function loadSpec() {
      try {
        setIsLoading(true);
        const specData = await civicAxesApi.getSpec();
        setSpec(specData);
        setSelectedDomains(new Set(specData.domains.map(d => d.id)));
        setAdaptiveState(initializeAdaptiveState(specData));
        setError(null);
      } catch (err) {
        console.error('Failed to load civic axes spec:', err);
        setError('Failed to load assessment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    loadSpec();
  }, []);

  // Start assessment with selected domains
  const startAssessment = (domains: Set<string>) => {
    if (!spec) return;
    setSelectedDomains(domains);
    const firstItem = selectNextQuestion(spec, [], adaptiveState, domains);
    setCurrentItem(firstItem);
    setMode('assessment');
  };

  const progress = spec && adaptiveState ? getAdaptiveProgress(adaptiveState, spec) : null;

  const handleResponse = async (response: SwipeResponse) => {
    if (!currentItem || !spec || !adaptiveState) return;

    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      // Record the swipe
      const newSwipe: SwipeEvent = {
        item_id: currentItem.id,
        response,
      };
      const updatedSwipes = [...swipes, newSwipe];
      setSwipes(updatedSwipes);

      // Update adaptive state (basic update without scoring)
      let newState = updateAdaptiveStateBasic(spec, { ...adaptiveState }, currentItem.id, selectedDomains);

<<<<<<< HEAD
      // Get scores from backend API
      try {
        const scoreResponse = await civicAxesApi.scoreResponses(updatedSwipes);
        newState = updateAdaptiveStateWithScores(newState, scoreResponse.scores);
        setAdaptiveState(newState);
=======
      // Check if we should stop
      if (shouldStopEarly(newState, selectedDomains)) {
        const scores = scoreAxes(spec, updatedSwipes);
        setAxisScores(scores);
        // Save swipes to BlueprintContext for use in Blueprint and Ballot Builder
        initializeFromSwipes(updatedSwipes);
        setMode('results');
        return;
      }
>>>>>>> prototype/web-app

        // Convert scores array to record for component state
        const scoresRecord: Record<string, AxisScore> = {};
        for (const score of scoreResponse.scores) {
          scoresRecord[score.axis_id] = score;
        }

<<<<<<< HEAD
        // Check if we should stop
        if (shouldStopEarly(newState, selectedDomains)) {
          setAxisScores(scoresRecord);
          setMode('results');
          return;
        }

        // Select next question
        const nextItem = selectNextQuestion(spec, updatedSwipes, newState, selectedDomains);

        if (!nextItem) {
          // No more questions available
          setAxisScores(scoresRecord);
          setMode('results');
          return;
        }
=======
      if (!nextItem) {
        // No more questions available
        const scores = scoreAxes(spec, updatedSwipes);
        setAxisScores(scores);
        // Save swipes to BlueprintContext for use in Blueprint and Ballot Builder
        initializeFromSwipes(updatedSwipes);
        setMode('results');
        return;
      }
>>>>>>> prototype/web-app

        // Show transition message at certain milestones
        const shouldShowTransitionMsg = checkForTransition(newState);
        if (shouldShowTransitionMsg) {
          setTransitionMessage(shouldShowTransitionMsg);
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
<<<<<<< HEAD
        }
      } catch (err) {
        console.error('Failed to score responses:', err);
        // Continue with basic state update even if scoring fails
        setAdaptiveState(newState);
        const nextItem = selectNextQuestion(spec, updatedSwipes, newState, selectedDomains);
        if (nextItem) {
          setCurrentItem(nextItem);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
=======
        }, 1500);
      } else {
        setCurrentItem(nextItem);
        setShowExplanation(false); // Reset explanation when moving to next question
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
>>>>>>> prototype/web-app
      }
    });
  };

<<<<<<< HEAD
  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading assessment...</Text>
      </View>
    );
  }

  // Retry loading spec
  const retryLoad = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const specData = await civicAxesApi.getSpec();
      setSpec(specData);
      setSelectedDomains(new Set(specData.domains.map(d => d.id)));
      setAdaptiveState(initializeAdaptiveState(specData));
    } catch (err) {
      console.error('Failed to load civic axes spec:', err);
      setError('Failed to load assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state
  if (error || !spec) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error || 'Failed to load assessment'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={retryLoad}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

=======
  // Get explanation content for the current item
  const getExplanationContent = (item: Item) => {
    const axisId = Object.keys(item.axis_keys)[0];
    const axis = spec.axes.find(a => a.id === axisId);
    if (!axis) return null;

    const key = item.axis_keys[axisId];
    // key=+1 means Agree pushes toward poleA, key=-1 means Agree pushes toward poleB
    return {
      axisName: axis.name,
      question: axis.description,
      agreesWith: key > 0 ? axis.poleA : axis.poleB,
      disagreesWith: key > 0 ? axis.poleB : axis.poleA,
    };
  };

>>>>>>> prototype/web-app
  // Render intro/domain selection screen
  if (mode === 'intro') {
    return (
      <IntroScreen
        spec={spec}
        onStartAll={() => startAssessment(new Set(spec.domains.map(d => d.id)))}
        onStartSelected={(domains) => startAssessment(domains)}
      />
    );
  }

  // Render results screen
  if (mode === 'results') {
    return (
      <ResultsScreen
        spec={spec}
        axisScores={axisScores}
        swipes={swipes}
        selectedDomains={selectedDomains}
        onRestart={() => {
          setSwipes([]);
          setAxisScores({});
          setAdaptiveState(initializeAdaptiveState(spec));
          setSelectedDomains(new Set(spec.domains.map(d => d.id)));
          setCurrentItem(null);
          setMode('intro');
        }}
      />
    );
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

  const getDomainIcon = (domainId: string): string => {
    switch (domainId) {
      case 'econ': return 'cash-outline';
      case 'health': return 'medkit-outline';
      case 'housing': return 'home-outline';
      case 'justice': return 'shield-outline';
      case 'climate': return 'leaf-outline';
      default: return 'ellipse-outline';
    }
  };

  const toggleDomain = (domainId: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domainId)) {
      // Don't allow deselecting if it's the last one
      if (newSelected.size > 1) {
        newSelected.delete(domainId);
      }
    } else {
      newSelected.add(domainId);
    }
    setSelectedDomains(newSelected);
  };

  const selectAllDomains = () => {
    setSelectedDomains(new Set(spec.domains.map(d => d.id)));
  };

  const getTopicFilterLabel = () => {
    if (selectedDomains.size === spec.domains.length) {
      return 'All Topics';
    }
    if (selectedDomains.size === 1) {
      const domainId = Array.from(selectedDomains)[0];
      const domain = spec.domains.find(d => d.id === domainId);
      return domain?.name || 'Filtered';
    }
    return `${selectedDomains.size} Topics`;
  };

  return (
    <View style={styles.container}>
      {/* Topic Picker Modal */}
      <Modal
        visible={showTopicPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTopicPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowTopicPicker(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Topics</Text>
              <TouchableOpacity onPress={() => setShowTopicPicker(false)}>
                <Ionicons name="close" size={24} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Select which policy areas to include in questions
            </Text>

            <ScrollView style={styles.modalDomainList}>
              {spec.domains.map(domain => {
                const isSelected = selectedDomains.has(domain.id);
                return (
                  <TouchableOpacity
                    key={domain.id}
                    style={[
                      styles.modalDomainCard,
                      isSelected && styles.modalDomainCardSelected,
                    ]}
                    onPress={() => toggleDomain(domain.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.modalDomainIcon,
                      isSelected && styles.modalDomainIconSelected,
                    ]}>
                      <Ionicons
                        name={getDomainIcon(domain.id) as any}
                        size={20}
                        color={isSelected ? Colors.white : Colors.gray[500]}
                      />
                    </View>
                    <Text style={[
                      styles.modalDomainName,
                      isSelected && styles.modalDomainNameSelected,
                    ]}>
                      {domain.name}
                    </Text>
                    <View style={[
                      styles.modalCheckbox,
                      isSelected && styles.modalCheckboxSelected,
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={selectAllDomains}
              >
                <Text style={styles.selectAllText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowTopicPicker(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Adaptive Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressStrategy}>{progress.dominantStrategy}</Text>
          <TouchableOpacity
            style={styles.topicFilterButton}
            onPress={() => setShowTopicPicker(true)}
          >
            <Ionicons name="filter-outline" size={16} color={Colors.primary} />
            <Text style={styles.topicFilterText}>{getTopicFilterLabel()}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
        </View>
        <Text style={styles.progressHint}>
          {progress.questionsAnswered} / ~{progress.estimatedTotal} • Adapts to your responses
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

          {/* Explain Button */}
          <TouchableOpacity
            style={styles.explainButton}
            onPress={() => setShowExplanation(!showExplanation)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showExplanation ? "chevron-up-circle-outline" : "help-circle-outline"}
              size={18}
              color={Colors.primary}
            />
            <Text style={styles.explainButtonText}>
              {showExplanation ? "Hide explanation" : "What does this mean?"}
            </Text>
          </TouchableOpacity>

          {/* Expandable Explanation */}
          {showExplanation && currentItem && (() => {
            const explanation = getExplanationContent(currentItem);
            if (!explanation) return null;
            return (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>This question measures:</Text>
                <Text style={styles.explanationAxisName}>{explanation.axisName}</Text>
                <Text style={styles.explanationQuestion}>{explanation.question}</Text>

                <View style={styles.explanationDivider} />

                <View style={styles.explanationRow}>
                  <View style={[styles.explanationBadge, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="checkmark" size={14} color="#4CAF50" />
                  </View>
                  <View style={styles.explanationTextContainer}>
                    <Text style={styles.explanationLabel}>If you agree:</Text>
                    <Text style={styles.explanationValue}>{explanation.agreesWith.label}</Text>
                  </View>
                </View>

                <View style={styles.explanationRow}>
                  <View style={[styles.explanationBadge, { backgroundColor: '#FFEBEE' }]}>
                    <Ionicons name="close" size={14} color="#F44336" />
                  </View>
                  <View style={styles.explanationTextContainer}>
                    <Text style={styles.explanationLabel}>If you disagree:</Text>
                    <Text style={styles.explanationValue}>{explanation.disagreesWith.label}</Text>
                  </View>
                </View>
              </View>
            );
          })()}

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


// ===========================================
// Results Screen
// ===========================================

function ResultsScreen({
  spec,
  axisScores,
  swipes,
  selectedDomains,
  onRestart,
}: {
  spec: Spec;
  axisScores: Record<string, AxisScore>;
  swipes: SwipeEvent[];
  selectedDomains: Set<string>;
  onRestart: () => void;
}) {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

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
            onPress={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
          >
            <View style={styles.domainHeader}>
              <View>
                <Text style={styles.domainName}>{domain.name}</Text>
                <Text style={styles.domainWhy}>{domain.why}</Text>
              </View>
              <Ionicons
                name={expandedDomain === domain.id ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#666"
              />
            </View>
          </TouchableOpacity>

          {expandedDomain === domain.id && (
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
        <Ionicons name="checkbox-outline" size={32} color="#2196F3" />
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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
    marginBottom: 12,
  },
  tradeoffText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  explainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
  },
  explainButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  explanationContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  explanationTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  explanationAxisName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  explanationQuestion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  explanationDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  explanationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  explanationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  explanationTextContainer: {
    flex: 1,
  },
  explanationLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  explanationValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
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
  // Topic filter button styles
  topicFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  topicFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalDomainList: {
    paddingHorizontal: 20,
  },
  modalDomainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.gray[50],
    gap: 12,
  },
  modalDomainCardSelected: {
    backgroundColor: Colors.primary + '10',
  },
  modalDomainIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDomainIconSelected: {
    backgroundColor: Colors.primary,
  },
  modalDomainName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.gray[700],
  },
  modalDomainNameSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  selectAllButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});

// ===========================================
// Intro Screen with Domain Selection
// ===========================================

function IntroScreen({
  spec,
  onStartAll,
  onStartSelected,
}: {
  spec: Spec;
  onStartAll: () => void;
  onStartSelected: (domains: Set<string>) => void;
}) {
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
    new Set(spec.domains.map(d => d.id))
  );

  const toggleDomain = (domainId: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domainId)) {
      newSelected.delete(domainId);
    } else {
      newSelected.add(domainId);
    }
    setSelectedDomains(newSelected);
  };

  const getDomainIcon = (domainId: string): string => {
    switch (domainId) {
      case 'econ': return 'cash-outline';
      case 'health': return 'medkit-outline';
      case 'housing': return 'home-outline';
      case 'justice': return 'shield-outline';
      case 'climate': return 'leaf-outline';
      default: return 'ellipse-outline';
    }
  };

  if (showDomainPicker) {
    return (
      <ScrollView style={introStyles.container}>
        <View style={introStyles.header}>
          <TouchableOpacity onPress={() => setShowDomainPicker(false)} style={introStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray[700]} />
          </TouchableOpacity>
          <Text style={introStyles.title}>Choose Topics</Text>
          <Text style={introStyles.subtitle}>
            Select which policy areas you want to answer questions about
          </Text>
        </View>

        <View style={introStyles.domainList}>
          {spec.domains.map(domain => {
            const isSelected = selectedDomains.has(domain.id);
            return (
              <TouchableOpacity
                key={domain.id}
                style={[
                  introStyles.domainCard,
                  isSelected && introStyles.domainCardSelected,
                ]}
                onPress={() => toggleDomain(domain.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  introStyles.domainIconContainer,
                  isSelected && introStyles.domainIconContainerSelected,
                ]}>
                  <Ionicons
                    name={getDomainIcon(domain.id) as any}
                    size={24}
                    color={isSelected ? Colors.white : Colors.gray[500]}
                  />
                </View>
                <View style={introStyles.domainInfo}>
                  <Text style={[
                    introStyles.domainName,
                    isSelected && introStyles.domainNameSelected,
                  ]}>
                    {domain.name}
                  </Text>
                  <Text style={introStyles.domainDescription} numberOfLines={2}>
                    {domain.why}
                  </Text>
                </View>
                <View style={[
                  introStyles.checkbox,
                  isSelected && introStyles.checkboxSelected,
                ]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={introStyles.footer}>
          <Text style={introStyles.selectedCount}>
            {selectedDomains.size} of {spec.domains.length} topics selected
          </Text>
          <TouchableOpacity
            style={[
              introStyles.startButton,
              selectedDomains.size === 0 && introStyles.startButtonDisabled,
            ]}
            onPress={() => onStartSelected(selectedDomains)}
            disabled={selectedDomains.size === 0}
          >
            <Text style={introStyles.startButtonText}>
              Start Assessment
            </Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={introStyles.container}>
      <View style={introStyles.heroSection}>
        <View style={introStyles.iconCircle}>
          <Ionicons name="sparkles" size={48} color={Colors.primary} />
        </View>
        <Text style={introStyles.heroTitle}>Smart Assessment</Text>
        <Text style={introStyles.heroSubtitle}>
          Answer questions about policy topics to build your civic profile.
          We'll adapt based on your responses.
        </Text>
      </View>

      <View style={introStyles.optionsSection}>
        {/* All Topics Option */}
        <TouchableOpacity
          style={introStyles.optionCard}
          onPress={onStartAll}
          activeOpacity={0.7}
        >
          <View style={introStyles.optionIconContainer}>
            <Ionicons name="grid-outline" size={28} color={Colors.primary} />
          </View>
          <View style={introStyles.optionContent}>
            <Text style={introStyles.optionTitle}>All Topics</Text>
            <Text style={introStyles.optionDescription}>
              Questions from all {spec.domains.length} policy areas, adaptively selected
            </Text>
          </View>
          <View style={introStyles.recommendedBadge}>
            <Text style={introStyles.recommendedText}>Recommended</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.gray[400]} />
        </TouchableOpacity>

        {/* Choose Topics Option */}
        <TouchableOpacity
          style={introStyles.optionCard}
          onPress={() => setShowDomainPicker(true)}
          activeOpacity={0.7}
        >
          <View style={[introStyles.optionIconContainer, { backgroundColor: Colors.gray[100] }]}>
            <Ionicons name="options-outline" size={28} color={Colors.gray[600]} />
          </View>
          <View style={introStyles.optionContent}>
            <Text style={introStyles.optionTitle}>Choose Topics</Text>
            <Text style={introStyles.optionDescription}>
              Select specific policy areas to focus on
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.gray[400]} />
        </TouchableOpacity>
      </View>

      <View style={introStyles.infoSection}>
        <Ionicons name="time-outline" size={16} color={Colors.gray[400]} />
        <Text style={introStyles.infoText}>Usually takes 3-5 minutes</Text>
      </View>
    </View>
  );
}

// ===========================================
// Intro Screen Styles
// ===========================================

const introStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 12,
  },
  optionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray[500],
    lineHeight: 20,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    right: 40,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.success,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 32,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray[400],
  },
  // Domain picker styles
  header: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray[500],
    lineHeight: 22,
  },
  domainList: {
    padding: 20,
    gap: 12,
  },
  domainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    gap: 12,
  },
  domainCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  domainIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainIconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  domainNameSelected: {
    color: Colors.primary,
  },
  domainDescription: {
    fontSize: 13,
    color: Colors.gray[500],
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  selectedCount: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.white,
  },
});

