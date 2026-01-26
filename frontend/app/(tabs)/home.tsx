/**
 * Home Screen
 *
 * Dashboard showing user's progress and quick actions.
 *
 * Complexity: ⭐⭐ Medium
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Progress Cards */}
        <View style={styles.cardsContainer}>
          <ProgressCard
            title="Civic Blueprint"
            description="Build your personalized voting profile"
            progress={0}
            total={50}
            color="#3B82F6"
            onPress={() => router.push('/(tabs)/blueprint')}
          />

          <ProgressCard
            title="Your Ballot"
            description="Review and complete your ballot"
            progress={0}
            total={12}
            color="#10B981"
            onPress={() => router.push('/(tabs)/ballot')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Button
              title="Start Blueprint"
              onPress={() => router.push('/(tabs)/blueprint')}
              style={styles.actionButton}
            />
            <Button
              title="View Ballot"
              onPress={() => router.push('/(tabs)/ballot')}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Upcoming Elections */}
        <View style={styles.electionsSection}>
          <Text style={styles.sectionTitle}>Upcoming Elections</Text>
          <View style={styles.electionCard}>
            <Text style={styles.electionDate}>November 5, 2026</Text>
            <Text style={styles.electionName}>General Election</Text>
            <Text style={styles.electionLocation}>Your District</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===========================================
// Sub-Components
// ===========================================

interface ProgressCardProps {
  title: string;
  description: string;
  progress: number;
  total: number;
  color: string;
  onPress: () => void;
}

function ProgressCard({ title, description, progress, total, color, onPress }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardPercentage, { color }]}>{percentage}%</Text>
      </View>
      <Text style={styles.cardDescription}>{description}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {progress} of {total} completed
      </Text>
      <Button
        title="Continue"
        onPress={onPress}
        variant="outline"
        style={styles.cardButton}
      />
    </View>
  );
}

// ===========================================
// Styles
// ===========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 28,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Cards
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  cardButton: {
    marginTop: 0,
  },

  // Actions Section
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },

  // Elections Section
  electionsSection: {
    marginBottom: 24,
  },
  electionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  electionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  electionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  electionLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
});
