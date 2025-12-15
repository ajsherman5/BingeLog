import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PredictiveAlert as AlertType } from '../types';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

interface PredictiveAlertProps {
  alert: AlertType;
  onDismiss?: () => void;
  onAction?: () => void;
}

export function PredictiveAlert({ alert, onDismiss, onAction }: PredictiveAlertProps) {
  const { theme } = useTheme();

  const getAlertColors = () => {
    switch (alert.type) {
      case 'warning':
        return {
          background: theme.secondarySoft,
          icon: theme.secondary,
          accent: theme.secondary,
        };
      case 'success':
        return {
          background: theme.accentSoft,
          icon: theme.accent,
          accent: theme.accent,
        };
      case 'info':
      default:
        return {
          background: theme.primarySoft,
          icon: theme.primary,
          accent: theme.primary,
        };
    }
  };

  const colors = getAlertColors();
  const iconName = alert.type === 'warning' ? 'alert-circle' : alert.type === 'success' ? 'check-circle' : 'info';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: colors.icon }]}>
          <Feather name={iconName} size={18} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: colors.accent }]}>
            {alert.type === 'warning' ? 'Heads up' : 'Insight'}
          </Text>
          <Text style={[styles.message, { color: theme.text }]}>
            {alert.message}
          </Text>
          {alert.suggestion && (
            <Text style={[styles.suggestion, { color: theme.textSecondary }]}>
              {alert.suggestion}
            </Text>
          )}
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Feather name="x" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.accent }]}
          onPress={onAction}
        >
          <Text style={[styles.actionText, { color: colors.accent }]}>
            Open Urge Timer
          </Text>
          <Feather name="arrow-right" size={14} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  message: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  },
  suggestion: {
    fontSize: FontSize.sm,
    marginTop: 4,
    lineHeight: 20,
  },
  dismissButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
