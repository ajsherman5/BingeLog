import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTheme } from '../src/context/ThemeContext';
import { useApp } from '../src/context/AppContext';
import { Card, Button, Chip } from '../src/components';
import { EMOTIONS, LOCATIONS } from '../src/constants/data';
import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../src/constants/theme';
import { signInWithApple, signInWithGoogle, isAppleAuthAvailable } from '../src/services/auth';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Step =
  | 'intro'
  | 'problem'
  | 'solution'
  | 'features'
  | 'testimonial'
  | 'personalize_emotions'
  | 'personalize_locations'
  | 'auth'
  | 'paywall';

const STEPS: Step[] = [
  'intro',
  'problem',
  'solution',
  'features',
  'testimonial',
  'personalize_emotions',
  'personalize_locations',
  'auth',
  'paywall',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    setOnboarded,
    updateSelectedEmotions,
    updateSelectedLocations,
    selectedEmotions,
    selectedLocations,
    setUser,
    upgradeToPremium,
    isAuthenticated,
  } = useApp();

  const [step, setStep] = useState<Step>('intro');
  const [tempEmotions, setTempEmotions] = useState<string[]>(selectedEmotions);
  const [tempLocations, setTempLocations] = useState<string[]>(selectedLocations);
  const [isLoading, setIsLoading] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const checkmarkAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  // Check Apple auth availability
  useState(() => {
    isAppleAuthAvailable().then(setAppleAuthAvailable);
  });

  // Animate checkmarks when paywall is shown
  const animatePaywallEntry = () => {
    // Pulse animation for the button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered checkmark animations
    checkmarkAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 100,
        useNativeDriver: true,
      }).start();
    });
  };

  const currentStepIndex = STEPS.indexOf(step);

  const animateTransition = (nextStep: Step) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setStep(nextStep), 150);
  };

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

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithApple();
      if (user) {
        setUser(user);
        animateTransition('paywall');
      }
    } catch (error) {
      Alert.alert('Sign In Failed', 'There was a problem signing in with Apple. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setUser(user);
        animateTransition('paywall');
      }
    } catch (error) {
      Alert.alert('Sign In Failed', 'There was a problem signing in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrial = () => {
    updateSelectedEmotions(tempEmotions);
    updateSelectedLocations(tempLocations);
    // Start 3-day trial with premium access
    upgradeToPremium('apple'); // Will be replaced with actual purchase
    setOnboarded(true);
    router.replace('/');
  };

  const renderStepIndicator = () => {
    // Don't show step indicator on paywall
    if (step === 'paywall') return null;

    return (
      <View style={styles.stepIndicator}>
        {STEPS.slice(0, -1).map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepDot,
              {
                backgroundColor: index <= currentStepIndex ? theme.primary : theme.borderLight,
                width: index === currentStepIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderIntro = () => (
    <View style={styles.centerContent}>
      <View style={[styles.heroIconLarge, { backgroundColor: theme.primarySoft }]}>
        <Feather name="heart" size={48} color={theme.primary} />
      </View>
      <Text style={[styles.heroTitleLarge, { color: theme.text }]}>
        BingeLog
      </Text>
      <Text style={[styles.heroSubtitleLarge, { color: theme.textSecondary }]}>
        An essential tool for{'\n'}overcoming binge eating
      </Text>
      <View style={styles.heroTagline}>
        <View style={[styles.taglineBadge, { backgroundColor: theme.accentSoft }]}>
          <Feather name="check-circle" size={14} color={theme.accent} />
          <Text style={[styles.taglineText, { color: theme.accent }]}>
            Evidence-based approach
          </Text>
        </View>
      </View>
    </View>
  );

  const renderProblem = () => (
    <View style={styles.centerContent}>
      <View style={[styles.heroIcon, { backgroundColor: theme.errorSoft }]}>
        <Feather name="cloud" size={32} color={theme.error} />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Breaking the cycle{'\n'}starts with awareness
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
        Most people who struggle with binge eating don't understand their patterns.
      </Text>

      <Card style={styles.problemCard}>
        <View style={styles.problemItem}>
          <Feather name="help-circle" size={20} color={theme.textTertiary} />
          <Text style={[styles.problemText, { color: theme.text }]}>
            "Why do I keep doing this?"
          </Text>
        </View>
        <View style={styles.problemItem}>
          <Feather name="help-circle" size={20} color={theme.textTertiary} />
          <Text style={[styles.problemText, { color: theme.text }]}>
            "What triggers my urges?"
          </Text>
        </View>
        <View style={styles.problemItem}>
          <Feather name="help-circle" size={20} color={theme.textTertiary} />
          <Text style={[styles.problemText, { color: theme.text }]}>
            "How do I break this pattern?"
          </Text>
        </View>
      </Card>
    </View>
  );

  const renderSolution = () => (
    <View style={styles.centerContent}>
      <View style={[styles.heroIcon, { backgroundColor: theme.accentSoft }]}>
        <Feather name="trending-up" size={32} color={theme.accent} />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Discover your patterns.{'\n'}Take back control.
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
        BingeLog helps you identify triggers, track progress, and build healthier habits through self-compassion.
      </Text>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>73%</Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>
            report fewer urges after 2 weeks
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statNumber, { color: theme.accent }]}>90s</Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>
            urge timer based on research
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.centerContent}>
      <Text style={[styles.sectionTitleTop, { color: theme.text }]}>
        Everything you need
      </Text>

      <Card style={styles.featureCard}>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.primarySoft }]}>
            <Feather name="bar-chart-2" size={20} color={theme.primary} />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              Pattern Insights
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textTertiary }]}>
              Discover what triggers your urges and when you're most vulnerable
            </Text>
          </View>
        </View>

        <View style={[styles.featureDivider, { backgroundColor: theme.divider }]} />

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.secondarySoft }]}>
            <Feather name="clock" size={20} color={theme.secondary} />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              90-Second Urge Timer
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textTertiary }]}>
              Ride the wave with guided breathing exercises
            </Text>
          </View>
        </View>

        <View style={[styles.featureDivider, { backgroundColor: theme.divider }]} />

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.accentSoft }]}>
            <Feather name="zap" size={20} color={theme.accent} />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              Streak Tracking
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textTertiary }]}>
              Celebrate your progress with milestones and achievements
            </Text>
          </View>
        </View>

        <View style={[styles.featureDivider, { backgroundColor: theme.divider }]} />

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: theme.primarySoft }]}>
            <Feather name="shield" size={20} color={theme.primary} />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              100% Private
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textTertiary }]}>
              Your data stays on your device. No cloud. No tracking.
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderTestimonial = () => (
    <View style={styles.centerContent}>
      <View style={[styles.heroIcon, { backgroundColor: theme.secondarySoft }]}>
        <Feather name="message-circle" size={32} color={theme.secondary} />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        You're not alone
      </Text>

      <Card style={styles.testimonialCard}>
        <View style={styles.quoteIcon}>
          <Feather name="message-square" size={24} color={theme.primary} />
        </View>
        <Text style={[styles.testimonialText, { color: theme.text }]}>
          "For the first time, I actually understand WHY I binge. The pattern insights showed me that stress at work was my biggest trigger. Now I can prepare for it."
        </Text>
        <View style={styles.testimonialAuthor}>
          <View style={[styles.authorAvatar, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.authorInitial, { color: theme.primary }]}>S</Text>
          </View>
          <View>
            <Text style={[styles.authorName, { color: theme.text }]}>Sarah</Text>
            <Text style={[styles.authorMeta, { color: theme.textTertiary }]}>
              Using BingeLog for 3 months
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.trustBadges}>
        <View style={[styles.trustBadge, { backgroundColor: theme.surface }]}>
          <Feather name="lock" size={14} color={theme.textTertiary} />
          <Text style={[styles.trustText, { color: theme.textTertiary }]}>Secure</Text>
        </View>
        <View style={[styles.trustBadge, { backgroundColor: theme.surface }]}>
          <Feather name="heart" size={14} color={theme.textTertiary} />
          <Text style={[styles.trustText, { color: theme.textTertiary }]}>Compassionate</Text>
        </View>
        <View style={[styles.trustBadge, { backgroundColor: theme.surface }]}>
          <Feather name="book-open" size={14} color={theme.textTertiary} />
          <Text style={[styles.trustText, { color: theme.textTertiary }]}>Evidence-based</Text>
        </View>
      </View>
    </View>
  );

  const renderPersonalizeEmotions = () => (
    <View style={styles.selectionContent}>
      <Text style={[styles.selectionTitle, { color: theme.text }]}>
        Let's personalize your experience
      </Text>
      <Text style={[styles.selectionSubtitle, { color: theme.textTertiary }]}>
        What emotions do you often experience before a binge?
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

  const renderPersonalizeLocations = () => (
    <View style={styles.selectionContent}>
      <Text style={[styles.selectionTitle, { color: theme.text }]}>
        Almost there!
      </Text>
      <Text style={[styles.selectionSubtitle, { color: theme.textTertiary }]}>
        Where do urges usually happen for you?
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

  const renderAuth = () => (
    <View style={styles.centerContent}>
      <View style={[styles.heroIcon, { backgroundColor: theme.primarySoft }]}>
        <Feather name="user" size={32} color={theme.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Create your account
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
        Sign in to save your progress and sync across devices
      </Text>

      <View style={styles.authButtons}>
        {Platform.OS === 'ios' && appleAuthAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={BorderRadius.md}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={[styles.googleButtonText, { color: theme.text }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.termsText, { color: theme.textTertiary }]}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );

  const paywallFeatures = [
    {
      title: 'Unlimited pattern insights',
      description: 'See all your triggers, times, and locations without limits',
      icon: 'bar-chart-2'
    },
    {
      title: 'Advanced charts & analytics',
      description: 'Weekly trends, emotion breakdowns, and time heatmaps',
      icon: 'pie-chart'
    },
    {
      title: 'Predictive alerts',
      description: 'Get warned before high-risk moments based on your patterns',
      icon: 'bell'
    },
    {
      title: 'All self-care journeys',
      description: 'Access every guided program for mindfulness and coping',
      icon: 'heart'
    },
    {
      title: 'Priority support',
      description: 'Get help when you need it most',
      icon: 'message-circle'
    },
  ];

  const renderPaywall = () => {
    const yearlyPerMonth = (24.99 / 12).toFixed(2);

    return (
      <SafeAreaView style={[styles.paywallContainer, { backgroundColor: theme.background }]}>
        {/* Header with logo */}
        <View style={styles.paywallLogoRow}>
          <View style={[styles.paywallLogo, { backgroundColor: theme.primarySoft }]}>
            <Feather name="heart" size={18} color={theme.primary} />
          </View>
          <Text style={[styles.paywallLogoText, { color: theme.primary }]}>BingeLog</Text>
        </View>

        {/* Title Section */}
        <Text style={[styles.paywallTitle, { color: theme.text }]}>
          Unlock full access
        </Text>
        <Text style={[styles.paywallSubtitle, { color: theme.textSecondary }]}>
          Track patterns and overcome binge eating
        </Text>

        {/* Pro Features */}
        <View style={styles.proFeaturesList}>
          {[
            { icon: 'bar-chart-2', text: 'Unlimited pattern insights' },
            { icon: 'pie-chart', text: 'Advanced charts & analytics' },
            { icon: 'bell', text: 'Predictive alerts' },
            { icon: 'compass', text: 'All self-care journeys' },
            { icon: 'zap', text: 'Priority support' },
          ].map((feature, index) => (
            <View key={index} style={styles.proFeatureRow}>
              <View style={[styles.proFeatureIcon, { backgroundColor: theme.accentSoft }]}>
                <Feather name={feature.icon as any} size={20} color={theme.accent} />
              </View>
              <Text style={[styles.proFeatureText, { color: theme.text }]}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Social Proof */}
        <View style={[styles.socialProofSection, { backgroundColor: theme.surface }]}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Feather key={star} name="star" size={14} color="#FFB800" />
            ))}
          </View>
          <Text style={[styles.socialProofQuote, { color: theme.text }]}>
            "This app helped me understand my triggers. I've been binge-free for 3 weeks!"
          </Text>
          <Text style={[styles.socialProofAuthor, { color: theme.textTertiary }]}>
            — Sarah M.
          </Text>
        </View>

        {/* Plan Selection */}
        <View style={styles.plansList}>
          {/* Annual Plan */}
          <TouchableOpacity
            style={[
              styles.planRow,
              {
                backgroundColor: theme.surface,
                borderColor: selectedPlan === 'yearly' ? theme.accent : theme.border,
                borderWidth: selectedPlan === 'yearly' ? 2 : 1,
              }
            ]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.radioOuter,
              { borderColor: selectedPlan === 'yearly' ? theme.accent : theme.border }
            ]}>
              {selectedPlan === 'yearly' && (
                <View style={[styles.radioInner, { backgroundColor: theme.accent }]}>
                  <Feather name="check" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.planDetails}>
              <View style={styles.planNameRow}>
                <Text style={[styles.planName, { color: theme.text }]}>Annual</Text>
                <View style={[styles.discountBadge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.discountBadgeText}>BEST VALUE</Text>
                </View>
              </View>
              <Text style={[styles.planMeta, { color: theme.textTertiary }]}>
                3-day free trial • then $24.99/year
              </Text>
            </View>
            <Text style={[styles.planPriceRight, { color: theme.text }]}>
              ${yearlyPerMonth}/mo
            </Text>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.planRow,
              {
                backgroundColor: theme.surface,
                borderColor: selectedPlan === 'monthly' ? theme.accent : theme.border,
                borderWidth: selectedPlan === 'monthly' ? 2 : 1,
              }
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.radioOuter,
              { borderColor: selectedPlan === 'monthly' ? theme.accent : theme.border }
            ]}>
              {selectedPlan === 'monthly' && (
                <View style={[styles.radioInner, { backgroundColor: theme.accent }]}>
                  <Feather name="check" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.planDetails}>
              <Text style={[styles.planName, { color: theme.text }]}>Monthly</Text>
              <Text style={[styles.planMeta, { color: theme.textTertiary }]}>
                Billed monthly at $6.99
              </Text>
            </View>
            <Text style={[styles.planPriceRight, { color: theme.text }]}>
              $6.99/mo
            </Text>
          </TouchableOpacity>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: theme.accent }]}
          onPress={handleStartTrial}
          activeOpacity={0.9}
        >
          <Text style={styles.continueButtonText}>
            {selectedPlan === 'yearly' ? 'Start now for $0.00' : 'Start now'}
          </Text>
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity style={styles.restoreLink}>
          <Text style={[styles.restoreLinkText, { color: theme.textTertiary }]}>
            Restore purchases
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  };

  const getNextAction = () => {
    switch (step) {
      case 'intro':
        return () => animateTransition('problem');
      case 'problem':
        return () => animateTransition('solution');
      case 'solution':
        return () => animateTransition('features');
      case 'features':
        return () => animateTransition('testimonial');
      case 'testimonial':
        return () => animateTransition('personalize_emotions');
      case 'personalize_emotions':
        return () => animateTransition('personalize_locations');
      case 'personalize_locations':
        return () => animateTransition('auth');
      case 'auth':
        return () => {}; // Auth buttons handle this
      case 'paywall':
        return handleStartTrial;
    }
  };

  const getButtonTitle = () => {
    switch (step) {
      case 'intro':
        return 'Get Started';
      case 'problem':
      case 'solution':
      case 'features':
      case 'testimonial':
        return 'Continue';
      case 'personalize_emotions':
      case 'personalize_locations':
        return 'Next';
      case 'auth':
        return ''; // No button on auth screen
      case 'paywall':
        return 'Start Free Trial';
    }
  };

  const isButtonDisabled = () => {
    if (step === 'personalize_emotions') return tempEmotions.length === 0;
    if (step === 'personalize_locations') return tempLocations.length === 0;
    return false;
  };

  const showFooter = step !== 'auth' && step !== 'paywall';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {renderStepIndicator()}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step === 'intro' && renderIntro()}
        {step === 'problem' && renderProblem()}
        {step === 'solution' && renderSolution()}
        {step === 'features' && renderFeatures()}
        {step === 'testimonial' && renderTestimonial()}
        {step === 'personalize_emotions' && renderPersonalizeEmotions()}
        {step === 'personalize_locations' && renderPersonalizeLocations()}
        {step === 'auth' && renderAuth()}
        {step === 'paywall' && renderPaywall()}
      </Animated.View>

      {showFooter && (
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
      )}
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

  // Hero styles
  heroIconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  heroTitleLarge: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -1,
  },
  heroSubtitleLarge: {
    fontSize: FontSize.xl,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 28,
  },
  heroTagline: {
    marginTop: Spacing.lg,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  taglineText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  // Section styles
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  sectionTitleTop: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },

  // Problem card
  problemCard: {
    width: '100%',
    gap: Spacing.lg,
  },
  problemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  problemText: {
    fontSize: FontSize.md,
    fontStyle: 'italic',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  statBox: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statNumber: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
  },
  statLabel: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  // Feature card
  featureCard: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  featureDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  featureDescription: {
    fontSize: FontSize.sm,
    marginTop: 2,
    lineHeight: 18,
  },

  // Testimonial
  testimonialCard: {
    width: '100%',
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: Spacing.md,
  },
  testimonialText: {
    fontSize: FontSize.md,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Spacing.xl,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  authorName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  authorMeta: {
    fontSize: FontSize.sm,
  },
  trustBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xxxl,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  trustText: {
    fontSize: FontSize.xs,
  },

  // Selection screens
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

  // Auth screen
  authButtons: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  appleButton: {
    width: '100%',
    height: 52,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  googleButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  termsText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },

  // Paywall
  paywallContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  paywallLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  paywallLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paywallLogoText: {
    fontSize: 18,
    fontWeight: FontWeight.semibold,
  },
  paywallTitle: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  paywallSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 6,
  },
  proFeaturesList: {
    marginTop: 20,
    gap: 12,
  },
  proFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  proFeatureIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proFeatureText: {
    fontSize: 17,
    flex: 1,
  },
  socialProofSection: {
    marginTop: 16,
    padding: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  socialProofQuote: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  socialProofAuthor: {
    fontSize: 13,
    marginTop: 4,
  },
  plansList: {
    marginTop: 16,
    gap: 10,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.lg,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planDetails: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  planName: {
    fontSize: 17,
    fontWeight: FontWeight.semibold,
  },
  planMeta: {
    fontSize: 14,
    marginTop: 2,
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: FontWeight.bold,
  },
  planPriceRight: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
  },
  continueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: BorderRadius.lg,
    marginTop: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: FontWeight.semibold,
  },
  restoreLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  restoreLinkText: {
    fontSize: 14,
  },

  // Footer
  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxxl,
  },
});
