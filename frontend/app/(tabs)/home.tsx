/**
 * Home Screen - Dashboard
 *
 * Shows overall ballot readiness progress with:
 * - Progress ring visualization
 * - Step indicators (Discover → Blueprint → Build)
 * - Quick action cards for each step
 * - Election countdown and deadlines
 * - Poll locator
 *
 * Complexity: ⭐⭐⭐ Medium-High
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Svg, { Circle } from 'react-native-svg';
import { useState, useEffect } from 'react';

// ===========================================
// Types
// ===========================================

interface StepStatus {
  assess: 'not_started' | 'in_progress' | 'complete';
  blueprint: 'not_started' | 'in_progress' | 'complete';
  build: 'not_started' | 'in_progress' | 'complete';
  buildProgress?: { decided: number; total: number };
  blueprintProgress?: { domains: number; total: number };
}

interface ElectionInfo {
  name: string;
  date: Date;
  registrationDeadline: Date;
  earlyVotingStart: Date;
}

interface PollingPlace {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  distance: string;
  hours: string;
}

// ===========================================
// Constants
// ===========================================

const Colors = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  blue: '#3B82F6',
  blueDark: '#1D4ED8',
  green: '#10B981',
  greenDark: '#059669',
  red: '#EF4444',
  orange: '#F59E0B',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  grayBorder: '#E5E7EB',
  white: '#FFFFFF',
  background: '#F9FAFB',
  text: '#111827',
};

// ===========================================
// Main Component
// ===========================================

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Mock state - in production this would come from a context/store
  const [stepStatus] = useState<StepStatus>({
    assess: 'complete',
    blueprint: 'in_progress',
    build: 'not_started',
    blueprintProgress: { domains: 3, total: 5 },
    buildProgress: { decided: 0, total: 12 },
  });

  const [pollingPlace] = useState<PollingPlace | null>({
    name: 'City Hall - Room 48',
    address: '1 Dr Carlton B Goodlett Pl',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    distance: '0.3 miles',
    hours: '7:00 AM - 8:00 PM',
  });

  const [election] = useState<ElectionInfo>({
    name: '2026 General Election',
    date: new Date('2026-11-03'),
    registrationDeadline: new Date('2026-10-19'),
    earlyVotingStart: new Date('2026-10-24'),
  });

  // Calculate overall progress
  const calculateProgress = (): number => {
    let progress = 0;
    if (stepStatus.assess === 'complete') progress += 33;
    if (stepStatus.blueprint === 'complete') progress += 33;
    else if (stepStatus.blueprint === 'in_progress' && stepStatus.blueprintProgress) {
      progress += Math.round(33 * (stepStatus.blueprintProgress.domains / stepStatus.blueprintProgress.total));
    }
    if (stepStatus.build === 'complete') progress += 34;
    else if (stepStatus.build === 'in_progress' && stepStatus.buildProgress) {
      progress += Math.round(34 * (stepStatus.buildProgress.decided / stepStatus.buildProgress.total));
    }
    return progress;
  };

  const progress = calculateProgress();

  // Calculate days until election
  const getDaysUntil = (date: Date): number => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysUntilElection = getDaysUntil(election.date);
  const daysUntilRegistration = getDaysUntil(election.registrationDeadline);
  const daysUntilEarlyVoting = getDaysUntil(election.earlyVotingStart);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Hero Progress Ring */}
        <View style={styles.heroProgress}>
          <View style={styles.heroDecoCircle1} />
          <View style={styles.heroDecoCircle2} />

          <ProgressRing progress={progress} size={120} strokeWidth={8} />

          <Text style={styles.heroTitle}>Ballot Ready</Text>
          <Text style={styles.heroSubtitle}>Complete your journey to be 100% prepared</Text>

          {/* Steps Row */}
          <View style={styles.stepsRow}>
            <StepIndicator
              label="Assess"
              step={1}
              status={stepStatus.assess}
            />
            <View style={[
              styles.stepConnector,
              stepStatus.assess === 'complete' && styles.stepConnectorComplete
            ]} />
            <StepIndicator
              label="Blueprint"
              step={2}
              status={stepStatus.blueprint}
            />
            <View style={[
              styles.stepConnector,
              stepStatus.blueprint === 'complete' && styles.stepConnectorComplete
            ]} />
            <StepIndicator
              label="Build"
              step={3}
              status={stepStatus.build}
            />
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Your Building Blocks</Text>
        <View style={styles.quickActions}>
          <QuickActionCard
            icon="search-outline"
            title="Assess"
            status={stepStatus.assess === 'complete' ? 'Complete' : 'Not Started'}
            statusType={stepStatus.assess === 'complete' ? 'complete' : 'default'}
            color={Colors.primary}
            onPress={() => router.push('/(tabs)/adaptive-assessment')}
            isActive={stepStatus.assess === 'in_progress'}
          />
          <QuickActionCard
            icon="document-text-outline"
            title="Blueprint"
            status={
              stepStatus.blueprint === 'complete' ? 'Complete' :
              stepStatus.blueprint === 'in_progress' && stepStatus.blueprintProgress
                ? `${stepStatus.blueprintProgress.domains}/${stepStatus.blueprintProgress.total} domains`
                : 'Not Started'
            }
            statusType={
              stepStatus.blueprint === 'complete' ? 'complete' :
              stepStatus.blueprint === 'in_progress' ? 'in_progress' : 'default'
            }
            color={Colors.blue}
            onPress={() => router.push('/(tabs)/blueprint-v3')}
            isActive={stepStatus.blueprint === 'in_progress'}
          />
          <QuickActionCard
            icon="checkbox-outline"
            title="Build"
            status={
              stepStatus.build === 'complete' ? 'Complete' :
              stepStatus.buildProgress
                ? `${stepStatus.buildProgress.decided}/${stepStatus.buildProgress.total} decided`
                : 'Not Started'
            }
            statusType={
              stepStatus.build === 'complete' ? 'complete' :
              stepStatus.build === 'in_progress' ? 'in_progress' : 'default'
            }
            color={Colors.green}
            onPress={() => router.push('/(tabs)/ballot-builder')}
            isActive={stepStatus.build === 'in_progress'}
          />
          <QuickActionCard
            icon="location-outline"
            title="Poll Finder"
            status={pollingPlace ? 'Set' : 'Set location'}
            statusType={pollingPlace ? 'complete' : 'default'}
            color={Colors.red}
            onPress={() => {/* TODO: Open poll finder modal */}}
            isActive={false}
          />
        </View>

        {/* Election + Deadlines Card */}
        <View style={styles.upcomingCard}>
          <View style={styles.upcomingHeader}>
            <Ionicons name="calendar-outline" size={18} color={Colors.white} />
            <Text style={styles.upcomingHeaderText}>{election.name}</Text>
            <View style={styles.upcomingCountdown}>
              <Text style={styles.upcomingCountdownText}>{daysUntilElection} days</Text>
            </View>
          </View>
          <View style={styles.upcomingContent}>
            <DeadlineRow
              icon="alert-circle-outline"
              iconBg="#FEE2E2"
              title="Voter Registration"
              detail="Last day to register to vote"
              badge={`${daysUntilRegistration} days`}
              badgeType={daysUntilRegistration <= 7 ? 'urgent' : 'days'}
            />
            <DeadlineRow
              icon="mail-outline"
              iconBg="#DBEAFE"
              title="Mail-in Ballot Request"
              detail="Request your mail ballot"
              badge="Request →"
              badgeType="action"
              onBadgePress={() => {/* TODO: Open mail ballot request */}}
            />
            <DeadlineRow
              icon="calendar-outline"
              iconBg="#D1FAE5"
              title="Early Voting Begins"
              detail="Vote before Election Day"
              badge={`${daysUntilEarlyVoting} days`}
              badgeType="days"
              isLast
            />
          </View>
        </View>

        {/* Poll Locator */}
        <Text style={styles.sectionTitle}>Your Polling Place</Text>
        {pollingPlace ? (
          <View style={styles.pollCard}>
            <View style={styles.pollHeader}>
              <View style={styles.pollIcon}>
                <Ionicons name="location" size={20} color={Colors.red} />
              </View>
              <View style={styles.pollHeaderText}>
                <Text style={styles.pollTitle}>{pollingPlace.name}</Text>
                <Text style={styles.pollSubtitle}>{pollingPlace.distance} from your address</Text>
              </View>
            </View>
            <View style={styles.pollLocation}>
              <Text style={styles.pollLocationName}>
                {pollingPlace.city} {pollingPlace.name.split(' - ')[0]}
              </Text>
              <Text style={styles.pollLocationAddress}>
                {pollingPlace.address}, {pollingPlace.city}, {pollingPlace.state} {pollingPlace.zip}
              </Text>
              <View style={styles.pollLocationHours}>
                <Ionicons name="time-outline" size={14} color={Colors.green} />
                <Text style={styles.pollLocationHoursText}>
                  Open {pollingPlace.hours} on Election Day
                </Text>
              </View>
            </View>
            <View style={styles.pollActions}>
              <TouchableOpacity
                style={[styles.pollAction, styles.pollActionPrimary]}
                onPress={() => {
                  const address = encodeURIComponent(
                    `${pollingPlace.address}, ${pollingPlace.city}, ${pollingPlace.state} ${pollingPlace.zip}`
                  );
                  Linking.openURL(`https://maps.google.com/?q=${address}`);
                }}
              >
                <Ionicons name="navigate-outline" size={16} color={Colors.white} />
                <Text style={styles.pollActionTextPrimary}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pollAction}>
                <Ionicons name="calendar-outline" size={16} color="#374151" />
                <Text style={styles.pollActionText}>Early Voting</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.pollCard}>
            <View style={styles.pollNotSet}>
              <Text style={styles.pollNotSetText}>
                Enter your address to find your polling location
              </Text>
              <TouchableOpacity style={styles.pollSetBtn}>
                <Ionicons name="location-outline" size={18} color={Colors.white} />
                <Text style={styles.pollSetBtnText}>Set My Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===========================================
