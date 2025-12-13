import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Journey, JourneyProgress } from '../types';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { Card } from './Card';

interface JourneyCardProps {
  journey: Journey;
  progress?: JourneyProgress;
  onPress: () => void;
}

export function JourneyCard({ journey, progress, onPress }: JourneyCardProps) {
  const { theme } = useTheme();

  const isStarted = !!progress;
  const completedDays = progress?.completedDays.length || 0;
  const progressPercent = (completedDays / journey.duration) * 100;
  const isCompleted = completedDays === journey.duration;

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

  const getCategoryBgColor = () => {
    switch (journey.category) {
      case 'awareness':
        return theme.primarySoft;
      case 'mindfulness':
        return theme.secondarySoft;
      case 'self-compassion':
        return theme.accentSoft;
      case 'coping':
        return theme.background;
      default:
        return theme.primarySoft;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: getCategoryBgColor() }]}>
            <Feather name={journey.icon as any} size={20} color={getCategoryColor()} />
          </View>

          {isCompleted ? (
            <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
              <Feather name="check" size={12} color={theme.accent} />
              <Text style={[styles.badgeText, { color: theme.accent }]}>Complete</Text>
            </View>
          ) : isStarted ? (
            <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                Day {progress.currentDay} of {journey.duration}
              </Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: theme.background }]}>
              <Text style={[styles.badgeText, { color: theme.textTertiary }]}>
                {journey.duration} days
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: theme.text }]}>{journey.title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {journey.description}
        </Text>

        {isStarted && !isCompleted && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.borderLight }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: getCategoryColor(), width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textTertiary }]}>
              {completedDays}/{journey.duration} days
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.categoryLabel, { color: getCategoryColor() }]}>
            {journey.category.charAt(0).toUpperCase() + journey.category.slice(1).replace('-', ' ')}
          </Text>
          <Feather name="chevron-right" size={18} color={theme.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FontSize.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
});
