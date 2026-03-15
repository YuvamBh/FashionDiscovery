import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';

const WARDROBE_ITEMS = [
  'Oversized Tees', 'Hoodies', 'Denim', 'Trousers', 
  'Basics', 'Dresses', 'Sneakers', 'Outerwear', 
  'Jewelry', 'Athleisure', 'Tailoring', 'Boots'
];

function SelectableCard({ label, isSelected, onPress }: { label: string, isSelected: boolean, onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <Pressable
        onPressIn={() => scale.value = withSpring(0.95)}
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

export default function CurrentWardrobeScreen() {
  const { currentWardrobe, setCurrentWardrobe } = useCalibrationStore();

  const toggleItem = (item: string) => {
    if (currentWardrobe.includes(item)) {
      setCurrentWardrobe(currentWardrobe.filter(i => i !== item));
    } else {
      setCurrentWardrobe([...currentWardrobe, item]);
    }
  };

  const handleContinue = () => {
    router.push('/(calibration)/style-aspiration');
  };

  const isComplete = currentWardrobe.length > 0;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111', '#050505']} />
      <ProgressHeader currentStep={3} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What do you wear most often right now?</Text>
        <Text style={styles.subtitle}>Select the core pillars of your current rotation.</Text>

        <View style={styles.grid}>
          {WARDROBE_ITEMS.map((item) => (
            <SelectableCard
              key={item}
              label={item}
              isSelected={currentWardrobe.includes(item)}
              onPress={() => toggleItem(item)}
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
  cardWrapper: {
    width: '48%', // Allows 2 cards per row with gap
  },
  card: {
    width: '100%',
    aspectRatio: 1.5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'flex-end',
  },
  cardSelected: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: '#ffffff',
  },
  cardText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  cardTextSelected: {
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
});
