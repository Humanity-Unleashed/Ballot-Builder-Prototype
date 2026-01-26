/**
 * Blueprint V3 - Streamlined Single-Screen View
 *
 * Shows user's civic blueprint at a glance without requiring multiple taps.
 * No animal archetypes - just clear, actionable policy positions.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useBlueprint } from '@/context/BlueprintContext';
import type { AxisProfile } from '../../types/blueprintProfile';
import { getSliderConfig } from '../../data/sliderPositions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function to convert 0-10 value to position index
function valueToPositionIndex(value: number, totalPositions: number): number {
  return Math.round((value / 10) * (totalPositions - 1));
}

// Helper function to get a descriptive stance label based on value (for axes without slider config)
function getGenericStanceLabel(value: number): string {
  if (value <= 2) return 'Strongly lean left';
  if (value <= 4) return 'Lean left';
  if (value <= 6) return 'Balanced / Mixed';
  if (value <= 8) return 'Lean right';
  return 'Strongly lean right';
}

// Helper function to get position label for an axis
function getPositionLabel(axisId: string, value: number): string {
  const config = getSliderConfig(axisId);
  if (!config) return getGenericStanceLabel(value);

  const positionIndex = valueToPositionIndex(value, config.positions.length);
  const position = config.positions[positionIndex];

  return position?.title || getGenericStanceLabel(value);
}

// Helper function to convert source type to display text
function getSourceLabel(source: string): string | null {
  switch (source) {
    case 'learned_from_swipes':
      return 'From assessment';
    case 'user_edited':
      return 'You set this';
    case 'default':
    default:
      return null; // Hide for default values
  }
}

// Helper function to convert 0-1 confidence to label
function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.7) return 'High confidence';
  if (confidence >= 0.4) return 'Medium confidence';
  return 'Low confidence';
}

// Helper function to get color based on confidence level
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return '#10B981'; // Green
  if (confidence >= 0.4) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
}

// Helper function to get segment color based on position
function getPositionSegmentColor(index: number, totalPositions: number, currentPolicyIndex: number): string {
  if (index === currentPolicyIndex) {
    return '#9CA3AF'; // Grey - current policy
  }

  const distanceFromCenter = Math.abs(index - currentPolicyIndex) / currentPolicyIndex;

  if (index < currentPolicyIndex) {
    // Purple side (poleA)
    return distanceFromCenter > 0.5 ? '#A855F7' : '#C084FC';
  } else {
    // Teal side (poleB)
    return distanceFromCenter > 0.5 ? '#14B8A6' : '#5EEAD4';
  }
}

export default function BlueprintV3Screen() {
  const { profile, spec, isLoading, updateAxisValue, updateAxisImportance } = useBlueprint();
  const [editingDomain, setEditingDomain] = useState<string | null>(null);

  if (isLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // Compute summary stats
  const stats = useMemo(() => {
    const topPriorities = profile.domains
      .filter(d => d.importance.value_0_10 >= 7)
      .map(d => spec.domains.find(sd => sd.id === d.domain_id)?.name)
      .filter(Boolean);

    const totalAxes = profile.domains.reduce((sum, d) => sum + d.axes.length, 0);
    const editedAxes = profile.domains.reduce(
      (sum, d) => sum + d.axes.filter(a => a.source === 'user_edited').length,
      0
    );

    return { topPriorities, totalAxes, editedAxes };
  }, [profile, spec]);

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

  const handleSaveDomain = () => {
    setEditingDomain(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Civic Blueprint</Text>
          <Text style={styles.subtitle}>
            {stats.topPriorities.length > 0
              ? `Top priorities: ${stats.topPriorities.slice(0, 3).join(', ')}`
              : 'Tap any area to adjust your positions'}
          </Text>
        </View>

        {/* All Domains - Compact Multi-Bar Cards */}
        {spec.domains.map((domain) => {
          const domProfile = profile.domains.find((d) => d.domain_id === domain.id);
          const importance = domProfile?.importance.value_0_10 ?? 5;
          const domainAxes = domProfile?.axes ?? [];

          return (
            <TouchableOpacity
              key={domain.id}
              style={styles.domainCard}
              onPress={() => setEditingDomain(domain.id)}
              activeOpacity={0.7}
            >
              {/* Domain Header Row */}
              <View style={styles.domainHeader}>
                <View style={styles.domainIconContainer}>
                  <Ionicons name={getDomainIcon(domain.id) as any} size={20} color={Colors.primary} />
                </View>
                <View style={styles.domainTitleArea}>
                  <Text style={styles.domainName}>{domain.name}</Text>
                </View>
                <Ionicons name="pencil-outline" size={18} color={Colors.gray[400]} />
              </View>

              {/* All Axes as Compact Bars */}
              {domainAxes.length > 0 && (
                <View style={styles.axesList}>
                  {domainAxes.map((axis) => {
                    const axisDef = spec.axes.find(a => a.id === axis.axis_id);
                    if (!axisDef) return null;

                    return (
                      <CompactAxisBar
                        key={axis.axis_id}
                        name={axisDef.name}
                        value={axis.value_0_10}
                        poleALabel={axisDef.poleA.label}
                        poleBLabel={axisDef.poleB.label}
                        axisId={axis.axis_id}
                        importance={axis.importance}
                        source={axis.source}
                        confidence={axis.confidence_0_1}
                      />
                    );
                  })}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Footer hint */}
        <Text style={styles.footerHint}>
          Tap any policy area to fine-tune your positions
        </Text>
      </ScrollView>

      {/* Edit Domain Modal */}
      {editingDomain && (
        <DomainEditModal
          domainId={editingDomain}
          profile={profile}
          spec={spec}
          onClose={() => setEditingDomain(null)}
          onChangeAxisImportance={updateAxisImportance}
          onChangeAxis={updateAxisValue}
        />
      )}
    </View>
  );
}

// =====================================================
// ImportanceBar Component - Compact visual indicator
// =====================================================

function ImportanceBar({ value }: { value: number }) {
  // Map 0-10 value to 0-4 dots filled (5 positions)
  const filled = Math.round((value / 10) * 4);
  const label = getImportanceLabel(value);

  return (
    <View style={importanceStyles.container}>
      <View style={importanceStyles.dots}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              importanceStyles.dot,
              i <= filled && importanceStyles.dotFilled,
            ]}
          />
        ))}
      </View>
      <Text style={importanceStyles.label}>{label}</Text>
    </View>
  );
}

