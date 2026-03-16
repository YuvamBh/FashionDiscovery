import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { colors, fonts, size, space, radius, tracking } from '../lib/tokens';

export function InfluenceUpdateCard({ message }: { message: string }) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(1500, withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) }));
    opacity.value = withDelay(1500, withTiming(1, { duration: 600 }));
    
    // Auto dismiss
    const timer = setTimeout(() => {
      translateY.value = withTiming(-100, { duration: 500 });
      opacity.value = withTiming(0, { duration: 500 });
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.indicator} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: colors.bg.overlay,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
    zIndex: 100,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.primary,
    marginRight: space[3],
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: size.sm,
    color: colors.text.secondary,
    letterSpacing: tracking.wide,
  }
});
