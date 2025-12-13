import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Milestone } from '../types';
import { MILESTONE_AFFIRMATIONS } from '../constants/data';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { Button } from './Button';

interface MilestoneModalProps {
  milestone: Milestone | null;
  visible: boolean;
  onClose: () => void;
}

export function MilestoneModal({ milestone, visible, onClose }: MilestoneModalProps) {
  const { theme } = useTheme();
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

  const handleShare = async () => {
    if (!milestone) return;

    const affirmation = MILESTONE_AFFIRMATIONS[Math.floor(Math.random() * MILESTONE_AFFIRMATIONS.length)];

    try {
      await Share.share({
        message: `${milestone.title}\n\n${milestone.description}\n\n"${affirmation}"\n\n- Shared from Binge Log`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  if (!milestone) return null;

  const getIconName = (): keyof typeof Feather.glyphMap => {
    switch (milestone.type) {
      case 'streak':
        return 'zap';
      case 'urges_surfed':
        return 'anchor';
      case 'logs':
        return 'book-open';
      default:
        return 'award';
    }
  };

  const getIconColor = () => {
    switch (milestone.type) {
      case 'streak':
        return theme.accent;
      case 'urges_surfed':
        return theme.secondary;
      case 'logs':
        return theme.primary;
      default:
        return theme.primary;
    }
  };

  const getIconBgColor = () => {
    switch (milestone.type) {
      case 'streak':
        return theme.accentSoft;
      case 'urges_surfed':
        return theme.secondarySoft;
      case 'logs':
        return theme.primarySoft;
      default:
        return theme.primarySoft;
    }
  };

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
          <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
            <Feather name={getIconName()} size={32} color={getIconColor()} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>{milestone.title}</Text>

          {/* Description */}
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {milestone.description}
          </Text>

          {/* Affirmation */}
          <View style={[styles.affirmationContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.affirmation, { color: theme.textTertiary }]}>
              "{MILESTONE_AFFIRMATIONS[Math.floor(Math.random() * MILESTONE_AFFIRMATIONS.length)]}"
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Share"
              onPress={handleShare}
              variant="outline"
              size="md"
              icon={<Feather name="share" size={16} color={theme.primary} />}
              style={{ flex: 1 }}
            />
            <Button
              title="Continue"
              onPress={onClose}
              variant="primary"
              size="md"
              style={{ flex: 1 }}
            />
          </View>
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
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  affirmationContainer: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  affirmation: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
});
