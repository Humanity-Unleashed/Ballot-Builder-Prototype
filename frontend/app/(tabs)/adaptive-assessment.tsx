import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Modal, Pressable, PanResponder, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { civicAxesApi, SwipeEvent, AxisScore } from '@/services/api';
import {
  initializeAdaptiveState,
  getAdaptiveProgress,
} from '../../utils/adaptiveSelection';
import { useBlueprint } from '@/context/BlueprintContext';
import type { Spec, SwipeResponse } from '../../types/civicAssessment';
import { getSliderConfig, AxisSliderConfig, getPositionColor, sliderPositionToScore } from '../../data/sliderPositions';
import {
  getFineTuningConfig,
  SubDimension,
  getFineTuningBreakdown,
  calculateFineTunedScore,
  FineTuningBreakdown,
} from '../../data/fineTuningPositions';

type AssessmentMode = 'intro' | 'assessment' | 'results' | 'fine-tuning';

// Helper function to get thumb color based on slider position (0-4 for 5 positions)
function getSliderThumbColor(position: number, totalPositions: number): string {
  const normalizedPosition = position / (totalPositions - 1); // 0 to 1
  if (normalizedPosition <= 0.3) return '#A855F7'; // Purple - toward poleA
  if (normalizedPosition >= 0.7) return '#14B8A6'; // Teal - toward poleB
  return '#6B7280'; // Gray - center/mixed
}

