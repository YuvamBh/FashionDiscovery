import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';
import { getCurrentUser } from '../../lib/auth';
import { updateCalibration } from '../../lib/users';
import { colors, fonts, size, space, tracking } from '../../lib/tokens';

export default function VisualVibeScreen() {
  const { styleAspiration, setStyleAspiration, preferredStyles, brandAffinity } = useCalibrationStore();
  const [value, setValue] = useState(styleAspiration ?? '');
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    if (!value.trim()) return;
    const vibe = value.trim();
    setStyleAspiration(vibe);
    setSaving(true);
    try {
      const user = await getCurrentUser();
      if (user) {
        await updateCalibration(user.id, {
          energies: preferredStyles,
          brandAffinity,
          aestheticVibe: vibe,
        });
      }
    } catch {
      // non-blocking — continue regardless
    }
    setSaving(false);
    router.push('/(calibration)/building-profile');
  };

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111111', '#050505']} />
      <ProgressHeader currentStep={3} />

      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={styles.question}>One word.</Text>
          <Text style={styles.subtext}>How you'd describe the way you dress.</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="Minimal"
              placeholderTextColor={colors.text.tertiary}
              maxLength={20}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
              textAlign="center"
              returnKeyType="done"
              onSubmitEditing={handleComplete}
            />
            <View style={styles.inputUnderline} />
          </View>
        </View>

        <View style={styles.footer}>
          <AnimatedButton
            title={saving ? 'Building...' : 'Build my feed →'}
            onPress={handleComplete}
            disabled={value.trim().length === 0 || saving}
            variant={value.trim().length > 0 ? 'primary' : 'secondary'}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: space[7],
    paddingTop: space[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    fontFamily: fonts.display,
    fontSize: size.xxxl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
    textAlign: 'center',
  },
  subtext: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.tertiary,
    marginTop: space[3],
    marginBottom: space[10],
    textAlign: 'center',
  },
  inputWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  input: {
    fontFamily: fonts.display,
    fontSize: size.hero,
    color: colors.text.primary,
    paddingVertical: space[4],
    width: '100%',
    borderWidth: 0,
  },
  inputUnderline: {
    width: 80,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.default,
    alignSelf: 'center',
  },
  footer: {
    paddingHorizontal: space[7],
    paddingBottom: 52,
    paddingTop: space[4],
  },
});
