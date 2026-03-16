import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { signInWithGoogle, getCurrentUser } from '../../lib/auth';
import { getUserProfile } from '../../lib/users';
import { fonts, size } from '../../lib/tokens';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setLoading(false);
      setError(error?.message ?? 'Sign in failed. Try again.');
      return;
    }
    const user = await getCurrentUser();
    if (user) {
      const { data: profile } = await getUserProfile(user.id);
      router.replace(profile?.calibration_completed ? '/feed' : '/(calibration)/style-preference');
    }
    setLoading(false);
  };


  return (
    <View style={styles.container}>
      <GradientBackground colors={['#0a0a0a', '#111111', '#050505']} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Join the next{'\n'}wave of discovery.</Text>
          <Text style={styles.subtitle}>
            Sign in with Google to save your taste and shape what gets made.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.googleButton, loading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleGoogleAuth}
            disabled={loading}
          >
            <View style={styles.googleIconPlaceholder}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.termsText}>
          We use your account to personalize discovery{'\n'}and protect signal quality.
        </Text>
        <Text style={styles.linksText}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Terms</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
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
    justifyContent: 'center',
    paddingTop: 40,
  },
  header: {
    marginBottom: 60,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 40,
    color: '#ffffff',
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 26,
  },
  actions: {
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 30,
    gap: 12,
  },
  googleIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#000',
  },
  googleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#000000',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: '#8A4A4A',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 52 : 32,
    alignItems: 'center',
    gap: 16,
  },
  termsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
  linksText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  link: {
    textDecorationLine: 'underline',
    color: '#ffffff',
  },
});
