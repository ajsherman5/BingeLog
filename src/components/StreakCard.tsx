import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card } from './Card';
import { FontSize, FontWeight, Spacing } from '../constants/theme';

interface StreakCardProps {
  currentStreak: number;
  showWeekDots?: boolean;
  bingeTimestamps?: number[];
}

export function StreakCard({ currentStreak, showWeekDots = true, bingeTimestamps = [] }: StreakCardProps) {
  const { theme } = useTheme();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const currentDayIndex = today.getDay();

  const isDayClean = (dayIndex: number) => {
    const date = new Date(today);
    const diff = dayIndex - currentDayIndex;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const hasBinge = bingeTimestamps.some((ts) => {
      return ts >= date.getTime() && ts < nextDay.getTime();
    });

    if (dayIndex > currentDayIndex) return false;
    return !hasBinge;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primarySoft }]}>
          <Feather name="zap" size={24} color={theme.primary} />
        </View>
      </View>
      <Text style={[styles.streakNumber, { color: theme.text }]}>
        {currentStreak}
      </Text>
      <Text style={[styles.streakLabel, { color: theme.textTertiary }]}>
        {currentStreak === 1 ? 'day streak' : 'day streak'}
      </Text>

      {showWeekDots && (
        <View style={styles.weekContainer}>
          {dayLabels.map((label, index) => (
            <View key={index} style={styles.dayItem}>
              <Text style={[styles.dayLabel, { color: theme.textMuted }]}>
                {label}
              </Text>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isDayClean(index)
                      ? theme.primary
                      : theme.borderLight,
                  },
                  index === currentDayIndex && styles.todayDot,
                  index === currentDayIndex && { borderColor: theme.primary },
                ]}
              />
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.light,
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xs,
    letterSpacing: 0.5,
  },
  weekContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.xxl,
  },
  dayItem: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dayLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  todayDot: {
    borderWidth: 2,
  },
});
