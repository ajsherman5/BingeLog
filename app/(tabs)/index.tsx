import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useApp } from '../../src/context/AppContext';
import {
  Card,
  WeekStrip,
  Button,
  MilestoneModal,
} from '../../src/components';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { MIN_LOGS_FOR_INSIGHTS } from '../../src/constants/data';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    stats,
    logs,
    isOnboarded,
    hasCheckedInToday,
    newMilestones,
    clearNewMilestones,
    triggerHaptic,
    getMostCommonTrigger,
  } = useApp();

  const [showMilestone, setShowMilestone] = useState(false);

  useEffect(() => {
    if (!isOnboarded) {
      router.replace('/onboarding');
    }
  }, [isOnboarded]);

  useEffect(() => {
    if (newMilestones.length > 0) {
      setShowMilestone(true);
    }
  }, [newMilestones]);

  const handleCloseMilestone = () => {
    setShowMilestone(false);
    clearNewMilestones();
  };

  if (!isOnboarded) {
    return null;
  }

  const bingeTimestamps = logs.map((log) => log.timestamp);
  const checkedIn = hasCheckedInToday();
  const mostCommonTrigger = getMostCommonTrigger();
  const hasEnoughDataForInsights = logs.length >= MIN_LOGS_FOR_INSIGHTS;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={[styles.brandIcon, { backgroundColor: theme.primarySoft }]}>
              <Feather name="heart" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.brandName, { color: theme.text }]}>
              Binge Log
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.logButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              triggerHaptic('light');
              router.push('/log');
            }}
            activeOpacity={0.8}
          >
            <Feather name="edit-3" size={16} color="#FFFFFF" />
            <Text style={styles.logButtonText}>Log</Text>
          </TouchableOpacity>
        </View>

        {/* Main Streak Display */}
        <Card style={styles.streakCard}>
          <View style={[styles.streakIconContainer, { backgroundColor: theme.accentSoft }]}>
            <Feather name="zap" size={28} color={theme.accent} />
          </View>
          <Text style={[styles.streakNumber, { color: theme.text }]}>
            {stats.currentStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
            {stats.currentStreak === 1 ? 'day binge-free' : 'days binge-free'}
          </Text>
          {stats.longestStreak > 0 && stats.longestStreak > stats.currentStreak && (
            <Text style={[styles.bestStreak, { color: theme.textTertiary }]}>
              Best: {stats.longestStreak} days
            </Text>
          )}
        </Card>

        {/* Week Strip */}
        <View style={styles.weekStripContainer}>
          <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>THIS WEEK</Text>
          <WeekStrip markedDates={bingeTimestamps} />
        </View>

        {/* Urge Timer - Primary Action */}
        <Card style={styles.urgeCard}>
          <View style={styles.urgeHeader}>
            <View style={[styles.urgeIcon, { backgroundColor: theme.secondarySoft }]}>
              <Feather name="clock" size={22} color={theme.secondary} />
            </View>
            <View style={styles.urgeText}>
              <Text style={[styles.urgeTitle, { color: theme.text }]}>
                Feeling an urge to binge?
              </Text>
              <Text style={[styles.urgeDescription, { color: theme.textTertiary }]}>
                Ride it out with the 90-second timer
              </Text>
            </View>
          </View>
          <Button
            title="Start Urge Timer"
            onPress={() => router.push('/urge')}
            variant="primary"
            size="lg"
            style={{ marginTop: Spacing.lg }}
          />
        </Card>

        {/* Urge Check-in */}
        {checkedIn ? (
          <Card style={styles.checkInCard}>
            <View style={styles.checkInContent}>
              <View style={[styles.checkInIcon, { backgroundColor: theme.accentSoft }]}>
                <Feather name="check-circle" size={18} color={theme.accent} />
              </View>
              <View style={styles.checkInText}>
                <Text style={[styles.checkInTitle, { color: theme.text }]}>
                  You're doing great
                </Text>
                <Text style={[styles.checkInSubtitle, { color: theme.accent }]}>
                  Today's check-in complete
                </Text>
              </View>
              <View style={[styles.checkInBadge, { backgroundColor: theme.accentSoft }]}>
                <Feather name="star" size={14} color={theme.accent} />
              </View>
            </View>
          </Card>
        ) : (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              router.push('/checkin');
            }}
            activeOpacity={0.8}
          >
            <Card style={styles.checkInCard}>
              <View style={styles.checkInContent}>
                <View style={[styles.checkInIcon, { backgroundColor: theme.primarySoft }]}>
                  <Feather name="activity" size={18} color={theme.primary} />
                </View>
                <View style={styles.checkInText}>
                  <Text style={[styles.checkInTitle, { color: theme.text }]}>
                    How are urges today?
                  </Text>
                  <Text style={[styles.checkInSubtitle, { color: theme.textTertiary }]}>
                    Quick check-in to track patterns
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textMuted} />
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalBinges}</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>
              {stats.totalBinges === 1 ? 'Binge Logged' : 'Binges Logged'}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.urgesSurfed}</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>
              {stats.urgesSurfed === 1 ? 'Urge Resisted' : 'Urges Resisted'}
            </Text>
          </Card>
        </View>

        {/* Pattern Insight */}
        {hasEnoughDataForInsights && mostCommonTrigger && (
          <Card style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Feather name="trending-up" size={16} color={theme.secondary} />
              <Text style={[styles.insightLabel, { color: theme.textTertiary }]}>
                Pattern Insight
              </Text>
            </View>
            <Text style={[styles.insightText, { color: theme.textSecondary }]}>
              Your most common trigger is{' '}
              <Text style={{ color: theme.primary, fontWeight: FontWeight.medium }}>
                {mostCommonTrigger.toLowerCase()}
              </Text>
              . Knowing this can help you prepare.
            </Text>
          </Card>
        )}

        {/* Self-Care Journeys Link */}
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            router.push('/journeys');
          }}
          activeOpacity={0.8}
        >
          <Card style={styles.journeysCard}>
            <View style={styles.journeysContent}>
              <View style={[styles.journeysIcon, { backgroundColor: theme.accentSoft }]}>
                <Feather name="compass" size={18} color={theme.accent} />
              </View>
              <View style={styles.journeysText}>
                <Text style={[styles.journeysTitle, { color: theme.text }]}>
                  Self-Care Journeys
                </Text>
                <Text style={[styles.journeysSubtitle, { color: theme.textTertiary }]}>
                  Guided exercises to understand triggers
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={[styles.encouragement, { color: theme.textTertiary }]}>
            {stats.currentStreak === 0
              ? "Every moment is a fresh start."
              : stats.currentStreak === 1
              ? "One day at a time. You're doing this."
              : stats.currentStreak < 7
              ? "You're building momentum. Keep going."
              : "Your awareness is making a difference."}
          </Text>
        </View>
      </ScrollView>

      {/* Milestone Modal */}
      <MilestoneModal
        milestone={newMilestones[0] || null}
        visible={showMilestone}
        onClose={handleCloseMilestone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.3,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  streakCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: FontWeight.light,
    letterSpacing: -2,
  },
  streakLabel: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  bestStreak: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  weekStripContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  urgeCard: {
    marginBottom: Spacing.md,
  },
  urgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgeText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  urgeTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  urgeDescription: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  checkInCard: {
    marginBottom: Spacing.md,
  },
  checkInContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  checkInTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  checkInSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  checkInBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.light,
  },
  statLabel: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  insightCard: {
    marginBottom: Spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  insightLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  journeysCard: {
    marginBottom: Spacing.md,
  },
  journeysContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  journeysIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeysText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  journeysTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  journeysSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  encouragementContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  encouragement: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
