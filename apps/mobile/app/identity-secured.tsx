import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { useAuthStore } from '../store/authStore';
import { useHaptics } from '../lib/useHaptics';

const { width } = Dimensions.get('window');

type Phase = 'typewriter1' | 'secured' | 'typewriter2' | 'generating' | 'done';

export default function IdentitySecuredScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const haptics = useHaptics();
  const [phase, setPhase] = useState<Phase>('typewriter1');
  const [text, setText] = useState('');
  
  const lockScale = useSharedValue(0.5);
  const lockOpacity = useSharedValue(0);
  const aiProgress = useSharedValue(0);

  const fullText1 = 'SECURING VIBE TAG...';
  const fullText2 = 'VIBE TAG SECURED';
  const fullText3 = 'CURATING YOUR FEED...';

  // Master sequence
  useEffect(() => {
    runSequence();
  }, []);

  const runSequence = async () => {
    // Stage 1: Securing vibe tag...
    await typeText(fullText1, 60, 'selection');
    await new Promise(r => setTimeout(r, 600));
    
    // Stage 2: Vibe tag secured + Lock
    setPhase('secured');
    setText(fullText2);
    haptics.success();
    lockOpacity.value = withTiming(1, { duration: 600 });
    lockScale.value = withSequence(
      withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 })
    );
    await new Promise(r => setTimeout(r, 1500));

    // Stage 3: Curating your feed...
    setPhase('typewriter2');
    setText('');
    await typeText(fullText3, 50, 'light');
    await new Promise(r => setTimeout(r, 400));

    // Stage 4: AI Generating
    setPhase('generating');
    aiProgress.value = withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) });
    await haptics.playPulseSequence(); // Increasing frequency
    
    // Finalize
    setPhase('done');
    router.replace('/feed');
  };

  const typeText = (fullText: string, speed: number, haptic: 'light' | 'selection') => {
    return new Promise<void>((resolve) => {
      let current = 0;
      const interval = setInterval(() => {
        if (current < fullText.length) {
          setText(fullText.substring(0, current + 1));
          current++;
          if (haptic === 'light') haptics.light();
          else haptics.selection();
        } else {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  };

  const lockStyle = useAnimatedStyle(() => ({
    opacity: lockOpacity.value,
    transform: [{ scale: lockScale.value }],
  }));

  const aiBarStyle = useAnimatedStyle(() => ({
    width: `${aiProgress.value * 100}%`,
    opacity: aiProgress.value > 0 ? 1 : 0,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.typewriter}>{text}</Text>
          
          {(phase === 'secured' || phase === 'typewriter2' || phase === 'generating') && (
            <Animated.View style={[styles.lockContainer, lockStyle]}>
              <Text style={styles.lockIcon}>🔒</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.bottomSection}>
          {phase === 'generating' && (
            <Animated.View entering={FadeIn} style={styles.aiContainer}>
              <View style={styles.aiTrack}>
                <Animated.View style={[styles.aiBar, aiBarStyle]} />
              </View>
              <View style={styles.terminalContainer}>
                <Text style={styles.terminalText}>RUN: ANALYZE_STYLE_VECTORS</Text>
                <Text style={styles.terminalText}>STATUS: CURATING_EDITS...</Text>
                <Text style={styles.terminalText}>BONE_STRUCTURE_MATCH: 98.4%</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    paddingHorizontal: space[8],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: space[12],
    height: 250,
    justifyContent: 'center',
  },
  typewriter: {
    fontFamily: fonts.display,
    fontSize: size.xl,
    color: colors.text.primary,
    letterSpacing: tracking.widest,
    textAlign: 'center',
    minHeight: size.xl * 2.5,
  },
  lockContainer: {
    marginTop: space[6],
  },
  lockIcon: {
    fontSize: 48,
  },
  bottomSection: {
    alignItems: 'center',
    height: 180,
  },
  aiContainer: {
    width: width - space[16],
    alignItems: 'center',
  },
  aiTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: space[8],
  },
  aiBar: {
    height: '100%',
    backgroundColor: colors.text.primary,
  },
  terminalContainer: {
    width: '100%',
    padding: space[4],
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  terminalText: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.text.tertiary,
    opacity: 0.8,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
});
