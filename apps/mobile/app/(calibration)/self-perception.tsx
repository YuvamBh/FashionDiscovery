import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';

const PERCEPTIONS = [
  'Just starting out',
  'I know what I like',
  'Pretty confident',
  'Very intentional',
  'People ask me for style advice'
];

function CardRow({ label, isSelected, onPress }: { label: string, isSelected: boolean, onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => scale.value = withSpring(0.97)}
        onPressOut={() => scale.value = withSpring(1)}
        onPress={onPress}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function SelfPerceptionScreen() {
  const { selfPerception, setSelfPerception } = useCalibrationStore();

  const handleSelect = (perception: string) => {
    setSelfPerception(perception);
  };

  const handleContinue = () => {
    router.push('/(calibration)/app-goals');
  };

  const isComplete = selfPerception !== null;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111', '#050505']} />
      <ProgressHeader currentStep={5} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>How would you describe your fashion sense today?</Text>

        <View style={styles.list}>
          {PERCEPTIONS.map((perception) => (
            <CardRow
              key={perception}
              label={perception}
              isSelected={selfPerception === perception}
              onPress={() => handleSelect(perception)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedButton
          title="Continue →"
          onPress={handleContinue}
          disabled={!isComplete}
          variant={isComplete ? 'primary' : 'secondary'}
        />
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
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 36,
    color: '#fff',
    lineHeight: 42,
    letterSpacing: -1,
    marginBottom: 40,
  },
  list: {
    gap: 16,
  },
  card: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  cardText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  cardTextSelected: {
    color: '#000000',
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
  },
});
