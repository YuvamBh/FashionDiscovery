import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuthStore } from '../store/authStore';

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  // Use separate selectors — inline object selectors create new refs each render,
  // which causes an infinite loop with Zustand's useSyncExternalStore.
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const authOutcome = useAuthStore((s) => s.authOutcome);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(24);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  // Reactive redirect: layout resolves auth -> this screen executes navigation
  useEffect(() => {
    if (!authOutcome) return;
    console.log(`[Index] Reactive redirect to: /${authOutcome}`);
    // Reset outcome as we consume it
    useAuthStore.setState({ authOutcome: null });
    router.replace(`/${authOutcome}` as any);
  }, [authOutcome]);

  // Animate sign-in UI in only if there is no active session
  useEffect(() => {
    if (!isAuthReady || authOutcome) return;
    titleOpacity.value = withTiming(1, { duration: 800, easing: ease });
    titleY.value = withTiming(0, { duration: 800, easing: ease });
    subtitleOpacity.value = withDelay(300, withTiming(1, { duration: 800, easing: ease }));
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 800, easing: ease }));
    footerOpacity.value = withDelay(800, withTiming(1, { duration: 800, easing: ease }));
  }, [isAuthReady, authOutcome]);

  // ALL hooks must be declared before any conditional returns (Rules of Hooks)
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  // Show nothing while we wait for the auth check or while redirecting
  if (!isAuthReady || authOutcome) return null;

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1080&auto=format&fit=crop' }}
        style={styles.background}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#000000', '#000000']}
          style={styles.gradient}
        />
        
        <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
          <Animated.View style={titleStyle}>
            <Text style={styles.wordmark}>FashionDiscovery</Text>
            <Text style={styles.headline}>
              Discover{'\n'}what's{'\n'}next.
            </Text>
          </Animated.View>

          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            A new kind of fashion discovery — built for taste, not transactions.
          </Animated.Text>
        </View>

        <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 60) }]}>
          <Animated.View style={buttonStyle}>
            <AnimatedButton 
              title="Get started" 
              onPress={() => router.push('/(onboarding)/discovery')}
              variant="primary"
            />
          </Animated.View>

          <Animated.Text style={[styles.footerText, footerStyle]}>
            No shopping clutter. Just signal, style, and future drops.
          </Animated.Text>

        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  wordmark: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: 'Syne_700Bold',
    fontSize: 56,
    color: '#ffffff',
    lineHeight: 60,
    letterSpacing: -2,
    marginBottom: 24,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 26,
    maxWidth: '90%',
  },
  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: 60,
    gap: 24,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  devSection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  devButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
    alignItems: 'center',
  },
  devButtonText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#444',
    letterSpacing: 1,
  },
});
