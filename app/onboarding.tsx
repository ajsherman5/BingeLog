import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useApp } from '../src/context/AppContext';
import { Card, Button, Chip } from '../src/components';
import { EMOTIONS, LOCATIONS } from '../src/constants/data';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../src/constants/theme';

type Step = 'welcome' | 'privacy' | 'emotions' | 'locations';

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { setOnboarded, updateSelectedEmotions, updateSelectedLocations, selectedEmotions, selectedLocations } = useApp();

  const [step, setStep] = useState<Step>('welcome');
  const [tempEmotions, setTempEmotions] = useState<string[]>(selectedEmotions);
  const [tempLocations, setTempLocations] = useState<string[]>(selectedLocations);

  const toggleEmotion = (emotion: string) => {
    setTempEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const toggleLocation = (location: string) => {
    setTempLocations((prev) =>
      prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]
    );
  };

  const handleComplete = () => {
    updateSelectedEmotions(tempEmotions);
    updateSelectedLocations(tempLocations);
    setOnboarded(true);
    router.replace('/');
  };

  const renderStepIndicator = () => {
    const steps: Step[] = ['welcome', 'privacy', 'emotions', 'locations'];
    const currentIndex = steps.indexOf(step);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepDot,
              {
                backgroundColor: index <= currentIndex ? theme.primary : theme.borderLight,
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderWelcome = () => (
    <View style={styles.centerContent}>
      <View style={[styles.heroIcon, { backgroundColor: theme.primarySoft }]}>
        <Feather name="heart" size={32} color={theme.primary} />
      </View>
      <Text style={[styles.heroTitle, { color: theme.text }]}>
        Binge Log
      </Text>
      <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
        Track patterns, not perfection
      </Text>

      <Card style={styles.featureCard}>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.primarySoft }]}>
            <Feather name="bar-chart-2" size={18} color={theme.primary} />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              Pattern Insights
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textTertiary }]}>
              Discover what triggers urges
            </Text>
          </View>
        </View>
        <View style={[styles.featureDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.accentSoft }]}>
            <Feather name="zap" size={18} color={theme.accent} />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              Streak Tracking
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textTertiary }]}>
              Celebrate your progress
            </Text>
          </View>
        </View>
        <View style={[styles.featureDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.secondarySoft }]}>
            <Feather name="clock" size={18} color={theme.secondary} />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              Urge Timer
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textTertiary }]}>
              Ride the wave mindfully
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderPrivacy = () => (
    <View style={styles.centerContent}>
      <View style={[styles.heroIcon, { backgroundColor: theme.accentSoft }]}>
        <Feather name="shield" size={32} color={theme.accent} />
      </View>
      <Text style={[styles.heroTitle, { color: theme.text }]}>
        Private & Secure
      </Text>
      <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
        Your data stays on your device
      </Text>

      <Card style={styles.privacyCard}>
        <View style={styles.privacyItem}>
          <Feather name="check" size={18} color={theme.accent} />
          <Text style={[styles.privacyText, { color: theme.text }]}>
            No account required
          </Text>
        </View>
        <View style={styles.privacyItem}>
          <Feather name="check" size={18} color={theme.accent} />
          <Text style={[styles.privacyText, { color: theme.text }]}>
            No cloud sync
          </Text>
        </View>
        <View style={styles.privacyItem}>
          <Feather name="check" size={18} color={theme.accent} />
          <Text style={[styles.privacyText, { color: theme.text }]}>
            No tracking or analytics
          </Text>
        </View>
        <View style={styles.privacyItem}>
          <Feather name="check" size={18} color={theme.accent} />
          <Text style={[styles.privacyText, { color: theme.text }]}>
            Your journey is yours alone
          </Text>
        </View>
      </Card>
    </View>
  );

  const renderEmotions = () => (
    <View style={styles.selectionContent}>
      <Text style={[styles.selectionTitle, { color: theme.text }]}>
        What emotions do you experience?
      </Text>
      <Text style={[styles.selectionSubtitle, { color: theme.textTertiary }]}>
        Select the ones that resonate with you
      </Text>

      <ScrollView
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContainer}
        showsVerticalScrollIndicator={false}
      >
        {EMOTIONS.map((emotion) => (
          <Chip
            key={emotion}
            label={emotion}
            selected={tempEmotions.includes(emotion)}
            onPress={() => toggleEmotion(emotion)}
          />
        ))}
      </ScrollView>

      <Text style={[styles.selectedCount, { color: theme.textTertiary }]}>
        {tempEmotions.length} selected
      </Text>
    </View>
  );

  const renderLocations = () => (
    <View style={styles.selectionContent}>
      <Text style={[styles.selectionTitle, { color: theme.text }]}>
        Where do urges usually happen?
      </Text>
      <Text style={[styles.selectionSubtitle, { color: theme.textTertiary }]}>
        Select common locations
      </Text>

      <ScrollView
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContainer}
        showsVerticalScrollIndicator={false}
      >
        {LOCATIONS.map((location) => (
          <Chip
            key={location}
            label={location}
            selected={tempLocations.includes(location)}
            onPress={() => toggleLocation(location)}
          />
        ))}
      </ScrollView>

      <Text style={[styles.selectedCount, { color: theme.textTertiary }]}>
        {tempLocations.length} selected
      </Text>
    </View>
  );

  const getNextAction = () => {
    switch (step) {
      case 'welcome':
        return () => setStep('privacy');
      case 'privacy':
        return () => setStep('emotions');
      case 'emotions':
        return () => setStep('locations');
      case 'locations':
        return handleComplete;
    }
  };

  const getButtonTitle = () => {
    switch (step) {
      case 'welcome':
        return 'Get Started';
      case 'privacy':
        return 'Continue';
      case 'emotions':
        return 'Next';
      case 'locations':
        return 'Start My Journey';
    }
  };

  const isButtonDisabled = () => {
    if (step === 'emotions') return tempEmotions.length === 0;
    if (step === 'locations') return tempLocations.length === 0;
    return false;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {renderStepIndicator()}

      <View style={styles.content}>
        {step === 'welcome' && renderWelcome()}
        {step === 'privacy' && renderPrivacy()}
        {step === 'emotions' && renderEmotions()}
        {step === 'locations' && renderLocations()}
      </View>

      <View style={styles.footer}>
        <Button
          title={getButtonTitle()}
          onPress={getNextAction()}
          variant="primary"
          size="lg"
          disabled={isButtonDisabled()}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionContent: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  heroTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: FontSize.lg,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  featureCard: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  featureDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  featureDescription: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  privacyCard: {
    width: '100%',
    gap: Spacing.lg,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  privacyText: {
    fontSize: FontSize.md,
  },
  selectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  selectionSubtitle: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xxl,
  },
  chipScroll: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  selectedCount: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxxl,
  },
  continueButton: {
    width: '100%',
  },
});
