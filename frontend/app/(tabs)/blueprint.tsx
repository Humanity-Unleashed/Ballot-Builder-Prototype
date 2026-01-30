/**
 * Blueprint Tab - Combined Assessment + Blueprint View
 *
 * A single tab that evolves through three states:
 * 1. Not Started - Shows intro with "Draft Your Civic Blueprint"
 * 2. Assessment In Progress - Shows adaptive assessment questions
 * 3. Complete - Shows editable blueprint view with retake option
 *
 * This combines the functionality of adaptive-assessment.tsx and blueprint-v3.tsx
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { civicAxesApi, SwipeEvent, AxisScore } from '@/services/api';
import {
  initializeAdaptiveState,
} from '../../utils/adaptiveSelection';
import { useBlueprint } from '@/context/BlueprintContext';
import type { Spec, SwipeResponse } from '../../types/civicAssessment';
import type { AxisProfile } from '../../types/blueprintProfile';
import { getSliderConfig, getPositionColor, sliderPositionToScore } from '../../data/sliderPositions';

// Blueprint state type
type BlueprintState = 'not_started' | 'assessment' | 'complete';

// ===========================================
// Helper Functions
// ===========================================

function getSliderThumbColor(position: number, totalPositions: number): string {
  const normalizedPosition = position / (totalPositions - 1);
  if (normalizedPosition <= 0.3) return '#A855F7';
  if (normalizedPosition >= 0.7) return '#14B8A6';
  return '#6B7280';
}

function getGradientSegmentColor(index: number, totalSegments: number): string {
  const t = index / (totalSegments - 1);
  if (t < 0.5) {
    const factor = t * 2;
    const r = Math.round(168 + (229 - 168) * factor);
    const g = Math.round(85 + (231 - 85) * factor);
    const b = Math.round(247 + (235 - 247) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const factor = (t - 0.5) * 2;
    const r = Math.round(229 + (20 - 229) * factor);
    const g = Math.round(231 + (184 - 231) * factor);
    const b = Math.round(235 + (166 - 235) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function getAxesForDomains(spec: Spec, selectedDomains: Set<string>): string[] {
  const axes: string[] = [];
  spec.domains.forEach(domain => {
    if (selectedDomains.has(domain.id)) {
      axes.push(...domain.axes);
    }
  });
  return axes;
}

function getDomainIcon(domainId: string): string {
  switch (domainId) {
    case 'econ': return 'cash-outline';
    case 'health': return 'medkit-outline';
    case 'housing': return 'home-outline';
    case 'justice': return 'shield-outline';
    case 'climate': return 'leaf-outline';
    default: return 'ellipse-outline';
  }
}

function getDomainEmoji(domainId: string): string {
  switch (domainId) {
    case 'econ': return '💰';
    case 'health': return '🏥';
    case 'housing': return '🏠';
    case 'justice': return '🛡️';
    case 'climate': return '🌱';
    default: return '📋';
  }
}

function valueToPositionIndex(value: number, totalPositions: number): number {
  return Math.round((value / 10) * (totalPositions - 1));
}

function getPositionLabel(axisId: string, value: number): string {
  const config = getSliderConfig(axisId);
  if (!config) {
    if (value <= 2) return 'Strongly lean left';
    if (value <= 4) return 'Lean left';
    if (value <= 6) return 'Balanced / Mixed';
    if (value <= 8) return 'Lean right';
    return 'Strongly lean right';
  }
  const positionIndex = valueToPositionIndex(value, config.positions.length);
  return config.positions[positionIndex]?.title || 'Mixed';
}

function getImportanceLabel(v: number): string {
  if (v <= 1) return 'Not much';
  if (v <= 3.5) return 'A little';
  if (v <= 6) return 'Matters to me';
  if (v <= 8.5) return 'Really matters';
  return 'Deal breaker';
}

// ===========================================
// Main Component
// ===========================================

export default function BlueprintScreen() {
  const { profile, spec: blueprintSpec, isLoading: blueprintLoading, initializeFromSwipes, updateAxisValue, updateAxisImportance } = useBlueprint();

  // Assessment state
  const [spec, setSpec] = useState<Spec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blueprintState, setBlueprintState] = useState<BlueprintState>('not_started');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [axisQueue, setAxisQueue] = useState<string[]>([]);
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(2);
  const [axisResponses, setAxisResponses] = useState<Record<string, number>>({});
  const [swipes, setSwipes] = useState<SwipeEvent[]>([]);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  // Blueprint view state
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [editingAxisId, setEditingAxisId] = useState<string | null>(null);
  // Fetch spec and check if user has completed assessment
  useEffect(() => {
    async function fetchSpec() {
      try {
        setLoading(true);
        const fetchedSpec = await civicAxesApi.getSpec();
        setSpec(fetchedSpec);
        setSelectedDomains(new Set(fetchedSpec.domains.map(d => d.id)));
        setError(null);

        // Check if user already has a profile (has completed assessment before)
        if (profile && profile.domains && profile.domains.length > 0) {
          // Check if any axes have been set (not default)
          const hasSetAxes = profile.domains.some(d =>
            d.axes.some(a => a.source !== 'default')
          );
          if (hasSetAxes) {
            setBlueprintState('complete');
          }
        }
      } catch (err) {
        console.error('Failed to load civic axes spec:', err);
        setError('Failed to load assessment data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchSpec();
  }, [profile]);

  // Update blueprint state when profile changes
  useEffect(() => {
    if (profile && profile.domains && profile.domains.length > 0) {
      const hasSetAxes = profile.domains.some(d =>
        d.axes.some(a => a.source !== 'default')
      );
      if (hasSetAxes && blueprintState === 'not_started') {
        setBlueprintState('complete');
      }
    }
  }, [profile]);

  // Start assessment
  const startAssessment = (domains: Set<string>) => {
    if (!spec) return;
    setSelectedDomains(domains);
    const axes = getAxesForDomains(spec, domains);
    setAxisQueue(axes);
    setCurrentAxisIndex(0);
    setSliderPosition(2);
    setAxisResponses({});
    setBlueprintState('assessment');
  };

  // Calculate scores using backend API
  const calculateScores = async (swipes: SwipeEvent[]) => {
    try {
      const response = await civicAxesApi.scoreResponses(swipes);
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

  // Convert responses to swipes
  const convertResponsesToSwipes = (responses: Record<string, number>): SwipeEvent[] => {
    if (!spec) return [];
    const swipeEvents: SwipeEvent[] = [];

    Object.entries(responses).forEach(([axisId, position]) => {
      const config = getSliderConfig(axisId);
      if (!config) return;

      const totalPositions = config.positions.length;
      const score = sliderPositionToScore(position, totalPositions);

      const axisItems = spec.items.filter(item => axisId in item.axis_keys);

      axisItems.slice(0, 2).forEach(item => {
        const key = item.axis_keys[axisId];
        let response: SwipeResponse;
        const effectiveScore = score * key;

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
    const currentAxisId = axisQueue[currentAxisIndex];
    const currentAxisConfig = currentAxisId ? getSliderConfig(currentAxisId) : null;
    if (!currentAxisId || !currentAxisConfig) return;

    const newResponses = {
      ...axisResponses,
      [currentAxisId]: sliderPosition,
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
        await calculateScores(finalSwipes);
        initializeFromSwipes(finalSwipes);
        setBlueprintState('complete');
        return;
      }

      const nextIndex = currentAxisIndex + 1;
      const shouldShowTransitionMsg = checkForAxisTransition(nextIndex, axisQueue.length);

      if (shouldShowTransitionMsg) {
        setTransitionMessage(shouldShowTransitionMsg);
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
          setCurrentAxisIndex(nextIndex);
          setSliderPosition(2);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }, 1500);
      } else {
        setCurrentAxisIndex(nextIndex);
        setSliderPosition(2);
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
    const currentAxisId = axisQueue[currentAxisIndex];
    if (!currentAxisId) return;

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
        await calculateScores(finalSwipes);
        initializeFromSwipes(finalSwipes);
        setBlueprintState('complete');
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

  const handleRetake = () => {
    setSwipes([]);
    setAxisResponses({});
    setAxisQueue([]);
    setCurrentAxisIndex(0);
    setSliderPosition(2);
    setBlueprintState('not_started');
  };

  // Loading state
  if (loading || blueprintLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Error state
  if (error || !spec) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error || 'Failed to load assessment'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={async () => {
            try {
              setLoading(true);
              setError(null);
              const fetchedSpec = await civicAxesApi.getSpec();
              setSpec(fetchedSpec);
              setSelectedDomains(new Set(fetchedSpec.domains.map(d => d.id)));
            } catch (err) {
              setError('Failed to load assessment data. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // STATE 1: Not Started - Show Intro
  if (blueprintState === 'not_started') {
    return (
      <IntroScreen
        spec={spec}
        onStart={() => startAssessment(new Set(spec.domains.map(d => d.id)))}
      />
    );
  }

  // STATE 2: Assessment In Progress
  if (blueprintState === 'assessment') {
    if (showTransition) {
      return (
        <View style={styles.transitionContainer}>
          <Ionicons name="bulb" size={64} color="#7C3AED" />
          <Text style={styles.transitionText}>{transitionMessage}</Text>
        </View>
      );
    }

    const currentAxisId = axisQueue[currentAxisIndex];
    const currentAxisConfig = currentAxisId ? getSliderConfig(currentAxisId) : null;
    const currentAxis = currentAxisId ? spec.axes.find(a => a.id === currentAxisId) : null;
    const currentDomain = currentAxis ? spec.domains.find(d => d.id === currentAxis.domain_id) : null;

    if (!currentAxisConfig || !currentAxis) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    }

    const totalAxes = axisQueue.length;
    const progressPercentage = totalAxes > 0 ? ((currentAxisIndex) / totalAxes) * 100 : 0;
    const currentPosition = currentAxisConfig.positions[sliderPosition];
    const positionColor = getPositionColor(sliderPosition, currentAxisConfig.positions.length, currentAxisConfig.currentPolicyIndex);
    const totalPositions = currentAxisConfig.positions.length;

    return (
      <View style={styles.assessmentContainer}>
        {/* Progress Header */}
        <View style={styles.assessmentHeader}>
          <View style={styles.progressRow}>
            <View style={styles.domainBadge}>
              <Text style={styles.domainEmoji}>{getDomainEmoji(currentDomain?.id || '')}</Text>
              <Text style={styles.domainBadgeText}>{currentDomain?.name}</Text>
            </View>
            <Text style={styles.progressCount}>Question {currentAxisIndex + 1} of {totalAxes}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        {/* Question Card */}
        <ScrollView contentContainerStyle={styles.assessmentContent}>
          <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
            <Text style={styles.axisTitle}>{currentAxis.name}</Text>
            <Text style={styles.axisQuestion}>{currentAxisConfig.question}</Text>

            {/* Position Display */}
            <View style={[styles.positionCard, { borderColor: positionColor }]}>
              <Text style={styles.positionTitle}>{currentPosition.title}</Text>
              <Text style={styles.positionDescription}>{currentPosition.description}</Text>
              {currentPosition.isCurrentPolicy && (
                <View style={styles.currentPolicyBadge}>
                  <Text style={styles.currentPolicyText}>Current US Policy</Text>
                </View>
              )}
            </View>

            {/* Slider */}
            <DraggableSlider
              position={sliderPosition}
              totalPositions={totalPositions}
              onPositionChange={setSliderPosition}
              poleALabel={currentAxisConfig.poleALabel}
              poleBLabel={currentAxisConfig.poleBLabel}
            />
          </Animated.View>
        </ScrollView>

        {/* Navigation Footer */}
        <View style={styles.navSection}>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnSecondary]}
              onPress={handleBack}
              disabled={currentAxisIndex === 0}
            >
              <Text style={[
                styles.navBtnTextSecondary,
                currentAxisIndex === 0 && styles.navBtnTextDisabled
              ]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrimary]}
              onPress={handleNext}
            >
              <Text style={styles.navBtnTextPrimary}>
                {currentAxisIndex >= axisQueue.length - 1 ? 'Finish' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.skipLink} onPress={handleSkip}>
            <Text style={styles.skipLinkText}>Skip this question</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // STATE 3: Complete - Show Blueprint View
  if (!profile || !blueprintSpec) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your blueprint...</Text>
      </View>
    );
  }

  const currentDomain = blueprintSpec.domains[currentDomainIndex];
  const currentDomProfile = profile.domains.find(d => d.domain_id === currentDomain?.id);
  const currentDomainAxes = currentDomProfile?.axes ?? [];

  return (
    <View style={styles.container}>
      {/* Blueprint Header */}
      <View style={styles.blueprintHeader}>
        <View style={styles.blueprintTitleRow}>
          <Text style={styles.blueprintTitle}>Your Civic Blueprint</Text>
          <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
            <Ionicons name="refresh-outline" size={16} color={Colors.gray[600]} />
            <Text style={styles.retakeBtnText}>Retake</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.blueprintSubtitle}>Tap any position to fine-tune</Text>
      </View>

      {/* Domain Tabs */}
      <View style={styles.domainTabsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.domainTabs}
        >
          {blueprintSpec.domains.map((domain, index) => (
            <TouchableOpacity
              key={domain.id}
              style={[
                styles.domainTab,
                index === currentDomainIndex && styles.domainTabActive,
              ]}
              onPress={() => setCurrentDomainIndex(index)}
            >
              <Ionicons
                name={getDomainIcon(domain.id) as any}
                size={14}
                color={index === currentDomainIndex ? Colors.white : Colors.gray[600]}
              />
              <Text
                style={[
                  styles.domainTabText,
                  index === currentDomainIndex && styles.domainTabTextActive,
                ]}
              >
                {domain.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Domain Content */}
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.blueprintContent}>
          <View style={styles.domainCard}>
            {currentDomainAxes.length > 0 && (
              <View style={styles.axesList}>
                {currentDomainAxes.map((axis) => {
                  const axisDef = blueprintSpec.axes.find(a => a.id === axis.axis_id);
                  if (!axisDef) return null;

                  return (
                    <TouchableOpacity
                      key={axis.axis_id}
                      onPress={() => setEditingAxisId(axis.axis_id)}
                      activeOpacity={0.7}
                      style={styles.axisCardTouchable}
                    >
                      <CompactAxisBar
                        name={axisDef.name}
                        value={axis.value_0_10}
                        poleALabel={axisDef.poleA.label}
                        poleBLabel={axisDef.poleB.label}
                        axisId={axis.axis_id}
                        importance={axis.importance}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

        </ScrollView>
      </View>

      {/* Edit Axis Modal */}
      {editingAxisId && (
        <AxisEditModal
          axisId={editingAxisId}
          profile={profile}
          spec={blueprintSpec}
          onClose={() => setEditingAxisId(null)}
          onChangeAxisImportance={updateAxisImportance}
          onChangeAxis={updateAxisValue}
        />
      )}
    </View>
  );
}

// ===========================================
// Intro Screen Component
// ===========================================

function IntroScreen({
  spec,
  onStart,
}: {
  spec: Spec;
  onStart: () => void;
}) {
  return (
    <View style={introStyles.container}>
      <View style={introStyles.content}>
        <View style={introStyles.iconCircle}>
          <Ionicons name="map-outline" size={48} color={Colors.primary} />
        </View>

        <Text style={introStyles.title}>Draft Your Civic Blueprint</Text>
        <Text style={introStyles.description}>
          Answer a few questions to discover your policy positions. We'll create a personalized civic blueprint you can fine-tune.
        </Text>

        <View style={introStyles.steps}>
          <View style={introStyles.step}>
            <View style={introStyles.stepNumber}>
              <Text style={introStyles.stepNumberText}>1</Text>
            </View>
            <Text style={introStyles.stepText}>Answer adaptive questions</Text>
          </View>
          <View style={introStyles.step}>
            <View style={introStyles.stepNumber}>
              <Text style={introStyles.stepNumberText}>2</Text>
            </View>
            <Text style={introStyles.stepText}>See your civic blueprint</Text>
          </View>
          <View style={introStyles.step}>
            <View style={introStyles.stepNumber}>
              <Text style={introStyles.stepNumberText}>3</Text>
            </View>
            <Text style={introStyles.stepText}>Fine-tune your positions</Text>
          </View>
        </View>

        <TouchableOpacity style={introStyles.startButton} onPress={onStart}>
          <Text style={introStyles.startButtonText}>Start Drafting</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        <View style={introStyles.timeHint}>
          <Ionicons name="time-outline" size={16} color={Colors.gray[400]} />
          <Text style={introStyles.timeHintText}>Takes about 3-5 minutes</Text>
        </View>
      </View>
    </View>
  );
}

const introStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  steps: {
    gap: 12,
    marginBottom: 32,
    width: '100%',
    maxWidth: 280,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  stepText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  timeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  timeHintText: {
    fontSize: 13,
    color: Colors.gray[400],
  },
});

// ===========================================
// Draggable Slider Component
// ===========================================

function DraggableSlider({
  position,
  totalPositions,
  onPositionChange,
  poleALabel,
  poleBLabel,
}: {
  position: number;
  totalPositions: number;
  onPositionChange: (pos: number) => void;
  poleALabel: string;
  poleBLabel: string;
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
        if (trackWidth.current > 0) {
          const touchX = evt.nativeEvent.locationX;
          const newPos = Math.round((touchX / trackWidth.current) * (totalPositions - 1));
          const clampedPos = Math.max(0, Math.min(totalPositions - 1, newPos));
          onPositionChange(clampedPos);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (trackWidth.current > 0) {
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
    <View style={sliderStyles.container}>
      <Text style={[sliderStyles.poleLabel, sliderStyles.poleLabelLeft]}>
        {poleALabel}
      </Text>

      <View style={sliderStyles.trackContainer}>
        <View
          ref={trackRef}
          style={sliderStyles.trackOuter}
          onLayout={(e) => {
            trackWidth.current = e.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <View
              key={i}
              style={[
                sliderStyles.trackSegment,
                { backgroundColor: getGradientSegmentColor(i, 20) },
              ]}
            />
          ))}
          <Animated.View
            style={[
              sliderStyles.thumb,
              {
                left: `${thumbPosition}%`,
                borderColor: thumbColor,
                transform: [{ scale: isDragging ? 1.15 : 1 }],
              },
            ]}
          >
            <View style={[sliderStyles.thumbInner, { backgroundColor: thumbColor }]} />
          </Animated.View>
        </View>

        <View style={sliderStyles.tickMarks}>
          {Array.from({ length: totalPositions }, (_, idx) => (
            <TouchableOpacity
              key={idx}
              style={sliderStyles.tickTouchArea}
              onPress={() => onPositionChange(idx)}
            >
              <View style={[
                sliderStyles.tick,
                idx === position && sliderStyles.tickActive,
              ]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[sliderStyles.poleLabel, sliderStyles.poleLabelRight]}>
        {poleBLabel}
      </Text>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  poleLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flexShrink: 1,
    maxWidth: '20%',
    lineHeight: 15,
  },
  poleLabelLeft: {
    color: '#A855F7',
    textAlign: 'left',
  },
  poleLabelRight: {
    color: '#14B8A6',
    textAlign: 'right',
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

// ===========================================
// Compact Axis Bar Component (Blueprint View)
// ===========================================

function CompactAxisBar({
  name,
  value,
  poleALabel,
  poleBLabel,
  axisId,
  importance,
}: {
  name: string;
  value: number;
  poleALabel: string;
  poleBLabel: string;
  axisId: string;
  importance?: number;
}) {
  const config = getSliderConfig(axisId);
  const positionIndex = config ? valueToPositionIndex(value, config.positions.length) : -1;
  const currentPosition = config?.positions[positionIndex];
  const positionLabel = getPositionLabel(axisId, value);

  const getAccentColor = () => {
    if (value <= 3) return '#A855F7';
    if (value >= 7) return '#14B8A6';
    return '#6B7280';
  };

  const filled = Math.round(((importance ?? 5) / 10) * 4);

  return (
    <View style={axisBarStyles.container}>
      <View style={axisBarStyles.headerRow}>
        <Text style={axisBarStyles.name}>{name}</Text>
        <View style={axisBarStyles.importanceDots}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                axisBarStyles.importanceDot,
                i <= filled && axisBarStyles.importanceDotFilled,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={[axisBarStyles.stanceBox, { borderLeftColor: getAccentColor() }]}>
        <Text style={axisBarStyles.stanceText}>
          {currentPosition?.title || positionLabel}
        </Text>
      </View>

    </View>
  );
}

const axisBarStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray[800],
    flex: 1,
    lineHeight: 18,
  },
  importanceDots: {
    flexDirection: 'row',
    gap: 3,
  },
  importanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[200],
  },
  importanceDotFilled: {
    backgroundColor: Colors.primary,
  },
  stanceBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  stanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[900],
    lineHeight: 20,
  },
});

// ===========================================
// Axis Edit Modal
// ===========================================

function AxisEditModal({
  axisId,
  profile,
  spec,
  onClose,
  onChangeAxisImportance,
  onChangeAxis,
}: {
  axisId: string;
  profile: any;
  spec: any;
  onClose: () => void;
  onChangeAxisImportance: (axis_id: string, value: number) => void;
  onChangeAxis: (axis_id: string, value: number) => void;
}) {
  const axisDef = spec.axes.find((a: any) => a.id === axisId);

  let axisData: AxisProfile | undefined;
  for (const domain of profile.domains) {
    const found = domain.axes.find((a: any) => a.axis_id === axisId);
    if (found) {
      axisData = found;
      break;
    }
  }

  if (!axisDef || !axisData) return null;

  const config = getSliderConfig(axisId);
  const totalPositions = config?.positions.length || 5;
  const currentPositionIndex = config
    ? valueToPositionIndex(axisData.value_0_10, totalPositions)
    : Math.round(axisData.value_0_10 / 2);

  return (
    <Modal visible animationType="slide" transparent>
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{axisDef.name}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modalStyles.content}>
            <Text style={modalStyles.axisDesc}>{axisDef.description}</Text>

            {/* Position display */}
            {config && (
              <View style={modalStyles.positionCard}>
                <Text style={modalStyles.positionTitle}>
                  {config.positions[currentPositionIndex]?.title || 'Mixed'}
                </Text>
                {config.positions[currentPositionIndex]?.description && (
                  <Text style={modalStyles.positionDescription}>
                    {config.positions[currentPositionIndex].description}
                  </Text>
                )}
              </View>
            )}

            {/* Position Slider */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>Your position:</Text>
              <DraggableSlider
                position={currentPositionIndex}
                totalPositions={totalPositions}
                onPositionChange={(pos) => {
                  const newValue = Math.round((pos / (totalPositions - 1)) * 10);
                  onChangeAxis(axisId, newValue);
                }}
                poleALabel={config?.poleALabel || axisDef.poleA.label}
                poleBLabel={config?.poleBLabel || axisDef.poleB.label}
              />
            </View>

            <View style={modalStyles.divider} />

            {/* Importance */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>How much does this matter to you?</Text>
              <Text style={modalStyles.importanceValue}>{getImportanceLabel(axisData.importance ?? 5)}</Text>
              <View style={modalStyles.importanceBubbles}>
                {[0, 1, 2, 3, 4].map((i) => {
                  const currentPosition = Math.round(((axisData.importance ?? 5) / 10) * 4);
                  return (
                    <TouchableOpacity
                      key={i}
                      style={modalStyles.importanceBubbleTouchArea}
                      onPress={() => {
                        const newValue = Math.round((i / 4) * 10);
                        onChangeAxisImportance(axisId, newValue);
                      }}
                    >
                      <View
                        style={[
                          modalStyles.importanceBubble,
                          i <= currentPosition && modalStyles.importanceBubbleFilled,
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={modalStyles.importanceLabels}>
                <Text style={modalStyles.importanceEndLabel}>Not much</Text>
                <Text style={modalStyles.importanceEndLabel}>Deal breaker</Text>
              </View>
            </View>
          </ScrollView>

          <View style={modalStyles.footer}>
            <TouchableOpacity style={modalStyles.doneButton} onPress={onClose}>
              <Text style={modalStyles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.gray[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.gray[900],
    flex: 1,
    paddingRight: 16,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  axisDesc: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
  },
  positionCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  positionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[900],
    textAlign: 'center',
  },
  positionDescription: {
    fontSize: 13,
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 19,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray[500],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  importanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
    textAlign: 'center',
  },
  importanceBubbles: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  importanceBubbleTouchArea: {
    padding: 8,
  },
  importanceBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
    borderWidth: 2,
    borderColor: Colors.gray[300],
  },
  importanceBubbleFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  importanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  importanceEndLabel: {
    fontSize: 11,
    color: Colors.gray[500],
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});

// ===========================================
// Helper function
// ===========================================

function checkForAxisTransition(currentIndex: number, totalAxes: number): string | null {
  if (currentIndex === Math.floor(totalAxes * 0.33)) {
    return "Great start! Building your civic blueprint...";
  } else if (currentIndex === Math.floor(totalAxes * 0.66)) {
    return "Almost there! Refining your positions...";
  }
  return null;
}

// ===========================================
// Main Styles
// ===========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
  },
  loadingText: {
    marginTop: 12,
    color: Colors.gray[500],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  transitionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: 24,
  },
  transitionText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[700],
    textAlign: 'center',
  },

  // Assessment styles
  assessmentContainer: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  assessmentHeader: {
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.primary}15`,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  domainEmoji: {
    fontSize: 14,
  },
  domainBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressCount: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 3,
  },
  assessmentContent: {
    padding: 20,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  axisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 8,
  },
  axisQuestion: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
    marginBottom: 20,
  },
  positionCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  positionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  positionDescription: {
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 19,
  },
  currentPolicyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
  },
  currentPolicyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  navSection: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navBtnSecondary: {
    backgroundColor: Colors.gray[100],
  },
  navBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  navBtnTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  navBtnTextDisabled: {
    color: Colors.gray[300],
  },
  navBtnTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  skipLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  skipLinkText: {
    fontSize: 13,
    color: Colors.gray[400],
  },

  // Blueprint view styles
  blueprintHeader: {
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  blueprintTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blueprintTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.gray[900],
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
  },
  retakeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  blueprintSubtitle: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 4,
  },
  domainTabsBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  domainTabs: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  domainTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
  },
  domainTabActive: {
    backgroundColor: Colors.primary,
  },
  domainTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  domainTabTextActive: {
    color: Colors.white,
  },
  blueprintContent: {
    padding: 16,
    paddingBottom: 40,
  },
  domainCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  axesList: {
    gap: 12,
  },
  axisCardTouchable: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
});
