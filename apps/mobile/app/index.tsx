import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { getUserProfile } from '../lib/users';
import { AnimatedButton } from '../components/AnimatedButton';

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

export default function SplashScreen() {
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(24);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    // Check if the user is already authenticated
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data: profile } = await getUserProfile(data.session.user.id);
        router.replace(profile?.calibration_completed ? '/feed' : '/(calibration)/style-preference');
      }
    })();

    titleOpacity.value = withTiming(1, { duration: 800, easing: ease });
    titleY.value = withTiming(0, { duration: 800, easing: ease });
    
    subtitleOpacity.value = withDelay(
      300, 
      withTiming(1, { duration: 800, easing: ease })
    );
    
    buttonOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 800, easing: ease })
    );

    footerOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 800, easing: ease })
    );
  }, []);

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
        
        <View style={styles.content}>
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

        <View style={styles.bottomSection}>
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
});
