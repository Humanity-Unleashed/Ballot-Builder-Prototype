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
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { civicAxesApi, SwipeEvent, AxisScore } from '@/services/api';
import { deriveMetaDimensions, MetaDimensionScores } from '../../utils/archetypes';
import { generateValueSummary, getUserValueFramings, type ValueFramingConfig } from '../../utils/valueFraming';
import {
  initializeAdaptiveState,
} from '../../utils/adaptiveSelection';
import { useBlueprint } from '@/context/BlueprintContext';
import type { Spec, SwipeResponse } from '../../types/civicAssessment';
import type { AxisProfile } from '../../types/blueprintProfile';
import { getSliderConfig, getPositionColor, sliderPositionToScore } from '../../data/sliderPositions';
import { getFineTuningConfig, getFineTuningBreakdown, calculateFineTunedScore } from '../../data/fineTuningPositions';

// Blueprint state type
type BlueprintState = 'not_started' | 'assessment' | 'complete' | 'fine_tuning';

const DOMAIN_DISPLAY_NAMES: Record<string, string> = {
  econ: 'Economy',
  health: 'Healthcare',
  housing: 'Housing',
  justice: 'Justice',
  climate: 'Climate',
};

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
  const [fineTuningAxisId, setFineTuningAxisId] = useState<string | null>(null);
  const [fineTuningResponses, setFineTuningResponses] = useState<Record<string, Record<string, number>>>({});
  const router = useRouter();

  // Derived data for complete state cards
  const metaDimensions = useMemo(() => {
    if (!profile) return null;
    return deriveMetaDimensions(profile);
  }, [profile]);

  const topPriorities = useMemo(() => {
    if (!profile) return [];
    return [...profile.domains]
      .sort((a, b) => (b.importance.value_0_10 ?? 0) - (a.importance.value_0_10 ?? 0))
      .slice(0, 2)
      .map(d => DOMAIN_DISPLAY_NAMES[d.domain_id] || d.domain_id);
  }, [profile]);

  const valueSummary = useMemo(() => {
    return metaDimensions ? generateValueSummary(metaDimensions) : null;
  }, [metaDimensions]);

  const valueFramings = useMemo(() => {
    return metaDimensions ? getUserValueFramings(metaDimensions) : [];
  }, [metaDimensions]);

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
    setFineTuningResponses({});
    setFineTuningAxisId(null);
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

  // STATE 2.5: Fine-Tuning
  if (blueprintState === 'fine_tuning' && fineTuningAxisId && spec) {
    return (
      <FineTuningScreen
        axisId={fineTuningAxisId}
        spec={spec}
        existingResponses={fineTuningResponses[fineTuningAxisId] || {}}
        onComplete={(responses) => {
          setFineTuningResponses(prev => ({ ...prev, [fineTuningAxisId]: responses }));
          setFineTuningAxisId(null);
          setBlueprintState('complete');
        }}
        onCancel={() => {
          setFineTuningAxisId(null);
          setBlueprintState('complete');
        }}
      />
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
      </View>

      {/* Single ScrollView with all content */}
      <ScrollView contentContainerStyle={styles.blueprintContent}>
        {/* Values Spectrum Card */}
        {metaDimensions && <ValuesSpectrumCard metaDimensions={metaDimensions} />}

        {/* Value Summary Card */}
        {metaDimensions && valueSummary && (
          <ValueSummaryCard summary={valueSummary} framings={valueFramings} />
        )}

        {/* Priority Insight Card */}
        {topPriorities.length >= 2 && (
          <PriorityInsightCard priorities={topPriorities} />
        )}

        {/* Domain Tabs */}
        <View style={styles.domainTabsInline}>
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

        {/* Domain Content - Axis Bars */}
        <Text style={styles.fineTuneHint}>Tap any position to fine-tune</Text>
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
                      isFineTuned={!!fineTuningResponses[axis.axis_id]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Vote CTA Card */}
        <VoteCTACard onPress={() => router.push('/(tabs)/ballot-builder')} />
      </ScrollView>

      {/* Edit Axis Modal */}
      {editingAxisId && (
        <AxisEditModal
          axisId={editingAxisId}
          profile={profile}
          spec={blueprintSpec}
          onClose={() => setEditingAxisId(null)}
          onChangeAxisImportance={updateAxisImportance}
          onChangeAxis={updateAxisValue}
          onFineTune={(axisId) => {
            setEditingAxisId(null);
            setFineTuningAxisId(axisId);
            setBlueprintState('fine_tuning');
          }}
          fineTuningResponses={fineTuningResponses[editingAxisId] || {}}
        />
      )}
    </View>
  );
}

