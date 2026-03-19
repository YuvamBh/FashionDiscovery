import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  withSpring
} from 'react-native-reanimated';
import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { useAuthStore } from '../store/authStore';
import { useHaptics } from '../lib/useHaptics';
import type { SharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function CharNode({ char, opacity, scale }: {
  char: string
  opacity: SharedValue<number>
  scale: SharedValue<number>
}) {
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));
  return <Animated.Text style={[styles.tagChar, style]}>{char}</Animated.Text>;
}

export default function IdentitySecuredScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const haptics = useHaptics();
  
  const [chars, setChars] = useState<string[]>([]);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  
  const flashOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(24);
  const buttonOpacity = useSharedValue(0);
  const lineScale = useSharedValue(0);
  
  const vibeTag = profile?.user_tag ?? 'ANON@0000';
  const tagChars = vibeTag.split('');
  
  const charScales = useRef(tagChars.map(() => useSharedValue(0.4))).current;
  const charOpacities = useRef(tagChars.map(() => useSharedValue(0))).current;

  useEffect(() => {
    // Step 1 (100ms delay): Draw horizontal lines
    lineScale.value = withDelay(100, withSpring(1, { damping: 20, stiffness: 100 }));
    haptics.light();

    // Step 2 (500ms): Reveal each character with spring
    tagChars.forEach((_, i) => {
      const delay = 500 + (i * 80);
      charOpacities[i].value = withDelay(delay, withTiming(1, { duration: 100 }));
      charScales[i].value = withDelay(delay, withSpring(1, { damping: 10, stiffness: 260 }));
      setTimeout(() => haptics.selection(), delay);
    });

    // Step 3 (after all chars revealed + 400ms)
    const afterChars = 500 + (tagChars.length * 80) + 400;
    setTimeout(() => {
      haptics.success();
      subtitleOpacity.value = withTiming(1, { duration: 600 });
      runOnJS(setShowSubtitle)(true);
    }, afterChars);

    // Step 4 (afterChars + 700ms)
    setTimeout(() => {
      buttonOpacity.value = withSpring(1, { damping: 16, stiffness: 100 });
      buttonTranslateY.value = withSpring(0, { damping: 16, stiffness: 100 });
      runOnJS(setShowButton)(true);
    }, afterChars + 700);
  }, []);

  const handleEnter = async () => {
    if (isEntering) return;
    setIsEntering(true);
    haptics.heavy();
    
    // White flash in
    flashOpacity.value = withTiming(1, { duration: 120, easing: Easing.in(Easing.ease) });
    
    await new Promise(r => setTimeout(r, 120));
    haptics.success();
    
    // Flash holds briefly
    await new Promise(r => setTimeout(r, 60));
    
    // Navigate — flash will still be showing
    router.replace('/feed');
  };

  const animatedLine = useAnimatedStyle(() => ({
    transform: [{ scaleX: lineScale.value }],
  }));

  const animatedSubtitle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const animatedButton = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }]
  }));

  const animatedFlash = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.flashOverlay, animatedFlash]} pointerEvents="none" />
      
      <View style={[styles.topLabel, { top: insets.top + space[6], left: space[7] }]}>
        <Text style={styles.topLabelText}>VIBE ID</Text>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.horizontalLine, animatedLine, { marginBottom: space[8] }]} />
        
        <View style={styles.characterRow}>
          {tagChars.map((char, i) => (
            <CharNode key={i} char={char} opacity={charOpacities[i]} scale={charScales[i]} />
          ))}
        </View>

        <Animated.View style={[styles.horizontalLine, animatedLine, { marginTop: space[8] }]} />

        <Animated.View style={[styles.subtitleContainer, animatedSubtitle]}>
          <Text style={styles.subtitleText}>Your signal is live.</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottomButtonContainer, { bottom: insets.bottom + 40 }, animatedButton]}>
        <Pressable 
          style={styles.button} 
          onPress={handleEnter}
          disabled={isEntering || !showButton}
        >
          <Text style={styles.buttonText}>Enter the room</Text>
        </Pressable>
      </Animated.View>

      {__DEV__ && (
        <Pressable 
          style={[styles.devSkip, { bottom: insets.bottom + 48, right: space[7] }]} 
          onPress={() => router.replace('/feed')}
        >
          <Text style={styles.devSkipText}>skip →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  flashOverlay: {
    backgroundColor: '#FFFFFF',
    zIndex: 100,
  },
  topLabel: {
    position: 'absolute',
  },
  topLabelText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.strong,
    width: SCREEN_WIDTH - 56,
  },
  characterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tagChar: {
    fontFamily: fonts.display,
    fontSize: size.hero,
    color: colors.text.primary,
    letterSpacing: 4,
  },
  subtitleContainer: {
    marginTop: space[8],
  },
  subtitleText: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.secondary,
    letterSpacing: tracking.wide,
    textAlign: 'center',
  },
  bottomButtonContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH - 56,
    alignSelf: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 20,
    backgroundColor: colors.text.primary,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.display,
    fontSize: size.base,
    color: colors.text.inverse,
    letterSpacing: tracking.widest,
  },
  devSkip: {
    position: 'absolute',
  },
  devSkipText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
  },
});