// Helper function to generate gradient color for a segment
function getGradientSegmentColor(index: number, totalSegments: number): string {
  const t = index / (totalSegments - 1); // 0 to 1
  // Interpolate: purple (0) -> gray (0.5) -> teal (1)
  if (t < 0.5) {
    // Purple to gray
    const factor = t * 2;
    const r = Math.round(168 + (229 - 168) * factor);
    const g = Math.round(85 + (231 - 85) * factor);
    const b = Math.round(247 + (235 - 247) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Gray to teal
    const factor = (t - 0.5) * 2;
    const r = Math.round(229 + (20 - 229) * factor);
    const g = Math.round(231 + (184 - 231) * factor);
    const b = Math.round(235 + (166 - 235) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

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

// Draggable Slider Component
function DraggableSlider({
  position,
  totalPositions,
  onPositionChange,
  poleALabel,
  poleBLabel,
  style,
}: {
  position: number;
  totalPositions: number;
  onPositionChange: (pos: number) => void;
  poleALabel: string;
  poleBLabel: string;
  style?: any;
}) {
  const trackRef = useRef<View>(null);
  const trackWidth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        // Handle initial tap position
        if (trackWidth.current > 0) {
          const touchX = evt.nativeEvent.locationX;
          const newPos = Math.round((touchX / trackWidth.current) * (totalPositions - 1));
          const clampedPos = Math.max(0, Math.min(totalPositions - 1, newPos));
          onPositionChange(clampedPos);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (trackWidth.current > 0) {
          // Calculate position from gesture
          const currentThumbX = (position / (totalPositions - 1)) * trackWidth.current;
          const newX = currentThumbX + gestureState.dx;
          const newPos = Math.round((newX / trackWidth.current) * (totalPositions - 1));
          const clampedPos = Math.max(0, Math.min(totalPositions - 1, newPos));
          if (clampedPos !== position) {
            onPositionChange(clampedPos);
          }
        }
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const thumbColor = getSliderThumbColor(position, totalPositions);
  const thumbPosition = (position / (totalPositions - 1)) * 100;

  return (
    <View style={[draggableSliderStyles.container, style]}>
      <Text style={[draggableSliderStyles.poleLabel, draggableSliderStyles.poleLabelLeft]}>
        {poleALabel}
      </Text>

      <View style={draggableSliderStyles.trackContainer}>
        <View
          ref={trackRef}
          style={draggableSliderStyles.trackOuter}
          onLayout={(e) => {
            trackWidth.current = e.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          {/* Smooth Gradient */}
          {Array.from({ length: 20 }, (_, i) => (
            <View
              key={i}
              style={[
                draggableSliderStyles.trackSegment,
                { backgroundColor: getGradientSegmentColor(i, 20) },
              ]}
            />
          ))}
          {/* Draggable Thumb */}
          <Animated.View
            style={[
              draggableSliderStyles.thumb,
              {
                left: `${thumbPosition}%`,
                borderColor: thumbColor,
                transform: [{ scale: isDragging ? 1.15 : 1 }],
              },
            ]}
          >
            <View style={[draggableSliderStyles.thumbInner, { backgroundColor: thumbColor }]} />
          </Animated.View>
        </View>

        {/* Tick Marks */}
        <View style={draggableSliderStyles.tickMarks}>
          {Array.from({ length: totalPositions }, (_, idx) => (
            <TouchableOpacity
              key={idx}
              style={draggableSliderStyles.tickTouchArea}
              onPress={() => onPositionChange(idx)}
            >
              <View style={[
                draggableSliderStyles.tick,
                idx === position && draggableSliderStyles.tickActive,
              ]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[draggableSliderStyles.poleLabel, draggableSliderStyles.poleLabelRight]}>
        {poleBLabel}
      </Text>
    </View>
  );
}

const draggableSliderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  poleLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
    width: 55,
  },
  poleLabelLeft: {
    color: '#A855F7',
  },
  poleLabelRight: {
    color: '#14B8A6',
  },
  trackContainer: {
    flex: 1,
  },
  trackOuter: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  trackSegment: {
    flex: 1,
    height: '100%',
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 4,
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
  thumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tickMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 8,
  },
  tickTouchArea: {
    padding: 4,
    alignItems: 'center',
  },
  tick: {
    width: 2,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 1,
  },
  tickActive: {
    backgroundColor: '#7C3AED',
    height: 12,
  },
});

export default function AdaptiveCivicAssessmentScreen() {
  const { initializeFromSwipes } = useBlueprint();
  const [spec, setSpec] = useState<Spec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AssessmentMode>('intro');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [axisQueue, setAxisQueue] = useState<string[]>([]);
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(2); // Start at center (current policy)
  const [axisResponses, setAxisResponses] = useState<Record<string, number>>({}); // axisId -> position
  const [swipes, setSwipes] = useState<SwipeEvent[]>([]);
  const [axisScores, setAxisScores] = useState<Record<string, AxisScore>>({});
  const [adaptiveState, setAdaptiveState] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  // Fine-tuning state
  const [fineTuningAxisId, setFineTuningAxisId] = useState<string | null>(null);
  const [fineTuningResponses, setFineTuningResponses] = useState<Record<string, Record<string, number>>>({});

  // Fetch civic axes spec from API
  useEffect(() => {
    async function fetchSpec() {
      try {
        setLoading(true);
        const fetchedSpec = await civicAxesApi.getSpec();
        setSpec(fetchedSpec);
        setSelectedDomains(new Set(fetchedSpec.domains.map(d => d.id)));
        setAdaptiveState(initializeAdaptiveState(fetchedSpec));
        setError(null);
      } catch (err) {
        console.error('Failed to load civic axes spec:', err);
        setError('Failed to load assessment data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchSpec();
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const sliderWidth = screenWidth - 120; // Account for padding and pole labels

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

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading assessment...</Text>
      </View>
    );
  }

  // Show error state
  if (error || !spec) {
    const handleRetry = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedSpec = await civicAxesApi.getSpec();
        setSpec(fetchedSpec);
        setSelectedDomains(new Set(fetchedSpec.domains.map(d => d.id)));
        setAdaptiveState(initializeAdaptiveState(fetchedSpec));
      } catch (err) {
        console.error('Failed to load civic axes spec:', err);
        setError('Failed to load assessment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error || 'Failed to load assessment'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get current axis config
  const currentAxisId = axisQueue[currentAxisIndex];
  const currentAxisConfig = currentAxisId ? getSliderConfig(currentAxisId) : null;
  const currentAxis = currentAxisId ? spec.axes.find(a => a.id === currentAxisId) : null;
  const currentDomain = currentAxis ? spec.domains.find(d => d.id === currentAxis.domain_id) : null;

  // Progress calculation
  const totalAxes = axisQueue.length;
  const progressPercentage = totalAxes > 0 ? ((currentAxisIndex) / totalAxes) * 100 : 0;

  // Calculate scores using backend API
  const calculateScores = async (swipes: SwipeEvent[]) => {
    try {
      const response = await civicAxesApi.scoreResponses(swipes);
      // Convert array of scores to Record<string, AxisScore>
      const scoresRecord: Record<string, AxisScore> = {};
      response.scores.forEach(score => {
        scoresRecord[score.axis_id] = score;
      });
      return scoresRecord;
    } catch (error) {
      console.error('Failed to calculate scores:', error);
      return {};
    }
  };

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

  const handleNext = () => {
    if (!currentAxisId || !currentAxisConfig) return;

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
        // Convert responses to swipes and calculate scores
        const finalSwipes = convertResponsesToSwipes(newResponses);
        setSwipes(finalSwipes);
        const scores = await calculateScores(finalSwipes);
        setAxisScores(scores);
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

  const handleSkip = () => {
    if (!currentAxisId) return;

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
        const scores = await calculateScores(finalSwipes);
        setAxisScores(scores);
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

  // Render fine-tuning screen
  if (mode === 'fine-tuning' && fineTuningAxisId) {
    return (
      <FineTuningScreen
        axisId={fineTuningAxisId}
        spec={spec}
        existingResponses={fineTuningResponses[fineTuningAxisId] || {}}
        onComplete={(responses) => {
          setFineTuningResponses(prev => ({
            ...prev,
            [fineTuningAxisId]: responses,
          }));
          setFineTuningAxisId(null);
          setMode('results');
        }}
        onCancel={() => {
          setFineTuningAxisId(null);
          setMode('results');
        }}
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
        fineTuningResponses={fineTuningResponses}
        onFineTune={(axisId) => {
          setFineTuningAxisId(axisId);
          setMode('fine-tuning');
        }}
        onRestart={() => {
          setSwipes([]);
          setAxisScores({});
          setAxisResponses({});
          setFineTuningResponses({});
          setAdaptiveState(initializeAdaptiveState(spec));
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

  const toggleDomain = (domainId: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domainId)) {
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
              <DraggableSlider
                position={sliderPosition}
                totalPositions={totalPositions}
                onPositionChange={setSliderPosition}
                poleALabel={currentAxisConfig.poleALabel}
                poleBLabel={currentAxisConfig.poleBLabel}
              />

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
  const progress = currentIndex / totalAxes;

  if (currentIndex === Math.floor(totalAxes * 0.33)) {
    return "Great start! Building your civic profile...";
  } else if (currentIndex === Math.floor(totalAxes * 0.66)) {
    return "Almost there! Refining your positions...";
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
  fineTuningResponses,
  onFineTune,
  onRestart,
}: {
  spec: Spec;
  axisScores: Record<string, AxisScore>;
  swipes: SwipeEvent[];
  selectedDomains: Set<string>;
  fineTuningResponses: Record<string, Record<string, number>>;
  onFineTune: (axisId: string) => void;
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
                  {(() => {
                    // Use fine-tuned score if available, otherwise use original score
                    const refinedScore = fineTuningResponses[axis.id]
                      ? calculateFineTunedScore(axis.id, fineTuningResponses[axis.id])
                      : null;
                    const displayScore = refinedScore !== null ? refinedScore : (score?.shrunk ?? 0);
                    const displayConfidence = refinedScore !== null ? 1 : (score?.confidence ?? 0.3);

                    return (
                      <View style={styles.spectrumContainer}>
                        <View style={styles.spectrumLabels}>
                          <Text style={styles.poleLabel}>{axis.poleA.label}</Text>
                          <Text style={styles.poleLabel}>{axis.poleB.label}</Text>
                        </View>
                        <View style={styles.spectrumBar}>
                          <View style={styles.spectrumMidpoint} />
                          <View
                            style={[
                              styles.spectrumIndicator,
                              {
                                left: `${((displayScore + 1) / 2) * 100}%`,
                                opacity: Math.max(displayConfidence, 0.3),
                                borderColor: refinedScore !== null ? '#059669' : '#7C3AED',
                              },
                            ]}
                          />
                        </View>
                        {refinedScore !== null && (
                          <Text style={styles.refinedIndicatorLabel}>Position refined</Text>
                        )}
                      </View>
                    );
                  })()}

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

                      {/* Fine-tune Button */}
                      {getFineTuningConfig(axis.id) && (
                        <TouchableOpacity
                          style={[
                            styles.fineTuneButton,
                            fineTuningResponses[axis.id] && styles.fineTuneButtonCompleted,
                          ]}
                          onPress={() => onFineTune(axis.id)}
                        >
                          <Ionicons
                            name={fineTuningResponses[axis.id] ? "checkmark-circle" : "options-outline"}
                            size={16}
                            color={fineTuningResponses[axis.id] ? "#059669" : "#7C3AED"}
                          />
                          <Text style={[
                            styles.fineTuneButtonText,
                            fineTuningResponses[axis.id] && styles.fineTuneButtonTextCompleted,
                          ]}>
                            {fineTuningResponses[axis.id] ? "Position fine-tuned" : "Fine-tune my position"}
                          </Text>
                          <Text style={styles.fineTuneQuestionCount}>
                            {getFineTuningConfig(axis.id)?.subDimensions.length} sub-topics
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={fineTuningResponses[axis.id] ? "#059669" : "#7C3AED"}
                          />
                        </TouchableOpacity>
                      )}

                      {/* Fine-tuning Breakdown (when completed) */}
                      {fineTuningResponses[axis.id] && (
                        <View style={styles.fineTuneBreakdown}>
                          <Text style={styles.fineTuneBreakdownTitle}>Your Nuanced Positions:</Text>
                          {getFineTuningBreakdown(axis.id, fineTuningResponses[axis.id]).map((item) => {
                            // Determine accent color based on position
                            const accentColor = item.score < -0.3 ? '#A855F7' : item.score > 0.3 ? '#14B8A6' : '#6B7280';
                            return (
                              <View key={item.subDimensionId} style={styles.fineTuneBreakdownItem}>
                                <Text style={styles.fineTuneBreakdownName}>{item.name}</Text>
                                <View style={[styles.fineTunePositionBox, { borderLeftColor: accentColor }]}>
                                  <Text style={styles.fineTuneBreakdownPosition}>{item.positionTitle}</Text>
                                </View>
                                {/* Mini gradient bar with indicator */}
                                <View style={styles.miniSpectrumContainer}>
                                  <View style={styles.miniGradientBar}>
                                    {Array.from({ length: 10 }, (_, i) => {
                                      const t = i / 9;
                                      let color: string;
                                      if (t < 0.5) {
                                        const factor = t * 2;
                                        const r = Math.round(168 + (200 - 168) * factor);
                                        const g = Math.round(85 + (200 - 85) * factor);
                                        const b = Math.round(247 + (200 - 247) * factor);
                                        color = `rgb(${r}, ${g}, ${b})`;
                                      } else {
                                        const factor = (t - 0.5) * 2;
                                        const r = Math.round(200 + (20 - 200) * factor);
                                        const g = Math.round(200 + (184 - 200) * factor);
                                        const b = Math.round(200 + (166 - 200) * factor);
                                        color = `rgb(${r}, ${g}, ${b})`;
                                      }
                                      return <View key={i} style={[styles.miniGradientSegment, { backgroundColor: color }]} />;
                                    })}
                                    <View
                                      style={[
                                        styles.miniSpectrumIndicator,
                                        { left: `${((item.score + 1) / 2) * 100}%`, borderColor: accentColor },
                                      ]}
                                    />
                                  </View>
                                </View>
                              </View>
                            );
                          })}

                          {/* Refined Position Summary */}
                          {(() => {
                            const refinedScore = calculateFineTunedScore(axis.id, fineTuningResponses[axis.id]);
                            if (refinedScore === null) return null;
                            const summaryColor = refinedScore < -0.2 ? '#A855F7' : refinedScore > 0.2 ? '#14B8A6' : '#6B7280';
                            return (
                              <View style={[styles.refinedScoreBox, { borderLeftColor: summaryColor }]}>
                                <Text style={styles.refinedScoreLabel}>Overall Position</Text>
                                <Text style={[styles.refinedScoreDescription, { color: summaryColor }]}>
                                  {Math.abs(refinedScore) < 0.2
                                    ? 'Balanced across sub-topics'
                                    : refinedScore < 0
                                    ? `Leans toward ${axis.poleA.label}`
                                    : `Leans toward ${axis.poleB.label}`}
                                </Text>
                              </View>
                            );
                          })()}
                        </View>
                      )}
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

function getDomainForAxis(spec: Spec, axisId: string) {
  const axis = spec.axes.find(a => a.id === axisId);
  if (!axis) return null;
  return spec.domains.find(d => d.id === axis.domain_id);
}

// ===========================================
// Fine-Tuning Screen
// ===========================================

function FineTuningScreen({
  axisId,
  spec,
  existingResponses,
  onComplete,
  onCancel,
}: {
  axisId: string;
  spec: Spec;
  existingResponses: Record<string, number>;
  onComplete: (responses: Record<string, number>) => void;
  onCancel: () => void;
}) {
  const fineTuningConfig = getFineTuningConfig(axisId);
  const axis = spec.axes.find(a => a.id === axisId);
  const domain = axis ? spec.domains.find(d => d.id === axis.domain_id) : null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(
    existingResponses[fineTuningConfig?.subDimensions[0]?.id || ''] ?? 2
  );
  const [responses, setResponses] = useState<Record<string, number>>(existingResponses);
  const [fadeAnim] = useState(new Animated.Value(1));

  if (!fineTuningConfig || !axis) {
    return (
      <View style={fineTuneStyles.container}>
        <Text>Fine-tuning data not available</Text>
      </View>
    );
  }

  const subDimensions = fineTuningConfig.subDimensions;
  const currentSubDimension = subDimensions[currentIndex];
  const totalQuestions = subDimensions.length;
  const progressPercentage = (currentIndex / totalQuestions) * 100;

  const currentPosition = currentSubDimension.positions[sliderPosition];
  const totalPositions = currentSubDimension.positions.length;

  const getPositionColorForFineTuning = (index: number, total: number, centerIndex: number): string => {
    if (index === centerIndex) return '#9CA3AF';
    const midpoint = centerIndex;
    const distanceFromCenter = Math.abs(index - midpoint) / midpoint;
    if (index < midpoint) {
      return distanceFromCenter > 0.5 ? '#A855F7' : '#C084FC';
    } else {
      return distanceFromCenter > 0.5 ? '#14B8A6' : '#5EEAD4';
    }
  };

  const positionColor = getPositionColorForFineTuning(
    sliderPosition,
    totalPositions,
    currentSubDimension.currentPolicyIndex
  );

  const handleNext = () => {
    // Save current response
    const newResponses = {
      ...responses,
      [currentSubDimension.id]: sliderPosition,
    };
    setResponses(newResponses);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentIndex >= totalQuestions - 1) {
        // Done with fine-tuning
        onComplete(newResponses);
        return;
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // Restore previous position if available, otherwise center
      setSliderPosition(newResponses[subDimensions[nextIndex].id] ?? 2);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        setSliderPosition(responses[subDimensions[prevIndex].id] ?? 2);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleSkip = () => {
    // Save center (neutral) position
    const newResponses = {
      ...responses,
      [currentSubDimension.id]: 2,
    };
    setResponses(newResponses);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentIndex >= totalQuestions - 1) {
        onComplete(newResponses);
        return;
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSliderPosition(newResponses[subDimensions[nextIndex].id] ?? 2);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={fineTuneStyles.container}>
      {/* Header */}
      <View style={fineTuneStyles.header}>
        <View style={fineTuneStyles.headerTop}>
          <TouchableOpacity onPress={onCancel} style={fineTuneStyles.cancelButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <View style={fineTuneStyles.headerTitleContainer}>
            <Text style={fineTuneStyles.headerSubtitle}>Fine-tuning</Text>
            <Text style={fineTuneStyles.headerTitle}>{axis.name}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={fineTuneStyles.progressContainer}>
          <View style={fineTuneStyles.progressLabel}>
            <Text style={fineTuneStyles.progressText}>
              Sub-topic {currentIndex + 1} of {totalQuestions}
            </Text>
          </View>
          <View style={fineTuneStyles.progressBar}>
            <View style={[fineTuneStyles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={fineTuneStyles.content}>
        <Animated.View style={[fineTuneStyles.questionCard, { opacity: fadeAnim }]}>
          <Text style={fineTuneStyles.subDimensionName}>{currentSubDimension.name}</Text>
          <Text style={fineTuneStyles.subDimensionQuestion}>{currentSubDimension.question}</Text>

          {/* Position Card */}
          <View style={fineTuneStyles.positionDisplay}>
            <View style={[fineTuneStyles.positionCard, { borderColor: positionColor }]}>
              <Text style={fineTuneStyles.positionTitle}>{currentPosition.title}</Text>
              <Text style={fineTuneStyles.positionDescription}>{currentPosition.description}</Text>
              {currentPosition.isCurrentPolicy && (
                <View style={fineTuneStyles.currentPolicyBadge}>
                  <Text style={fineTuneStyles.currentPolicyText}>Current US Policy</Text>
                </View>
              )}
            </View>

            {/* Slider */}
            <View style={fineTuneStyles.sliderSection}>
              <DraggableSlider
                position={sliderPosition}
                totalPositions={totalPositions}
                onPositionChange={setSliderPosition}
                poleALabel={currentSubDimension.poleALabel}
                poleBLabel={currentSubDimension.poleBLabel}
              />
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Navigation Footer */}
      <View style={fineTuneStyles.navSection}>
        <View style={fineTuneStyles.navButtons}>
          <TouchableOpacity
            style={[fineTuneStyles.navBtn, fineTuneStyles.navBtnSecondary]}
            onPress={handleBack}
            disabled={currentIndex === 0}
          >
            <Text style={[
              fineTuneStyles.navBtnTextSecondary,
              currentIndex === 0 && fineTuneStyles.navBtnTextDisabled
            ]}>
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[fineTuneStyles.navBtn, fineTuneStyles.navBtnPrimary]}
            onPress={handleNext}
          >
            <Text style={fineTuneStyles.navBtnTextPrimary}>
              {currentIndex >= totalQuestions - 1 ? 'Finish' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={fineTuneStyles.skipLink} onPress={handleSkip}>
          <Text style={fineTuneStyles.skipLinkText}>Skip this sub-topic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Fine-tuning styles
const fineTuneStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#7C3AED',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
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
  subDimensionName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subDimensionQuestion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
    marginBottom: 24,
  },
  positionDisplay: {
    flex: 1,
    justifyContent: 'center',
  },
  positionCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    marginBottom: 24,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    lineHeight: 22,
  },
  positionDescription: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },
  currentPolicyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  currentPolicyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  sliderSection: {
    width: '100%',
  },
  sliderWithLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  poleLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
    width: 55,
  },
  poleLabelLeft: {
    color: '#A855F7',
  },
  poleLabelRight: {
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
  sliderThumb: {
    position: 'absolute',
    top: '50%',
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#6B7280', // Default, overridden dynamically
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
  sliderThumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B7280', // Default, overridden dynamically
  },
  tickMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 8,
  },
  tickTouchArea: {
    padding: 4,
    alignItems: 'center',
  },
  tick: {
    width: 2,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 1,
  },
  tickActive: {
    backgroundColor: '#7C3AED',
    height: 12,
  },
  navSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnSecondary: {
    backgroundColor: '#f3f4f6',
  },
  navBtnPrimary: {
    backgroundColor: '#7C3AED',
  },
  navBtnTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  navBtnTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  navBtnTextDisabled: {
    color: '#ccc',
  },
  skipLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  skipLinkText: {
    fontSize: 13,
    color: '#888',
  },
});

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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[700],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
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
  gradientProgressFill: {
    backgroundColor: '#7C3AED',
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
  domainContextTop: {
    alignItems: 'center',
    marginBottom: 12,
  },
  domainTitleTop: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  explanationContainerLight: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  explanationRowLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  explanationBadgeSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explanationTextLight: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray[400],
    lineHeight: 18,
  },
  explanationLabelLight: {
    fontWeight: '600',
    color: Colors.gray[500],
  },
  // Slider Assessment Styles
  domainBadgeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  domainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  domainBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  axisTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  axisQuestion: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  positionCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    marginBottom: 24,
  },
  positionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  positionDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  currentPolicyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  currentPolicyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  sliderSection: {
    width: '100%',
    marginBottom: 24,
  },
  sliderWithLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  poleLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
    width: 55,
  },
  poleLabelLeft: {
    color: '#A855F7',
  },
  poleLabelRight: {
    color: '#14B8A6',
  },
  sliderTrackWrapper: {
    flex: 1,
    position: 'relative',
    paddingVertical: 20,
  },
  sliderTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  sliderSegment: {
    flex: 1,
    height: '100%',
  },
  tickMarks: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tickTouchArea: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: 3,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 1.5,
  },
  tickActive: {
    backgroundColor: '#7C3AED',
    height: 14,
    width: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: 14,
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#7C3AED',
    marginLeft: -18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderThumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C3AED',
  },
  positionCounter: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 12,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navBtnSecondary: {
    backgroundColor: '#f3f4f6',
  },
  navBtnPrimary: {
    backgroundColor: '#7C3AED',
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  navBtnTextSecondary: {
    color: '#666',
  },
  navBtnTextPrimary: {
    color: '#fff',
  },
  navBtnTextDisabled: {
    color: '#ccc',
  },
  skipLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  skipLinkText: {
    fontSize: 13,
    color: '#888',
  },
  // ============================================
  // NEW SLIDER SCREEN STYLES (Matching Mockup)
  // ============================================
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
    borderColor: '#6B7280', // Default, overridden dynamically
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
    backgroundColor: '#6B7280', // Default, overridden dynamically
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
  fineTuneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  fineTuneButtonCompleted: {
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
  },
  fineTuneButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  fineTuneButtonTextCompleted: {
    color: '#059669',
  },
  fineTuneQuestionCount: {
    fontSize: 11,
    color: '#9CA3AF',
    marginRight: 4,
  },
  fineTuneBreakdown: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fineTuneBreakdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fineTuneBreakdownItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fineTuneBreakdownName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  fineTunePositionBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#6B7280',
    marginBottom: 8,
  },
  fineTuneBreakdownPosition: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  miniSpectrumContainer: {
    marginTop: 4,
  },
  miniGradientBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  miniGradientSegment: {
    flex: 1,
    height: '100%',
  },
  miniSpectrumMidpoint: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#9ca3af',
  },
  miniSpectrumIndicator: {
    position: 'absolute',
    top: -3,
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 7,
    marginLeft: -7,
    borderWidth: 3,
    borderColor: '#6B7280',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  refinedScoreBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
  },
  refinedScoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  refinedScoreDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  refinedIndicatorLabel: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
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

