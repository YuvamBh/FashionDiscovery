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

const CATEGORIES = [
  { 
    id: 'outerwear', 
    label: 'Outerwear', 
    desc: 'Jackets, Coats, Blazers',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'knitwear', 
    label: 'Knitwear', 
    desc: 'Sweaters, Cardigans',
    image: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'shirting', 
    label: 'Shirting', 
    desc: 'Button-downs, Flannels',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'tees', 
    label: 'Tees & Hoodies', 
    desc: 'Everyday staples',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'denim_pants', 
    label: 'Bottoms', 
    desc: 'Denim, Trousers, Cargos',
    image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'footwear', 
    label: 'Footwear', 
    desc: 'Sneakers, Boots, Loafers',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop'
  },
];

function CategoryCard({ category, isSelected, onPress }: { category: typeof CATEGORIES[0], isSelected: boolean, onPress: () => void }) {
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
        <Image source={{ uri: category.image }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
          <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
            {category.label}
          </Text>
          <Text style={styles.cardDesc}>
            {category.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function CategoriesSetup() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => 
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
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
        fashion_preferences: { ...currentPrefs, target_categories: selectedCategories } 
      });
    }
    setLoading(false);
    router.push('/curating');
  };

  const isFormComplete = selectedCategories.length > 0;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#0a0a0a', '#0f0f0f', '#000000']} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={titleStyle}>
          <Text style={styles.stepLabel}>05 — PRIORITIES</Text>
          <Text style={styles.title}>What are you{'\n'}hunting for?</Text>
          <Text style={styles.subtitle}>
            Select the pieces you're most interested in discovering right now.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.grid, gridStyle]}>
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategories.includes(cat.id)}
              onPress={() => toggleCategory(cat.id)}
            />
          ))}
        </Animated.View>
      </ScrollView>

      <Animated.View style={[styles.footer, ctaStyle]}>
        <AnimatedButton
          title={loading ? 'Saving...' : 'Complete Profile  →'}
          onPress={handleContinue}
          disabled={!isFormComplete || loading}
          variant={isFormComplete ? 'primary' : 'secondary'}
        />
        <Pressable onPress={() => router.push('/curating')}>
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
    aspectRatio: 1,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
