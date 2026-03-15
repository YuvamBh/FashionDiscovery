import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
// import * as WebBrowser from 'expo-web-browser';
// import { supabase } from '../../lib/supabase';

// Setup for Google Auth later
// WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  
  const handleGoogleAuth = async () => {
    // TODO: Wire up actual Supabase OAuth here
    // For now we will mock a successful auth flow that pushes to the profile setup
    console.log("Mocking Google OAuth flow...");
    router.replace('/name-setup');
  };

  const handlePhoneAuth = () => {
    // Navigate to the dedicated phone number entry screen
    router.push('/(auth)/phone');
  };

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#0a0a0a', '#111111', '#050505']} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Join the next{'\n'}wave of discovery.</Text>
          <Text style={styles.subtitle}>
            Sign in to save your taste, personalize your feed, and shape future drops.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.googleButton} 
            activeOpacity={0.8}
            onPress={handleGoogleAuth}
          >
            {/* Using a placeholder character for Google icon since we don't have SVGs installed yet */}
            <View style={styles.googleIconPlaceholder}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <AnimatedButton 
            title="Continue with phone number" 
            onPress={handlePhoneAuth}
            variant="secondary"
          />
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
