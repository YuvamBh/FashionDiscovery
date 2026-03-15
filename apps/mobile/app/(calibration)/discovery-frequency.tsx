import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';

const FREQUENCIES = [
  { label: 'Every day', subtext: 'I want daily drops and high volume discovery.' },
  { label: 'A few times a week', subtext: 'Keep me updated on major culture shifts.' },
  { label: 'Once a week', subtext: 'Just give me the weekly digest of what matters.' },
  { label: 'Only the best drops', subtext: 'High signal only. No noise.' }
];

function FrequencyCard({ label, subtext, isSelected, onPress }: { label: string, subtext: string, isSelected: boolean, onPress: () => void }) {
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
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
            {label}
          </Text>
          <View style={[styles.radio, isSelected && styles.radioSelected]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
        <Text style={[styles.cardSubtext, isSelected && styles.cardSubtextSelected]}>
          {subtext}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function DiscoveryFrequencyScreen() {
  const { discoveryFrequency, setDiscoveryFrequency } = useCalibrationStore();

  const handleSelect = (frequency: string) => {
    setDiscoveryFrequency(frequency);
  };

  const handleContinue = () => {
    router.push('/(calibration)/visual-vibe');
  };

  const isComplete = discoveryFrequency !== null;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111', '#050505']} />
      <ProgressHeader currentStep={7} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>How often should your feed feel fresh?</Text>

        <View style={styles.list}>
          {FREQUENCIES.map((freq) => (
            <FrequencyCard
              key={freq.label}
              label={freq.label}
              subtext={freq.subtext}
              isSelected={discoveryFrequency === freq.label}
              onPress={() => handleSelect(freq.label)}
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
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  cardSelected: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  cardLabelSelected: {
    color: '#ffffff',
  },
  cardSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
    paddingRight: 40,
  },
  cardSubtextSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#ffffff',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
  },
});
