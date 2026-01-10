/**
 * Welcome Screen (index)
 *
 * First screen users see. Routes:
 * - / (this screen)
 * - /(auth)/login
 * - /(auth)/register
 *
 * Complexity: ⭐ Easy
 */

import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>BB</Text>
          </View>
          <Text style={styles.title}>Ballot Builder</Text>
          <Text style={styles.subtitle}>Your Personal Voting Guide</Text>
        </View>

        {/* Value Proposition */}
        <View style={styles.valueSection}>
          <ValueItem
            emoji="📋"
            title="Build Your Civic Blueprint"
            description="Answer simple questions to discover your values"
          />
          <ValueItem
            emoji="🗳️"
            title="Get Personalized Guidance"
            description="See how candidates and measures align with you"
          />
          <ValueItem
            emoji="✅"
            title="Vote With Confidence"
            description="Make informed decisions on every ballot item"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/register')}
          />
          <Button
            title="I Already Have an Account"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ===========================================
// Sub-Components
// ===========================================

interface ValueItemProps {
  emoji: string;
  title: string;
  description: string;
}

function ValueItem({ emoji, title, description }: ValueItemProps) {
  return (
    <View style={styles.valueItem}>
      <Text style={styles.valueEmoji}>{emoji}</Text>
      <View style={styles.valueText}>
        <Text style={styles.valueTitle}>{title}</Text>
        <Text style={styles.valueDescription}>{description}</Text>
      </View>
    </View>
  );
}

// ===========================================
// Styles
// ===========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },

  // Value Proposition Section
  valueSection: {
    paddingVertical: 32,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  valueEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  valueText: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  valueDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Button Section
  buttonSection: {
    paddingBottom: 24,
  },
  secondaryButton: {
    marginTop: 12,
  },
});
