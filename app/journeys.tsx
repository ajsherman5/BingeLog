import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useApp } from '../src/context/AppContext';
import { JourneyCard } from '../src/components';
import { JOURNEYS } from '../src/constants/data';
import { Spacing, FontSize, FontWeight } from '../src/constants/theme';

export default function JourneysScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { getJourneyProgress, triggerHaptic } = useApp();

  const handleJourneyPress = (journeyId: string) => {
    triggerHaptic('light');
    router.push(`/journey/${journeyId}`);
  };

  // Separate active and available journeys
  const activeJourneys = JOURNEYS.filter((j) => {
    const progress = getJourneyProgress(j.id);
    return progress && progress.completedDays.length < j.duration;
  });

  const completedJourneys = JOURNEYS.filter((j) => {
    const progress = getJourneyProgress(j.id);
    return progress && progress.completedDays.length >= j.duration;
  });

  const availableJourneys = JOURNEYS.filter((j) => !getJourneyProgress(j.id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Journeys</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Guided multi-day exercises to build awareness and develop coping skills.
        </Text>

        {/* Active Journeys */}
        {activeJourneys.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              IN PROGRESS
            </Text>
            {activeJourneys.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                progress={getJourneyProgress(journey.id)}
                onPress={() => handleJourneyPress(journey.id)}
              />
            ))}
          </>
        )}

        {/* Available Journeys */}
        {availableJourneys.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              AVAILABLE
            </Text>
            {availableJourneys.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                onPress={() => handleJourneyPress(journey.id)}
              />
            ))}
          </>
        )}

        {/* Completed Journeys */}
        {completedJourneys.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              COMPLETED
            </Text>
            {completedJourneys.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                progress={getJourneyProgress(journey.id)}
                onPress={() => handleJourneyPress(journey.id)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  intro: {
    fontSize: FontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
});
