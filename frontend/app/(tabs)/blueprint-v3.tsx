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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BlueprintV3Screen() {
  const { profile, spec, isLoading, updateAxisValue, updateImportance } = useBlueprint();
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

  const getStanceColor = (value: number): string => {
    if (value <= 3) return '#A855F7'; // Purple - left
    if (value >= 7) return '#14B8A6'; // Teal - right
    return Colors.gray[400]; // Neutral
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

        {/* All Domains - Compact Cards */}
        {spec.domains.map((domain) => {
          const domProfile = profile.domains.find((d) => d.domain_id === domain.id);
          const importance = domProfile?.importance.value_0_10 ?? 5;
          const primaryAxis = domProfile?.axes[0];
          const primaryAxisDef = primaryAxis
            ? spec.axes.find(a => a.id === primaryAxis.axis_id)
            : null;

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
                  <ImportanceBar value={importance} />
                </View>
                <Ionicons name="pencil-outline" size={18} color={Colors.gray[400]} />
              </View>

              {/* Primary Stance Preview */}
              {primaryAxis && primaryAxisDef && (
                <View style={styles.stancePreview}>
                  <View style={styles.stanceLabels}>
                    <Text style={[styles.stanceLabel, { color: '#A855F7' }]} numberOfLines={1}>
                      {primaryAxisDef.poleA.label}
                    </Text>
                    <Text style={[styles.stanceLabel, { color: '#14B8A6', textAlign: 'right' }]} numberOfLines={1}>
                      {primaryAxisDef.poleB.label}
                    </Text>
                  </View>
                  <View style={styles.stanceTrack}>
                    <View
                      style={[
                        styles.stanceIndicator,
                        {
                          left: `${(primaryAxis.value_0_10 / 10) * 100}%`,
                          backgroundColor: getStanceColor(primaryAxis.value_0_10),
                        }
                      ]}
                    />
                    <View style={styles.stanceCenterMark} />
                  </View>
                </View>
              )}

              {/* Additional axes count */}
              {domProfile && domProfile.axes.length > 1 && (
                <Text style={styles.moreAxesText}>
                  +{domProfile.axes.length - 1} more position{domProfile.axes.length > 2 ? 's' : ''}
                </Text>
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
          onChangeImportance={updateImportance}
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
  const filled = Math.round(value / 2); // 0-5 dots
  const label = getImportanceLabel(value);

  return (
    <View style={importanceStyles.container}>
      <View style={importanceStyles.dots}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              importanceStyles.dot,
              i < filled && importanceStyles.dotFilled,
            ]}
          />
        ))}
      </View>
      <Text style={importanceStyles.label}>{label}</Text>
    </View>
  );
}

function getImportanceLabel(v: number): string {
  if (v <= 2) return 'Low priority';
  if (v <= 5) return 'Moderate';
  if (v <= 8) return 'Important';
  return 'Top priority';
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
  onChangeImportance,
  onChangeAxis,
}: {
  domainId: string;
  profile: Profile;
  spec: Spec;
  onClose: () => void;
  onChangeImportance: (domain_id: string, value: number) => void;
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
            {/* Importance Slider */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>PRIORITY LEVEL</Text>
              <DiscreteSlider
                value={domProfile.importance.value_0_10}
                onChange={(v) => onChangeImportance(domainId, v)}
                leftLabel="Not a priority"
                midLabel="Moderate"
                rightLabel="Top priority"
                variant="importance"
              />
            </View>

            <View style={modalStyles.divider} />

            {/* All Axes */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>YOUR POSITIONS</Text>
              {domProfile.axes.map((axis) => {
                const axisDef = spec.axes.find(a => a.id === axis.axis_id);
                if (!axisDef) return null;

                return (
                  <View key={axis.axis_id} style={modalStyles.axisCard}>
                    <Text style={modalStyles.axisName}>{axisDef.name}</Text>
                    <Text style={modalStyles.axisDesc}>{axisDef.description}</Text>
                    <DiscreteSlider
                      value={Math.round(axis.value_0_10)}
                      onChange={(v) => onChangeAxis(axis.axis_id, v)}
                      leftLabel={axisDef.poleA.label}
                      midLabel="Mixed"
                      rightLabel={axisDef.poleB.label}
                      variant="stance"
                    />
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
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    padding: 20,
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
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray[500],
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  axisCard: {
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    gap: 8,
  },
  axisName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  axisDesc: {
    fontSize: 13,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  footer: {
    padding: 20,
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
    if (t < 0.5) {
      return interpolateColor('#E5E7EB', '#93C5FD', t * 2);
    } else {
      return interpolateColor('#93C5FD', '#3B82F6', (t - 0.5) * 2);
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
}: {
  value: number;
  onChange: (v: number) => void;
  leftLabel?: string;
  midLabel?: string;
  rightLabel?: string;
  variant?: 'importance' | 'stance';
}) {
  const segments = Array.from({ length: 11 }, (_, i) => i);
  const thumbPosition = (value / 10) * 100;

  return (
    <View style={sliderStyles.wrapper}>
      <View style={sliderStyles.trackContainer}>
        <View style={sliderStyles.gradientTrack}>
          {segments.map((i) => (
            <TouchableOpacity
              key={i}
              style={[
                sliderStyles.segment,
                { backgroundColor: getGradientColor(i, variant) },
                i === 0 && sliderStyles.segmentFirst,
                i === 10 && sliderStyles.segmentLast,
              ]}
              onPress={() => onChange(i)}
              activeOpacity={0.8}
            />
          ))}
        </View>

        <View
          style={[sliderStyles.thumb, { left: `${thumbPosition}%` }]}
          pointerEvents="none"
        >
          <View style={[sliderStyles.thumbInner, { backgroundColor: getGradientColor(value, variant) }]}>
            <View style={sliderStyles.thumbDot} />
          </View>
        </View>

        <View style={sliderStyles.centerMarker} pointerEvents="none" />
      </View>

      <View style={sliderStyles.labels}>
        <Text style={[sliderStyles.labelText, { color: variant === 'stance' ? '#A855F7' : Colors.gray[500] }]} numberOfLines={1}>
          {leftLabel ?? ''}
        </Text>
        <Text style={[sliderStyles.labelText, sliderStyles.mid]} numberOfLines={1}>
          {midLabel ?? 'Mixed'}
        </Text>
        <Text style={[sliderStyles.labelText, sliderStyles.right, { color: variant === 'stance' ? '#14B8A6' : '#3B82F6' }]} numberOfLines={1}>
          {rightLabel ?? ''}
        </Text>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  wrapper: { gap: 8 },
  trackContainer: {
    position: 'relative',
    height: 32,
    justifyContent: 'center',
  },
  gradientTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    height: '100%',
  },
  segmentFirst: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  segmentLast: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    marginTop: -14,
    marginLeft: -14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  thumbDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  centerMarker: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: Colors.gray[400],
    opacity: 0.4,
  },
  labels: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  labelText: {
    flex: 1,
    fontSize: 11,
    color: Colors.gray[500],
    fontWeight: '600',
  },
  mid: { textAlign: 'center' },
  right: { textAlign: 'right' },
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
  stancePreview: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  stanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: '45%',
  },
  stanceTrack: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    position: 'relative',
  },
  stanceIndicator: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  stanceCenterMark: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: Colors.gray[400],
    opacity: 0.5,
  },
  moreAxesText: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.gray[400],
    fontStyle: 'italic',
  },
  footerHint: {
    textAlign: 'center',
    color: Colors.gray[400],
    fontSize: 13,
    marginTop: 8,
  },
});
