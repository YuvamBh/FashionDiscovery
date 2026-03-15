import {
  View,
  Text,
  StyleSheet,
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

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

const BRANDS = [
  // Sportswear / Mainstream
  { label: 'Nike', colors: ['#ffffff', '#aaaaaa'] },
  { label: 'Adidas', colors: ['#000000', '#333333'] },
  { label: 'New Balance', colors: ['#cfd8dc', '#90a4ae'] },
  { label: 'Asics', colors: ['#2874a6', '#1b4f72'] },
  
  // Streetwear / Skate
  { label: 'Stüssy', colors: ['#f1c40f', '#d35400'] },
  { label: 'Supreme', colors: ['#e74c3c', '#c0392b'] },
  { label: 'Carhartt WIP', colors: ['#d68910', '#935116'] },
  { label: 'Palace', colors: ['#ffffff', '#000000'] },

  // Gorpcore / Outdoor
  { label: "Arc'teryx", colors: ['#2c3e50', '#1a252f'] },
  { label: 'Salomon', colors: ['#aeb6bf', '#5d6d7e'] },
  { label: 'The North Face', colors: ['#000000', '#4a4a4a'] },

  // Contemporary / Premium
  { label: 'Acne Studios', colors: ['#ffb6c1', '#db7093'] },
  { label: 'Aimé Leon Dore', colors: ['#2e4053', '#1b2631'] },
  { label: 'Our Legacy', colors: ['#e67e22', '#d35400'] },
  { label: 'Diesel', colors: ['#e74c3c', '#c0392b'] },
  
  // Luxury / Designer
  { label: 'Balenciaga', colors: ['#5dade2', '#2874a6'] },
  { label: 'Prada', colors: ['#000000', '#333333'] },
  { label: 'Bottega Veneta', colors: ['#58d68d', '#1d8348'] },
  { label: 'Jil Sander', colors: ['#d5d8dc', '#808b96'] },
  { label: 'Maison Margiela', colors: ['#8c8c8c', '#4a4a4a'] },

  // Avant-Garde / Opium
  { label: 'Rick Owens', colors: ['#2b2b2b', '#000000'] },
  { label: 'Chrome Hearts', colors: ['#000000', '#222222'] },
  { label: 'Vivienne Westwood', colors: ['#9b59b6', '#8e44ad'] },
  { label: 'Yohji Yamamoto', colors: ['#000000', '#111111'] },
];

function AnimatedPill({ label, isSelected, onPress, colors }: { label: string, isSelected: boolean, onPress: () => void, colors?: string[] }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => scale.value = withSpring(0.9)}
        onPressOut={() => scale.value = withSpring(1)}
        onPress={onPress}
        style={[
          styles.pill,
          isSelected && styles.pillSelected,
          colors && isSelected && { borderColor: 'transparent' }
        ]}
      >
        {isSelected && colors ? (
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 30, overflow: 'hidden' }]}>
            <GradientBackground colors={colors as [string, string, ...string[]]} />
          </View>
        ) : null}
        <Text style={[styles.pillText, isSelected && styles.pillTextSelected, colors && isSelected && { color: '#fff' }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function BrandsScreen() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
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
    setSelectedBrands((prev) => 
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleContinue = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      // Fetch existing preferences
      const { data: userProfile } = await supabase
        .from('users')
        .select('fashion_preferences')
        .eq('id', data.user.id)
        .single();
        
      const currentPrefs = userProfile?.fashion_preferences || {};
      
      await updateUserProfile(data.user.id, { 
        fashion_preferences: { ...currentPrefs, brands: selectedBrands } 
      });
    }
    setLoading(false);
    router.push('/fit');
  };

  const isFormComplete = selectedBrands.length > 0;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#0a0a0a', '#111', '#050505']} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={titleStyle}>
          <Text style={styles.stepLabel}>03 — BRANDS</Text>
          <Text style={styles.title}>What's in{'\n'}your closet?</Text>
          <Text style={styles.subtitle}>
            Select the designers and brands you wear or aspire to wear.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.section, contentStyle]}>
          <View style={styles.pillContainer}>
            {BRANDS.map((item) => (
              <AnimatedPill
                key={item.label}
                label={item.label}
                colors={item.colors}
                isSelected={selectedBrands.includes(item.label)}
                onPress={() => toggleBrand(item.label)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedButton
          title={loading ? 'Saving...' : 'Continue →'}
          onPress={handleContinue}
          disabled={!isFormComplete || loading}
          variant={isFormComplete ? 'primary' : 'secondary'}
        />
        <Pressable onPress={() => router.push('/fit')}>
          <Text style={styles.skipText}>Skip for now</Text>
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
  section: {
    gap: 16,
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
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  pillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
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
