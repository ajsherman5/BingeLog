import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Shadow, Spacing } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, style, padding = 'lg' }: CardProps) {
  const { theme } = useTheme();

  const paddingValue = {
    none: 0,
    sm: Spacing.md,
    md: Spacing.lg,
    lg: Spacing.xl,
  }[padding];

  return (
    <View
      style={[
        styles.card,
        Shadow.md,
        {
          backgroundColor: theme.surface,
          padding: paddingValue,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
  },
});
