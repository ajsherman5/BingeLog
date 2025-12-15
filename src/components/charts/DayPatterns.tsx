import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { BingeLog, UrgeEntry } from '../../types';
import { DAYS_OF_WEEK } from '../../constants/data';

interface DayPatternsProps {
  logs: BingeLog[];
  urges: UrgeEntry[];
}

export function DayPatterns({ logs, urges }: DayPatternsProps) {
  const { theme } = useTheme();

  // Count by day of week
  const dayCounts: Record<string, { binges: number; urgesSurfed: number }> = {};

  DAYS_OF_WEEK.forEach(day => {
    dayCounts[day] = { binges: 0, urgesSurfed: 0 };
  });

  logs.forEach(log => {
    const day = DAYS_OF_WEEK[new Date(log.timestamp).getDay()];
    dayCounts[day].binges++;
  });

  urges.filter(u => u.surfed).forEach(urge => {
    const day = DAYS_OF_WEEK[new Date(urge.timestamp).getDay()];
    dayCounts[day].urgesSurfed++;
  });

  const maxBinges = Math.max(...Object.values(dayCounts).map(d => d.binges), 1);
  const maxUrges = Math.max(...Object.values(dayCounts).map(d => d.urgesSurfed), 1);

  // Find the peak day
  const peakDay = Object.entries(dayCounts)
    .reduce((max, [day, counts]) => {
      if (counts.binges > max.count) {
        return { day, count: counts.binges };
      }
      return max;
    }, { day: '', count: 0 });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textTertiary }]}>
        DAY OF WEEK PATTERNS
      </Text>

      <View style={styles.chartContainer}>
        {DAYS_OF_WEEK.map((day, index) => {
          const data = dayCounts[day];
          const bingeHeight = (data.binges / maxBinges) * 50;
          const urgeHeight = (data.urgesSurfed / maxUrges) * 50;
          const isPeak = day === peakDay.day && peakDay.count > 0;

          return (
            <View key={day} style={styles.dayColumn}>
              <View style={styles.barsWrapper}>
                {/* Binges bar */}
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: isPeak ? theme.error : theme.primaryLight,
                      height: Math.max(bingeHeight, data.binges > 0 ? 4 : 0),
                    },
                  ]}
                />
                {/* Urges surfed bar */}
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: theme.accent,
                      height: Math.max(urgeHeight, data.urgesSurfed > 0 ? 4 : 0),
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  { color: isPeak ? theme.error : theme.textMuted },
                  isPeak && styles.dayLabelPeak,
                ]}
              >
                {day.slice(0, 1)}
              </Text>
              {data.binges > 0 && (
                <Text style={[styles.countLabel, { color: theme.textTertiary }]}>
                  {data.binges}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {peakDay.count > 0 && (
        <View style={[styles.insightContainer, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.insightText, { color: theme.text }]}>
            <Text style={styles.insightHighlight}>{peakDay.day}s</Text> tend to be challenging for you
          </Text>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.primaryLight }]} />
          <Text style={[styles.legendText, { color: theme.textTertiary }]}>Binges</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.legendText, { color: theme.textTertiary }]}>Urges surfed</Text>
        </View>
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
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    marginBottom: Spacing.md,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 50,
    marginBottom: Spacing.xs,
  },
  bar: {
    width: 10,
    borderRadius: 5,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: FontWeight.medium,
  },
  dayLabelPeak: {
    fontWeight: FontWeight.semibold,
  },
  countLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  insightContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  insightText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  insightHighlight: {
    fontWeight: FontWeight.semibold,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FontSize.xs,
  },
});
