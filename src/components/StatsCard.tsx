import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { Card } from './Card';

interface StatItemProps {
  value: number;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
}

interface StatsCardProps {
  stats: StatItemProps[];
}

export function StatsCard({ stats }: StatsCardProps) {
  const { theme } = useTheme();

  return (
    <Card style={styles.container}>
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
              <Feather name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={[styles.value, { color: theme.text }]}>{stat.value}</Text>
            <Text style={[styles.label, { color: theme.textTertiary }]}>{stat.label}</Text>
            {index < stats.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {},
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.light,
  },
  label: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  divider: {
    position: 'absolute',
    right: 0,
    top: '20%',
    height: '60%',
    width: 1,
  },
});
