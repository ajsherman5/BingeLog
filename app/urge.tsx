import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useApp } from '../src/context/AppContext';
import { Card, Button, ProgressRing, Chip } from '../src/components';
import { URGE_TIMER_SECONDS, GENTLE_MESSAGES, COPING_STRATEGIES, URGE_INTENSITY_LABELS } from '../src/constants/data';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../src/constants/theme';
import { getUrgeCoachMessage, hasAIApiKey } from '../src/services/ai';
import { UrgeIntensity } from '../src/types';

const TOTAL_SECONDS = URGE_TIMER_SECONDS;

export default function UrgeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { logs, stats, urgeCheckIns, addUrgeEntry, triggerHaptic } = useApp();

  const [secondsLeft, setSecondsLeft] = useState(URGE_TIMER_SECONDS);
  const [isComplete, setIsComplete] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [hasTracked, setHasTracked] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [hasAI, setHasAI] = useState(false);

  // Reflection state
  const [showReflection, setShowReflection] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState<UrgeIntensity | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [reflectionNote, setReflectionNote] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const startTime = useRef(Date.now());

  // Check if AI is available
  useEffect(() => {
    hasAIApiKey().then(setHasAI);
  }, []);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) {
      setIsComplete(true);
      triggerHaptic('success');
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Rotate messages (fallback and AI)
  useEffect(() => {
    const messageTimer = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change message
        if (hasAI && !aiMessage && !isLoadingAI) {
          fetchAIMessage();
        } else {
          setMessageIndex((prev) => (prev + 1) % GENTLE_MESSAGES.length);
          setAiMessage(null);
        }
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 12000);

    return () => clearInterval(messageTimer);
  }, [hasAI, aiMessage, isLoadingAI]);

  // Fetch AI message
  const fetchAIMessage = async () => {
    if (!hasAI || isLoadingAI) return;

    setIsLoadingAI(true);
    const recentTriggers = urgeCheckIns
      .slice(0, 5)
      .flatMap(c => c.triggers)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 3);

    const message = await getUrgeCoachMessage(stats, recentTriggers, secondsLeft);
    if (message) {
      setAiMessage(message);
    }
    setIsLoadingAI(false);
  };

  // Fetch first AI message after a few seconds
  useEffect(() => {
    if (hasAI && secondsLeft === URGE_TIMER_SECONDS - 5) {
      fetchAIMessage();
    }
  }, [hasAI, secondsLeft]);

  const getCommonTrigger = () => {
    if (logs.length < 3) return null;

    const emotionCounts: Record<string, number> = {};
    logs.forEach((log) => {
      log.emotions.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      return sorted[0][0].toLowerCase();
    }
    return null;
  };

  const commonTrigger = getCommonTrigger();
  const progress = secondsLeft / URGE_TIMER_SECONDS;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUrgePassed = () => {
    triggerHaptic('success');
    setShowReflection(true);
  };

  const handleReflectionComplete = () => {
    if (!hasTracked) {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      addUrgeEntry({
        surfed: true,
        duration,
        intensity: selectedIntensity || undefined,
        triggersPresent: selectedTriggers.length > 0 ? selectedTriggers : undefined,
        copingStrategies: selectedStrategies.length > 0 ? selectedStrategies : undefined,
        reflectionNote: reflectionNote.trim() || undefined,
      });
      setHasTracked(true);
      triggerHaptic('success');
    }
    router.back();
  };

  const handleSkipReflection = () => {
    if (!hasTracked) {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      addUrgeEntry({ surfed: true, duration });
      setHasTracked(true);
    }
    router.back();
  };

  const handleLogBinge = () => {
    if (!hasTracked) {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      addUrgeEntry({ surfed: false, duration });
      setHasTracked(true);
    }
    router.replace('/log');
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : prev.length < 3 ? [...prev, trigger] : prev
    );
    triggerHaptic('light');
  };

  const toggleStrategy = (strategy: string) => {
    setSelectedStrategies(prev =>
      prev.includes(strategy)
        ? prev.filter(s => s !== strategy)
        : prev.length < 3 ? [...prev, strategy] : prev
    );
    triggerHaptic('light');
  };

  const currentMessage = aiMessage || GENTLE_MESSAGES[messageIndex];

  // Get top triggers from user's history for the reflection
  const topTriggers = (() => {
    const allTriggers: string[] = [];
    logs.forEach(log => allTriggers.push(...log.emotions));
    urgeCheckIns.forEach(checkIn => allTriggers.push(...checkIn.triggers));

    const counts: Record<string, number> = {};
    allTriggers.forEach(t => counts[t] = (counts[t] || 0) + 1);

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([trigger]) => trigger);
  })();

  // Reflection View
  if (showReflection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkipReflection} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.textTertiary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Nice work!</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.reflectionScroll}
          contentContainerStyle={styles.reflectionContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Message */}
          <View style={styles.successBanner}>
            <View style={[styles.successIcon, { backgroundColor: theme.accentSoft }]}>
              <Feather name="award" size={32} color={theme.accent} />
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>
              You surfed the urge!
            </Text>
            <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
              Quick reflection to help track patterns
            </Text>
          </View>

          {/* Intensity */}
          <View style={styles.reflectionSection}>
            <Text style={[styles.reflectionLabel, { color: theme.text }]}>
              How strong was the urge?
            </Text>
            <View style={styles.intensityContainer}>
              {URGE_INTENSITY_LABELS.slice(1).map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.intensityButton,
                    { backgroundColor: selectedIntensity === item.value ? theme.primarySoft : theme.surface },
                    selectedIntensity === item.value && { borderColor: theme.primary, borderWidth: 2 },
                  ]}
                  onPress={() => {
                    setSelectedIntensity(item.value as UrgeIntensity);
                    triggerHaptic('light');
                  }}
                >
                  <Text style={[
                    styles.intensityLabel,
                    { color: selectedIntensity === item.value ? theme.primary : theme.textSecondary }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Triggers Present */}
          <View style={styles.reflectionSection}>
            <Text style={[styles.reflectionLabel, { color: theme.text }]}>
              What were you feeling?
            </Text>
            <Text style={[styles.reflectionHint, { color: theme.textTertiary }]}>
              Optional - select up to 3
            </Text>
            <View style={styles.chipContainer}>
              {topTriggers.map((trigger) => (
                <Chip
                  key={trigger}
                  label={trigger}
                  selected={selectedTriggers.includes(trigger)}
                  onPress={() => toggleTrigger(trigger)}
                  disabled={selectedTriggers.length >= 3 && !selectedTriggers.includes(trigger)}
                />
              ))}
            </View>
          </View>

          {/* Coping Strategies */}
          <View style={styles.reflectionSection}>
            <Text style={[styles.reflectionLabel, { color: theme.text }]}>
              What helped you get through it?
            </Text>
            <Text style={[styles.reflectionHint, { color: theme.textTertiary }]}>
              Optional - select up to 3
            </Text>
            <View style={styles.chipContainer}>
              {COPING_STRATEGIES.map((strategy) => (
                <Chip
                  key={strategy}
                  label={strategy}
                  selected={selectedStrategies.includes(strategy)}
                  onPress={() => toggleStrategy(strategy)}
                  disabled={selectedStrategies.length >= 3 && !selectedStrategies.includes(strategy)}
                />
              ))}
            </View>
          </View>

          {/* Note */}
          <View style={styles.reflectionSection}>
            <Text style={[styles.reflectionLabel, { color: theme.text }]}>
              Anything else?
            </Text>
            <Card style={styles.noteCard} padding="none">
              <TextInput
                style={[styles.noteInput, { color: theme.text }]}
                placeholder="Optional note..."
                placeholderTextColor={theme.textMuted}
                multiline
                maxLength={140}
                value={reflectionNote}
                onChangeText={setReflectionNote}
              />
            </Card>
          </View>
        </ScrollView>

        <View style={styles.reflectionActions}>
          <Button
            title="Save Reflection"
            onPress={handleReflectionComplete}
            variant="primary"
            size="lg"
            style={styles.primaryAction}
          />
          <TouchableOpacity onPress={handleSkipReflection} style={styles.secondaryAction}>
            <Text style={[styles.secondaryActionText, { color: theme.textTertiary }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Timer View
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Feather name="x" size={24} color={theme.textTertiary} />
        </TouchableOpacity>
        {hasAI && (
          <View style={[styles.aiBadge, { backgroundColor: theme.secondarySoft }]}>
            <Feather name="cpu" size={12} color={theme.secondary} />
            <Text style={[styles.aiBadgeText, { color: theme.secondary }]}>AI Coach</Text>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Card style={styles.timerCard}>
            <ProgressRing progress={progress} size={180} strokeWidth={10}>
              {!isComplete ? (
                <View style={styles.timerContent}>
                  <Text style={[styles.timerText, { color: theme.text }]}>
                    {formatTime(secondsLeft)}
                  </Text>
                  <Text style={[styles.timerLabel, { color: theme.textTertiary }]}>
                    remaining
                  </Text>
                </View>
              ) : (
                <View style={styles.timerContent}>
                  <View style={[styles.completeIcon, { backgroundColor: theme.accentSoft }]}>
                    <Feather name="check" size={28} color={theme.accent} />
                  </View>
                  <Text style={[styles.completeText, { color: theme.accent }]}>
                    Complete
                  </Text>
                </View>
              )}
            </ProgressRing>
          </Card>
        </Animated.View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Animated.View style={[styles.messageWrapper, { opacity: fadeAnim }]}>
            {isLoadingAI ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                {aiMessage && (
                  <View style={[styles.aiIndicator, { backgroundColor: theme.secondarySoft }]}>
                    <Feather name="star" size={12} color={theme.secondary} />
                  </View>
                )}
                <Text style={[styles.message, { color: theme.text }]}>
                  {currentMessage}
                </Text>
              </>
            )}
          </Animated.View>

          {commonTrigger && !aiMessage && (
            <Card style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Feather name="info" size={16} color={theme.secondary} />
                <Text style={[styles.insightLabel, { color: theme.textTertiary }]}>
                  Pattern insight
                </Text>
              </View>
              <Text style={[styles.insightText, { color: theme.textSecondary }]}>
                You often feel <Text style={{ color: theme.primary, fontWeight: FontWeight.medium }}>{commonTrigger}</Text> before urges.
                Notice if that's present right now.
              </Text>
            </Card>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Urge passed"
          onPress={handleUrgePassed}
          variant="secondary"
          size="lg"
          style={styles.primaryAction}
        />

        <TouchableOpacity onPress={handleLogBinge} style={styles.secondaryAction}>
          <Text style={[styles.secondaryActionText, { color: theme.textTertiary }]}>
            Log a binge instead
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  aiBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  timerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.light,
    letterSpacing: -1,
  },
  timerLabel: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    letterSpacing: 0.5,
  },
  completeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  completeText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
  },
  messageContainer: {
    marginTop: Spacing.xxxl,
    alignItems: 'center',
    width: '100%',
  },
  messageWrapper: {
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  aiIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 26,
    paddingHorizontal: Spacing.md,
  },
  insightCard: {
    width: '100%',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  insightLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  insightText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  actions: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxxl,
    alignItems: 'center',
  },
  primaryAction: {
    width: '100%',
  },
  secondaryAction: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  secondaryActionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  // Reflection styles
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  reflectionScroll: {
    flex: 1,
  },
  reflectionContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  successBanner: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    fontSize: FontSize.md,
  },
  reflectionSection: {
    marginBottom: Spacing.xl,
  },
  reflectionLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  reflectionHint: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  intensityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  intensityButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  intensityLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  noteCard: {
    marginTop: Spacing.xs,
  },
  noteInput: {
    padding: Spacing.lg,
    fontSize: FontSize.md,
    textAlignVertical: 'top',
    minHeight: 80,
    lineHeight: 22,
  },
  reflectionActions: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxxl,
    alignItems: 'center',
  },
});
