import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/context/ThemeContext';
import { useApp } from '../../src/context/AppContext';
import { Card, Chip } from '../../src/components';
import { EMOTIONS, LOCATIONS } from '../../src/constants/data';
import { ThemeMode } from '../../src/types';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/theme';
import { enableAllNotifications, disableAllNotifications, schedulePredictiveNotifications } from '../../src/utils/notifications';
import { setAIApiKey, getAIApiKey, hasAIApiKey } from '../../src/services/ai';

type SettingsView = 'main' | 'theme' | 'emotions' | 'locations' | 'ai';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();
  const {
    selectedEmotions,
    selectedLocations,
    updateSelectedEmotions,
    updateSelectedLocations,
    logs,
    stats,
    notificationsEnabled,
    setNotificationsEnabled,
    triggerHaptic,
  } = useApp();

  const [view, setView] = useState<SettingsView>('main');
  const [tempEmotions, setTempEmotions] = useState<string[]>(selectedEmotions);
  const [tempLocations, setTempLocations] = useState<string[]>(selectedLocations);
  const [hasAI, setHasAI] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    const hasKey = await hasAIApiKey();
    setHasAI(hasKey);
    if (hasKey) {
      const key = await getAIApiKey();
      if (key) setApiKey(key);
    }
  };

  const handleSaveApiKey = async () => {
    if (apiKey.trim()) {
      await setAIApiKey(apiKey.trim());
      setHasAI(true);
      triggerHaptic('success');
      // Schedule predictive notifications with AI
      if (logs.length >= 5) {
        await schedulePredictiveNotifications(logs);
      }
      setView('main');
    }
  };

  const handleRemoveApiKey = async () => {
    Alert.alert(
      'Remove API Key',
      'This will disable AI features. You can add it back anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await setAIApiKey('');
            setApiKey('');
            setHasAI(false);
            triggerHaptic('light');
          },
        },
      ]
    );
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

  const saveEmotions = () => {
    updateSelectedEmotions(tempEmotions);
    setView('main');
  };

  const saveLocations = () => {
    updateSelectedLocations(tempLocations);
    setView('main');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your logs and reset the app. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    triggerHaptic('light');
    if (value) {
      await enableAllNotifications();
      setNotificationsEnabled(true);
    } else {
      await disableAllNotifications();
      setNotificationsEnabled(false);
    }
  };

  const themeModes: { value: ThemeMode; label: string; description: string }[] = [
    { value: 'system', label: 'System', description: 'Match device settings' },
    { value: 'light', label: 'Light', description: 'Always light mode' },
    { value: 'dark', label: 'Dark', description: 'Always dark mode' },
  ];

  if (view === 'theme') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setView('main')} style={styles.headerButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: theme.text }]}>Appearance</Text>
          <View style={styles.headerButton} />
        </View>
        <ScrollView style={styles.content}>
          {themeModes.map((mode) => (
            <TouchableOpacity
              key={mode.value}
              onPress={() => {
                setThemeMode(mode.value);
                setView('main');
              }}
            >
              <Card style={[styles.optionCard, { marginBottom: Spacing.sm }]}>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: theme.text }]}>
                    {mode.label}
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textTertiary }]}>
                    {mode.description}
                  </Text>
                </View>
                {themeMode === mode.value && (
                  <Feather name="check" size={20} color={theme.primary} />
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === 'emotions') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setView('main')} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.textTertiary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: theme.text }]}>Emotions</Text>
          <TouchableOpacity onPress={saveEmotions} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <Text style={[styles.sectionHint, { color: theme.textTertiary }]}>
            Select emotions to show in quick log
          </Text>
          <View style={styles.chipGrid}>
            {EMOTIONS.map((emotion) => (
              <Chip
                key={emotion}
                label={emotion}
                selected={tempEmotions.includes(emotion)}
                onPress={() => toggleEmotion(emotion)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === 'locations') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setView('main')} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.textTertiary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: theme.text }]}>Locations</Text>
          <TouchableOpacity onPress={saveLocations} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <Text style={[styles.sectionHint, { color: theme.textTertiary }]}>
            Select locations to show in quick log
          </Text>
          <View style={styles.chipGrid}>
            {LOCATIONS.map((location) => (
              <Chip
                key={location}
                label={location}
                selected={tempLocations.includes(location)}
                onPress={() => toggleLocation(location)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === 'ai') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setView('main')} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.textTertiary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.subTitle, { color: theme.text }]}>AI Features</Text>
          <TouchableOpacity onPress={handleSaveApiKey} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: apiKey.trim() ? theme.primary : theme.textMuted }]}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Card style={styles.aiInfoCard}>
            <View style={[styles.aiInfoIcon, { backgroundColor: theme.secondarySoft }]}>
              <Feather name="cpu" size={24} color={theme.secondary} />
            </View>
            <Text style={[styles.aiInfoTitle, { color: theme.text }]}>
              Unlock AI Features
            </Text>
            <Text style={[styles.aiInfoDescription, { color: theme.textSecondary }]}>
              Add your Claude API key to enable personalized coaching, natural language logging, and smart pattern insights.
            </Text>
          </Card>

          <Text style={[styles.sectionTitle, { color: theme.textTertiary, marginTop: Spacing.xl }]}>
            API KEY
          </Text>
          <Card style={styles.apiKeyCard}>
            <View style={styles.apiKeyInputRow}>
              <TextInput
                style={[styles.apiKeyInput, { color: theme.text }]}
                placeholder="sk-ant-..."
                placeholderTextColor={theme.textMuted}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowApiKey(!showApiKey)}
                style={styles.apiKeyToggle}
              >
                <Feather
                  name={showApiKey ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </Card>

          <Text style={[styles.apiKeyHint, { color: theme.textTertiary }]}>
            Get your API key from console.anthropic.com{'\n'}
            Your key is stored locally on your device.
          </Text>

          {hasAI && (
            <TouchableOpacity onPress={handleRemoveApiKey} style={styles.removeKeyButton}>
              <Text style={[styles.removeKeyText, { color: theme.error }]}>
                Remove API Key
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.primarySoft }]}>
                <Feather name="edit-3" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalBinges}</Text>
              <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Binges</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.secondarySoft }]}>
                <Feather name="shield" size={16} color={theme.secondary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.urgesSurfed}</Text>
              <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Resisted</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.accentSoft }]}>
                <Feather name="zap" size={16} color={theme.accent} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.longestStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Best Streak</Text>
            </View>
          </View>
        </Card>

        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>APPEARANCE</Text>
        <TouchableOpacity onPress={() => setView('theme')}>
          <Card style={styles.menuCard}>
            <Text style={[styles.menuLabel, { color: theme.text }]}>Theme</Text>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: theme.textTertiary }]}>
                {themeModes.find((t) => t.value === themeMode)?.label}
              </Text>
              <Feather name="chevron-right" size={18} color={theme.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Quick Log Section */}
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>QUICK LOG</Text>
        <TouchableOpacity onPress={() => setView('emotions')}>
          <Card style={[styles.menuCard, styles.menuCardTop]}>
            <Text style={[styles.menuLabel, { color: theme.text }]}>Emotions</Text>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: theme.textTertiary }]}>
                {selectedEmotions.length} selected
              </Text>
              <Feather name="chevron-right" size={18} color={theme.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>
        <View style={[styles.menuDivider, { backgroundColor: theme.divider }]} />
        <TouchableOpacity onPress={() => setView('locations')}>
          <Card style={[styles.menuCard, styles.menuCardBottom]}>
            <Text style={[styles.menuLabel, { color: theme.text }]}>Locations</Text>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: theme.textTertiary }]}>
                {selectedLocations.length} selected
              </Text>
              <Feather name="chevron-right" size={18} color={theme.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Notifications Section */}
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>NOTIFICATIONS</Text>
        <Card style={styles.menuCard}>
          <View style={styles.notificationRow}>
            <View style={styles.notificationText}>
              <Text style={[styles.menuLabel, { color: theme.text }]}>Daily Reminders</Text>
              <Text style={[styles.notificationHint, { color: theme.textTertiary }]}>
                Morning and evening check-ins
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: theme.borderLight, true: theme.primaryLight }}
              thumbColor={notificationsEnabled ? theme.primary : theme.surface}
            />
          </View>
        </Card>

        {/* AI Section */}
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>AI FEATURES</Text>
        <TouchableOpacity onPress={() => setView('ai')}>
          <Card style={styles.menuCard}>
            <View style={styles.aiMenuContent}>
              <View style={[styles.aiMenuIcon, { backgroundColor: theme.secondarySoft }]}>
                <Feather name="cpu" size={16} color={theme.secondary} />
              </View>
              <View style={styles.aiMenuText}>
                <Text style={[styles.menuLabel, { color: theme.text }]}>
                  {hasAI ? 'AI Enabled' : 'Enable AI'}
                </Text>
                <Text style={[styles.notificationHint, { color: theme.textTertiary }]}>
                  {hasAI ? 'Coaching, insights & more' : 'Add your API key'}
                </Text>
              </View>
              {hasAI ? (
                <View style={[styles.aiStatusBadge, { backgroundColor: theme.accentSoft }]}>
                  <Feather name="check" size={12} color={theme.accent} />
                </View>
              ) : (
                <Feather name="chevron-right" size={18} color={theme.textMuted} />
              )}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Data Section */}
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>DATA</Text>
        <TouchableOpacity onPress={handleClearData}>
          <Card style={styles.menuCard}>
            <Text style={[styles.menuLabel, { color: theme.error }]}>Clear All Data</Text>
          </Card>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Binge Log v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Your data stays on your device
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 140,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xxl,
    letterSpacing: -0.5,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  subTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  headerButton: {
    width: 60,
  },
  headerButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  statsCard: {
    marginBottom: Spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 50,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.light,
  },
  statLabel: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    letterSpacing: 0.3,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationHint: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    marginLeft: Spacing.sm,
  },
  sectionHint: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xl,
  },
  menuCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuCardTop: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  menuCardBottom: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  menuDivider: {
    height: 1,
    marginLeft: Spacing.xl,
  },
  menuLabel: {
    fontSize: FontSize.md,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  menuValue: {
    fontSize: FontSize.md,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  optionDescription: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xxxxl,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: FontSize.sm,
  },
  aiMenuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiMenuText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  aiStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiInfoCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  aiInfoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  aiInfoTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  aiInfoDescription: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  apiKeyCard: {
    padding: 0,
  },
  apiKeyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiKeyInput: {
    flex: 1,
    padding: Spacing.lg,
    fontSize: FontSize.md,
  },
  apiKeyToggle: {
    padding: Spacing.lg,
  },
  apiKeyHint: {
    fontSize: FontSize.xs,
    marginTop: Spacing.md,
    lineHeight: 18,
    textAlign: 'center',
  },
  removeKeyButton: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    padding: Spacing.md,
  },
  removeKeyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
});
