import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme';

interface StreakBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ count, size = 'md' }: StreakBadgeProps) {
  const { theme } = useTheme();

  const sizes = {
    sm: { padding: Spacing.sm, fontSize: FontSize.sm, icon: 12 },
    md: { padding: Spacing.md, fontSize: FontSize.md, icon: 14 },
    lg: { padding: Spacing.lg, fontSize: FontSize.lg, icon: 18 },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.primarySoft,
          paddingHorizontal: sizes.padding,
          paddingVertical: sizes.padding / 2,
        },
      ]}
    >
      <Feather name="zap" size={sizes.icon} color={theme.primary} />
      <Text
        style={[
          styles.count,
          { color: theme.primary, fontSize: sizes.fontSize },
        ]}
      >
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  count: {
    fontWeight: FontWeight.semibold,
  },
});
