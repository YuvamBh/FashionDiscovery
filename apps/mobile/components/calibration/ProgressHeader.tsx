import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, size, space, tracking } from '../../lib/tokens';

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps?: number;
}

export function ProgressHeader({ currentStep, totalSteps = 3 }: ProgressHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + space[3] }]}>
      <Pressable onPress={() => router.back()} hitSlop={16}>
        <Text style={styles.back}>←</Text>
      </Pressable>
      <Text style={styles.counter}>
        {currentStep} — {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[7],
    paddingBottom: space[5],
  },
  back: {
    fontFamily: fonts.body,
    fontSize: size.xl,
    color: colors.text.secondary,
  },
  counter: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
  },
});
