import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { BingeLog, UrgeCheckIn, UrgeEntry } from '../../types';

interface EmotionBreakdownProps {
  logs: BingeLog[];
  urgeCheckIns: UrgeCheckIn[];
  urges: UrgeEntry[];
  limit?: number;
}

const EMOTION_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#F9F871', // Light yellow
  '#7BD3EA', // Light blue
];

export function EmotionBreakdown({ logs, urgeCheckIns, urges, limit = 5 }: EmotionBreakdownProps) {
  const { theme } = useTheme();

  // Combine all emotions/triggers
  const emotionCounts: Record<string, number> = {};

  logs.forEach(log => {
    log.emotions.forEach(e => {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    });
  });

  urgeCheckIns.forEach(checkIn => {
    checkIn.triggers.forEach(t => {
      emotionCounts[t] = (emotionCounts[t] || 0) + 1;
    });
  });

  urges.forEach(urge => {
    urge.triggersPresent?.forEach(t => {
      emotionCounts[t] = (emotionCounts[t] || 0) + 1;
    });
  });

  const sortedEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const total = sortedEmotions.reduce((sum, [, count]) => sum + count, 0);

  if (sortedEmotions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.textTertiary }]}>
          TRIGGER BREAKDOWN
        </Text>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          Log more to see your trigger patterns
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textTertiary }]}>
        TRIGGER BREAKDOWN
      </Text>

      {/* Visual bar breakdown */}
      <View style={[styles.barContainer, { backgroundColor: theme.border }]}>
        {sortedEmotions.map(([emotion, count], index) => (
          <View
            key={emotion}
            style={[
              styles.barSegment,
              {
                backgroundColor: EMOTION_COLORS[index % EMOTION_COLORS.length],
                flex: count,
              },
            ]}
          />
        ))}
      </View>

      {/* Legend with percentages */}
      <View style={styles.legendContainer}>
        {sortedEmotions.map(([emotion, count], index) => {
          const percentage = Math.round((count / total) * 100);
          return (
            <View key={emotion} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: EMOTION_COLORS[index % EMOTION_COLORS.length] },
                  ]}
                />
                <Text style={[styles.legendLabel, { color: theme.text }]}>
                  {emotion}
                </Text>
              </View>
              <View style={styles.legendRight}>
                <Text style={[styles.legendCount, { color: theme.textMuted }]}>
                  {count}
                </Text>
                <Text style={[styles.legendPercent, { color: theme.textTertiary }]}>
                  {percentage}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  barContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    gap: Spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  legendCount: {
    fontSize: FontSize.sm,
    width: 24,
    textAlign: 'right',
  },
  legendPercent: {
    fontSize: FontSize.xs,
    width: 36,
    textAlign: 'right',
  },
});
