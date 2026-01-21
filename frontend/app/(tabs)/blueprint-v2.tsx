/**
 * Blueprint V2 - Gamified Version
 *
 * Shows user's civic style as an animal archetype + editable sliders.
 * Uses BlueprintContext to share data with Smart Assessment and Ballot Builder.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useBlueprint } from '@/context/BlueprintContext';
import type { AxisProfile } from '../../types/blueprintProfile';
import { computeArchetype, getConfidenceLabel, ArchetypeResult } from '../../utils/archetypes';
import { deriveInsightChips, deriveEvidenceData, InsightChipData, EvidenceData } from '../../utils/blueprintInsights';

export default function BlueprintV2Screen() {
  // Get profile from shared context (populated by Smart Assessment)
  const { profile, spec, isLoading, updateAxisValue, updateImportance } = useBlueprint();

  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [showMoreAxes, setShowMoreAxes] = useState<Record<string, boolean>>({});

  // Show loading state
  if (isLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // Compute archetype
  const archetype = useMemo(() => computeArchetype(profile), [profile]);
  const archetypeTraitsShort = archetype.primary.traits.slice(0, 2).join(' • ');
  const confidenceLabel = getConfidenceLabel(archetype.confidence);

  // Derive insight chips
  const chips = useMemo(() => {
    return deriveInsightChips({ profile, spec, archetypeTraitsShort });
  }, [profile, archetypeTraitsShort]);

  // Evidence data
  const evidenceData = useMemo(() => deriveEvidenceData(profile, spec), [profile]);

  // Handlers - use context methods to persist changes
  const handleChangeImportance = (domain_id: string, value: number) => {
    updateImportance(domain_id, value);
  };

  const handleChangeAxis = (axis_id: string, value: number) => {
    updateAxisValue(axis_id, value);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Card */}
      <BlueprintHero
        archetype={archetype}
        confidenceLabel={confidenceLabel}
        onOpenEvidence={() => setEvidenceOpen(true)}
      />

      {/* Insight Chips */}
      <InsightChipsRow chips={chips} />

      {/* Fine-tune Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fine-tune your blueprint</Text>
        <Text style={styles.sectionSubtitle}>Adjust priorities and stances anytime.</Text>
      </View>

      {/* Domain Accordions */}
      {spec.domains.map((domain) => {
        const domProfile = profile.domains.find((d) => d.domain_id === domain.id);
        const importance = domProfile?.importance.value_0_10 ?? 5;
        const isOpen = expandedDomain === domain.id;
        const showAll = showMoreAxes[domain.id] ?? false;

        const domainAxes = domProfile?.axes ?? [];
        const primaryAxis = domainAxes[0];
        const restAxes = domainAxes.slice(1);

        return (
          <View key={domain.id} style={styles.domainCard}>
            <TouchableOpacity
              style={styles.domainHeader}
              onPress={() => setExpandedDomain(isOpen ? null : domain.id)}
              activeOpacity={0.7}
            >
              <View style={styles.domainIconContainer}>
                <Ionicons name={getDomainIcon(domain.id) as any} size={24} color={Colors.primary} />
              </View>
              <View style={styles.domainInfo}>
                <Text style={styles.domainName}>{domain.name}</Text>
                <Text style={styles.domainMeta}>{getImportanceWord(importance)}</Text>
              </View>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={Colors.gray[400]}
              />
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.domainBody}>
                {/* Importance Slider */}
                <Text style={styles.sliderLabel}>IMPORTANCE</Text>
                <DiscreteSlider
                  value={importance}
                  onChange={(v) => handleChangeImportance(domain.id, v)}
                  leftLabel="Not a priority"
                  midLabel="Matters some"
                  rightLabel="Top priority"
                  variant="importance"
                />

                <View style={styles.divider} />

                {/* Stances */}
                <Text style={styles.sliderLabel}>STANCES</Text>
                {primaryAxis && (
                  <AxisSliderRow
                    axis={primaryAxis}
                    spec={spec}
                    onChange={handleChangeAxis}
                  />
                )}

                {!showAll && restAxes.length > 0 && (
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => setShowMoreAxes((s) => ({ ...s, [domain.id]: true }))}
                  >
                    <Text style={styles.moreButtonText}>More details</Text>
                  </TouchableOpacity>
                )}

                {showAll &&
                  restAxes.map((axis) => (
                    <AxisSliderRow
                      key={axis.axis_id}
                      axis={axis}
                      spec={spec}
                      onChange={handleChangeAxis}
                    />
                  ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Evidence Modal */}
      <EvidenceModal
        visible={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        data={evidenceData}
      />
    </ScrollView>
  );
}

// =====================================================
// BlueprintHero Component
// =====================================================

function BlueprintHero({
  archetype,
  confidenceLabel,
  onOpenEvidence,
}: {
  archetype: ArchetypeResult;
  confidenceLabel: string;
  onOpenEvidence: () => void;
}) {
  return (
    <View style={heroStyles.card}>
      <Text style={heroStyles.kicker}>Your current civic style</Text>

      <View style={heroStyles.emojiWrap}>
        <Text style={heroStyles.emoji}>{archetype.primary.emoji}</Text>
      </View>

      <Text style={heroStyles.title}>{archetype.primary.name}</Text>

      <View style={heroStyles.traits}>
        {archetype.primary.traits.slice(0, 3).map((t) => (
          <View key={t} style={heroStyles.traitChip}>
            <Text style={heroStyles.traitText}>{t}</Text>
          </View>
        ))}
      </View>

      <Text style={heroStyles.summary}>{archetype.primary.summary}</Text>

      <Text style={heroStyles.confidence}>{confidenceLabel}</Text>

      <TouchableOpacity style={heroStyles.cta} onPress={onOpenEvidence} activeOpacity={0.8}>
        <Text style={heroStyles.ctaText}>See what shaped this</Text>
      </TouchableOpacity>

      <Text style={heroStyles.disclaimer}>
        This is a friendly summary, not a label. You can change it anytime.
      </Text>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emojiWrap: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.gray[900],
    textAlign: 'center',
  },
  traits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  traitChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  traitText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  summary: {
    fontSize: 14,
    color: Colors.gray[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  confidence: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  cta: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  ctaText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.gray[400],
    textAlign: 'center',
    marginTop: 4,
  },
});

// =====================================================
// InsightChipsRow Component
// =====================================================

function InsightChipsRow({ chips }: { chips: InsightChipData[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chipStyles.row}
      style={chipStyles.container}
    >
      {chips.map((c) => (
        <View key={c.id} style={chipStyles.chip}>
          <Text style={chipStyles.chipText}>{c.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const chipStyles = StyleSheet.create({
  container: { marginTop: 16 },
  row: { gap: 8, paddingHorizontal: 2 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[700],
  },
});

// =====================================================
// EvidenceModal Component
// =====================================================

function EvidenceModal({
  visible,
  onClose,
  data,
}: {
  visible: boolean;
  onClose: () => void;
  data: EvidenceData;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>What shaped this</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modalStyles.content}>
            <Text style={modalStyles.lede}>Based on your priorities and stances today.</Text>

            <Text style={modalStyles.sectionTitle}>Top priorities</Text>
            <View style={modalStyles.chipWrap}>
              {data.topDomains.map((d) => (
                <View key={d.name} style={modalStyles.chip}>
                  <Text style={modalStyles.chipText}>{d.name} • {d.importanceLabel}</Text>
                </View>
              ))}
            </View>

            <Text style={modalStyles.sectionTitle}>Most influential stances</Text>
            <View style={modalStyles.list}>
              {data.topAxes.map((a) => (
                <View key={a.name} style={modalStyles.listRow}>
                  <Text style={modalStyles.listTitle}>{a.name}</Text>
                  <Text style={modalStyles.listSub}>{a.stanceLabel}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
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
    maxHeight: '85%',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.gray[900] },
  content: { padding: 20, gap: 16 },
  lede: { color: Colors.gray[500], lineHeight: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.gray[900] },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.gray[700] },
  list: { gap: 8 },
  listRow: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50],
  },
  listTitle: { fontWeight: '700', color: Colors.gray[900] },
  listSub: { marginTop: 4, color: Colors.gray[500], fontSize: 13 },
});

// =====================================================
// DiscreteSlider Component (Gradient Style)
// =====================================================

// Color interpolation helper
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

// Get gradient color for a position (0-10)
function getGradientColor(position: number, variant: 'importance' | 'stance' = 'stance'): string {
  const t = position / 10;

  if (variant === 'importance') {
    // Gray to Blue gradient for importance
    if (t < 0.5) {
      return interpolateColor('#E5E7EB', '#93C5FD', t * 2);
    } else {
      return interpolateColor('#93C5FD', '#3B82F6', (t - 0.5) * 2);
    }
  } else {
    // Purple to Teal gradient for stance (left pole to right pole)
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
      {/* Value display */}
      <View style={sliderStyles.valueRow}>
        <View style={[sliderStyles.valueChip, { backgroundColor: getGradientColor(value, variant) + '30' }]}>
          <Text style={sliderStyles.valueChipText}>{value}/10</Text>
        </View>
      </View>

      {/* Gradient Track */}
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

        {/* Thumb indicator */}
        <View
          style={[
            sliderStyles.thumb,
            { left: `${thumbPosition}%` },
          ]}
          pointerEvents="none"
        >
          <View style={[sliderStyles.thumbInner, { backgroundColor: getGradientColor(value, variant) }]}>
            <View style={sliderStyles.thumbDot} />
          </View>
        </View>

        {/* Center marker */}
        <View style={sliderStyles.centerMarker} pointerEvents="none" />
      </View>

      {/* Labels */}
      <View style={sliderStyles.labels}>
        <Text style={[sliderStyles.labelText, { color: variant === 'stance' ? '#A855F7' : Colors.gray[500] }]} numberOfLines={2}>
          {leftLabel ?? ''}
        </Text>
        <Text style={[sliderStyles.labelText, sliderStyles.mid]} numberOfLines={2}>
          {midLabel ?? 'Mixed'}
        </Text>
        <Text style={[sliderStyles.labelText, sliderStyles.right, { color: variant === 'stance' ? '#14B8A6' : '#3B82F6' }]} numberOfLines={2}>
          {rightLabel ?? ''}
        </Text>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  wrapper: { gap: 10 },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  valueChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  trackContainer: {
    position: 'relative',
    height: 36,
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
    marginTop: -16,
    marginLeft: -16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  thumbDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    opacity: 0.5,
  },
  labels: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 2,
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
// AxisSliderRow Component
// =====================================================

function AxisSliderRow({
  axis,
  spec,
  onChange,
}: {
  axis: AxisProfile;
  spec: Spec;
  onChange: (axis_id: string, value: number) => void;
}) {
  const axisDef = spec.axes.find((a) => a.id === axis.axis_id);
  if (!axisDef) return null;

  const edited = axis.source === 'user_edited';
  const confidence = axis.confidence_0_1 ?? 0.5;
  const confidenceLabel = confidence < 0.35 ? 'Low' : confidence < 0.7 ? 'Medium' : 'High';

  return (
    <View style={axisStyles.card}>
      <View style={axisStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={axisStyles.name}>{axisDef.name}</Text>
          <Text style={axisStyles.desc} numberOfLines={2}>{axisDef.description}</Text>
        </View>
        {edited && <Text style={axisStyles.editedBadge}>Edited</Text>}
      </View>

      <DiscreteSlider
        value={Math.round(axis.value_0_10)}
        onChange={(v) => onChange(axis.axis_id, v)}
        leftLabel={axisDef.poleA.label}
        midLabel="Mixed / depends"
        rightLabel={axisDef.poleB.label}
      />

      <Text style={axisStyles.confidence}>Confidence: {confidenceLabel}</Text>
    </View>
  );
}

const axisStyles = StyleSheet.create({
  card: { gap: 8, marginTop: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  name: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  desc: { color: Colors.gray[500], marginTop: 2, fontSize: 12 },
  editedBadge: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  confidence: { color: Colors.gray[400], fontSize: 12 },
});

// =====================================================
// Helper Functions
// =====================================================

function getImportanceWord(v: number): string {
  if (v <= 0) return 'Not a priority';
  if (v <= 2) return 'Low priority';
  if (v <= 4) return 'Minor factor';
  if (v <= 6) return 'Important';
  if (v <= 8) return 'Very important';
  return 'Top priority';
}

// =====================================================
// Main Styles
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginTop: 8,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gray[900],
  },
  sectionSubtitle: {
    color: Colors.gray[500],
    fontSize: 14,
  },
  domainCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: 'hidden',
  },
  domainHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  domainIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainInfo: { flex: 1 },
  domainName: { fontSize: 16, fontWeight: '700', color: Colors.gray[900] },
  domainMeta: { marginTop: 2, color: Colors.gray[500], fontSize: 13 },
  domainBody: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray[500],
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 8,
  },
  moreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    marginTop: 8,
  },
  moreButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
