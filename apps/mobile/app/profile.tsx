import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, size, space, tracking, radius } from '../lib/tokens';
import { TabBar } from '../components/TabBar';
import { useCalibrationStore } from '../store/calibrationStore';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { preferredStyles, brandAffinity, styleAspiration } = useCalibrationStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>YOUR PROFILE</Text>
          <Text style={styles.headerTitle}>
            {styleAspiration ?? 'Style Explorer'}
          </Text>
        </View>

        {preferredStyles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Taste Fingerprint</Text>
            <View style={styles.pillsContainer}>
              {preferredStyles.map((style) => (
                <View key={style} style={styles.pill}>
                  <Text style={styles.pillText}>{style}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {brandAffinity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Brands</Text>
            <View style={styles.pillsContainer}>
              {brandAffinity.map((brand) => (
                <View key={brand} style={styles.pill}>
                  <Text style={styles.pillText}>{brand}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>FashionDiscovery Beta 1.0</Text>
        </View>
      </ScrollView>

      <TabBar active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: space[7],
    paddingTop: space[7],
    paddingBottom: space[5],
  },
  headerLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: tracking.widest,
    marginBottom: space[2],
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: size.xxxl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
  },
  section: {
    marginTop: space[8],
    paddingHorizontal: space[7],
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: tracking.widest,
    marginBottom: space[4],
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  pill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.strong,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
  },
  pillText: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.secondary,
  },
  footer: {
    marginTop: space[12],
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    textTransform: 'uppercase',
  },
});
