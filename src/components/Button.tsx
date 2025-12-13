import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { ReactNode } from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg, fontSize: FontSize.sm },
    md: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.xl, fontSize: FontSize.md },
    lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl, fontSize: FontSize.lg },
  }[size];

  const variantStyles = {
    primary: {
      button: {
        backgroundColor: disabled ? theme.borderLight : theme.primary,
        ...Shadow.sm,
      },
      text: { color: '#FFFFFF' },
    },
    secondary: {
      button: {
        backgroundColor: disabled ? theme.borderLight : theme.accent,
        ...Shadow.sm,
      },
      text: { color: '#FFFFFF' },
    },
    outline: {
      button: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled ? theme.borderLight : theme.border,
      },
      text: { color: disabled ? theme.textMuted : theme.text },
    },
    ghost: {
      button: {
        backgroundColor: 'transparent',
      },
      text: { color: disabled ? theme.textMuted : theme.primary },
    },
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
        variantStyles.button,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            styles.text,
            { fontSize: sizeStyles.fontSize },
            variantStyles.text,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  text: {
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
  },
});
