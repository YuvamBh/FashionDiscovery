import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeInUp 
} from 'react-native-reanimated';
import { colors, fonts, size, space, tracking, radius } from '../lib/tokens';
import { useAuthStore } from '../store/authStore';
import { updateNametag } from '../lib/users';

export default function NametagScreen() {
  const { userId, fetchProfile } = useAuthStore();
  const [preferredName, setPreferredName] = useState('');
  const [userTag, setUserTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateTag = (tag: string) => {
    // Format requirement: at least 3 alphabets + @ + 4 digits
    // Example: ABC@1234
    const regex = /^[A-Z]{3,}@[0-9]{4}$/;
    return regex.test(tag.toUpperCase());
  };

  const handleSubmit = async () => {
    if (!preferredName.trim()) {
      setError('Preferred name is required');
      return;
    }

    if (!validateTag(userTag)) {
      setError('Format: 3+ letters @ 4 digits (e.g. YUV@7777)');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: updateError } = await updateNametag(
        userId!, 
        preferredName.trim(), 
        userTag.toUpperCase().trim()
      );

      if (updateError) {
        if (updateError.code === '23505') {
          setError('This tag is already claimed by another user.');
        } else {
          setError('Could not save identity. Please try again.');
        }
        setLoading(false);
        return;
      }

      await fetchProfile(userId!);
      router.replace('/feed');
    } catch (e) {
      console.error('[Nametag] Submit error:', e);
      setError('An unexpected error occurred.');
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
          <Text style={styles.title}>YOUR IDENTITY</Text>
          <Text style={styles.subtitle}>
            Create your nametag. This is how brands and other discoverers will identify your influence.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PREFERRED NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Yuvam"
              placeholderTextColor={colors.text.tertiary}
              value={preferredName}
              onChangeText={setPreferredName}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>VIBE TAG</Text>
            <TextInput
              style={[styles.input, styles.tagInput]}
              placeholder="YUV@8888"
              placeholderTextColor={colors.text.tertiary}
              value={userTag}
              onChangeText={(text) => setUserTag(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text style={styles.hint}>At least 3 letters + @ + 4 digits</Text>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity 
            style={[styles.button, (!preferredName || !userTag) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={styles.buttonText}>ESTABLISH IDENTITY</Text>
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
    justifyContent: 'center',
    paddingHorizontal: space[8],
  },
  title: {
    fontFamily: fonts.display,
    fontSize: size.xxl,
    color: colors.text.primary,
    letterSpacing: tracking.widest,
    marginBottom: space[2],
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.secondary,
    lineHeight: size.sm * 1.5,
    marginBottom: space[10],
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: space[6],
  },
  label: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.wider,
    marginBottom: space[2],
  },
  input: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.md,
    padding: space[4],
    color: colors.text.primary,
    fontFamily: fonts.body,
    fontSize: size.md,
  },
  tagInput: {
    letterSpacing: tracking.widest,
    fontFamily: fonts.display,
  },
  hint: {
    fontSize: size.xs,
    color: colors.text.tertiary,
    marginTop: space[1],
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ff4444',
    fontSize: size.xs,
    marginBottom: space[4],
    fontFamily: fonts.body,
  },
  button: {
    backgroundColor: colors.text.primary,
    paddingVertical: space[4],
    borderRadius: radius.full,
    alignItems: 'center',
    marginTop: space[4],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.display,
    color: colors.bg.primary,
    fontSize: size.sm,
    letterSpacing: tracking.widest,
  },
});
