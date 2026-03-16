import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';
import { colors, fonts, size, space, tracking } from '../../lib/tokens';

const OPTIONS = [
  'Quiet / Considered',
  'Dark / Charged',
  'Deconstructed',
  'Sharp / Tailored',
  'Soft / Draped',
  'Raw / Utility',
  'Editorial',
  'Avant-garde',
];

const MAX = 3;

export default function StylePreferenceScreen() {
  const { preferredStyles, setPreferredStyles } = useCalibrationStore();

  const toggle = (option: string) => {
    if (preferredStyles.includes(option)) {
      setPreferredStyles(preferredStyles.filter((s) => s !== option));
    } else if (preferredStyles.length < MAX) {
      setPreferredStyles([...preferredStyles, option]);
    }
  };

  const atMax = preferredStyles.length >= MAX;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111111', '#050505']} />
      <ProgressHeader currentStep={1} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question}>{"What pulls\nyou in?"}</Text>
        <Text style={styles.subtext}>The energy you're drawn to. Pick up to 3.</Text>

        <View style={styles.grid}>
          {OPTIONS.map((option) => {
            const selected = preferredStyles.includes(option);
            const dimmed = atMax && !selected;
            return (
              <Pressable
                key={option}
                onPress={() => toggle(option)}
                disabled={dimmed}
                style={[
                  styles.pill,
                  selected && styles.pillSelected,
                  dimmed && styles.pillDimmed,
                ]}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedButton
          title="Continue →"
          onPress={() => router.push('/(calibration)/brand-affinity')}
          disabled={preferredStyles.length === 0}
          variant={preferredStyles.length > 0 ? 'primary' : 'secondary'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    paddingHorizontal: space[7],
    paddingTop: space[4],
    paddingBottom: 120,
  },
  question: {
    fontFamily: fonts.display,
    fontSize: size.xxxl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
    lineHeight: 48,
  },
  subtext: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.tertiary,
    marginTop: space[3],
    marginBottom: space[8],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
  },
  pill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    paddingVertical: 14,
    paddingHorizontal: space[5],
  },
  pillSelected: {
    borderColor: colors.text.primary,
  },
  pillDimmed: {
    opacity: 0.3,
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: size.base,
    color: colors.text.tertiary,
  },
  pillTextSelected: {
    color: colors.text.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space[7],
    paddingBottom: 52,
    paddingTop: space[4],
    backgroundColor: colors.bg.primary,
  },
});