// Sub-Components
// ===========================================

interface ProgressRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
}

function ProgressRing({ progress, size, strokeWidth }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.progressRingContainer}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.white}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View style={styles.progressRingText}>
        <Text style={styles.progressRingValue}>{progress}%</Text>
      </View>
    </View>
  );
}

interface StepIndicatorProps {
  label: string;
  step: number;
  status: 'not_started' | 'in_progress' | 'complete';
}

function StepIndicator({ label, step, status }: StepIndicatorProps) {
  const isComplete = status === 'complete';
  const isCurrent = status === 'in_progress';

  return (
    <View style={styles.stepDot}>
      <View style={[
        styles.stepCircle,
        isComplete && styles.stepCircleComplete,
        isCurrent && styles.stepCircleCurrent,
      ]}>
        {isComplete ? (
          <Ionicons name="checkmark" size={16} color={Colors.primary} />
        ) : (
          <Text style={[
            styles.stepNumber,
            (isComplete || isCurrent) && styles.stepNumberActive
          ]}>{step}</Text>
        )}
      </View>
      <Text style={styles.stepLabel}>{label}</Text>
    </View>
  );
}

interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  status: string;
  statusType: 'default' | 'complete' | 'in_progress';
  color: string;
  onPress: () => void;
  isActive: boolean;
}

