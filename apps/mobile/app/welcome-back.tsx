import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { useAuthStore } from '../store/authStore';

const TAGLINES = [
  "Your influence shapes the future of style.",
  "The world waits for your next signal.",
  "Your taste is the ultimate authority.",
  "Elevating the digital editorial, one signal at a time.",
  "Curating the avant-garde with every choice you make.",
  "Your vision, our discovery.",
  "Defining the new era of fashion influence.",
  "A masterclass in modern discovery.",
  "Setting the tone for what comes next.",
  "Your aesthetic is a global signal."
];

export default function WelcomeBackScreen() {
  const { profile, userId, fetchProfile } = useAuthStore();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  const taglineOpacity = useSharedValue(0);

  // Randomize tagline on mount
  const randomTagline = useMemo(() => {
    return TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
  }, []);

  useEffect(() => {
    if (userId && !profile) {
      fetchProfile(userId);
    }

    // Main content animation
    opacity.value = withTiming(1, { 
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
    translateY.value = withTiming(0, { 
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });

    // Tagline animation with delay
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 1000 }));

    // Auto-redirect after delay
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(router.replace)('/feed');
        }
      });
    }, 3500); 

    return () => clearTimeout(timeout);
  }, [userId]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const displayName = profile?.display_name || 'Discoverer';

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.label}>WELCOME BACK</Text>
        <Text style={styles.name}>{displayName}</Text>
        
        <Animated.View style={[styles.taglineWrapper, taglineStyle]}>
          <Text style={styles.tagline}>
            {randomTagline}
          </Text>
        </Animated.View>

        <View style={styles.dash} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: space[8],
  },
  label: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    marginBottom: space[2],
  },
  name: {
    fontFamily: fonts.display,
    fontSize: size.xxxl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
    textAlign: 'center',
  },
  taglineWrapper: {
    marginTop: space[4],
    alignItems: 'center',
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: size.sm * 1.5,
    letterSpacing: tracking.wide,
    fontStyle: 'italic',
  },
  dash: {
    width: 20,
    height: 1,
    backgroundColor: colors.text.tertiary,
    marginTop: space[8],
    opacity: 0.3,
  },
});
