import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { sendOtp, verifyOtp } from '../lib/auth';
import { getOrCreateUser } from '../lib/users';
import { supabase } from '../lib/supabase';
import { GradientBackground } from '../components/GradientBackground';
import { AnimatedButton } from '../components/AnimatedButton';

type Mode = 'choose' | 'phone' | 'otp';

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

function AnimatedScreen({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400, easing: ease });
    translateY.value = withTiming(0, { duration: 400, easing: ease });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    flex: 1,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function Onboarding() {
  const [mode, setMode] = useState<Mode>('choose');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'fashiondiscovery://auth-callback',
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data.url) {
        setErrorMsg('Enable Google in your Supabase dashboard first, then rebuild.');
      }
    } catch {
      setErrorMsg('Google sign-in needs setup. Use phone for now.');
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!phone) return;
    setErrorMsg('');
    setLoading(true);
    const { error } = await sendOtp(phone);
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    setMode('otp');
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setErrorMsg('');
    setLoading(true);
    const { data, error } = await verifyOtp(phone, otp);
    if (error) { setLoading(false); setErrorMsg(error.message); return; }
    if (data.user) await getOrCreateUser(data.user.id, phone);
    setLoading(false);
    router.replace('/name-setup');
  };

  const goBack = () => {
    if (mode === 'phone' || mode === 'otp') {
      setMode(mode === 'otp' ? 'phone' : 'choose');
      setErrorMsg('');
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <GradientBackground colors={['#0a0a0a', '#111', '#000']} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
        </View>

        {mode === 'choose' && (
          <AnimatedScreen key="choose">
            <Text style={styles.title}>Join the{'\n'}platform.</Text>
            <Text style={styles.subtitle}>
              Your taste shapes what brands make next.{'\n'}
              Start by creating your account.
            </Text>

            <AnimatedButton
              title="Continue with Google"
              onPress={handleGoogleSignIn}
              variant="google"
              disabled={loading}
              style={{ marginBottom: 16 }}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <AnimatedButton
              title="Continue with Phone"
              onPress={() => setMode('phone')}
              variant="outline"
              disabled={loading}
              style={{ marginBottom: 24 }}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => router.replace('/name-setup')}
            >
              <Text style={styles.skipText}>Skip sign in (dev)</Text>
            </TouchableOpacity>
          </AnimatedScreen>
        )}

        {mode === 'phone' && (
          <AnimatedScreen key="phone">
            <Text style={styles.title}>Your{'\n'}number.</Text>
            <Text style={styles.subtitle}>We'll send a one-time code to verify.</Text>

            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (234) 567-8900"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoFocus
            />
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <AnimatedButton
              title={loading ? 'Sending...' : 'Send Code'}
              onPress={handleSendOtp}
              variant="primary"
              disabled={!phone || loading}
            />
          </AnimatedScreen>
        )}

        {mode === 'otp' && (
          <AnimatedScreen key="otp">
            <Text style={styles.title}>Check{'\n'}your texts.</Text>
            <Text style={styles.subtitle}>Code sent to {phone}</Text>

            <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
            <TextInput
              style={[styles.input, styles.inputOtp]}
              placeholder="000000"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              autoFocus
            />
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <AnimatedButton
              title={loading ? 'Verifying...' : 'Verify'}
              onPress={handleVerifyOtp}
              variant="primary"
              disabled={!otp || loading}
            />
          </AnimatedScreen>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 56,
  },
  topBar: {
    paddingTop: 64,
    marginBottom: 28,
  },
  backBtn: {
    fontSize: 22,
    color: '#fff',
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
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 26,
    marginBottom: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  inputLabel: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  inputOtp: {
    fontFamily: 'Syne_700Bold',
    fontSize: 32,
    letterSpacing: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#ef4444',
    marginBottom: 16,
    lineHeight: 20,
  },
  skipBtn: {
    marginTop: 28,
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
