/**
 * Blueprint Screen
 *
 * "Your Civic Blueprint" - View and edit your estimated stances and priorities.
 * Based on swipe onboarding, users can adjust values and see evidence.
 *
 * Complexity: ⭐⭐⭐ Hard (state management, sliders, drawers)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBlueprint } from '@/context/BlueprintContext';
import BlueprintSlider from '@/components/BlueprintSlider';
import EvidenceDrawer from '@/components/EvidenceDrawer';
import { Colors } from '@/constants/Colors';
import { getImportanceLabel, getStanceLabel } from '@/types/blueprintProfile';
import type { Axis } from '@/types/civicAssessment';
import type { AxisProfile, DomainProfile } from '@/types/blueprintProfile';

// ===========================================
// Main Screen
// ===========================================

export default function BlueprintScreen() {
  const { profile, isLoading, spec, updateAxisValue, updateImportance, toggleAxisLock, resetAxisToLearned } = useBlueprint();
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [showMoreAxes, setShowMoreAxes] = useState<Record<string, boolean>>({});
  const [evidenceAxis, setEvidenceAxis] = useState<{ axis: Axis; profile: AxisProfile } | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your blueprint...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Blueprint Yet</Text>
          <Text style={styles.emptyText}>
            Complete the civic assessment to build your blueprint.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleDomain = (domainId: string) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

  const toggleMoreAxes = (domainId: string) => {
    setShowMoreAxes(prev => ({ ...prev, [domainId]: !prev[domainId] }));
  };

  const getAxisById = (axisId: string): Axis | undefined => {
    return spec.axes.find(a => a.id === axisId);
  };

  const getDomainById = (domainId: string) => {
    return spec.domains.find(d => d.id === domainId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Your Civic Blueprint</Text>
            <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Based on your swipes. You can edit anything anytime.
          </Text>
        </View>

        {/* Domain List */}
        {profile.domains.map(domainProfile => {
          const domain = getDomainById(domainProfile.domain_id);
          if (!domain) return null;

          const isExpanded = expandedDomain === domain.id;
          const primaryAxisId = domain.axes[0];
          const primaryAxis = getAxisById(primaryAxisId);
          const primaryAxisProfile = domainProfile.axes.find(a => a.axis_id === primaryAxisId);
          const otherAxes = domain.axes.slice(1);
          const showingMore = showMoreAxes[domain.id];

          return (
            <View key={domain.id} style={styles.domainCard}>
              {/* Domain Header */}
              <TouchableOpacity
                style={styles.domainHeader}
                onPress={() => toggleDomain(domain.id)}
                activeOpacity={0.7}
              >
                <View style={styles.domainInfo}>
                  <Text style={styles.domainName}>{domain.name}</Text>
                  <Text style={styles.importanceLabel}>
                    {getImportanceLabel(domainProfile.importance.value_0_10)}
                  </Text>
                </View>
                <View style={styles.domainRight}>
                  <View style={styles.importanceChip}>
                    <Text style={styles.importanceChipText}>
                      {domainProfile.importance.value_0_10}/10
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={Colors.gray[400]}
                  />
                </View>
              </TouchableOpacity>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={styles.domainContent}>
                  {/* Importance Slider */}
                  <View style={styles.priorityCard}>
                    <View style={styles.priorityHeader}>
                      <View style={styles.priorityIconContainer}>
                        <Ionicons name="flag" size={16} color={Colors.white} />
                      </View>
                      <View style={styles.priorityHeaderText}>
                        <Text style={styles.priorityTitle}>Priority Level</Text>
                        <Text style={styles.priorityHelper}>
                          How much should this topic influence your recommendations?
                        </Text>
                      </View>
                    </View>
                    <BlueprintSlider
                      value={domainProfile.importance.value_0_10}
                      onChange={(v) => updateImportance(domain.id, v)}
                      leftLabel="Not a priority"
                      rightLabel="Top voting priority"
                      centerLabel="Matters some"
                      variant="importance"
                    />
                    {domainProfile.importance.source === 'user_edited' && (
                      <View style={styles.editedBadge}>
                        <Text style={styles.editedBadgeText}>Edited by you</Text>
                      </View>
                    )}
                  </View>

                  {/* Primary Axis */}
                  {primaryAxis && primaryAxisProfile && (
                    <AxisCard
                      axis={primaryAxis}
                      axisProfile={primaryAxisProfile}
                      onValueChange={(v) => updateAxisValue(primaryAxis.id, v)}
                      onToggleLock={() => toggleAxisLock(primaryAxis.id)}
                      onReset={() => resetAxisToLearned(primaryAxis.id)}
                      onShowEvidence={() => setEvidenceAxis({ axis: primaryAxis, profile: primaryAxisProfile })}
                    />
                  )}

                  {/* More Axes Toggle */}
                  {otherAxes.length > 0 && (
                    <>
                      <TouchableOpacity
                        style={styles.moreAxesButton}
                        onPress={() => toggleMoreAxes(domain.id)}
                      >
                        <Text style={styles.moreAxesText}>
                          {showingMore ? 'Hide details' : `Show ${otherAxes.length} more topic${otherAxes.length > 1 ? 's' : ''}`}
                        </Text>
                        <Ionicons
                          name={showingMore ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={Colors.primary}
                        />
                      </TouchableOpacity>

                      {/* Other Axes */}
                      {showingMore && otherAxes.map(axisId => {
                        const axis = getAxisById(axisId);
                        const axisProfile = domainProfile.axes.find(a => a.axis_id === axisId);
                        if (!axis || !axisProfile) return null;

                        return (
                          <AxisCard
                            key={axisId}
                            axis={axis}
                            axisProfile={axisProfile}
                            onValueChange={(v) => updateAxisValue(axis.id, v)}
                            onToggleLock={() => toggleAxisLock(axis.id)}
                            onReset={() => resetAxisToLearned(axis.id)}
                            onShowEvidence={() => setEvidenceAxis({ axis, profile: axisProfile })}
                          />
                        );
                      })}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* Footer hint */}
        <View style={styles.footer}>
          <Ionicons name="lock-closed-outline" size={16} color={Colors.gray[400]} />
          <Text style={styles.footerText}>
            Lock any setting to prevent it from changing with future swipes.
          </Text>
        </View>
      </ScrollView>

      {/* Evidence Drawer */}
      {evidenceAxis && (
        <EvidenceDrawer
          visible={true}
          onClose={() => setEvidenceAxis(null)}
          axisName={evidenceAxis.axis.name}
          evidence={evidenceAxis.profile.evidence}
          spec={spec}
          confidence={evidenceAxis.profile.confidence_0_1}
        />
      )}

      {/* Info Modal (simple implementation) */}
      {showInfoModal && (
        <InfoModal onClose={() => setShowInfoModal(false)} />
      )}
    </SafeAreaView>
  );
}

// ===========================================
// Axis Card Component
// ===========================================

interface AxisCardProps {
  axis: Axis;
  axisProfile: AxisProfile;
  onValueChange: (value: number) => void;
  onToggleLock: () => void;
  onReset: () => void;
  onShowEvidence: () => void;
}

function AxisCard({
  axis,
  axisProfile,
  onValueChange,
  onToggleLock,
  onReset,
  onShowEvidence,
}: AxisCardProps) {
  const getConfidenceColor = (): string => {
    if (axisProfile.confidence_0_1 >= 0.7) return Colors.success;
    if (axisProfile.confidence_0_1 >= 0.4) return Colors.warning;
    return Colors.gray[400];
  };

  return (
    <View style={axisStyles.card}>
      {/* Axis Header */}
      <View style={axisStyles.header}>
        <View style={axisStyles.headerLeft}>
          <Text style={axisStyles.name}>{axis.name}</Text>
          {axisProfile.source === 'user_edited' && (
            <View style={axisStyles.editedBadge}>
              <Text style={axisStyles.editedBadgeText}>Edited</Text>
            </View>
          )}
        </View>
        <View style={axisStyles.headerRight}>
          {/* Lock Toggle */}
          <TouchableOpacity onPress={onToggleLock} style={axisStyles.lockButton}>
            <Ionicons
              name={axisProfile.locked ? 'lock-closed' : 'lock-open-outline'}
              size={18}
              color={axisProfile.locked ? Colors.primary : Colors.gray[400]}
            />
          </TouchableOpacity>
          {/* Why? Button */}
          <TouchableOpacity onPress={onShowEvidence} style={axisStyles.whyButton}>
            <Text style={axisStyles.whyText}>Why?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <Text style={axisStyles.description}>{axis.description}</Text>

      {/* Confidence Indicator */}
      <View style={axisStyles.confidenceRow}>
        <View style={[axisStyles.confidenceDot, { backgroundColor: getConfidenceColor() }]} />
        <Text style={axisStyles.confidenceText}>
          {axisProfile.confidence_0_1 >= 0.7 ? 'High' : axisProfile.confidence_0_1 >= 0.4 ? 'Medium' : 'Low'} confidence
          ({axisProfile.evidence.n_items_answered} responses)
        </Text>
      </View>

      {/* Slider */}
      <BlueprintSlider
        value={axisProfile.value_0_10}
        onChange={onValueChange}
        leftLabel={axis.poleA.label}
        rightLabel={axis.poleB.label}
        centerLabel="Mixed / depends"
        disabled={axisProfile.locked}
        variant="stance"
      />

      {/* Reset Action */}
      {axisProfile.source === 'user_edited' && (
        <TouchableOpacity onPress={onReset} style={axisStyles.resetButton}>
          <Ionicons name="refresh-outline" size={14} color={Colors.gray[500]} />
          <Text style={axisStyles.resetText}>Reset to learned</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ===========================================
// Info Modal Component
// ===========================================

function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <View style={infoStyles.overlay}>
      <View style={infoStyles.modal}>
        <View style={infoStyles.header}>
          <Text style={infoStyles.title}>How this works</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.gray[500]} />
          </TouchableOpacity>
        </View>
        <View style={infoStyles.bullets}>
          <BulletPoint text="Swipes help estimate where you lean on a few key topics." />
          <BulletPoint text="Priorities control what matters most in your recommendations." />
          <BulletPoint text="You can override any slider—your edits take precedence." />
        </View>
        <TouchableOpacity style={infoStyles.closeButton} onPress={onClose}>
          <Text style={infoStyles.closeButtonText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={infoStyles.bulletRow}>
      <View style={infoStyles.bulletDot} />
      <Text style={infoStyles.bulletText}>{text}</Text>
    </View>
  );
}

// ===========================================
// Styles
// ===========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.gray[700],
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  infoButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 4,
  },

  // Domain Card
  domainCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  importanceLabel: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 2,
  },
  domainRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  importanceChip: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  importanceChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  domainContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },

  // Priority Card (distinctive styling)
  priorityCard: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  priorityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityHeaderText: {
    flex: 1,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 2,
  },
  priorityHelper: {
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 18,
  },

  // Section Card (for other uses)
  sectionCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 4,
  },
  sectionHelper: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 8,
  },
  editedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  editedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },

  // More Axes
  moreAxesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  moreAxesText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: Colors.gray[400],
  },
});

const axisStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  editedBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  editedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lockButton: {
    padding: 4,
  },
  whyButton: {
    backgroundColor: Colors.gray[200],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  whyText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  description: {
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 18,
    marginBottom: 8,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    marginTop: 8,
  },
  resetText: {
    fontSize: 13,
    color: Colors.gray[500],
  },
});

const infoStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  bullets: {
    gap: 16,
    marginBottom: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: Colors.gray[700],
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
