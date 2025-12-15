import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import { PremiumFeature } from '../types';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

interface PaywallLockProps {
  feature: PremiumFeature;
  children?: React.ReactNode;
  message?: string;
}

export function PaywallLock({ feature, children, message = 'Unlock Premium Insights' }: PaywallLockProps) {
  const { theme } = useTheme();
  const { isPremium, showUpgradePrompt } = usePremium();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => showUpgradePrompt(feature)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#7C3AED', '#9333EA', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Crown icon */}
        <View style={styles.iconContainer}>
          <Feather name="award" size={32} color="#FFFFFF" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{message}</Text>

        {/* Features list */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Feather name="check" size={16} color="#E9D5FF" />
            <Text style={styles.featureText}>Your Patterns & Triggers</Text>
          </View>
          <View style={styles.featureItem}>
            <Feather name="check" size={16} color="#E9D5FF" />
            <Text style={styles.featureText}>What's Working For You</Text>
          </View>
          <View style={styles.featureItem}>
            <Feather name="check" size={16} color="#E9D5FF" />
            <Text style={styles.featureText}>Detailed Charts & Analytics</Text>
          </View>
          <View style={styles.featureItem}>
            <Feather name="check" size={16} color="#E9D5FF" />
            <Text style={styles.featureText}>Personalized Suggestions</Text>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>Upgrade to Pro</Text>
          <Feather name="arrow-right" size={18} color="#7C3AED" />
        </View>

        {/* Subtle badge */}
        <Text style={styles.badge}>PRO</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  featuresList: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSize.md,
    color: '#F3E8FF',
    fontWeight: FontWeight.medium,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  ctaText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#7C3AED',
  },
  badge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
  },
});