function QuickActionCard({ icon, title, status, statusType, color, onPress, isActive }: QuickActionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, isActive && styles.quickActionActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={[
        styles.quickActionStatus,
        statusType === 'complete' && styles.quickActionStatusComplete,
        statusType === 'in_progress' && styles.quickActionStatusInProgress,
      ]}>
        {statusType === 'complete' && '✓ '}{status}
      </Text>
    </TouchableOpacity>
  );
}

interface DeadlineRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  detail: string;
  badge: string;
  badgeType: 'days' | 'urgent' | 'action';
  onBadgePress?: () => void;
  isLast?: boolean;
}

function DeadlineRow({ icon, iconBg, title, detail, badge, badgeType, onBadgePress, isLast }: DeadlineRowProps) {
  const BadgeComponent = badgeType === 'action' ? TouchableOpacity : View;

  return (
    <View style={[styles.deadlineRow, isLast && styles.deadlineRowLast]}>
      <View style={[styles.deadlineIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={
          badgeType === 'urgent' ? Colors.red :
          badgeType === 'action' ? Colors.blue : Colors.green
        } />
      </View>
      <View style={styles.deadlineInfo}>
        <Text style={styles.deadlineTitle}>{title}</Text>
        <Text style={styles.deadlineDetail}>{detail}</Text>
      </View>
      <BadgeComponent
        style={[
          styles.deadlineBadge,
          badgeType === 'days' && styles.deadlineBadgeDays,
          badgeType === 'urgent' && styles.deadlineBadgeUrgent,
          badgeType === 'action' && styles.deadlineBadgeAction,
        ]}
        {...(badgeType === 'action' && onBadgePress ? { onPress: onBadgePress } : {})}
      >
        <Text style={[
          styles.deadlineBadgeText,
          badgeType === 'days' && styles.deadlineBadgeTextDays,
          badgeType === 'urgent' && styles.deadlineBadgeTextUrgent,
          badgeType === 'action' && styles.deadlineBadgeTextAction,
        ]}>{badge}</Text>
      </BadgeComponent>
    </View>
  );
}

// ===========================================
// Styles
// ===========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Welcome Section
  welcomeSection: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  email: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },

  // Hero Progress
  heroProgress: {
    margin: 16,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecoCircle1: {
    position: 'absolute',
    top: -45,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDecoCircle2: {
    position: 'absolute',
    bottom: -60,
    right: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 16,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },

  // Progress Ring
  progressRingContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },

  // Steps Row
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  stepDot: {
    alignItems: 'center',
    width: 70,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleComplete: {
    backgroundColor: Colors.white,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.white,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  stepNumberActive: {
    color: Colors.primary,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  stepConnector: {
    width: 30,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 16,
    borderRadius: 2,
  },
  stepConnectorComplete: {
    backgroundColor: Colors.white,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickAction: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
  },
  quickActionActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#FAFAFF',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  quickActionStatus: {
    fontSize: 12,
    color: Colors.gray,
  },
  quickActionStatusComplete: {
    color: Colors.green,
    fontWeight: '600',
  },
  quickActionStatusInProgress: {
    color: Colors.orange,
    fontWeight: '600',
  },

  // Upcoming/Deadlines Card
  upcomingCard: {
    margin: 16,
    marginTop: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue,
    padding: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  upcomingHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
  },
  upcomingCountdown: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  upcomingCountdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  upcomingContent: {
    padding: 12,
    paddingHorizontal: 16,
  },

  // Deadline Row
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    gap: 12,
  },
  deadlineRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  deadlineIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  deadlineDetail: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  deadlineBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deadlineBadgeDays: {
    backgroundColor: '#DBEAFE',
  },
  deadlineBadgeUrgent: {
    backgroundColor: '#FEE2E2',
  },
  deadlineBadgeAction: {
    backgroundColor: Colors.primary,
  },
  deadlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deadlineBadgeTextDays: {
    color: Colors.blueDark,
  },
  deadlineBadgeTextUrgent: {
    color: '#DC2626',
  },
  deadlineBadgeTextAction: {
    color: Colors.white,
  },

  // Poll Card
  pollCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  pollIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollHeaderText: {
    flex: 1,
  },
  pollTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  pollSubtitle: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  pollLocation: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    marginBottom: 12,
  },
  pollLocationName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  pollLocationAddress: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 4,
    lineHeight: 18,
  },
  pollLocationHours: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  pollLocationHoursText: {
    fontSize: 12,
    color: Colors.green,
    fontWeight: '600',
  },
  pollActions: {
    flexDirection: 'row',
    gap: 10,
  },
  pollAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.grayLight,
    borderRadius: 10,
    gap: 6,
  },
  pollActionPrimary: {
    backgroundColor: Colors.red,
  },
  pollActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  pollActionTextPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  pollNotSet: {
    alignItems: 'center',
    padding: 20,
  },
  pollNotSetText: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
    textAlign: 'center',
  },
  pollSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  pollSetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});
