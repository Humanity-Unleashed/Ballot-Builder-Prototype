/**
 * Blueprint Screen
 *
 * Swipe-based interface for building civic blueprint.
 * This is where users respond to policy statements.
 *
 * Complexity: ⭐⭐⭐ Hard (swipe gestures)
 * Note: Swipe card implementation should be paired with experienced dev
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';

export default function BlueprintScreen() {
  // TODO: Implement swipe card interface
  // - Fetch policy statements from API
  // - Implement gesture-based card swiping
  // - Track responses and update confidence areas

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Civic Blueprint</Text>
          <Text style={styles.subtitle}>
            Swipe right to agree, left to disagree
          </Text>
        </View>

        {/* Placeholder for swipe cards */}
        <View style={styles.cardContainer}>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderEmoji}>🗳️</Text>
            <Text style={styles.placeholderTitle}>Coming Soon</Text>
            <Text style={styles.placeholderText}>
              The swipe interface will appear here. You'll be able to respond to
              policy statements to build your civic blueprint.
            </Text>
          </View>
        </View>

        {/* Progress indicator placeholder */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '0%' }]} />
          </View>
          <Text style={styles.progressText}>0 of 50 statements</Text>
        </View>

        {/* Action buttons placeholder */}
        <View style={styles.actions}>
          <Button
            title="👎 Disagree"
            variant="outline"
            onPress={() => {}}
            style={[styles.actionButton, styles.disagreeButton]}
            disabled
          />
          <Button
            title="👍 Agree"
            onPress={() => {}}
            style={styles.actionButton}
            disabled
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Card container
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 320,
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  disagreeButton: {
    borderColor: '#EF4444',
  },
});
