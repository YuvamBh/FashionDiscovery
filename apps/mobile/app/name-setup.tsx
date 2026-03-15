import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { updateUserProfile } from '../lib/users';
import { GradientBackground } from '../components/GradientBackground';
import { AnimatedButton } from '../components/AnimatedButton';

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

export default function NameSetup() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(24);
  const inputOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600, easing: ease });
    titleY.value = withTiming(0, { duration: 600, easing: ease });
    inputOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: ease }));
    ctaOpacity.value = withDelay(400, withTiming(1, { duration: 500, easing: ease }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await updateUserProfile(data.user.id, { full_name: trimmed });
    }
    setLoading(false);
    // Move to the new vibe selection screen
    router.replace('/vibe');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <GradientBackground colors={['#000', '#0a0a0a', '#111']} />
      
      <View style={styles.content}>
        <Animated.View style={titleStyle}>
          <Text style={styles.stepLabel}>01 — IDENTITY</Text>
          <Text style={styles.title}>What do{'\n'}we call you?</Text>
          <Text style={styles.subtitle}>
            Your name helps brands know their{'\n'}top tastemakers.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.inputSection, inputStyle]}>
          <Text style={styles.inputLabel}>FIRST NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, ctaStyle]}>
        <AnimatedButton
          title={loading ? 'Saving...' : 'Continue  →'}
          onPress={handleContinue}
          disabled={!name.trim() || loading}
          variant="primary"
        />
        <TouchableOpacity onPress={() => router.replace('/vibe')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    gap: 44,
  },
  stepLabel: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 48,
    color: '#fff',
    lineHeight: 54,
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 25,
  },
  inputSection: {
    gap: 10,
  },
  inputLabel: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2.5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 18,
    fontFamily: 'Syne_600SemiBold',
    fontSize: 28,
    color: '#fff',
    letterSpacing: 0.2,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
    gap: 16,
    alignItems: 'center',
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});

