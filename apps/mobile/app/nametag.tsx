import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Keyboard,
  Pressable,
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
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { useAuthStore } from '../store/authStore';
import { updateNametag } from '../lib/users';
import { useHaptics } from '../lib/useHaptics';

export default function NametagScreen() {
  const insets = useSafeAreaInsets();
  const { userId, fetchProfile } = useAuthStore();
  const haptics = useHaptics();
  const [preferredName, setPreferredName] = useState('');
  const [tagHandle, setTagHandle] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorShake = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  const headlineY = useSharedValue(20);
  const headlineOpacity = useSharedValue(0);
  const subtextOpacity = useSharedValue(0);
  const previewScale = useSharedValue(0.94);
  const previewOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const tagScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const vibeHandleRef = useRef<TextInput>(null);
  const numberInputRef = useRef<TextInput>(null);

  // Staggered entry animation
  useEffect(() => {
    // Headline enters
    headlineOpacity.value = withTiming(1, { duration: 500 });
    headlineY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    
    // Subtext 80ms later
    subtextOpacity.value = withDelay(80, withTiming(1, { duration: 400 }));
    
    // Preview 160ms later
    previewOpacity.value = withDelay(160, withTiming(1, { duration: 400 }));
    previewScale.value = withDelay(160, withSpring(1, { damping: 18, stiffness: 120 }));
    
    // Form 240ms later
    formOpacity.value = withDelay(240, withTiming(1, { duration: 400 }));
  }, []);

  // Pulse when VibeID is complete
  useEffect(() => {
    if (tagHandle.length >= 3 && tagNumber.length === 4) {
      haptics.medium();
      pulseScale.value = withSequence(
        withTiming(1.05, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [tagHandle, tagNumber]);

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

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineY.value }]
  }));

  const subtextStyle = useAnimatedStyle(() => ({
    opacity: subtextOpacity.value
  }));

  const previewStyle = useAnimatedStyle(() => ({
    opacity: previewOpacity.value,
    transform: [{ scale: previewScale.value }]
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value
  }));

  const tagPreviewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tagScale.value }]
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
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

  const liveTag = tagHandle ? `${tagHandle.toUpperCase()}@${tagNumber || '____'}` : '@____';

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.inner, { 
        paddingTop: insets.top + space[8],
        paddingHorizontal: space[7],
        paddingBottom: insets.bottom + space[6]
      }]}>
        
        <Animated.View style={headlineStyle}>
          <Text style={styles.headline}>Your signal.</Text>
        </Animated.View>
        <Animated.View style={subtextStyle}>
          <Text style={styles.subtext}>Not your name. How the feed knows you.</Text>
        </Animated.View>

        <Animated.View style={[styles.previewContainer, previewStyle]}>
          <Animated.Text style={[styles.livePreview, pulseStyle, tagPreviewStyle]}>
            {liveTag}
          </Animated.Text>
        </Animated.View>

        <Animated.View style={[styles.form, formStyle]}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NICKNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="nickname"
              placeholderTextColor={colors.text.tertiary}
              value={preferredName}
              onChangeText={(text) => {
                setPreferredName(text);
                if (text.length > 0) haptics.selection();
              }}
              autoFocus
              maxLength={13}
              returnKeyType="next"
              onSubmitEditing={() => vibeHandleRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>VIBE TAG</Text>
            <View style={styles.splitInputContainer}>
              <TextInput
                ref={vibeHandleRef}
                style={[styles.input, styles.handleInput]}
                placeholder="abc"
                placeholderTextColor={colors.text.tertiary}
                value={tagHandle}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^a-zA-Z]/g, '').toUpperCase();
                  setTagHandle(cleaned);
                  if (cleaned.length > 0) haptics.selection();
                  tagScale.value = withSequence(
                    withSpring(1.06, { damping: 8, stiffness: 300 }),
                    withSpring(1.0, { damping: 12, stiffness: 200 })
                  );
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={9 as number}
                returnKeyType="next"
                onSubmitEditing={() => numberInputRef.current?.focus()}
                blurOnSubmit={false}
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
                  if (cleaned.length > 0) {
                    tagScale.value = withSequence(
                      withSpring(1.06, { damping: 8, stiffness: 300 }),
                      withSpring(1.0, { damping: 12, stiffness: 200 })
                    );
                  }
                  if (cleaned.length === 4) {
                    Keyboard.dismiss();
                  }
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

          <Animated.View style={buttonAnimatedStyle}>
            <Pressable 
              style={[styles.button, (!preferredName || !tagHandle || tagNumber.length < 4) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading || (!preferredName || !tagHandle || tagNumber.length < 4)}
              onPressIn={() => {
                if (!loading && preferredName && tagHandle && tagNumber.length === 4) {
                  haptics.medium();
                  buttonScale.value = withSpring(0.96, { damping: 12, stiffness: 300 });
                }
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
              }}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={styles.buttonText}>MINT IDENTITY</Text>
              )}
            </Pressable>
          </Animated.View>
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
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 56,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
    lineHeight: 58,
  },
  subtext: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.tertiary,
    marginTop: space[3],
    lineHeight: 22,
  },
  previewContainer: {
    marginTop: space[10],
    marginBottom: space[10],
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  livePreview: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.text.primary,
    letterSpacing: tracking.wide,
    textAlign: 'center',
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
