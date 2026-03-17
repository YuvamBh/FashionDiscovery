import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { deleteAccount } from '../lib/users';
import { getUserSignalCount } from '../lib/signals';
import { useFeedStore } from '../store/feedStore';
import { TabBar } from '../components/TabBar';
import { AnimatedButton } from '../components/AnimatedButton';
import { useHaptics } from '../lib/useHaptics';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, fetchProfile, userId, clearAuth, signOutUser } = useAuthStore();
  const haptics = useHaptics();
  const savedCount = useFeedStore((s) => s.savedItems.length);
  const [signalCount, setSignalCount] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const influenceWidth = useSharedValue(0);

  // Fetch profile + live signal count on mount
  useEffect(() => {
    if (!userId) return;
    if (!profile) fetchProfile(userId);
    getUserSignalCount(userId).then(({ count }) => setSignalCount(count));
  }, [userId]);

  useEffect(() => {
    if (profile) {
      influenceWidth.value = withTiming(profile.authority_score ?? 0, { duration: 1000 });
    }
  }, [profile]);

  const influenceStyle = useAnimatedStyle(() => ({
    width: `${influenceWidth.value}%` as any,
  }));

  const handleSignOut = async () => {
    haptics.light();
    await signOutUser();
    // _layout.tsx onAuthStateChange also handles this, but store method is more robust
    router.replace('/');
  };

  const handleDeleteAccount = () => {
    haptics.warning();
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data — signals, taste profile, everything. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => haptics.selection() },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!userId) return;
            setIsDeleting(true);
            haptics.heavy();
            
            const { error } = await deleteAccount(userId);
            
            if (error) {
              console.error('[Profile] Delete error:', error);
              haptics.error();
              Alert.alert(
                'Deletion Failed',
                'Make sure you have run the delete_user SQL function in your Supabase Editor.'
              );
              setIsDeleting(false);
              return;
            }

            haptics.success();
            await signOutUser();
            router.replace('/');
          },
        },
      ],
    );
  };

  if (!profile && !userId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingDash}>—</Text>
      </View>
    );
  }

  const displayName = profile?.display_name ?? 'Discoverer';
  const email = profile?.email ?? '';
  const avatarUrl = profile?.avatar_url ?? null;
  const aestheticVibe = profile?.aesthetic_vibe ?? null;
  const energies = profile?.fashion_preferences?.energies ?? [];
  const brandAffinity = profile?.fashion_preferences?.brand_affinity ?? [];
  const totalSignals = signalCount ?? profile?.total_signals ?? 0;
  const authorityScore = profile?.authority_score ?? 0;
  const authorityLevel =
    authorityScore >= 75
      ? 'Taste Authority'
      : authorityScore >= 40
      ? 'Rising Tastemaker'
      : 'New Discoverer';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.headerLabel}>PROFILE</Text>
        </View>

        {/* IDENTITY */}
        <View style={styles.identity}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.identityInfo}>
            <Text style={styles.displayName}>{displayName}</Text>
            {profile?.user_tag && (
              <Text style={styles.userTag}>{profile.user_tag}</Text>
            )}
            <Text style={styles.email}>{email}</Text>
            {aestheticVibe && (
              <View style={styles.vibeBadge}>
                <Text style={styles.vibeBadgeText}>{aestheticVibe.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSignals}</Text>
            <Text style={styles.statLabel}>SIGNALS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(authorityScore)}</Text>
            <Text style={styles.statLabel}>AUTHORITY</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{savedCount}</Text>
            <Text style={styles.statLabel}>SAVED</Text>
          </View>
        </View>

        {/* TASTE SECTION */}
        {energies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR ENERGY</Text>
            <View style={styles.pillsRow}>
              {energies.map((e: string) => (
                <View key={e} style={styles.pill}>
                  <Text style={styles.pillText}>{e}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* BRAND AFFINITY */}
        {brandAffinity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR BRANDS</Text>
            <View style={styles.pillsRow}>
              {brandAffinity.map((b: string) => (
                <View key={b} style={styles.pill}>
                  <Text style={styles.pillText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* INFLUENCE BAR */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INFLUENCE</Text>
          <View style={styles.influenceTrack}>
            <Animated.View style={[styles.influenceFill, influenceStyle]} />
          </View>
          <Text style={styles.influenceCaption}>
            Your signals carry <Text style={styles.influenceLevelText}>{authorityLevel}</Text> weight with brands
          </Text>
        </View>

        {/* SIGN OUT */}
        <View style={styles.actionSection}>
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>

        {/* DELETE ACCOUNT */}
        <View style={styles.deleteSection}>
          <Pressable
            style={[styles.deleteButton, isDeleting && { opacity: 0.5 }]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#8A4A4A" />
            ) : (
              <Text style={styles.deleteText}>Delete account</Text>
            )}
          </Pressable>
          <Text style={styles.deleteCaption}>Permanently removes your account and all data.</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDash: {
    fontFamily: fonts.body,
    fontSize: size.xl,
    color: colors.text.tertiary,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: space[7],
  },
  headerLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    textTransform: 'uppercase',
  },
  identity: {
    marginTop: space[8],
    paddingHorizontal: space[7],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[5],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bg.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.display,
    fontSize: size.xxl,
    color: colors.text.primary,
  },
  identityInfo: {
    flex: 1,
  },
  displayName: {
    fontFamily: fonts.display,
    fontSize: size.xl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    marginTop: space[1],
  },
  userTag: {
    fontFamily: fonts.display,
    fontSize: size.sm,
    color: colors.text.secondary,
    letterSpacing: tracking.widest,
    marginTop: space[1],
  },
  vibeBadge: {
    marginTop: space[2],
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    alignSelf: 'flex-start',
  },
  vibeBadgeText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.secondary,
    letterSpacing: tracking.widest,
  },
  statsRow: {
    marginTop: space[8],
    marginHorizontal: space[7],
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space[5],
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: size.xxl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    marginTop: space[1],
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
  },
  section: {
    marginTop: space[8],
    paddingHorizontal: space[7],
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    textTransform: 'uppercase',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    marginTop: space[3],
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
  },
  pillText: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.secondary,
    letterSpacing: tracking.wide,
  },
  influenceTrack: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginTop: space[3],
  },
  influenceFill: {
    height: 1,
    backgroundColor: colors.text.primary,
  },
  influenceCaption: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    marginTop: space[2],
  },
  influenceLevelText: {
    color: colors.text.secondary,
  },
  actionSection: {
    marginTop: space[10],
    paddingHorizontal: space[7],
  },
  signOutButton: {
    paddingVertical: space[4],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  signOutText: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    letterSpacing: tracking.wide,
  },
  deleteSection: {
    marginTop: space[4],
    paddingHorizontal: space[7],
    alignItems: 'center',
    gap: space[2],
  },
  deleteButton: {
    width: '100%',
    paddingVertical: space[4],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#3a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: '#8A4A4A',
    textAlign: 'center',
    letterSpacing: tracking.wide,
  },
  deleteCaption: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    opacity: 0.5,
  },
  devSection: {
    marginTop: space[6],
    paddingHorizontal: space[7],
    flexDirection: 'row',
    gap: 8,
  },
  devButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
    alignItems: 'center',
  },
  devButtonText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#444',
    letterSpacing: 1,
  },
});
