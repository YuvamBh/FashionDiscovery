import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, useDerivedValue, SharedValue } from 'react-native-reanimated';

// Animated version of LinearGradient
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface GradientBackgroundProps {
  colors: [string, string, ...string[]];
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ colors, style, children }) => {
  // Convert standard array to shared value for smooth transitions
  // React Native Reanimated doesn't animate string arrays natively easily without custom layout animations or color interpolation
  // For a simpler approach, we just map out the LinearGradient.
  
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </LinearGradient>
  );
};
