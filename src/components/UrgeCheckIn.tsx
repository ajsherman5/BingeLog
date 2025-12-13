import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { UrgeIntensity } from '../types';
import { URGE_INTENSITY_LABELS, URGE_TRIGGERS } from '../constants/data';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { Card } from './Card';
import { Button } from './Button';
import { Chip } from './Chip';

interface UrgeCheckInProps {
  onComplete?: () => void;
}

export function UrgeCheckIn({ onComplete }: UrgeCheckInProps) {
  const { theme } = useTheme();
  const { addUrgeCheckIn, triggerHaptic } = useApp();

  const [step, setStep] = useState<'intensity' | 'triggers' | 'note'>('intensity');
  const [selectedIntensity, setSelectedIntensity] = useState<UrgeIntensity | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const handleIntensitySelect = (intensity: UrgeIntensity) => {
    setSelectedIntensity(intensity);
    triggerHaptic('light');

    // If no urges, skip to completion
    if (intensity === 1) {
      addUrgeCheckIn(intensity, []);
      onComplete?.();
    } else {
      setTimeout(() => setStep('triggers'), 150);
    }
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
    triggerHaptic('light');
  };

  const handleSubmit = () => {
    if (selectedIntensity) {
      addUrgeCheckIn(selectedIntensity, selectedTriggers, note.trim() || undefined);
      onComplete?.();
    }
  };

  const handleSkipToSubmit = () => {
    if (selectedIntensity) {
      addUrgeCheckIn(selectedIntensity, selectedTriggers);
      onComplete?.();
    }
  };

  const getIntensityColor = (value: number) => {
    if (value <= 2) return theme.accent;
    if (value === 3) return theme.warning;
    return theme.error;
  };

  if (step === 'intensity') {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          How strong are your urges?
        </Text>
        <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
          Check in with how you're feeling right now
        </Text>

        <View style={styles.intensityContainer}>
          {URGE_INTENSITY_LABELS.map((item) => {
            const isSelected = selectedIntensity === item.value;
            const color = getIntensityColor(item.value);

            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.intensityButton,
                  {
                    backgroundColor: isSelected ? color : theme.surface,
                    borderColor: isSelected ? color : theme.border,
                  },
                ]}
                onPress={() => handleIntensitySelect(item.value as UrgeIntensity)}
              >
                <Feather
                  name={item.icon as any}
                  size={24}
                  color={isSelected ? '#FFFFFF' : color}
                />
                <Text
                  style={[
                    styles.intensityLabel,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.intensityDescription,
                    { color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textTertiary },
                  ]}
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  if (step === 'triggers') {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          What's triggering you?
        </Text>
        <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
          Select any that apply
        </Text>

        <ScrollView
          style={styles.triggerScroll}
          contentContainerStyle={styles.triggerContainer}
          showsVerticalScrollIndicator={false}
        >
          {URGE_TRIGGERS.map((trigger) => (
            <Chip
              key={trigger}
              label={trigger}
              selected={selectedTriggers.includes(trigger)}
              onPress={() => toggleTrigger(trigger)}
            />
          ))}
        </ScrollView>

        <View style={styles.buttonRow}>
          <Button
            title="Skip"
            onPress={() => setStep('note')}
            variant="ghost"
            size="md"
            style={{ flex: 1 }}
          />
          <Button
            title="Next"
            onPress={() => setStep('note')}
            variant="primary"
            size="md"
            style={{ flex: 2 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        Anything else to note?
      </Text>
      <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
        Optional: what else is going on?
      </Text>

      <Card style={styles.noteCard} padding="none">
        <TextInput
          style={[styles.noteInput, { color: theme.text }]}
          placeholder="What's happening right now?"
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={140}
          value={note}
          onChangeText={setNote}
        />
      </Card>

      <View style={styles.buttonRow}>
        <Button
          title="Skip"
          onPress={handleSkipToSubmit}
          variant="ghost"
          size="md"
          style={{ flex: 1 }}
        />
        <Button
          title="Save Check-in"
          onPress={handleSubmit}
          variant="primary"
          size="md"
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xl,
  },
  intensityContainer: {
    gap: Spacing.sm,
  },
  intensityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  intensityLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    flex: 0,
    minWidth: 100,
  },
  intensityDescription: {
    fontSize: FontSize.sm,
    flex: 1,
  },
  triggerScroll: {
    flex: 1,
  },
  triggerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  noteCard: {
    marginBottom: Spacing.lg,
  },
  noteInput: {
    padding: Spacing.lg,
    fontSize: FontSize.md,
    textAlignVertical: 'top',
    minHeight: 100,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
});