// ===========================================
// Values Spectrum Card Component
// ===========================================

function scoreToPercents(score: number, invert: boolean): { leftPct: number; rightPct: number } {
  const leftPct = Math.round(((invert ? score : -score) + 1) / 2 * 100);
  return { leftPct, rightPct: 100 - leftPct };
}

const SPECTRUM_BARS: {
  key: keyof MetaDimensionScores;
  axisName: string;
  leftLabel: string;
  rightLabel: string;
  leftIdLabel: string;
  rightIdLabel: string;
  leftColor: string;
  rightColor: string;
  invert: boolean;
}[] = [
  {
    key: 'responsibility_orientation',
    axisName: 'Social Model',
    leftLabel: 'Community',
    rightLabel: 'Individual',
    leftIdLabel: 'Communitarian',
    rightIdLabel: 'Individualist',
    leftColor: '#6366F1', // indigo
    rightColor: '#F97316', // orange
    invert: false,
  },
  {
    key: 'change_tempo',
    axisName: 'Reform Appetite',
    leftLabel: 'Stability',
    rightLabel: 'Change',
    leftIdLabel: 'Incrementalist',
    rightIdLabel: 'Reformist',
    leftColor: '#0EA5E9', // sky
    rightColor: '#E11D48', // rose
    invert: true,
  },
  {
    key: 'governance_style',
    axisName: 'Oversight',
    leftLabel: 'Standards',
    rightLabel: 'Flexibility',
    leftIdLabel: 'Regulationist',
    rightIdLabel: 'Autonomist',
    leftColor: '#EAB308', // amber
    rightColor: '#16A34A', // green
    invert: false,
  },
];