function getImportanceLabel(v: number): string {
  // Map to 5 positions: 0, 2.5, 5, 7.5, 10
  if (v <= 1) return 'Not much';
  if (v <= 3.5) return 'A little';
  if (v <= 6) return 'Matters to me';
  if (v <= 8.5) return 'Really matters';
  return 'Deal breaker';
}

const importanceStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[200],
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 12,
    color: Colors.gray[500],
  },
});

// =====================================================
// CompactAxisBar Component - Style B: Gradient Bar with Marker
// =====================================================

function CompactAxisBar({
  name,
  value,
  poleALabel,
  poleBLabel,
  axisId,
  importance,
  source,
  confidence,
}: {
  name: string;
  value: number;
  poleALabel: string;
  poleBLabel: string;
  axisId: string;
  importance?: number;
  source?: string;
  confidence?: number;
}) {
  const positionLabel = getPositionLabel(axisId, value);
  const config = getSliderConfig(axisId);
  const positionIndex = config ? valueToPositionIndex(value, config.positions.length) : -1;
  const currentPosition = config?.positions[positionIndex];

  // Calculate marker position (0-100%)
  const markerPosition = (value / 10) * 100;

  // Determine accent color based on position
  const getAccentColor = () => {
    if (value <= 3) return '#A855F7'; // Purple - toward poleA
    if (value >= 7) return '#14B8A6'; // Teal - toward poleB
    return '#6B7280'; // Gray - center/mixed
  };

  return (
    <View style={axisBarStyles.container}>
      {/* Header with axis name */}
      <Text style={axisBarStyles.name}>{name}</Text>

      {/* Stance box - prominent display of the position title */}
      <View style={[axisBarStyles.stanceBox, { borderLeftColor: getAccentColor() }]}>
        <Text style={axisBarStyles.stanceText}>
          {currentPosition?.title || positionLabel}
        </Text>
        {currentPosition?.isCurrentPolicy && (
          <View style={axisBarStyles.currentPolicyBadge}>
            <Text style={axisBarStyles.currentPolicyText}>Current Policy</Text>
          </View>
        )}
      </View>

      {/* Gradient bar with marker */}
      <View style={axisBarStyles.barWrapper}>
        <View style={axisBarStyles.gradientBar}>
          {/* We simulate gradient with 3 sections */}
          <View style={axisBarStyles.barSectionPurple} />
          <View style={axisBarStyles.barSectionGray} />
          <View style={axisBarStyles.barSectionTeal} />
        </View>

        {/* Marker */}
        <View style={[axisBarStyles.marker, { left: `${markerPosition}%` }]}>
          <View style={[axisBarStyles.markerInner, { borderColor: getAccentColor() }]} />
        </View>
      </View>

      {/* Pole labels */}
      <View style={axisBarStyles.labelsRow}>
        <Text style={axisBarStyles.poleLabelLeft}>{poleALabel}</Text>
        <Text style={axisBarStyles.poleLabelRight}>{poleBLabel}</Text>
      </View>
    </View>
  );
}

const axisBarStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray[800],
  },
  stanceBox: {
    backgroundColor: '#F5F3FF', // Light purple-tinted background
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#A855F7',
  },
  stanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[900],
    lineHeight: 20,
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
  barWrapper: {
    position: 'relative',
    height: 20,
    justifyContent: 'center',
    marginTop: 4,
  },
  gradientBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barSectionPurple: {
    flex: 1,
    backgroundColor: '#A855F7',
  },
  barSectionGray: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  barSectionTeal: {
    flex: 1,
    backgroundColor: '#14B8A6',
  },
  marker: {
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    marginLeft: -12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poleLabelLeft: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A855F7',
    textTransform: 'uppercase',
  },
  poleLabelRight: {
    fontSize: 10,
    fontWeight: '600',
    color: '#14B8A6',
    textTransform: 'uppercase',
  },
});

// =====================================================
// DomainEditModal - Full editing interface
// =====================================================

interface Spec {
  domains: Array<{ id: string; name: string }>;
  axes: Array<{
    id: string;
    domain_id: string;
    name: string;
    description: string;
    poleA: { label: string };
    poleB: { label: string };
  }>;
}

interface Profile {
  domains: Array<{
    domain_id: string;
    importance: { value_0_10: number };
    axes: AxisProfile[];
  }>;
}

function DomainEditModal({
  domainId,
  profile,
  spec,
  onClose,
  onChangeAxisImportance,
  onChangeAxis,
}: {
  domainId: string;
  profile: Profile;
  spec: Spec;
  onClose: () => void;
  onChangeAxisImportance: (axis_id: string, value: number) => void;
  onChangeAxis: (axis_id: string, value: number) => void;
}) {
  const domain = spec.domains.find(d => d.id === domainId);
  const domProfile = profile.domains.find(d => d.domain_id === domainId);

  if (!domain || !domProfile) return null;

  return (
    <Modal visible animationType="slide" transparent>
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{domain.name}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modalStyles.content}>
            {/* All Axes with Position and Importance */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>YOUR POSITIONS</Text>
              {domProfile.axes.map((axis) => {
                const axisDef = spec.axes.find(a => a.id === axis.axis_id);
                if (!axisDef) return null;

                return (
                  <View key={axis.axis_id} style={modalStyles.axisCard}>
                    <Text style={modalStyles.axisName}>{axisDef.name}</Text>
                    <Text style={modalStyles.axisDesc}>{axisDef.description}</Text>

                    {/* Importance Slider for this axis */}
                    <View style={modalStyles.importanceSection}>
                      <Text style={modalStyles.importanceLabel}>Priority:</Text>
                      <DiscreteSlider
                        value={axis.importance ?? 5}
                        onChange={(v) => onChangeAxisImportance(axis.axis_id, v)}
                        leftLabel="Not much"
                        midLabel="Matters to me"
                        rightLabel="Deal breaker"
                        variant="importance"
                      />
                    </View>

                    <View style={modalStyles.miniDivider} />

                    {/* Position Slider */}
                    <View style={modalStyles.positionSection}>
                      <Text style={modalStyles.positionLabel}>Your position:</Text>
                      <DiscreteSlider
                        value={Math.round(axis.value_0_10)}
                        onChange={(v) => onChangeAxis(axis.axis_id, v)}
                        leftLabel={axisDef.poleA.label}
                        midLabel="Mixed"
                        rightLabel={axisDef.poleB.label}
                        variant="stance"
                        axisId={axis.axis_id}
                      />
                    </View>
                  </View>
                );
              })}
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
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  section: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray[500],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  axisCard: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  axisName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  axisDesc: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
    marginBottom: 4,
  },
  importanceSection: {
    gap: 8,
  },
  importanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miniDivider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 8,
  },
  positionSection: {
    gap: 8,
  },
  positionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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

