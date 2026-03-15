import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { GradientBackground } from '../components/GradientBackground';

const PHRASES = [
  "Analyzing your taste profile...",
  "Running style algorithms...",
  "Cross-referencing global catalogs...",
  "Matching with underground brands...",
  "Curating your unique feed..."
];

export default function CuratingScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Pulse animation for the central element
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Fade in text
    opacity.value = withTiming(1, { duration: 500 });

    const interval = setInterval(() => {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setPhraseIndex)((prev) => {
          if (prev >= PHRASES.length - 1) return prev;
          return prev + 1;
        });
        opacity.value = withTiming(1, { duration: 300 });
      });
    }, 1500);

    const navTimer = setTimeout(() => {
      router.replace('/calibration');
    }, PHRASES.length * 1500 + 500);

    return () => {
      clearInterval(interval);
      clearTimeout(navTimer);
    };
  }, []);

  const animatedCircle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1 - ((pulse.value - 1) * 2),
  }));

  const animatedText = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#0a0a0a', '#111', '#000']} />
      
      <View style={styles.center}>
        <View style={styles.circleContainer}>
          <Animated.View style={[styles.glowRing, animatedCircle]} />
          <View style={styles.innerCircle} />
        </View>

        <Animated.Text style={[styles.loadingText, animatedText]}>
          {PHRASES[phraseIndex]}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    gap: 40,
  },
  circleContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
