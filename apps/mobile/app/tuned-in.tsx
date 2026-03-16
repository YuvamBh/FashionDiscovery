import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { GradientBackground } from '../components/GradientBackground';
import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { useCalibrationStore } from '../store/calibrationStore';

export default function TunedInScreen() {
  const opacity = useSharedValue(0);
  const { preferredStyles, brandAffinity } = useCalibrationStore();
  
  const topStyles = preferredStyles.slice(0, 2).join(', ').toLowerCase();
  const topBrand = brandAffinity[0] || 'early-drop';
  
  const fallbackSubtitle = "We're shaping your feed around minimal, elevated, and early-drop driven pieces.";
  const dynamicSubtitle = topStyles ? `We're shaping your feed around ${topStyles}, and ${topBrand.toLowerCase()} driven pieces.` : fallbackSubtitle;

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 600 }, (finished) => {
        if (finished) {
          runOnJS(router.replace)('/feed');
        }
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.container}>
      <GradientBackground colors={[colors.bg.primary, colors.bg.elevated, colors.bg.primary]} />
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.title}>You're tuned in.</Text>
        <Text style={styles.subtitle}>{dynamicSubtitle}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg.primary 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: space[10] 
  },
  title: { 
    fontFamily: fonts.display, 
    fontSize: size.xl, 
    color: colors.text.primary, 
    marginBottom: space[4], 
    letterSpacing: tracking.tight 
  },
  subtitle: { 
    fontFamily: fonts.body, 
    fontSize: size.base, 
    color: colors.text.secondary, 
    textAlign: 'center', 
    lineHeight: 24, 
    letterSpacing: tracking.wide 
  }
});
