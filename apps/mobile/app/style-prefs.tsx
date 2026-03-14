import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { mergeTasteProfile } from '../lib/users';

const AESTHETICS = [
  { id: 'minimal', label: 'Minimal', desc: 'Clean lines, muted tones' },
  { id: 'streetwear', label: 'Streetwear', desc: 'Oversized, bold graphics' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium fabrics, tailored cuts' },
  { id: 'y2k', label: 'Y2K / Retro', desc: 'Nostalgic, playful details' },
  { id: 'avantgarde', label: 'Avant-garde', desc: 'Experimental, conceptual' },
  { id: 'casual', label: 'Casual', desc: 'Everyday comfort-first' },
  { id: 'workwear', label: 'Workwear', desc: 'Utility, durable, functional' },
  { id: 'athleisure', label: 'Athleisure', desc: 'Sport-inspired, performance' },
];

const BRANDS = [
  'Acne Studios', 'A.P.C.', "Arc'teryx", 'Aime Leon Dore',
  'Balenciaga', 'Carhartt WIP', 'Celine', 'Fear of God',
  'Jacquemus', 'Kith', 'Lemaire', 'Maison Margiela',
  'Nike ACG', 'Noah', 'Off-White', 'Our Legacy',
  'Rick Owens', 'Sporty & Rich', 'Stone Island', 'Stüssy',
  'The Row', 'Vetements', 'Yohji Yamamoto', 'Y-3',
];

const PRICE_RANGES = [
  { id: 'budget', label: 'Budget', desc: 'Under $100' },
  { id: 'mid', label: 'Mid-range', desc: '$100 – $300' },
  { id: 'premium', label: 'Premium', desc: '$300 – $800' },
  { id: 'luxury', label: 'Luxury', desc: '$800+' },
  { id: 'mixed', label: 'No limit', desc: 'Depends on the piece' },
];

const SHOPPING_STYLES = [
  { id: 'early', label: 'Early Adopter', desc: 'I set trends, not follow them' },
  { id: 'classics', label: 'Quality Investor', desc: 'Timeless pieces that last' },
  { id: 'mixed', label: 'Mixed Signals', desc: 'Trend pieces + wardrobe classics' },
  { id: 'vintage', label: 'Thrift & Archive', desc: 'Vintage finds, hidden gems' },
];

export default function StylePrefs() {
  const [aesthetics, setAesthetics] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [shoppingStyle, setShoppingStyle] = useState<string | null>(null);

  const toggleAesthetic = (id: string) =>
    setAesthetics(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleBrand = (name: string) =>
    setBrands(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);

  const canContinue = aesthetics.length > 0;

  const handleContinue = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await mergeTasteProfile(data.user.id, {
        styles: aesthetics,
        brands,
        price_range: priceRange,
        shopping_style: shoppingStyle,
        prefs_set_at: new Date().toISOString(),
      });
    }
    router.replace('/calibration');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.pageHeader}>
          <Text style={styles.stepLabel}>02 — TASTE PROFILE</Text>
          <Text style={styles.pageTitle}>Tell us about{'\n'}your style.</Text>
          <Text style={styles.pageSubtitle}>
            This shapes your feed and how much weight{'\n'}your signals carry with brands.
          </Text>
        </View>

        {/* Aesthetic */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>YOUR AESTHETIC</Text>
            <Text style={styles.sectionHint}>Select all that apply</Text>
          </View>
          <View style={styles.tileGrid}>
            {AESTHETICS.map(item => {
              const on = aesthetics.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.tile, on && styles.tileOn]}
                  onPress={() => toggleAesthetic(item.id)}
                  activeOpacity={0.75}
                >
                  {on && <Text style={styles.tileCheck}>✓</Text>}
                  <Text style={[styles.tileLabel, on && styles.tileLabelOn]}>{item.label}</Text>
                  <Text style={[styles.tileDesc, on && styles.tileDescOn]}>{item.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Brands */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BRANDS YOU FOLLOW</Text>
            <Text style={styles.sectionHint}>Pick up to 8</Text>
          </View>
          <View style={styles.chipWrap}>
            {BRANDS.map(brand => {
              const on = brands.includes(brand);
              const maxed = brands.length >= 8 && !on;
              return (
                <TouchableOpacity
                  key={brand}
                  style={[styles.chip, on && styles.chipOn, maxed && styles.chipDim]}
                  onPress={() => !maxed && toggleBrand(brand)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{brand}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Price range */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PRICE SWEET SPOT</Text>
            <Text style={styles.sectionHint}>Select one</Text>
          </View>
          {PRICE_RANGES.map(item => {
            const on = priceRange === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, on && styles.rowOn]}
                onPress={() => setPriceRange(item.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.dot, on && styles.dotOn]} />
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, on && styles.rowLabelOn]}>{item.label}</Text>
                  <Text style={styles.rowDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Shopping style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HOW YOU SHOP</Text>
            <Text style={styles.sectionHint}>Select one</Text>
          </View>
          {SHOPPING_STYLES.map(item => {
            const on = shoppingStyle === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, on && styles.rowOn]}
                onPress={() => setShoppingStyle(item.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.dot, on && styles.dotOn]} />
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, on && styles.rowLabelOn]}>{item.label}</Text>
                  <Text style={styles.rowDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnOff]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            {canContinue ? 'Continue  →' : 'Pick your aesthetic first'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/calibration')}>
          <Text style={styles.skipText}>Skip all</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { paddingBottom: 140 },
  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
  },
  stepLabel: {
    fontSize: 10, fontWeight: '600', color: '#2a2a2a',
    letterSpacing: 3, marginBottom: 16,
  },
  pageTitle: {
    fontFamily: 'Georgia',
    fontSize: 44, color: '#fff',
    lineHeight: 50, letterSpacing: -1.2, marginBottom: 12,
  },
  pageSubtitle: { fontSize: 14, color: '#3a3a3a', lineHeight: 23 },
  section: { paddingHorizontal: 24, marginBottom: 40 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'baseline', marginBottom: 16,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#111',
  },
  sectionTitle: { fontSize: 10, fontWeight: '700', color: '#333', letterSpacing: 2.5 },
  sectionHint: { fontSize: 10, color: '#2a2a2a' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '47%', backgroundColor: '#0e0e0e',
    borderWidth: 1, borderColor: '#161616',
    borderRadius: 12, padding: 16, minHeight: 80,
    justifyContent: 'flex-end', position: 'relative',
  },
  tileOn: { backgroundColor: '#fff', borderColor: '#fff' },
  tileCheck: {
    position: 'absolute', top: 12, right: 14,
    fontSize: 11, fontWeight: '700', color: '#0a0a0a',
  },
  tileLabel: { fontSize: 14, fontWeight: '700', color: '#666', marginBottom: 3 },
  tileLabelOn: { color: '#0a0a0a' },
  tileDesc: { fontSize: 11, color: '#252525', lineHeight: 15 },
  tileDescOn: { color: '#555' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: '#0e0e0e',
    borderWidth: 1, borderColor: '#161616', borderRadius: 20,
  },
  chipOn: { backgroundColor: '#fff', borderColor: '#fff' },
  chipDim: { opacity: 0.22 },
  chipText: { fontSize: 13, color: '#444' },
  chipTextOn: { color: '#0a0a0a', fontWeight: '600' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: '#0e0e0e',
    borderWidth: 1, borderColor: '#161616',
    borderRadius: 10, marginBottom: 8,
  },
  rowOn: { borderColor: '#fff', backgroundColor: '#111' },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#252525',
  },
  dotOn: { borderColor: '#fff', backgroundColor: '#fff' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 2 },
  rowLabelOn: { color: '#fff' },
  rowDesc: { fontSize: 12, color: '#252525' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 48, paddingTop: 16,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1, borderTopColor: '#111',
    gap: 14, alignItems: 'center',
  },
  continueBtn: {
    backgroundColor: '#fff', borderRadius: 10,
    paddingVertical: 17, alignItems: 'center', width: '100%',
  },
  continueBtnOff: { opacity: 0.2 },
  continueBtnText: { color: '#0a0a0a', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  skipText: { color: '#252525', fontSize: 12, textDecorationLine: 'underline' },
});
