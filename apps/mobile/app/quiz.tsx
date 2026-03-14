import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

type QuizState = {
  brands: string[];
  fit: string | null;
  budget: string | null;
};

const BRANDS = ['Acne Studios', 'Rick Owens', 'Aime Leon Dore', 'Stussy', 'Balenciaga', 'Carhartt WIP', 'Bottega Veneta', 'Jil Sander'];
const FITS = ['Oversized / Relaxed', 'Tailored / Slim', 'Cropped & Boxy', 'Avant-Garde Proportions'];

export default function FashionQuiz() {
  const [quiz, setQuiz] = useState<QuizState>({
    brands: [],
    fit: null,
    budget: null,
  });
  const [loading, setLoading] = useState(false);

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(24);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600, easing: ease });
    titleY.value = withTiming(0, { duration: 600, easing: ease });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: ease }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const toggleBrand = (brand: string) => {
    setQuiz((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const handleContinue = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      // Save fashion quiz data to their taste_profile JSONB
      await mergeTasteProfile(data.user.id, { quiz_answers: quiz });
    }
    setLoading(false);
    router.replace('/calibration');
  };

  const isFormComplete = quiz.brands.length > 0 && quiz.fit !== null;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#0a0a0a', '#111', '#050505']} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={titleStyle}>
          <Text style={styles.stepLabel}>03 — PREFERENCES</Text>
          <Text style={styles.title}>Define{'\n'}your taste.</Text>
          <Text style={styles.subtitle}>
            Select the brands and styles that resonate with you to calibrate your feed.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.section, contentStyle]}>
          <Text style={styles.sectionTitle}>Favorite Brands (Select multiple)</Text>
          <View style={styles.pillContainer}>
            {BRANDS.map((brand) => {
              const selected = quiz.brands.includes(brand);
              return (
                <TouchableOpacity
                  key={brand}
                  style={[styles.pill, selected && styles.pillSelected]}
                  onPress={() => toggleBrand(brand)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                    {brand}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, contentStyle, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Preferred Fit</Text>
          <View style={styles.pillContainer}>
            {FITS.map((fit) => {
              const selected = quiz.fit === fit;
              return (
                <TouchableOpacity
                  key={fit}
                  style={[styles.pill, selected && styles.pillSelected]}
                  onPress={() => setQuiz((prev) => ({ ...prev, fit }))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                    {fit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedButton
          title={loading ? 'Saving...' : 'Calibrate Feed →'}
          onPress={handleContinue}
          disabled={!isFormComplete || loading}
          variant={isFormComplete ? 'primary' : 'secondary'}
        />
        <TouchableOpacity onPress={() => router.replace('/calibration')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scroll: {
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
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  pillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  pillTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
    gap: 16,
    alignItems: 'center',
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
