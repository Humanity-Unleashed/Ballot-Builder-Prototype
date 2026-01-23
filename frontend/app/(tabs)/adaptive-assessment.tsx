import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { civicAxesApi, AxisScore, SwipeEvent } from '../../services/api';
import { useBlueprint } from '@/context/BlueprintContext';
import type { Spec, SwipeResponse } from '../../types/civicAssessment';
import { getSliderConfig, getPositionColor, sliderPositionToScore } from '../../data/sliderPositions';

type AssessmentMode = 'intro' | 'assessment' | 'results';

// Get axes for selected domains
function getAxesForDomains(spec: Spec, selectedDomains: Set<string>): string[] {
  const axes: string[] = [];
  spec.domains.forEach(domain => {
    if (selectedDomains.has(domain.id)) {
      axes.push(...domain.axes);
    }
  });
  return axes;
}

export default function AdaptiveCivicAssessmentScreen() {
  const { initializeFromSwipes } = useBlueprint();
  const [spec, setSpec] = useState<Spec | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AssessmentMode>('intro');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [axisQueue, setAxisQueue] = useState<string[]>([]);
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(2); // Start at center (current policy)
  const [axisResponses, setAxisResponses] = useState<Record<string, number>>({}); // axisId -> position
  const [swipes, setSwipes] = useState<SwipeEvent[]>([]);
  const [axisScores, setAxisScores] = useState<Record<string, AxisScore>>({});
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);

  // Fetch spec from backend on mount
  useEffect(() => {
    async function loadSpec() {
      try {
        setIsLoading(true);
        const specData = await civicAxesApi.getSpec();
        setSpec(specData);
        setSelectedDomains(new Set(specData.domains.map(d => d.id)));
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
    const axes = getAxesForDomains(spec, domains);
    setAxisQueue(axes);
    setCurrentAxisIndex(0);
    setSliderPosition(2); // Reset to center
    setAxisResponses({});
    setMode('assessment');
  };

  // Get current axis config
  const currentAxisId = axisQueue[currentAxisIndex];
  const currentAxisConfig = currentAxisId && spec ? getSliderConfig(currentAxisId) : null;
  const currentAxis = currentAxisId && spec ? spec.axes.find(a => a.id === currentAxisId) : null;
  const currentDomain = currentAxis && spec ? spec.domains.find(d => d.id === currentAxis.domain_id) : null;

  // Progress calculation
  const totalAxes = axisQueue.length;
  const progressPercentage = totalAxes > 0 ? ((currentAxisIndex) / totalAxes) * 100 : 0;

  // Convert axis responses to swipe events for scoring
  const convertResponsesToSwipes = (responses: Record<string, number>): SwipeEvent[] => {
    if (!spec) return [];
    const swipeEvents: SwipeEvent[] = [];

    Object.entries(responses).forEach(([axisId, position]) => {
      const config = getSliderConfig(axisId);
      if (!config) return;

      const totalPositions = config.positions.length;
      const score = sliderPositionToScore(position, totalPositions);

      // Find items for this axis and create appropriate swipe responses
      const axisItems = spec.items.filter(item => axisId in item.axis_keys);

      // Use first two items for the axis to establish position
      axisItems.slice(0, 2).forEach(item => {
        const key = item.axis_keys[axisId];
        // Convert score to response based on key direction
        let response: SwipeResponse;
        const effectiveScore = score * key; // If key is -1, flip the direction

        if (effectiveScore <= -0.6) {
          response = 'strong_disagree';
        } else if (effectiveScore <= -0.2) {
          response = 'disagree';
        } else if (effectiveScore >= 0.6) {
          response = 'strong_agree';
        } else if (effectiveScore >= 0.2) {
          response = 'agree';
        } else {
          response = 'unsure';
        }

        swipeEvents.push({
          item_id: item.id,
          response,
        });
      });
    });

    return swipeEvents;
  };

  // Helper function to get domain icon
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

  const getDomainEmoji = (domainId: string): string => {
    switch (domainId) {
      case 'econ': return '💰';
      case 'health': return '🏥';
      case 'housing': return '🏠';
      case 'justice': return '🛡️';
      case 'climate': return '🌱';
      default: return '📋';
    }
  };

  // Toggle domain selection (for topic picker)
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

  // Select all domains
  const selectAllDomains = () => {
    if (spec) {
      setSelectedDomains(new Set(spec.domains.map(d => d.id)));
    }
  };

  const handleNext = async () => {
    if (!currentAxisId || !currentAxisConfig || !spec) return;

    // Save current position
    const newResponses = {
      ...axisResponses,
      [currentAxisId]: sliderPosition,
    };
    setAxisResponses(newResponses);

    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      // Check if we're done
      if (currentAxisIndex >= axisQueue.length - 1) {
        // Convert responses to swipes and calculate scores via backend API
        const finalSwipes = convertResponsesToSwipes(newResponses);
        setSwipes(finalSwipes);

        try {
          const scoreResponse = await civicAxesApi.scoreResponses(finalSwipes);
          const scoresRecord: Record<string, AxisScore> = {};
          for (const score of scoreResponse.scores) {
            scoresRecord[score.axis_id] = score;
          }
          setAxisScores(scoresRecord);
        } catch (err) {
          console.error('Failed to score responses:', err);
          // Set empty scores on error
          setAxisScores({});
        }

        initializeFromSwipes(finalSwipes);
        setMode('results');
        return;
      }

      // Check for transition message
      const nextIndex = currentAxisIndex + 1;
      const shouldShowTransitionMsg = checkForAxisTransition(nextIndex, totalAxes);

      if (shouldShowTransitionMsg) {
        setTransitionMessage(shouldShowTransitionMsg);
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
          setCurrentAxisIndex(nextIndex);
          setSliderPosition(2); // Reset to center for next axis
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }, 1500);
      } else {
        setCurrentAxisIndex(nextIndex);
        setSliderPosition(2); // Reset to center for next axis
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  const handleBack = () => {
    if (currentAxisIndex > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        const prevIndex = currentAxisIndex - 1;
        const prevAxisId = axisQueue[prevIndex];
        setCurrentAxisIndex(prevIndex);
        // Restore previous position if available
        setSliderPosition(axisResponses[prevAxisId] ?? 2);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleSkip = async () => {
    if (!currentAxisId || !spec) return;

    // Save center position (current policy = unsure/neutral)
    const newResponses = {
      ...axisResponses,
      [currentAxisId]: 2,
    };
    setAxisResponses(newResponses);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      if (currentAxisIndex >= axisQueue.length - 1) {
        const finalSwipes = convertResponsesToSwipes(newResponses);
        setSwipes(finalSwipes);

        try {
          const scoreResponse = await civicAxesApi.scoreResponses(finalSwipes);
          const scoresRecord: Record<string, AxisScore> = {};
          for (const score of scoreResponse.scores) {
            scoresRecord[score.axis_id] = score;
          }
          setAxisScores(scoresRecord);
        } catch (err) {
          console.error('Failed to score responses:', err);
          setAxisScores({});
        }

        initializeFromSwipes(finalSwipes);
        setMode('results');
        return;
      }

      setCurrentAxisIndex(currentAxisIndex + 1);
      setSliderPosition(2);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

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
          setAxisResponses({});
          setSelectedDomains(new Set(spec.domains.map(d => d.id)));
          setAxisQueue([]);
          setCurrentAxisIndex(0);
          setSliderPosition(2);
          setMode('intro');
        }}
      />
    );
  }

  if (showTransition) {
    return (
      <View style={styles.transitionContainer}>
        <Ionicons name="bulb" size={64} color="#7C3AED" />
        <Text style={styles.transitionText}>{transitionMessage}</Text>
      </View>
    );
  }

  if (!currentAxisConfig || !currentAxis) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Current position data
  const currentPosition = currentAxisConfig.positions[sliderPosition];
  const positionColor = getPositionColor(sliderPosition, currentAxisConfig.positions.length, currentAxisConfig.currentPolicyIndex);
  const totalPositions = currentAxisConfig.positions.length;

  return (
    <View style={styles.sliderScreenContainer}>
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
              Select which policy areas to include
            </Text>

            <ScrollView style={styles.modalDomainList}>
              {spec?.domains.map(domain => {
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
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Header Section */}
      <View style={styles.sliderHeader}>
        <View style={styles.sliderProgressContainer}>
          <View style={styles.sliderProgressLabel}>
            <Text style={styles.sliderProgressDomain}>{currentDomain?.name}</Text>
            <Text style={styles.sliderProgressCount}>Question {currentAxisIndex + 1} of {totalAxes}</Text>
          </View>
          <View style={styles.sliderProgressBar}>
            <View style={[styles.sliderProgressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
        <View style={styles.sliderDomainBadge}>
          <Text style={styles.sliderDomainEmoji}>{getDomainEmoji(currentDomain?.id || '')}</Text>
          <Text style={styles.sliderDomainBadgeText}>{currentDomain?.name}</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.sliderContent}>
        <Animated.View style={[styles.sliderQuestionCard, { opacity: fadeAnim }]}>
          {/* Axis Title & Question */}
          <Text style={styles.sliderAxisTitle}>{currentAxis.name}</Text>
          <Text style={styles.sliderAxisQuestion}>{currentAxisConfig.question}</Text>

          {/* Position Display Area */}
          <View style={styles.sliderPositionDisplay}>
            {/* Position Card */}
            <View style={[styles.sliderPositionCard, { borderColor: positionColor }]}>
              <Text style={styles.sliderPositionTitle}>{currentPosition.title}</Text>
              <Text style={styles.sliderPositionDescription}>{currentPosition.description}</Text>
              {currentPosition.isCurrentPolicy && (
                <View style={styles.sliderCurrentPolicyBadge}>
                  <Text style={styles.sliderCurrentPolicyText}>Current US Policy</Text>
                </View>
              )}
            </View>

            {/* Slider Section */}
            <View style={styles.sliderSliderSection}>
              <View style={styles.sliderWithLabels}>
                <Text style={[styles.sliderPoleLabel, styles.sliderPoleLabelLeft]}>
                  {currentAxisConfig.poleALabel}
                </Text>

                <View style={styles.sliderTrackContainer}>
                  {/* Gradient Track */}
                  <View style={styles.sliderTrackOuter}>
                    <View style={[styles.sliderTrackSegment, { backgroundColor: '#A855F7' }]} />
                    <View style={[styles.sliderTrackSegment, { backgroundColor: '#C084FC' }]} />
                    <View style={[styles.sliderTrackSegment, { backgroundColor: '#9CA3AF' }]} />
                    <View style={[styles.sliderTrackSegment, { backgroundColor: '#5EEAD4' }]} />
                    <View style={[styles.sliderTrackSegment, { backgroundColor: '#14B8A6' }]} />
                    {/* Thumb on the track */}
                    <View
                      style={[
                        styles.sliderThumbNew,
                        { left: `${(sliderPosition / (totalPositions - 1)) * 100}%` },
                      ]}
                    >
                      <View style={styles.sliderThumbInnerNew} />
                    </View>
                  </View>

                  {/* Tick Marks - Below the track */}
                  <View style={styles.sliderTickMarks}>
                    {currentAxisConfig.positions.map((_, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.sliderTickTouchArea}
                        onPress={() => setSliderPosition(idx)}
                      >
                        <View style={[
                          styles.sliderTick,
                          idx === sliderPosition && styles.sliderTickActive,
                        ]} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Text style={[styles.sliderPoleLabel, styles.sliderPoleLabelRight]}>
                  {currentAxisConfig.poleBLabel}
                </Text>
              </View>

              <Text style={styles.sliderPositionCounter}>
                Position {sliderPosition + 1} of {totalPositions}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Navigation Footer */}
      <View style={styles.sliderNavSection}>
        <View style={styles.sliderNavButtons}>
          <TouchableOpacity
            style={[styles.sliderNavBtn, styles.sliderNavBtnSecondary]}
            onPress={handleBack}
            disabled={currentAxisIndex === 0}
          >
            <Text style={[
              styles.sliderNavBtnTextSecondary,
              currentAxisIndex === 0 && styles.sliderNavBtnTextDisabled
            ]}>
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sliderNavBtn, styles.sliderNavBtnPrimary]}
            onPress={handleNext}
          >
            <Text style={styles.sliderNavBtnTextPrimary}>
              {currentAxisIndex >= axisQueue.length - 1 ? 'Finish' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sliderSkipLink} onPress={handleSkip}>
          <Text style={styles.sliderSkipLinkText}>Skip this question</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function checkForAxisTransition(currentIndex: number, totalAxes: number): string | null {
  if (currentIndex === Math.floor(totalAxes * 0.33)) {
    return "Great start! Building your civic profile...";
  } else if (currentIndex === Math.floor(totalAxes * 0.66)) {
    return "Almost there! Refining your positions...";
  }

  return null;
}

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
          <Ionicons name="bulb" size={48} color={Colors.primary} />
        </View>
        <Text style={introStyles.heroTitle}>Civic Assessment</Text>
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
// Results Screen
// ===========================================

function ResultsScreen({
  spec,
  axisScores,
  swipes,
  selectedDomains: _selectedDomains,
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
        <Text style={styles.resultsTitle}>Your Civic Blueprint</Text>
        <Text style={styles.resultsSubtitle}>
          Created from {swipes.length} questions
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
                  Math.max(Object.keys(axisScores).length, 1)) *
                  100
              )}
              %
            </Text>
            <Text style={styles.efficiencyLabel}>Avg Confidence</Text>
          </View>
        </View>
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
          Your civic blueprint captured your priorities and can now match you
          with candidates and ballot measures.
        </Text>
      </View>

      <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
        <Ionicons name="refresh" size={20} color={Colors.primary} />
        <Text style={styles.restartButtonText}>Retake Assessment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
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

const styles = StyleSheet.create({
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
  // Slider Screen Styles
  sliderScreenContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  sliderHeader: {
    padding: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sliderProgressContainer: {
    marginBottom: 12,
  },
  sliderProgressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sliderProgressDomain: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sliderProgressCount: {
    fontSize: 12,
    color: '#666',
  },
  sliderProgressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#A855F7',
  },
  sliderDomainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sliderDomainEmoji: {
    fontSize: 14,
  },
  sliderDomainBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  sliderContent: {
    flex: 1,
    padding: 20,
  },
  sliderQuestionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sliderAxisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  sliderAxisQuestion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
    marginBottom: 32,
  },
  sliderPositionDisplay: {
    flex: 1,
    justifyContent: 'center',
  },
  sliderPositionCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
    marginBottom: 24,
  },
  sliderPositionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    lineHeight: 24,
  },
  sliderPositionDescription: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },
  sliderCurrentPolicyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  sliderCurrentPolicyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  sliderSliderSection: {
    width: '100%',
  },
  sliderWithLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderPoleLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
    width: 55,
  },
  sliderPoleLabelLeft: {
    color: '#A855F7',
  },
  sliderPoleLabelRight: {
    color: '#14B8A6',
  },
  sliderTrackContainer: {
    flex: 1,
  },
  sliderTrackOuter: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  sliderTrackSegment: {
    flex: 1,
    height: '100%',
  },
  sliderThumbNew: {
    position: 'absolute',
    top: '50%',
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#7C3AED',
    marginLeft: -18,
    marginTop: -18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderThumbInnerNew: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C3AED',
  },
  sliderTickMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 8,
  },
  sliderTickTouchArea: {
    padding: 4,
    alignItems: 'center',
  },
  sliderTick: {
    width: 2,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 1,
  },
  sliderTickActive: {
    backgroundColor: '#7C3AED',
    height: 12,
  },
  sliderPositionCounter: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  sliderNavSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sliderNavButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sliderNavBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderNavBtnSecondary: {
    backgroundColor: '#f3f4f6',
  },
  sliderNavBtnPrimary: {
    backgroundColor: '#7C3AED',
  },
  sliderNavBtnTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  sliderNavBtnTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  sliderNavBtnTextDisabled: {
    color: '#ccc',
  },
  sliderSkipLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  sliderSkipLinkText: {
    fontSize: 13,
    color: '#888',
  },
  // Results Screen Styles
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
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  restartButtonText: {
    fontSize: 16,
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
