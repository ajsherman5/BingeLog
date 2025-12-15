import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

interface PremiumBadgeProps {
  size?: 'sm' | 'md';
  style?: object;
}

export function PremiumBadge({ size = 'sm', style }: PremiumBadgeProps) {
  const { theme } = useTheme();

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.primarySoft,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? 2 : Spacing.xs,
        },
        style,
      ]}
    >
      <Feather
        name="star"
        size={isSmall ? 10 : 12}
        color={theme.primary}
      />
      <Text
        style={[
          styles.text,
          {
            color: theme.primary,
            fontSize: isSmall ? 10 : FontSize.xs,
          },
        ]}
      >
        PRO
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BorderRadius.full,
  },
  text: {
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },
});
