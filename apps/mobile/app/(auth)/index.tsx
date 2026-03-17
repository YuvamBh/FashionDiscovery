import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { signInWithGoogle } from '../../lib/auth';
import { fonts, size } from '../../lib/tokens';
import { useAuthStore } from '../../store/authStore';
import { useHaptics } from '../../lib/useHaptics';
import { supabase } from '../../lib/supabase';
import { AnimatedButton } from '../../components/AnimatedButton';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authOutcome = useAuthStore((s) => s.authOutcome);
  const haptics = useHaptics();

  // Reactive redirect: when the layout resolves the auth outcome,
  // this screen (which stays mounted during OAuth) immediately navigates.
  useEffect(() => {
    if (!authOutcome) return;
    console.log(`[AuthScreen] Reactive redirect to: /${authOutcome}`);
    setError(null); // Clear any transient errors on success
    useAuthStore.setState({ authOutcome: null });
    router.replace(`/${authOutcome}` as any);
  }, [authOutcome]);

  // Safety: If stuck in loading for > 12s, re-check session manually
  // Only trigger if we haven't already received an authOutcome
  useEffect(() => {
    if (!loading || authOutcome) return;
    const timer = setTimeout(async () => {
      // Re-read store state in case it updated during the timeout
      const currentOutcome = useAuthStore.getState().authOutcome;
      if (currentOutcome) return;

      console.log('[AuthScreen] Loading took > 12s. Re-checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await useAuthStore.getState().fetchProfile(session.user.id);
        const outcome = profile?.onboarding_completed ? 'feed' : 'nametag';
        useAuthStore.setState({ isAuthReady: true, authOutcome: outcome as any });
      } else {
        setLoading(false);
        setError('Sign in timed out. Please try again.');
        haptics.error();
      }
    }, 12000); // Increased to 12s for slower connections
    return () => clearTimeout(timer);
  }, [loading, authOutcome]);

  useEffect(() => {
    return () => { setLoading(false); };
  }, []);

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    haptics.light(); // Tactile feedback on press
    
    try {
      console.log('[AuthScreen] Starting Google Auth...');
      const { error } = await signInWithGoogle();
      
      if (error) {
        if (error.message === 'Sign in cancelled') {
          console.log('[AuthScreen] Sign in cancelled by user.');
          setLoading(false);
          return;
        }
        console.error('[AuthScreen] Sign in error:', error.message);
        setError('Sign in failed. Please try again.');
        setLoading(false);
        haptics.error();
      }
      // Success: Layout will set 'authOutcome', which our useEffect watches.
      console.log('[AuthScreen] Google Auth call returned success. Waiting for session resolution...');
    } catch (e: any) {
      console.error('[AuthScreen] Exception during auth:', e.message);
      setError('Something went wrong. Please try again.');
      setLoading(false);
      haptics.error();
    }
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
          <AnimatedButton
            title={loading ? 'Signing in...' : 'Continue with Google'}
            onPress={handleGoogleAuth}
            disabled={loading}
            variant="google"
            icon={
              <View style={styles.googleIconPlaceholder}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
            }
          />

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
