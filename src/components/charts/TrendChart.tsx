import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { BingeLog, UrgeEntry } from '../../types';

interface TrendChartProps {
  logs: BingeLog[];
  urges: UrgeEntry[];
  weeks?: number;
}

export function TrendChart({ logs, urges, weeks = 4 }: TrendChartProps) {
  const { theme } = useTheme();

  // Calculate weekly data
  const weeklyData = [];
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = now - ((i + 1) * weekMs);
    const weekEnd = now - (i * weekMs);

    const weekLogs = logs.filter(l => l.timestamp >= weekStart && l.timestamp < weekEnd);
    const weekUrges = urges.filter(u => u.timestamp >= weekStart && u.timestamp < weekEnd);
    const weekSurfed = weekUrges.filter(u => u.surfed).length;

    weeklyData.push({
      label: i === 0 ? 'This week' : i === 1 ? 'Last week' : `${i} weeks ago`,
      binges: weekLogs.length,
      urgesSurfed: weekSurfed,
    });
  }

  const maxBinges = Math.max(...weeklyData.map(w => w.binges), 1);
  const maxUrges = Math.max(...weeklyData.map(w => w.urgesSurfed), 1);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textTertiary }]}>
        WEEKLY TREND
      </Text>

      <View style={styles.chartContainer}>
        {weeklyData.map((week, index) => (
          <View key={index} style={styles.weekColumn}>
            <View style={styles.barsContainer}>
              {/* Binges bar (red) */}
              <View
                style={[
                  styles.bar,
                  styles.bingeBar,
                  {
                    backgroundColor: theme.error,
                    height: Math.max((week.binges / maxBinges) * 60, 4),
                    opacity: week.binges > 0 ? 1 : 0.3,
                  },
                ]}
              />
              {/* Urges surfed bar (green) */}
              <View
                style={[
                  styles.bar,
                  styles.urgeBar,
                  {
                    backgroundColor: theme.accent,
                    height: Math.max((week.urgesSurfed / maxUrges) * 60, 4),
                    opacity: week.urgesSurfed > 0 ? 1 : 0.3,
                  },
                ]}
              />
            </View>
            <Text style={[styles.weekLabel, { color: theme.textMuted }]} numberOfLines={1}>
              {index === weeks - 1 ? 'This' : index === weeks - 2 ? 'Last' : `W${weeks - index}`}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.error }]} />
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
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: Spacing.md,
  },
  weekColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  bar: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
  },
  bingeBar: {},
  urgeBar: {},
  weekLabel: {
    fontSize: 10,
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
