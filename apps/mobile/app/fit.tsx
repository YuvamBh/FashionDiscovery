import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { updateUserProfile } from '../lib/users';
import { GradientBackground } from '../components/GradientBackground';
import { AnimatedButton } from '../components/AnimatedButton';

const { width } = Dimensions.get('window');
const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

const FITS = [
  { 
    id: 'oversized', 
    label: 'Oversized', 
    desc: 'Relaxed, baggy, loose',
    image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'tailored', 
    label: 'Tailored', 
    desc: 'Slim, clean, precise',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'cropped', 
    label: 'Cropped', 
    desc: 'Boxy, high-waisted',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'skinny', 
    label: 'Fitted', 
    desc: 'Body-con, tight, skinny',
    image: 'https://images.unsplash.com/photo-1512411516053-5d519d5c8a24?q=80&w=1000&auto=format&fit=crop'
  },
];

function FitCard({ fit, isSelected, onPress }: { fit: typeof FITS[0], isSelected: boolean, onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <Pressable
        onPressIn={() => scale.value = withSpring(0.95)}
        onPressOut={() => scale.value = withSpring(1)}
        onPress={onPress}
        style={[
          styles.card,
          isSelected && styles.cardSelected,
        ]}
      >
        <Image source={{ uri: fit.image }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
          <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
            {fit.label}
          </Text>
          <Text style={styles.cardDesc}>
            {fit.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function FitSetup() {
  const [selectedFit, setSelectedFit] = useState<string | null>(null);
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

  const handleContinue = async () => {
    if (!selectedFit) return;
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('fashion_preferences')
        .eq('id', data.user.id)
        .single();
        
      const currentPrefs = userProfile?.fashion_preferences || {};
      
      await updateUserProfile(data.user.id, { 
        fashion_preferences: { ...currentPrefs, fit: selectedFit } 
      });
    }
    setLoading(false);
    router.push('/categories');
  };

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#0a0a0a', '#0f0f0f', '#000000']} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={titleStyle}>
          <Text style={styles.stepLabel}>04 — SILHOUETTE</Text>
          <Text style={styles.title}>How should{'\n'}it fit?</Text>
          <Text style={styles.subtitle}>
            Your silhouette defines your proportions.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.grid, gridStyle]}>
          {FITS.map((fit) => (
            <FitCard
              key={fit.id}
              fit={fit}
              isSelected={selectedFit === fit.id}
              onPress={() => setSelectedFit(fit.id)}
            />
          ))}
        </Animated.View>
      </ScrollView>

      <Animated.View style={[styles.footer, ctaStyle]}>
        <AnimatedButton
          title={loading ? 'Saving...' : 'Continue  →'}
          onPress={handleContinue}
          disabled={!selectedFit || loading}
          variant={selectedFit ? 'primary' : 'secondary'}
        />
        <Pressable onPress={() => router.push('/categories')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
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
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 100,
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
    fontSize: 44,
    color: '#fff',
    lineHeight: 50,
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
  cardContainer: {
    width: (width - 56 - 16) / 2,
    aspectRatio: 0.85,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#111',
  },
  cardSelected: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  cardLabel: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  cardLabelSelected: {
    color: '#fff',
    fontSize: 18,
  },
  cardDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
    gap: 16,
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
