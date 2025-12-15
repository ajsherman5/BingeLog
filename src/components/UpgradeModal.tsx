import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { usePremium } from '../context/PremiumContext';
import { PremiumFeature } from '../types';
import { PREMIUM_FEATURES, ALL_PREMIUM_BENEFITS } from '../constants/premium';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { Button } from './Button';

interface UpgradeModalProps {
  visible: boolean;
  feature?: PremiumFeature | null;
  onClose: () => void;
}

export function UpgradeModal({ visible, feature, onClose }: UpgradeModalProps) {
  const { theme } = useTheme();
  const { upgradeToPremium } = useApp();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleUpgrade = () => {
    // For now, use dev source (will be replaced with actual IAP)
    upgradeToPremium('dev');
    onClose();
  };

  const handleRestore = async () => {
    // TODO: Implement restore purchases
    console.log('Restore purchases');
  };

  const featureConfig = feature ? PREMIUM_FEATURES[feature] : null;
  const benefits = featureConfig?.benefits || ALL_PREMIUM_BENEFITS;
  const title = featureConfig ? `Unlock ${featureConfig.name}` : 'Upgrade to Premium';
  const description = featureConfig?.description || 'Get the most out of your recovery journey';

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.surface,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color={theme.textTertiary} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.primarySoft }]}>
            <Feather
              name={featureConfig?.icon as any || 'star'}
              size={32}
              color={theme.primary}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

          {/* Description */}
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {description}
          </Text>

          {/* Benefits List */}
          <View style={[styles.benefitsContainer, { backgroundColor: theme.background }]}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={[styles.checkCircle, { backgroundColor: theme.accentSoft }]}>
                  <Feather name="check" size={12} color={theme.accent} />
                </View>
                <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: theme.text }]}>$4.99</Text>
            <Text style={[styles.priceUnit, { color: theme.textTertiary }]}>/month</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Upgrade Now"
              onPress={handleUpgrade}
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
            />
          </View>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
            <Text style={[styles.restoreText, { color: theme.textTertiary }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    width: '100%',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  benefitsContainer: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: FontSize.sm,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.lg,
  },
  price: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.semibold,
  },
  priceUnit: {
    fontSize: FontSize.md,
    marginLeft: Spacing.xs,
  },
  actions: {
    width: '100%',
  },
  restoreButton: {
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  restoreText: {
    fontSize: FontSize.sm,
  },
});
