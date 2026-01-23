/**
 * Evidence Drawer Component
 *
 * Modal that shows "Why?" evidence for an axis score.
 * Displays the top driver swipes that influenced the estimate.
 *
 * @example
 * <EvidenceDrawer
 *   visible={showEvidence}
 *   onClose={() => setShowEvidence(false)}
 *   axisName="Government Role"
 *   evidence={axisProfile.evidence}
 *   spec={spec}
 * />
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import type { Spec } from '@/types/civicAssessment';
import type { AxisEvidence } from '@/types/blueprintProfile';

// ===========================================
// Types
// ===========================================

interface EvidenceDrawerProps {
  /** Whether the drawer is visible */
  visible: boolean;
  /** Called when drawer should close */
  onClose: () => void;
  /** Name of the axis */
  axisName: string;
  /** Evidence data from the axis profile */
  evidence: AxisEvidence;
  /** Spec to look up item texts */
  spec: Spec;
  /** Confidence value 0-1 */
  confidence: number;
}

// ===========================================
// Component
// ===========================================

export default function EvidenceDrawer({
  visible,
  onClose,
  axisName,
  evidence,
  spec,
  confidence,
}: EvidenceDrawerProps) {
  // Look up item texts from IDs
  const driverItems = evidence.top_driver_item_ids
    .map(id => spec.items.find(item => item.id === id))
    .filter(Boolean)
    .slice(0, 5);

  const getConfidenceLabel = (): { label: string; color: string } => {
    if (confidence >= 0.7) return { label: 'High', color: Colors.success };
    if (confidence >= 0.4) return { label: 'Medium', color: Colors.warning };
    return { label: 'Low', color: Colors.error };
  };

  const confidenceInfo = getConfidenceLabel();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View />
      </Pressable>
      <View style={styles.drawer}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Why this estimate?</Text>
            <Text style={styles.axisName}>{axisName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.gray[500]} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{evidence.n_items_answered}</Text>
            <Text style={styles.statLabel}>Answered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{evidence.n_unsure}</Text>
            <Text style={styles.statLabel}>Unsure</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: confidenceInfo.color }]}>
              {confidenceInfo.label}
            </Text>
            <Text style={styles.statLabel}>Confidence</Text>
          </View>
        </View>

        {/* Explanation */}
        <Text style={styles.explanation}>
          These swipes most influenced this estimate:
        </Text>

        {/* Driver items */}
        <ScrollView style={styles.itemsContainer}>
          {driverItems.length > 0 ? (
            driverItems.map((item, index) => (
              <View key={item!.id} style={styles.itemCard}>
                <View style={styles.itemNumber}>
                  <Text style={styles.itemNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.itemText}>{item!.text}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="help-circle-outline" size={40} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>
                No swipes recorded yet for this topic.
              </Text>
              <Text style={styles.emptySubtext}>
                Answer more cards to build your profile.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action */}
        {evidence.n_items_answered < 4 && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Answer more cards on this topic</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

// ===========================================
// Styles
// ===========================================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  axisName: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  closeButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.gray[200],
  },
  explanation: {
    fontSize: 14,
    color: Colors.gray[600],
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  itemsContainer: {
    paddingHorizontal: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[500],
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray[400],
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
