import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { mergeTasteProfile } from '../lib/users';
import { GradientBackground } from '../components/GradientBackground';
import { AnimatedButton } from '../components/AnimatedButton';

const { width } = Dimensions.get('window');
const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

const VIBES = [
  { id: 'streetwear', label: 'Streetwear', colors: ['#000000', '#2a0845', '#6441A5'] },
  { id: 'minimalist', label: 'Minimalist', colors: ['#0a0a0a', '#434343', '#000000'] },
  { id: 'avant-garde', label: 'Avant-Garde', colors: ['#000000', '#1f1c2c', '#928dab'] },
  { id: 'y2k', label: 'Y2K', colors: ['#0a0a0a', '#ff9a9e', '#fecfef'] },
];

export default function VibeSetup() {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(24);
  const gridOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600, easing: ease });
    titleY.value = withTiming(0, { duration: 600, easing: ease });
    gridOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: ease }));
    ctaOpacity.value = withDelay(400, withTiming(1, { duration: 600, easing: ease }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const gridStyle = useAnimatedStyle(() => ({
    opacity: gridOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const activeColors = selectedVibe
    ? VIBES.find((v) => v.id === selectedVibe)?.colors || ['#0a0a0a', '#111', '#000']
    : ['#0a0a0a', '#111', '#000'];

  const handleContinue = async () => {
    if (!selectedVibe) return;
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await mergeTasteProfile(data.user.id, { aesthetic_vibe: selectedVibe });
    }
    setLoading(false);
    // Save to global state or context in the future if needed
    router.replace('/quiz');
  };

  return (
    <View style={styles.container}>
      <GradientBackground colors={activeColors as [string, string, ...string[]]} />
      
      <View style={styles.content}>
        <Animated.View style={titleStyle}>
          <Text style={styles.stepLabel}>02 — AESTHETIC</Text>
          <Text style={styles.title}>Choose{'\n'}your vibe.</Text>
          <Text style={styles.subtitle}>
            This sets the mood for your discovery experience.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.grid, gridStyle]}>
          {VIBES.map((vibe) => {
            const isSelected = selectedVibe === vibe.id;
            return (
              <TouchableOpacity
                key={vibe.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => setSelectedVibe(vibe.id)}
                activeOpacity={0.9}
              >
                {/* Temporary placeholder background since we don't have images added yet */}
                <View style={[styles.cardBg, { backgroundColor: vibe.colors[1] }]} />
                <View style={styles.cardOverlay}>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                    {vibe.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, ctaStyle]}>
        <AnimatedButton
          title={loading ? 'Saving...' : 'Continue  →'}
          onPress={handleContinue}
          disabled={!selectedVibe || loading}
          variant={selectedVibe ? 'primary' : 'secondary'}
        />
        <TouchableOpacity onPress={() => router.replace('/quiz')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
  },
  stepLabel: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 48,
    color: '#fff',
    lineHeight: 54,
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 25,
    marginBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 56 - 16) / 2,
    aspectRatio: 0.8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardSelected: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  cardLabel: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  cardLabelSelected: {
    color: '#fff',
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
    textDecorationLine: 'underline',
  },
});
