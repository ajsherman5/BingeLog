import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme';

interface WeekStripProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  markedDates?: number[]; // timestamps of days with activity
}

export function WeekStrip({ selectedDate, onSelectDate, markedDates = [] }: WeekStripProps) {
  const { theme } = useTheme();
  const today = new Date();

  // Get the week dates (Sun-Sat containing today)
  const getWeekDates = () => {
    const dates: Date[] = [];
    const current = new Date(today);
    const dayOfWeek = current.getDay();

    // Go back to Sunday
    current.setDate(current.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const weekDates = getWeekDates();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isMarked = (date: Date) => {
    return markedDates.some((timestamp) => {
      const markedDate = new Date(timestamp);
      return (
        markedDate.getDate() === date.getDate() &&
        markedDate.getMonth() === date.getMonth() &&
        markedDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <View style={styles.container}>
      {weekDates.map((date, index) => {
        const todayCheck = isToday(date);
        const marked = isMarked(date);

        return (
          <TouchableOpacity
            key={index}
            style={styles.dayContainer}
            onPress={() => onSelectDate?.(date)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayLabel,
                { color: todayCheck ? theme.text : theme.textTertiary },
              ]}
            >
              {dayLabels[index]}
            </Text>
            <View
              style={[
                styles.dateCircle,
                todayCheck && { backgroundColor: theme.text },
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  { color: todayCheck ? theme.surface : theme.text },
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
            {marked && (
              <View style={[styles.marker, { backgroundColor: theme.primary }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  dayContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dayLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  marker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
});
