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
  Easing
} from 'react-native-reanimated';
import { GradientBackground } from '../../components/GradientBackground';
import { useCalibrationStore } from '../../store/calibrationStore';
// import { supabase } from '../../lib/supabase';

const PHRASES = [
  "Analyzing style preferences...",
  "Cross-referencing brand affinities...",
  "Structuring aesthetic pillars...",
  "Tuning the discovery algorithm...",
  "Curating early access drops...",
  "Finalizing taste fingerprint..."
];

export default function BuildingProfileScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const { getCompleteProfile } = useCalibrationStore();

  useEffect(() => {
    // Pulse animation for the center core
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Crossfade phrase animation
    const interval = setInterval(() => {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setPhraseIndex)((prev) => {
          if (prev >= PHRASES.length - 1) return prev;
          return prev + 1;
        });
        opacity.value = withTiming(1, { duration: 300 });
      });
    }, 1200);

    // Simulated network sync delay
    const syncProfile = async () => {
      try {
        const fullProfile = getCompleteProfile();
        console.log("Syncing Profile payload to backend:", fullProfile);
        
        // TODO: Wire up to Supabase user metadata update here
        // await supabase.auth.updateUser({ data: { fashion_profile: fullProfile } });

        // Wait a few seconds for effect, then push user into feed
        await new Promise(r => setTimeout(r, 6000));
        router.replace('/feed');

      } catch (err) {
        console.error("Error saving profile", err);
        router.replace('/feed'); // Fallback route just to unblock
      }
    };

    syncProfile();

    return () => clearInterval(interval);
  }, []);

  const animatedText = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedCore = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#0a0a0a', '#000000', '#0a0a0a']} />
      
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
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  visualizer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  coreRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  phrase: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
});
