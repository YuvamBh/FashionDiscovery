import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';

const STYLES = [
  'Minimal', 'Streetwear', 'Elevated basics', 'Vintage', 
  'Luxury', 'Sporty', 'Clean classic', 'Avant-garde', 
  'Bold / experimental', 'Feminine', 'Masculine', 'Neutral / unisex'
];

function StylePill({ label, isSelected, onPress }: { label: string, isSelected: boolean, onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => scale.value = withSpring(0.95)}
        onPressOut={() => scale.value = withSpring(1)}
        onPress={onPress}
        style={[styles.pill, isSelected && styles.pillSelected]}
      >
        <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function StylePreferenceScreen() {
  const { preferredStyles, setPreferredStyles } = useCalibrationStore();

  const toggleStyle = (style: string) => {
    if (preferredStyles.includes(style)) {
      setPreferredStyles(preferredStyles.filter(s => s !== style));
    } else {
      setPreferredStyles([...preferredStyles, style]);
    }
  };

  const handleContinue = () => {
    router.push('/(calibration)/brand-affinity');
  };

  const isComplete = preferredStyles.length > 0;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111', '#050505']} />
      <ProgressHeader currentStep={1} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What kind of style are you naturally drawn to?</Text>
        <Text style={styles.subtitle}>Select all that apply.</Text>

        <View style={styles.grid}>
          {STYLES.map((style) => (
            <StylePill
              key={style}
              label={style}
              isSelected={preferredStyles.includes(style)}
              onPress={() => toggleStyle(style)}
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
        <Pressable onPress={() => router.push('/(calibration)/brand-affinity')}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
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
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  pillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  pillTextSelected: {
    color: '#000',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
    gap: 16,
    alignItems: 'center',
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
});
