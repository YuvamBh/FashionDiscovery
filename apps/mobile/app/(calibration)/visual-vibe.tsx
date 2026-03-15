import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';

const VIBE_BOARDS = [
  { id: 'v1', label: 'Dark Archival', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop' },
  { id: 'v2', label: 'Elevated Techwear', image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=600&auto=format&fit=crop' },
  { id: 'v3', label: 'Clean Vintage', image: 'https://images.unsplash.com/photo-1434389670869-c4ad33020614?q=80&w=600&auto=format&fit=crop' },
  { id: 'v4', label: 'Avant-Garde', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { id: 'v5', label: 'Street Luxury', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
  { id: 'v6', label: 'Minimalist Core', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop' },
];

function VibeTile({ item, isSelected, onPress }: { item: typeof VIBE_BOARDS[0], isSelected: boolean, onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.tileWrapper, animatedStyle]}>
      <Pressable
        onPressIn={() => scale.value = withSpring(0.95)}
        onPressOut={() => scale.value = withSpring(1)}
        onPress={onPress}
        style={[styles.tile, isSelected && styles.tileSelected]}
      >
        <Image source={{ uri: item.image }} style={styles.tileImage} />
        {isSelected && <View style={styles.selectionOverlay} />}
        
        <View style={styles.tileFooter}>
          <Text style={styles.tileLabel}>{item.label}</Text>
          {isSelected && (
            <View style={styles.checkbox}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function VisualVibeScreen() {
  const { visualVibes, setVisualVibes } = useCalibrationStore();

  const toggleVibe = (id: string) => {
    if (visualVibes.includes(id)) {
      setVisualVibes(visualVibes.filter(v => v !== id));
    } else {
      if (visualVibes.length < 4) {
        setVisualVibes([...visualVibes, id]);
      }
    }
  };

  const handleFinish = () => {
    router.push('/(calibration)/building-profile');
  };

  const isComplete = visualVibes.length > 0;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111', '#050505']} />
      <ProgressHeader currentStep={8} totalSteps={8} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Pick the moodboards that feel closest to you.</Text>
        <Text style={styles.subtitle}>Select up to 4 vibes to tune the visual algorithm.</Text>

        <View style={styles.grid}>
          {VIBE_BOARDS.map((vibe) => (
            <VibeTile
              key={vibe.id}
              item={vibe}
              isSelected={visualVibes.includes(vibe.id)}
              onPress={() => toggleVibe(vibe.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedButton
          title="Build taste profile →"
          onPress={handleFinish}
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
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  tileWrapper: {
    width: '47%', // 2 per row
  },
  tile: {
    width: '100%',
    aspectRatio: 0.8, // Taller portrait layout like moodboards
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tileSelected: {
    borderColor: '#ffffff',
  },
  tileImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  tileFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)' // Ensure text is readable
  },
  tileLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
  },
});
