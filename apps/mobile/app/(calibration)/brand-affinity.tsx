import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';
import { searchBrands, requestBrand, Brand } from '../../lib/brands';
import { supabase } from '../../lib/supabase';
import { colors, fonts, size, space, tracking } from '../../lib/tokens';

export default function BrandAffinityScreen() {
  const { brandAffinity, setBrandAffinity } = useCalibrationStore();
  const [query, setQuery] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [selected, setSelected] = useState<string[]>(brandAffinity);
  const [userId, setUserId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      setUserId(authData.user?.id ?? null);
      const { data: brandData } = await searchBrands('');
      setBrands(brandData);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await searchBrands(query);
      setBrands(data);
      setLoading(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const showNotFound = query.trim().length >= 2 && brands.length === 0 && !loading;

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name],
    );
  };

  const handleRequest = async () => {
    if (!userId) return;
    setRequesting(true);
    await requestBrand(query, userId);
    setRequesting(false);
    setRequested(true);
  };

  const handleContinue = () => {
    setBrandAffinity(selected);
    router.push('/(calibration)/visual-vibe');
  };

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111111', '#050505']} />
      <ProgressHeader currentStep={2} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.question}>Which of these{'\n'}feels like you?</Text>
        <Text style={styles.subtext}>Not about price. About energy.</Text>

        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.search}
            placeholder="Search brands..."
            placeholderTextColor={colors.text.tertiary}
            value={query}
            onChangeText={(t) => {
              setRequested(false);
              setQuery(t);
            }}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {loading ? (
          <View style={styles.pillsRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={styles.skeleton} />
            ))}
          </View>
        ) : (
          <View style={styles.pillsRow}>
            {brands.map((brand) => {
              const isSelected = selected.includes(brand.name);
              return (
                <Pressable
                  key={brand.id}
                  onPress={() => toggle(brand.name)}
                  style={[styles.pill, isSelected && styles.pillSelected]}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {brand.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {showNotFound && (
          <View style={styles.notFound}>
            <Text style={styles.notFoundTitle}>"{query}" isn't in our list yet.</Text>
            <Text style={styles.notFoundSubtext}>Want us to add them?</Text>

            {!requested ? (
              <Pressable
                style={styles.requestBtn}
                onPress={handleRequest}
                disabled={requesting || !userId}
              >
                <Text style={styles.requestBtnText}>
                  {requesting ? 'Requesting...' : `Request ${query}`.toUpperCase()}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.requestedText}>✓  Request sent. We'll add them soon.</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedButton title="Continue →" onPress={handleContinue} variant="primary" />
        <Pressable onPress={() => router.push('/(calibration)/visual-vibe')}>
          <Text style={styles.skip}>Skip — I'll discover as I go</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    paddingHorizontal: space[7],
    paddingTop: space[6],
    paddingBottom: 140,
  },
  question: {
    fontFamily: fonts.display,
    fontSize: size.xxxl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
    lineHeight: 48,
  },
  subtext: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.tertiary,
    marginTop: space[2],
    marginBottom: space[5],
  },
  searchWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
    marginBottom: space[5],
  },
  search: {
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.primary,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
  },
  skeleton: {
    width: 90,
    height: 44,
    backgroundColor: colors.bg.elevated,
    opacity: 0.3,
  },
  pill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    paddingVertical: 14,
    paddingHorizontal: space[5],
  },
  pillSelected: {
    borderColor: colors.text.primary,
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: size.base,
    color: colors.text.tertiary,
  },
  pillTextSelected: {
    color: colors.text.primary,
  },
  notFound: {
    marginTop: space[6],
    padding: space[5],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  notFoundTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: size.base,
    color: colors.text.secondary,
  },
  notFoundSubtext: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    marginTop: space[2],
  },
  requestBtn: {
    marginTop: space[4],
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.strong,
    alignItems: 'center',
  },
  requestBtnText: {
    fontFamily: fonts.displayMedium,
    fontSize: size.xs,
    color: colors.text.primary,
    letterSpacing: tracking.widest,
  },
  requestedText: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.secondary,
    marginTop: space[4],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space[7],
    paddingBottom: 52,
    paddingTop: space[4],
    gap: space[4],
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
  },
  skip: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
  },
});
