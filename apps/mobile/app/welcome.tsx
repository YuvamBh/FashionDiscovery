import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { GradientBackground } from '../components/GradientBackground';
import { AnimatedButton } from '../components/AnimatedButton';

const { height } = Dimensions.get('window');
const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

export default function Welcome() {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.88);
  const headlineOpacity = useSharedValue(0);
  const headlineY = useSharedValue(28);
  const bodyOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(20);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700, easing: ease });
    logoScale.value = withTiming(1, { duration: 700, easing: ease });

    headlineOpacity.value = withDelay(320, withTiming(1, { duration: 700, easing: ease }));
    headlineY.value = withDelay(320, withTiming(0, { duration: 700, easing: ease }));

    bodyOpacity.value = withDelay(600, withTiming(1, { duration: 600, easing: ease }));

    ctaOpacity.value = withDelay(850, withTiming(1, { duration: 600, easing: ease }));
    ctaY.value = withDelay(850, withTiming(0, { duration: 600, easing: ease }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineY.value }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }],
  }));

  const handleGoogleSignIn = () => {
    // TODO: Implement actual Google Auth
    router.push('/onboarding');
  };

  const handlePhoneSignIn = () => {
    // TODO: Implement phone OTP auth
    router.push('/onboarding');
  };

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#0a0a0a', '#1a1a1a', '#000000']} />
      
      <View style={styles.content}>
        {/* Top wordmark */}
        <Animated.View style={[styles.topBar, logoStyle]}>
          <Text style={styles.monogram}>FD</Text>
          <View style={styles.dividerLine} />
          <Text style={styles.wordmarkSub}>FASHION DISCOVERY</Text>
        </Animated.View>

        {/* Hero headline */}
        <View style={styles.hero}>
          <Animated.Text style={[styles.headline, headlineStyle]}>
            Shape{'\n'}what gets{'\n'}made.
          </Animated.Text>
          <Animated.Text style={[styles.body, bodyStyle]}>
            The cultural intelligence platform where{'\n'}
            your taste signals influence what{'\n'}
            brands create next.
          </Animated.Text>
        </View>

        {/* CTA section */}
        <Animated.View style={[styles.footer, ctaStyle]}>
          <AnimatedButton
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="google"
          />
          <AnimatedButton
            title="Continue with Phone"
            onPress={handlePhoneSignIn}
            variant="outline"
          />

          <Text style={styles.legal}>
            By continuing you agree to our Terms of Service{'\n'}and Privacy Policy.
          </Text>
        </Animated.View>
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
    paddingTop: 72,
    paddingBottom: 52,
    zIndex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 0,
  },
  monogram: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 2,
  },
  dividerLine: {
    width: 1,
    height: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  wordmarkSub: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3.5,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 16,
  },
  headline: {
    fontFamily: 'Syne_700Bold',
    fontSize: height > 800 ? 56 : 48,
    color: '#fff',
    lineHeight: height > 800 ? 64 : 56,
    letterSpacing: -1.5,
    marginBottom: 24,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 26,
  },
  footer: {
    gap: 8,
  },
  legal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },
});

