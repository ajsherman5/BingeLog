import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { BingeLog } from '../../types';
import { TIME_WINDOWS, DAYS_OF_WEEK } from '../../constants/data';

interface TimeHeatmapProps {
  logs: BingeLog[];
}

export function TimeHeatmap({ logs }: TimeHeatmapProps) {
  const { theme } = useTheme();

  // Build heatmap data
  const heatmapData: Record<string, Record<string, number>> = {};
  let maxCount = 0;

  // Initialize all cells
  DAYS_OF_WEEK.forEach(day => {
    heatmapData[day] = {};
    TIME_WINDOWS.forEach(tw => {
      heatmapData[day][tw.label] = 0;
    });
  });

  // Count occurrences
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const day = DAYS_OF_WEEK[date.getDay()];
    const hour = date.getHours();

    const timeWindow = TIME_WINDOWS.find(tw => {
      if (tw.start < tw.end) {
        return hour >= tw.start && hour < tw.end;
      }
      return hour >= tw.start || hour < tw.end;
    });

    if (timeWindow && heatmapData[day]) {
      heatmapData[day][timeWindow.label]++;
      maxCount = Math.max(maxCount, heatmapData[day][timeWindow.label]);
    }
  });

  const getIntensity = (count: number): number => {
    if (maxCount === 0) return 0;
    return count / maxCount;
  };

  const getCellColor = (intensity: number): string => {
    if (intensity === 0) return theme.border;
    // Interpolate from light to intense error color
    const opacity = 0.2 + (intensity * 0.8);
    return `rgba(255, 99, 71, ${opacity})`;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textTertiary }]}>
        TIME HEATMAP
      </Text>

      <View style={styles.heatmapContainer}>
        {/* Header row with time labels */}
        <View style={styles.headerRow}>
          <View style={styles.dayLabel} />
          {TIME_WINDOWS.map(tw => (
            <View key={tw.label} style={styles.timeLabel}>
              <Text style={[styles.timeLabelText, { color: theme.textMuted }]}>
                {tw.label.slice(0, 3)}
              </Text>
            </View>
          ))}
        </View>

        {/* Data rows */}
        {DAYS_OF_WEEK.map(day => (
          <View key={day} style={styles.row}>
            <View style={styles.dayLabel}>
              <Text style={[styles.dayLabelText, { color: theme.textMuted }]}>
                {day.slice(0, 3)}
              </Text>
            </View>
            {TIME_WINDOWS.map(tw => {
              const count = heatmapData[day][tw.label];
              const intensity = getIntensity(count);
              return (
                <View
                  key={tw.label}
                  style={[
                    styles.cell,
                    { backgroundColor: getCellColor(intensity) },
                  ]}
                >
                  {count > 0 && (
                    <Text style={[styles.cellText, { color: intensity > 0.5 ? '#FFF' : theme.text }]}>
                      {count}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: theme.textMuted }]}>Less</Text>
        <View style={styles.legendGradient}>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
            <View
              key={i}
              style={[styles.legendCell, { backgroundColor: getCellColor(intensity) }]}
            />
          ))}
        </View>
        <Text style={[styles.legendText, { color: theme.textMuted }]}>More</Text>
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
  heatmapContainer: {
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
  },
  dayLabel: {
    width: 36,
    justifyContent: 'center',
  },
  dayLabelText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
  timeLabel: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabelText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
  cell: {
    flex: 1,
    height: 28,
    marginHorizontal: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  legendGradient: {
    flexDirection: 'row',
    gap: 2,
  },
  legendCell: {
    width: 16,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
  },
});
