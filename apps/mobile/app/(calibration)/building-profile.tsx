import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { GradientBackground } from '../../components/GradientBackground';
import { colors, fonts, size, space } from '../../lib/tokens';

const PHRASES = [
  'Analyzing style preferences...',
  'Cross-referencing brand affinities...',
  'Structuring aesthetic pillars...',
  'Tuning the discovery algorithm...',
  'Curating early access drops...',
  'Finalizing taste fingerprint...',
];

export default function BuildingProfileScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    const interval = setInterval(() => {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setPhraseIndex)((prev) => (prev >= PHRASES.length - 1 ? prev : prev + 1));
        opacity.value = withTiming(1, { duration: 300 });
      });
    }, 1200);

    const timer = setTimeout(() => router.replace('/tuned-in'), 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const animatedText = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const animatedCore = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.container}>
      <GradientBackground colors={[colors.bg.primary, '#000000', colors.bg.primary]} />

      <View style={styles.content}>
        <View style={styles.visualizer}>
          <Animated.View style={[styles.glowRing, animatedCore]} />
          <View style={styles.coreRing} />
        </View>

        <Animated.Text style={[styles.phrase, animatedText]}>
          {PHRASES[phraseIndex]}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space[10],
  },
  visualizer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space[14],
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: colors.white.a40,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  coreRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.text.primary,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  phrase: {
    fontFamily: fonts.displayMedium,
    fontSize: size.lg,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
});