function ValuesSpectrumCard({ metaDimensions }: { metaDimensions: MetaDimensionScores }) {
  return (
    <View style={spectrumStyles.card}>
      <Text style={spectrumStyles.title}>Your Values Spectrum</Text>
      {SPECTRUM_BARS.map((bar) => {
        const { leftPct, rightPct } = scoreToPercents(metaDimensions[bar.key], bar.invert);
        const leftWins = leftPct >= rightPct;
        const winnerLabel = leftPct === rightPct ? 'Balanced' : leftWins ? bar.leftIdLabel : bar.rightIdLabel;
        const winnerColor = leftPct === rightPct ? Colors.gray[500] : leftWins ? bar.leftColor : bar.rightColor;
        return (
          <View key={bar.key} style={spectrumStyles.row}>
            <View style={spectrumStyles.axisHeader}>
              <Text style={spectrumStyles.axisName}>{bar.axisName}</Text>
              <Text style={[spectrumStyles.winnerLabel, { color: winnerColor }]}>{winnerLabel}</Text>
            </View>
            <View style={spectrumStyles.barRow}>
              <Text style={[spectrumStyles.pct, { color: bar.leftColor }]}>{leftPct}%</Text>
              <View style={spectrumStyles.barTrack}>
                <View style={[spectrumStyles.barLeft, { width: `${leftPct}%`, backgroundColor: bar.leftColor }]} />
                <View style={[spectrumStyles.barRight, { width: `${rightPct}%`, backgroundColor: bar.rightColor }]} />
              </View>
              <Text style={[spectrumStyles.pct, { color: bar.rightColor, textAlign: 'right' }]}>{rightPct}%</Text>
            </View>
            <View style={spectrumStyles.labelRow}>
              <Text style={[spectrumStyles.label, { color: bar.leftColor }]}>{bar.leftLabel}</Text>
              <Text style={[spectrumStyles.label, { color: bar.rightColor, textAlign: 'right' }]}>{bar.rightLabel}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const spectrumStyles = StyleSheet.create({
  card: {
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 12,
  },
  row: {
    marginBottom: 14,
  },
  axisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  axisName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  winnerLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pct: {
    fontSize: 12,
    fontWeight: '700',
    width: 32,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barLeft: {
    height: '100%',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  barRight: {
    height: '100%',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
});

// ===========================================
// Value Summary Card Component
// ===========================================

function ValueSummaryCard({ summary, framings }: { summary: string; framings: ValueFramingConfig[] }) {
  // Bold the coreValueLabels within the summary text
  const renderSummaryText = () => {
    if (framings.length === 0) {
      return <Text style={valueSummaryStyles.summaryText}>{summary}</Text>;
    }

    const labels = framings.map(f => f.coreValueLabel);
    // Build a regex that matches any of the labels
    const pattern = new RegExp(`(${labels.map(l => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    const parts = summary.split(pattern);

    return (
      <Text style={valueSummaryStyles.summaryText}>
        {parts.map((part, i) =>
          labels.includes(part) ? (
            <Text key={i} style={valueSummaryStyles.summaryBold}>{part}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    <View style={valueSummaryStyles.card}>
      <Text style={valueSummaryStyles.label}>YOUR CIVIC PERSPECTIVE</Text>
      {renderSummaryText()}
      {framings.length > 0 && (
        <View style={valueSummaryStyles.chipsRow}>
          {framings.map((f) => (
            <View key={f.metaDimension} style={valueSummaryStyles.chip}>
              <Text style={valueSummaryStyles.chipText}>{f.coreValueLabel}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const valueSummaryStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  summaryBold: {
    fontWeight: '700',
    color: '#5B21B6',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D28D9',
  },
});

// ===========================================
// Priority Insight Card Component
// ===========================================

function PriorityInsightCard({ priorities }: { priorities: string[] }) {
  return (
    <View style={insightStyles.card}>
      <Ionicons name="trending-up" size={20} color="#059669" />
      <Text style={insightStyles.text}>
        <Text style={insightStyles.bold}>{priorities[0]}</Text> and{' '}
        <Text style={insightStyles.bold}>{priorities[1]}</Text> are your top priorities
      </Text>
    </View>
  );
}

const insightStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  text: {
    fontSize: 14,
    color: '#065F46',
    flex: 1,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
});

// ===========================================
// Vote CTA Card Component
// ===========================================

function VoteCTACard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={ctaStyles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={ctaStyles.content}>
        <Ionicons name="checkbox-outline" size={24} color={Colors.white} />
        <View style={ctaStyles.textWrap}>
          <Text style={ctaStyles.title}>Make My Voting Plan</Text>
          <Text style={ctaStyles.subtitle}>Match your blueprint to real candidates</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
      </View>
    </TouchableOpacity>
  );
}

const ctaStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
});

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
  isFineTuned,
}: {
  name: string;
  value: number;
  poleALabel: string;
  poleBLabel: string;
  axisId: string;
  importance?: number;
  isFineTuned?: boolean;
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

      {isFineTuned && (
        <View style={axisBarStyles.fineTunedBadge}>
          <Ionicons name="checkmark-circle" size={12} color="#059669" />
          <Text style={axisBarStyles.fineTunedText}>Position refined</Text>
        </View>
      )}
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
  fineTunedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fineTunedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
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
  onFineTune,
  fineTuningResponses,
}: {
  axisId: string;
  profile: any;
  spec: any;
  onClose: () => void;
  onChangeAxisImportance: (axis_id: string, value: number) => void;
  onChangeAxis: (axis_id: string, value: number) => void;
  onFineTune: (axisId: string) => void;
  fineTuningResponses: Record<string, number>;
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

            {/* Fine-tuning section */}
            {getFineTuningConfig(axisId) && (
              <>
                <View style={modalStyles.divider} />

                {Object.keys(fineTuningResponses).length > 0 ? (
                  <View style={modalStyles.section}>
                    <FineTuneBreakdownView axisId={axisId} responses={fineTuningResponses} />
                    <TouchableOpacity
                      style={modalStyles.fineTuneButtonCompleted}
                      onPress={() => onFineTune(axisId)}
                    >
                      <Ionicons name="refresh-outline" size={16} color="#059669" />
                      <Text style={modalStyles.fineTuneButtonTextCompleted}>Re-fine-tune position</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={modalStyles.section}>
                    <TouchableOpacity
                      style={modalStyles.fineTuneButton}
                      onPress={() => onFineTune(axisId)}
                    >
                      <Ionicons name="options-outline" size={18} color={Colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={modalStyles.fineTuneButtonText}>Fine-tune my position</Text>
                        <Text style={modalStyles.fineTuneQuestionCount}>
                          {getFineTuningConfig(axisId)!.subDimensions.length} sub-topics to explore
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={Colors.gray[400]} />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
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
  fineTuneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${Colors.primary}08`,
    borderWidth: 1,
    borderColor: `${Colors.primary}25`,
    borderRadius: 12,
    padding: 14,
  },
  fineTuneButtonCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  fineTuneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  fineTuneButtonTextCompleted: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  fineTuneQuestionCount: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 2,
  },
});

// ===========================================
// Fine-Tuning Screen Component
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
              {currentIndex >= totalQuestions - 1 ? 'Finish' : 'Next \u2192'}
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 8,
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  subDimensionQuestion: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 22,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  positionDisplay: {
    flex: 1,
    justifyContent: 'center',
  },
  positionCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'stretch',
    minHeight: 100,
    justifyContent: 'center',
    marginBottom: 20,
  },
  positionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[900],
    textAlign: 'center',
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  positionDescription: {
    fontSize: 13,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  currentPolicyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
    alignSelf: 'center',
  },
  currentPolicyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  sliderSection: {
    width: '100%',
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

// ===========================================
// Fine-Tune Breakdown View Component (for modal)
// ===========================================

function FineTuneBreakdownView({
  axisId,
  responses,
}: {
  axisId: string;
  responses: Record<string, number>;
}) {
  const breakdown = getFineTuningBreakdown(axisId, responses);
  const overallScore = calculateFineTunedScore(axisId, responses);

  if (breakdown.length === 0) return null;

  const getAccentColor = (score: number) => {
    if (score <= -0.3) return '#A855F7';
    if (score >= 0.3) return '#14B8A6';
    return '#6B7280';
  };

  return (
    <View style={ftBreakdownStyles.container}>
      <Text style={ftBreakdownStyles.title}>Your fine-tuned positions</Text>

      {breakdown.map((item) => (
        <View key={item.subDimensionId} style={[ftBreakdownStyles.itemBox, { borderLeftColor: getAccentColor(item.score) }]}>
          <Text style={ftBreakdownStyles.itemName}>{item.name}</Text>
          <Text style={ftBreakdownStyles.itemPosition}>{item.positionTitle}</Text>
        </View>
      ))}

      {overallScore !== null && (
        <View style={ftBreakdownStyles.summaryBox}>
          <Ionicons name="analytics-outline" size={14} color={Colors.gray[500]} />
          <Text style={ftBreakdownStyles.summaryText}>
            Overall: {overallScore <= -0.3 ? 'Leans progressive' : overallScore >= 0.3 ? 'Leans conservative' : 'Mixed / balanced'}
          </Text>
        </View>
      )}
    </View>
  );
}

const ftBreakdownStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray[500],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  itemBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 4,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[500],
    marginBottom: 2,
  },
  itemPosition: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[900],
    lineHeight: 18,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[600],
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
  fineTuneHint: {
    fontSize: 12,
    color: Colors.gray[400],
    textAlign: 'center',
    marginBottom: 8,
  },
  domainTabsBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  domainTabsInline: {
    marginBottom: 12,
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
    paddingHorizontal: 16,
    paddingTop: 16,
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
