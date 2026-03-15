import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';

// Extended searchable list
const BRAND_DATABASE = [
  'Nike', 'Adidas', 'New Balance', 'Salomon', 'Asics', 
  'Arc\'teryx', 'The North Face', 'Patagonia',
  'Acne Studios', 'Aime Leon Dore', 'Stussy', 'Supreme', 'Carhartt WIP',
  'Rick Owens', 'Balenciaga', 'Bottega Veneta', 'Jil Sander', 'Prada',
  'Maison Margiela', 'Chrome Hearts', 'Our Legacy', 'Vivienne Westwood',
  'Kith', 'Brain Dead', 'A-COLD-WALL*', 'Fear of God', 'Off-White',
  'Loewe', 'Marni', 'Jacquemus', 'A.P.C.', 'Ami Paris'
];

export default function BrandAffinityScreen() {
  const { brandAffinity, setBrandAffinity } = useCalibrationStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return BRAND_DATABASE.slice(0, 15); // Show suggestions by default
    return BRAND_DATABASE.filter(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const toggleBrand = (brand: string) => {
    Keyboard.dismiss();
    if (brandAffinity.includes(brand)) {
      setBrandAffinity(brandAffinity.filter(b => b !== brand));
    } else {
      setBrandAffinity([...brandAffinity, brand]);
    }
  };

  const handleContinue = () => {
    router.push('/(calibration)/current-wardrobe');
  };

  const isComplete = brandAffinity.length > 0;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111', '#050505']} />
      <ProgressHeader currentStep={2} />
      
      <KeyboardAvoidingView style={styles.innerContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Which brands feel most like you?</Text>
          <Text style={styles.subtitle}>Brands you wear, or brands you admire.</Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search brands..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>

          {brandAffinity.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={styles.sectionLabel}>Selected</Text>
              <View style={styles.grid}>
                {brandAffinity.map((brand) => (
                  <Pressable key={`sel-${brand}`} style={[styles.pill, styles.pillSelected]} onPress={() => toggleBrand(brand)}>
                    <Text style={[styles.pillText, styles.pillTextSelected]}>{brand}  ×</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.suggestionSection}>
            <Text style={styles.sectionLabel}>{searchQuery ? 'Results' : 'Suggestions'}</Text>
            <View style={styles.grid}>
              {filteredBrands.filter(b => !brandAffinity.includes(b)).map((brand) => (
                <Pressable key={`sug-${brand}`} style={styles.pill} onPress={() => toggleBrand(brand)}>
                  <Text style={styles.pillText}>+  {brand}</Text>
                </Pressable>
              ))}
              {filteredBrands.length === 0 && (
                <Text style={styles.emptyText}>No brands found matching "{searchQuery}"</Text>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <AnimatedButton
            title="Continue →"
            onPress={handleContinue}
            disabled={!isComplete}
            variant={isComplete ? 'primary' : 'secondary'}
          />
          <Pressable onPress={() => router.push('/(calibration)/current-wardrobe')}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  innerContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
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
  searchContainer: {
    marginBottom: 32,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
  },
  sectionLabel: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  selectedSection: {
    marginBottom: 32,
  },
  suggestionSection: {
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
    color: 'rgba(255,255,255,0.8)',
  },
  pillTextSelected: {
    color: '#000',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 8,
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
