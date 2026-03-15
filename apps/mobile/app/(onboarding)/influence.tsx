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
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressDots } from '../../components/onboarding/ProgressDots';

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

export default function InfluenceScreen() {
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(24);

  useEffect(() => {
    contentOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 800, easing: ease })
    );
    contentY.value = withDelay(
      100,
      withTiming(0, { duration: 800, easing: ease })
    );
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Blurred neon/glow texture representing heat/signals */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop' }}
        style={styles.background}
      >
        <LinearGradient
          colors={['rgba(10,10,10,0.4)', '#0a0a0a', '#0a0a0a']}
          style={styles.gradient}
          locations={[0, 0.6, 1]}
        />
        
        <View style={styles.content}>
          <Animated.View style={contentStyle}>
            <View style={styles.tag}>
              <View style={styles.activePulse} />
              <Text style={styles.tagText}>STRONG SIGNAL</Text>
            </View>
            <Text style={styles.headline}>
              Your taste{'\n'}shapes what{'\n'}launches.
            </Text>
            <Text style={styles.subtitle}>
              Every swipe surfaces demand. Standout pieces rise. You are part of real-time trend formation—not just shopping.
            </Text>
          </Animated.View>
        </View>

        <View style={styles.bottomSection}>
          <ProgressDots total={3} current={1} />
          <AnimatedButton 
            title="Continue" 
            onPress={() => router.push('/(onboarding)/taste')}
            variant="primary"
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  background: {
    flex: 1,
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
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#58d68d', // Green active indicator
    marginRight: 8,
  },
  tagText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 10,
    color: '#fff',
    letterSpacing: 1.5,
  },
  headline: {
    fontFamily: 'Syne_700Bold',
    fontSize: 44,
    color: '#ffffff',
    lineHeight: 48,
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 26,
  },
  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: 60,
  },
});