// =====================================================
// DiscreteSlider Component
// =====================================================

function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

function getGradientColor(position: number, variant: 'importance' | 'stance' = 'stance'): string {
  const t = position / 10;

  if (variant === 'importance') {
    // 5 color stops for importance: light grey → light blue → medium blue → bright blue → deep blue
    if (t <= 0.25) {
      return interpolateColor('#E5E7EB', '#BFDBFE', t * 4);
    } else if (t <= 0.5) {
      return interpolateColor('#BFDBFE', '#93C5FD', (t - 0.25) * 4);
    } else if (t <= 0.75) {
      return interpolateColor('#93C5FD', '#60A5FA', (t - 0.5) * 4);
    } else {
      return interpolateColor('#60A5FA', '#3B82F6', (t - 0.75) * 4);
    }
  } else {
    if (t < 0.5) {
      return interpolateColor('#A855F7', '#E5E7EB', t * 2);
    } else {
      return interpolateColor('#E5E7EB', '#14B8A6', (t - 0.5) * 2);
    }
  }
}

function DiscreteSlider({
  value,
  onChange,
  leftLabel,
  midLabel,
  rightLabel,
  variant = 'stance',
  axisId,
}: {
  value: number;
  onChange: (v: number) => void;
  leftLabel?: string;
  midLabel?: string;
  rightLabel?: string;
  variant?: 'importance' | 'stance';
  axisId?: string;
}) {
  // Get position details if axisId is provided
  const config = axisId ? getSliderConfig(axisId) : undefined;

  // Use position-based segments for axes, 5 segments for importance
  const usePositions = config && config.positions.length > 0;
  const numSegments = usePositions ? config.positions.length : 5; // Changed from 11 to 5 for importance
  const segments = Array.from({ length: numSegments }, (_, i) => i);

  // Convert value to position index
  const positionIndex = usePositions
    ? valueToPositionIndex(value, numSegments)
    : Math.round((value / 10) * (numSegments - 1)); // Convert 0-10 to 0-4 for importance
  const thumbPosition = (positionIndex / (numSegments - 1)) * 100;
  const currentPosition = config?.positions[positionIndex];

  // For stance sliders without config, show a generic stance label
  const getStanceDisplayLabel = () => {
    if (value <= 2) return 'Strongly toward ' + (leftLabel || 'left');
    if (value <= 4) return 'Leaning toward ' + (leftLabel || 'left');
    if (value <= 6) return 'Balanced / Mixed';
    if (value <= 8) return 'Leaning toward ' + (rightLabel || 'right');
    return 'Strongly toward ' + (rightLabel || 'right');
  };

  return (
    <View style={sliderStyles.wrapper}>
      {/* Position display card for axes, or importance label for priority */}
      {variant === 'stance' ? (
        // Stance slider - show position card
        <View style={sliderStyles.positionCard}>
          <Text style={sliderStyles.positionTitle}>
            {currentPosition?.title || getStanceDisplayLabel()}
          </Text>
          {currentPosition?.description && (
            <Text style={sliderStyles.positionDescription}>{currentPosition.description}</Text>
          )}
          {currentPosition?.isCurrentPolicy && (
            <View style={sliderStyles.currentPolicyBadge}>
              <Text style={sliderStyles.currentPolicyText}>Current US Policy</Text>
            </View>
          )}
        </View>
      ) : (
        // Importance slider - show importance label
        <View style={sliderStyles.importanceLabelContainer}>
          <Text style={sliderStyles.importanceLabelText}>{getImportanceLabel(value)}</Text>
        </View>
      )}

      <View style={sliderStyles.trackContainer}>
        {/* Gradient track */}
        <View style={sliderStyles.gradientTrack}>
          {segments.map((i) => {
            // Get color based on segment type
            let segmentColor: string;
            if (usePositions) {
              segmentColor = getPositionSegmentColor(i, numSegments, config?.currentPolicyIndex || 2);
            } else {
              // For importance, convert segment index to 0-10 scale for color
              const colorValue = Math.round((i / (numSegments - 1)) * 10);
              segmentColor = getGradientColor(colorValue, variant);
            }

            return (
              <TouchableOpacity
                key={i}
                style={[
                  sliderStyles.segment,
                  { backgroundColor: segmentColor },
                  i === 0 && sliderStyles.segmentFirst,
                  i === numSegments - 1 && sliderStyles.segmentLast,
                ]}
                onPress={() => {
                  // Convert position index to 0-10 value
                  const newValue = Math.round((i / (numSegments - 1)) * 10);
                  onChange(newValue);
                }}
                activeOpacity={0.8}
              />
            );
          })}
        </View>

        {/* Thumb indicator */}
        <View
          style={[sliderStyles.thumb, { left: `${thumbPosition}%` }]}
          pointerEvents="none"
        >
          <View style={[sliderStyles.thumbInner, { borderColor: '#7C3AED' }]}>
            <View style={sliderStyles.thumbDot} />
          </View>
        </View>

        {/* Center marker */}
        <View style={sliderStyles.centerMarker} pointerEvents="none" />
      </View>

      {/* Tick marks below track */}
      <View style={sliderStyles.tickMarks}>
        {segments.map((i) => {
          const isCenterPosition = usePositions
            ? i === config?.currentPolicyIndex
            : i === Math.floor(numSegments / 2); // Center position for importance (position 2 of 5)
          const isActivePosition = i === positionIndex;
          const newValue = Math.round((i / (numSegments - 1)) * 10);

          return (
            <TouchableOpacity
              key={i}
              style={sliderStyles.tickTouchArea}
              onPress={() => onChange(newValue)}
              activeOpacity={0.8}
            >
              <View style={[
                sliderStyles.tick,
                isCenterPosition && sliderStyles.tickCenter,
                isActivePosition && sliderStyles.tickActive,
              ]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Labels */}
      <View style={sliderStyles.labels}>
        <Text style={[sliderStyles.labelText, sliderStyles.labelLeft, { color: variant === 'stance' ? '#A855F7' : Colors.gray[500] }]} numberOfLines={2}>
          {usePositions ? config?.poleALabel.replace('\n', ' ') : leftLabel ?? ''}
        </Text>
        {!usePositions && (
          <Text style={[sliderStyles.labelText, sliderStyles.labelCenter, { color: Colors.gray[400] }]} numberOfLines={2}>
            {midLabel ?? 'Mixed'}
          </Text>
        )}
        <Text style={[sliderStyles.labelText, sliderStyles.labelRight, { color: variant === 'stance' ? '#14B8A6' : '#3B82F6' }]} numberOfLines={2}>
          {usePositions ? config?.poleBLabel.replace('\n', ' ') : rightLabel ?? ''}
        </Text>
      </View>

    </View>
  );
}

const sliderStyles = StyleSheet.create({
  wrapper: { gap: 16 },
  positionCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  positionDescription: {
    fontSize: 13,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 18,
  },
  currentPolicyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  currentPolicyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  importanceLabelContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  importanceLabelText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  valueChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  trackContainer: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  gradientTrack: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    height: '100%',
  },
  segmentFirst: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  segmentLast: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    marginLeft: -18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    borderWidth: 4,
  },
  thumbDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C3AED',
  },
  centerMarker: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: Colors.gray[400],
    opacity: 0.5,
  },
  tickMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  tickTouchArea: {
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: 2,
    height: 8,
    backgroundColor: Colors.gray[300],
    borderRadius: 1,
  },
  tickCenter: {
    height: 12,
    backgroundColor: Colors.gray[400],
  },
  tickActive: {
    backgroundColor: '#7C3AED',
    height: 12,
  },
  labels: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  labelText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  labelLeft: {
    textAlign: 'left',
  },
  labelCenter: {
    textAlign: 'center',
  },
  labelRight: {
    textAlign: 'right',
  },
});

// =====================================================
// Main Styles
// =====================================================

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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 4,
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
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  domainIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainTitleArea: {
    flex: 1,
  },
  domainName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  axesList: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    gap: 14,
  },
  footerHint: {
    textAlign: 'center',
    color: Colors.gray[400],
    fontSize: 13,
    marginTop: 8,
  },
});
