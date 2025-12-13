import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useApp } from '../src/context/AppContext';
import { Card, Button, Chip } from '../src/components';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../src/constants/theme';
import { parseNaturalLanguageLog, hasAIApiKey } from '../src/services/ai';

export default function LogScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { addLog, selectedEmotions, selectedLocations, triggerHaptic } = useApp();

  const [selectedEmotionsList, setSelectedEmotionsList] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [note, setNote] = useState('');
  const [hasAI, setHasAI] = useState(false);
  const [naturalInput, setNaturalInput] = useState('');
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [aiParsed, setAiParsed] = useState(false);

  useEffect(() => {
    hasAIApiKey().then(setHasAI);
  }, []);

  const handleAIParse = async () => {
    if (!naturalInput.trim() || isParsingAI) return;

    setIsParsingAI(true);
    triggerHaptic('light');

    const parsed = await parseNaturalLanguageLog(
      naturalInput,
      selectedEmotions,
      selectedLocations
    );

    if (parsed) {
      setSelectedEmotionsList(parsed.emotions.filter(e => selectedEmotions.includes(e)));
      if (parsed.location && selectedLocations.includes(parsed.location)) {
        setSelectedLocation(parsed.location);
      }
      if (parsed.note) {
        setNote(parsed.note);
      }
      setAiParsed(true);
      triggerHaptic('success');
    }

    setIsParsingAI(false);
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotionsList((prev) => {
      if (prev.includes(emotion)) {
        return prev.filter((e) => e !== emotion);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, emotion];
    });
    triggerHaptic('light');
  };

  const selectLocation = (location: string) => {
    setSelectedLocation(location === selectedLocation ? '' : location);
    triggerHaptic('light');
  };

  const handleQuickLog = () => {
    addLog({
      timestamp: Date.now(),
      emotions: [],
      location: '',
      note: undefined,
    });
    triggerHaptic('success');
    router.back();
  };

  const handleSubmit = () => {
    addLog({
      timestamp: Date.now(),
      emotions: selectedEmotionsList,
      location: selectedLocation,
      note: note.trim() || undefined,
    });
    triggerHaptic('success');
    router.back();
  };

  const hasAnyInput = selectedEmotionsList.length > 0 || selectedLocation !== '' || note.trim() !== '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Feather name="x" size={24} color={theme.textTertiary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Log a Binge</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Log Option */}
          <TouchableOpacity onPress={handleQuickLog} activeOpacity={0.8}>
            <Card style={styles.quickLogCard}>
              <View style={styles.quickLogContent}>
                <View style={[styles.quickLogIcon, { backgroundColor: theme.primarySoft }]}>
                  <Feather name="zap" size={20} color={theme.primary} />
                </View>
                <View style={styles.quickLogText}>
                  <Text style={[styles.quickLogTitle, { color: theme.text }]}>
                    Quick Log
                  </Text>
                  <Text style={[styles.quickLogSubtitle, { color: theme.textTertiary }]}>
                    Just record the timestamp, add details later
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textMuted} />
              </View>
            </Card>
          </TouchableOpacity>

          {/* AI Natural Language Input */}
          {hasAI && (
            <>
              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textMuted }]}>or describe it</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              <Card style={styles.aiInputCard}>
                <View style={styles.aiInputHeader}>
                  <View style={[styles.aiIcon, { backgroundColor: theme.secondarySoft }]}>
                    <Feather name="cpu" size={16} color={theme.secondary} />
                  </View>
                  <Text style={[styles.aiInputLabel, { color: theme.textSecondary }]}>
                    AI will fill in the details
                  </Text>
                </View>
                <TextInput
                  style={[styles.aiInput, { color: theme.text, backgroundColor: theme.surface }]}
                  placeholder="e.g., Just binged after a stressful day at work, feeling really anxious..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  maxLength={200}
                  value={naturalInput}
                  onChangeText={(text) => {
                    setNaturalInput(text);
                    setAiParsed(false);
                  }}
                />
                <TouchableOpacity
                  style={[
                    styles.aiParseButton,
                    { backgroundColor: naturalInput.trim() ? theme.secondary : theme.borderLight }
                  ]}
                  onPress={handleAIParse}
                  disabled={!naturalInput.trim() || isParsingAI}
                  activeOpacity={0.8}
                >
                  {isParsingAI ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather name="star" size={16} color="#FFFFFF" />
                      <Text style={styles.aiParseButtonText}>
                        {aiParsed ? 'Parsed!' : 'Parse with AI'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Card>
            </>
          )}

          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>
              {hasAI ? 'or select manually' : 'or add details'}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Emotions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              How are you feeling?
            </Text>
            <Text style={[styles.sectionHint, { color: theme.textTertiary }]}>
              Optional - select up to 3
            </Text>
            <View style={styles.chipContainer}>
              {selectedEmotions.map((emotion) => (
                <Chip
                  key={emotion}
                  label={emotion}
                  selected={selectedEmotionsList.includes(emotion)}
                  onPress={() => toggleEmotion(emotion)}
                  disabled={selectedEmotionsList.length >= 3 && !selectedEmotionsList.includes(emotion)}
                />
              ))}
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Where are you?
            </Text>
            <Text style={[styles.sectionHint, { color: theme.textTertiary }]}>
              Optional - helps identify patterns
            </Text>
            <View style={styles.chipContainer}>
              {selectedLocations.map((location) => (
                <Chip
                  key={location}
                  label={location}
                  selected={selectedLocation === location}
                  onPress={() => selectLocation(location)}
                />
              ))}
            </View>
          </View>

          {/* Note Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Anything else?
            </Text>
            <Text style={[styles.sectionHint, { color: theme.textTertiary }]}>
              Optional - what triggered this?
            </Text>
            <Card style={styles.noteCard} padding="none">
              <TextInput
                style={[styles.noteInput, { color: theme.text }]}
                placeholder="Add a quick note..."
                placeholderTextColor={theme.textMuted}
                multiline
                maxLength={140}
                value={note}
                onChangeText={setNote}
              />
            </Card>
            <Text style={[styles.charCount, { color: theme.textMuted }]}>
              {note.length}/140
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title={hasAnyInput ? "Log with Details" : "Log Binge"}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  quickLogCard: {
    marginBottom: Spacing.lg,
  },
  quickLogContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickLogIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLogText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  quickLogTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  quickLogSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  aiInputCard: {
    marginBottom: Spacing.lg,
  },
  aiInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiInputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  aiInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  aiParseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    gap: Spacing.xs,
    alignSelf: 'flex-end',
  },
  aiParseButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: FontSize.sm,
    marginHorizontal: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
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
  charCount: {
    fontSize: FontSize.xs,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  footer: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
  },
  submitButton: {
    width: '100%',
  },
});
