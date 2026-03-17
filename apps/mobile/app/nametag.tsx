import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { useAuthStore } from '../store/authStore';
import { updateNametag } from '../lib/users';
import { useHaptics } from '../lib/useHaptics';

export default function NametagScreen() {
  const { userId, fetchProfile } = useAuthStore();
  const haptics = useHaptics();
  const [preferredName, setPreferredName] = useState('');
  const [tagHandle, setTagHandle] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorShake = useSharedValue(0);
  const numberInputRef = useRef<TextInput>(null);

  const triggerError = (msg: string) => {
    haptics.error();
    setError(msg);
    errorShake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 })
    );
  };

  const errorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  const handleSubmit = async () => {
    haptics.light();
    if (!preferredName.trim()) {
      triggerError('Nickname is required');
      return;
    }

    if (preferredName.length > 13) {
      triggerError('Nickname max 13 characters');
      return;
    }

    if (tagHandle.length < 3 || tagHandle.length > 9) {
      triggerError('Handle must be 3-9 characters');
      return;
    }

    if (tagNumber.length !== 4 || !/^\d+$/.test(tagNumber)) {
      triggerError('Tag number must be 4 digits');
      return;
    }

    const fullTag = `${tagHandle.toUpperCase()}@${tagNumber}`;

    setError(null);
    setLoading(true);

    try {
      const { error: updateError } = await updateNametag(
        userId!, 
        preferredName.trim(), 
        fullTag
      );

      if (updateError) {
        if (updateError.code === '23505') {
          triggerError('This identity is already claimed.');
        } else {
          triggerError('Identity sync failed.');
        }
        setLoading(false);
        return;
      }

      await fetchProfile(userId!);
      router.replace('/identity-secured');
    } catch (e) {
      console.error('[Nametag] Submit error:', e);
      triggerError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Animated.View entering={FadeInDown.delay(200).duration(800)}>
          <Text style={styles.title}>IDENTITY</Text>
          <Text style={styles.subtitle}>Let's setup your vibeID!</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NICKNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="nickname"
              placeholderTextColor={colors.text.tertiary}
              value={preferredName}
              onChangeText={setPreferredName}
              autoFocus
              maxLength={13}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>VIBE TAG</Text>
            <View style={styles.splitInputContainer}>
              <TextInput
                style={[styles.input, styles.handleInput]}
                placeholder="abc"
                placeholderTextColor={colors.text.tertiary}
                value={tagHandle}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^a-zA-Z]/g, '').toUpperCase();
                  setTagHandle(cleaned);
                  if (cleaned.length >= 9) {
                    haptics.selection();
                    numberInputRef.current?.focus();
                  }
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={9 as number}
              />
              <Text style={styles.atSymbol}>@</Text>
              <TextInput
                ref={numberInputRef}
                style={[styles.input, styles.numberInput]}
                placeholder="0000"
                placeholderTextColor={colors.text.tertiary}
                value={tagNumber}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setTagNumber(cleaned);
                }}
                keyboardType="number-pad"
                maxLength={4 as number}
              />
            </View>
          </View>

          {error && (
            <Animated.View style={[styles.errorBox, errorStyle]} entering={FadeIn}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          <TouchableOpacity 
            style={[styles.button, (!preferredName || !tagHandle || tagNumber.length < 4) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={styles.buttonText}>SECURE IDENTITY</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  inner: {
    flex: 1,
    paddingHorizontal: space[8],
    justifyContent: 'center',
    paddingBottom: space[16],
  },
  title: {
    fontFamily: fonts.display,
    fontSize: size.xl * 1.5,
    color: colors.text.primary,
    letterSpacing: tracking.widest,
    marginBottom: space[2],
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: size.md,
    color: colors.text.secondary,
    letterSpacing: tracking.wide,
    marginBottom: space[10],
  },
  form: {
    gap: space[8],
  },
  inputGroup: {
    gap: space[2],
  },
  label: {
    fontFamily: fonts.display,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    marginLeft: space[1],
  },
  input: {
    height: 60,
    backgroundColor: '#111',
    borderRadius: 0,
    paddingHorizontal: space[5],
    color: colors.text.primary,
    fontFamily: fonts.display,
    fontSize: size.md,
    letterSpacing: tracking.wider,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  splitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  handleInput: {
    flex: 2,
  },
  atSymbol: {
    fontFamily: fonts.display,
    fontSize: size.lg,
    color: colors.text.secondary,
  },
  numberInput: {
    flex: 1,
    textAlign: 'center',
  },
  errorBox: {
    marginTop: space[2],
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderLeftWidth: 2,
    borderLeftColor: '#FF453A',
  },
  errorText: {
    color: '#FF453A',
    fontFamily: fonts.body,
    fontSize: size.xs,
    letterSpacing: tracking.wide,
  },
  button: {
    height: 60,
    backgroundColor: colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: space[4],
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    color: colors.bg.primary,
    fontFamily: fonts.display,
    fontSize: size.sm,
    letterSpacing: tracking.widest,
  },
});
