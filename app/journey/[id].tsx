import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useApp } from '../../src/context/AppContext';
import { Card, Button } from '../../src/components';
import { JOURNEYS } from '../../src/constants/data';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';

export default function JourneyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { getJourneyProgress, startJourney, completeJourneyDay, triggerHaptic } = useApp();

  const journey = JOURNEYS.find((j) => j.id === id);
  const progress = getJourneyProgress(id || '');

  const [selectedDay, setSelectedDay] = useState<number>(progress?.currentDay || 1);
  const [reflectionText, setReflectionText] = useState('');

  if (!journey) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Journey not found</Text>
      </SafeAreaView>
    );
  }

  const currentDayData = journey.days.find((d) => d.day === selectedDay);
  const isDayCompleted = progress?.completedDays.includes(selectedDay) || false;
  const isStarted = !!progress;

  const handleStartJourney = () => {
    startJourney(journey.id);
    triggerHaptic('medium');
  };

  const handleCompleteDay = () => {
    completeJourneyDay(journey.id, selectedDay);
    triggerHaptic('success');

    if (selectedDay < journey.duration) {
      setSelectedDay(selectedDay + 1);
      setReflectionText('');
    }
  };

  const getCategoryColor = () => {
    switch (journey.category) {
      case 'awareness':
        return theme.primary;
      case 'mindfulness':
        return theme.secondary;
      case 'self-compassion':
        return theme.accent;
      case 'coping':
        return theme.warning;
      default:
        return theme.primary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {journey.title}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
          contentContainerStyle={styles.daySelectorContent}
        >
          {journey.days.map((day) => {
            const isCompleted = progress?.completedDays.includes(day.day) || false;
            const isCurrent = day.day === selectedDay;
            const isLocked = !isStarted || day.day > (progress?.currentDay || 1);

            return (
              <TouchableOpacity
                key={day.day}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: isCurrent
                      ? getCategoryColor()
                      : isCompleted
                      ? theme.accentSoft
                      : theme.surface,
                    borderColor: isCurrent ? getCategoryColor() : theme.border,
                    opacity: isLocked ? 0.5 : 1,
                  },
                ]}
                onPress={() => !isLocked && setSelectedDay(day.day)}
                disabled={isLocked}
              >
                {isCompleted && !isCurrent ? (
                  <Feather name="check" size={16} color={theme.accent} />
                ) : (
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: isCurrent ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {day.day}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Day Content */}
        {!isStarted ? (
          <Card style={styles.startCard}>
            <View style={[styles.journeyIcon, { backgroundColor: theme.primarySoft }]}>
              <Feather name={journey.icon as any} size={32} color={getCategoryColor()} />
            </View>
            <Text style={[styles.journeyTitle, { color: theme.text }]}>{journey.title}</Text>
            <Text style={[styles.journeyDescription, { color: theme.textSecondary }]}>
              {journey.description}
            </Text>
            <Text style={[styles.durationText, { color: theme.textTertiary }]}>
              {journey.duration} days
            </Text>
            <Button
              title="Begin Journey"
              onPress={handleStartJourney}
              variant="primary"
              size="lg"
              style={{ width: '100%', marginTop: Spacing.xl }}
            />
          </Card>
        ) : currentDayData ? (
          <>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <Text style={[styles.dayLabel, { color: getCategoryColor() }]}>
                Day {currentDayData.day}
              </Text>
              <Text style={[styles.dayTitle, { color: theme.text }]}>
                {currentDayData.title}
              </Text>
            </View>

            {/* Prompt */}
            <Card style={styles.promptCard}>
              <View style={styles.promptHeader}>
                <Feather name="message-circle" size={18} color={theme.secondary} />
                <Text style={[styles.promptLabel, { color: theme.textTertiary }]}>
                  Today's Focus
                </Text>
              </View>
              <Text style={[styles.promptText, { color: theme.text }]}>
                {currentDayData.prompt}
              </Text>
            </Card>

            {/* Exercise (if any) */}
            {currentDayData.exercise && (
              <Card style={styles.exerciseCard}>
                <View style={styles.promptHeader}>
                  <Feather name="activity" size={18} color={theme.accent} />
                  <Text style={[styles.promptLabel, { color: theme.textTertiary }]}>
                    Practice
                  </Text>
                </View>
                <Text style={[styles.promptText, { color: theme.text }]}>
                  {currentDayData.exercise}
                </Text>
              </Card>
            )}

            {/* Reflection */}
            {currentDayData.reflection && (
              <Card style={styles.reflectionCard}>
                <View style={styles.promptHeader}>
                  <Feather name="edit-3" size={18} color={theme.primary} />
                  <Text style={[styles.promptLabel, { color: theme.textTertiary }]}>
                    Reflection
                  </Text>
                </View>
                <Text style={[styles.reflectionQuestion, { color: theme.textSecondary }]}>
                  {currentDayData.reflection}
                </Text>
                <TextInput
                  style={[
                    styles.reflectionInput,
                    {
                      color: theme.text,
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="Write your thoughts..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  value={reflectionText}
                  onChangeText={setReflectionText}
                />
              </Card>
            )}

            {/* Complete Day Button */}
            {!isDayCompleted && (
              <Button
                title={selectedDay === journey.duration ? 'Complete Journey' : 'Complete Day'}
                onPress={handleCompleteDay}
                variant="primary"
                size="lg"
                style={{ marginTop: Spacing.xl }}
              />
            )}

            {isDayCompleted && (
              <View style={[styles.completedBadge, { backgroundColor: theme.accentSoft }]}>
                <Feather name="check-circle" size={20} color={theme.accent} />
                <Text style={[styles.completedText, { color: theme.accent }]}>
                  Day completed
                </Text>
              </View>
            )}
          </>
        ) : null}
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
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  errorText: {
    fontSize: FontSize.md,
    textAlign: 'center',
    marginTop: Spacing.xxxl,
  },
  daySelector: {
    marginBottom: Spacing.xl,
  },
  daySelectorContent: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  startCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  journeyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  journeyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  journeyDescription: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  durationText: {
    fontSize: FontSize.sm,
  },
  dayHeader: {
    marginBottom: Spacing.xl,
  },
  dayLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  dayTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.3,
  },
  promptCard: {
    marginBottom: Spacing.md,
  },
  exerciseCard: {
    marginBottom: Spacing.md,
  },
  reflectionCard: {
    marginBottom: Spacing.md,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  promptLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
  promptText: {
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  reflectionQuestion: {
    fontSize: FontSize.md,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  reflectionInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  completedText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
});
