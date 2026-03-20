import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import { updateUserProfile } from '../lib/users';
import { getUserSignalCount } from '../lib/signals';
import { TabBar } from '../components/TabBar';
import { useHaptics } from '../lib/useHaptics';
import { supabase } from '../lib/supabase';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatJoinDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const BUDGET_LABELS: Record<string, string> = {
  under_100: 'Under $100',
  '100_300': '$100–300',
  '300_600': '$300–600',
  '600_1000': '$600–1k',
  '1000_plus': '$1k+',
};

const FREQ_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  seasonally: 'Seasonally',
  rarely: 'Rarely',
};

// ── sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={subStyles.sectionLabel}>{label}</Text>
  );
}

function Divider() {
  return <View style={subStyles.divider} />;
}

function InfoRow({
  label,
  value,
  onPress,
  isEditing,
}: {
  label: string;
  value: string | null | undefined;
  onPress?: () => void;
  isEditing: boolean;
}) {
  return (
    <Pressable
      style={subStyles.infoRow}
      onPress={isEditing ? onPress : undefined}
      disabled={!isEditing}
    >
      <Text style={subStyles.infoLabel}>{label}</Text>
      <View style={subStyles.infoRight}>
        {value ? (
          <Text style={subStyles.infoValue}>{value}</Text>
        ) : (
          <Text style={subStyles.infoEmpty}>Set</Text>
        )}
        {isEditing && <Text style={subStyles.infoChevron}>›</Text>}
      </View>
    </Pressable>
  );
}

function PickerOptions({
  options,
  selected,
  onSelect,
}: {
  options: Array<{ value: string; label: string }>;
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={subStyles.pickerOptions}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={subStyles.pickerOption}
          onPress={() => onSelect(opt.value)}
        >
          <Text
            style={[
              subStyles.pickerOptionText,
              selected === opt.value && subStyles.pickerOptionSelected,
            ]}
          >
            {opt.label}
          </Text>
          {selected === opt.value && (
            <Text style={subStyles.pickerCheck}>✓</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

// ── picker data ───────────────────────────────────────────────────────────────

const AGE_OPTIONS = [
  { value: '16-20', label: '16 – 20' },
  { value: '21-25', label: '21 – 25' },
  { value: '26-30', label: '26 – 30' },
  { value: '31-35', label: '31 – 35' },
  { value: '36-40', label: '36 – 40' },
  { value: '40+', label: '40+' },
];

const GENDER_OPTIONS = [
  { value: 'masculine', label: 'Masculine' },
  { value: 'feminine', label: 'Feminine' },
  { value: 'androgynous', label: 'Androgynous' },
  { value: 'fluid', label: 'Gender fluid' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

const BUDGET_OPTIONS = [
  { value: 'under_100', label: 'Under $100' },
  { value: '100_300', label: '$100 – $300' },
  { value: '300_600', label: '$300 – $600' },
  { value: '600_1000', label: '$600 – $1,000' },
  { value: '1000_plus', label: '$1,000+' },
];

const FREQ_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'seasonally', label: 'Each season' },
  { value: 'rarely', label: 'Rarely' },
];

// ── main component ────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, fetchProfile, userId, signOutUser } = useAuthStore();
  const haptics = useHaptics();
  const savedCount = useFeedStore((s) => s.savedItems.length);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [signalCount, setSignalCount] = useState<number | null>(null);
  const [expandedPicker, setExpandedPicker] = useState<string | null>(null);

  // Draft fields
  const [draftBio, setDraftBio] = useState('');
  const [draftInstagram, setDraftInstagram] = useState('');
  const [draftAgeRange, setDraftAgeRange] = useState<string | null>(null);
  const [draftGender, setDraftGender] = useState<string | null>(null);
  const [draftCity, setDraftCity] = useState('');
  const [draftBudget, setDraftBudget] = useState<string | null>(null);
  const [draftFrequency, setDraftFrequency] = useState<string | null>(null);

  // Animated values
  const influenceWidth = useSharedValue(0);
  const completionWidth = useSharedValue(0);

  useEffect(() => {
    if (!userId) return;
    if (!profile) fetchProfile(userId);
    getUserSignalCount(userId).then(({ count }) => setSignalCount(count));
  }, [userId]);

  useEffect(() => {
    if (profile) {
      influenceWidth.value = withTiming(profile.authority_score ?? 0, { duration: 1000 });
      completionWidth.value = withTiming(profile.profile_completion_score ?? 0, { duration: 1200 });
    }
  }, [profile]);

  const influenceStyle = useAnimatedStyle(() => ({
    width: `${influenceWidth.value}%` as any,
  }));
  const completionStyle = useAnimatedStyle(() => ({
    width: `${completionWidth.value}%` as any,
  }));

  // ── edit flow ───────────────────────────────────────────────────────────────

  const onPressEdit = () => {
    setDraftBio(profile?.bio ?? '');
    setDraftInstagram(profile?.instagram_handle ?? '');
    setDraftAgeRange(profile?.age_range ?? null);
    setDraftGender(profile?.gender_expression ?? null);
    setDraftCity(profile?.location_city ?? '');
    setDraftBudget(profile?.budget_range ?? null);
    setDraftFrequency(profile?.shopping_frequency ?? null);
    haptics.light();
    setIsEditing(true);
  };

  const onPressDone = async () => {
    if (!userId) return;
    setIsSaving(true);
    haptics.medium();
    const updates = {
      bio: draftBio || null,
      instagram_handle: draftInstagram || null,
      age_range: draftAgeRange,
      gender_expression: draftGender,
      location_city: draftCity || null,
      budget_range: draftBudget,
      shopping_frequency: draftFrequency,
    };
    await updateUserProfile(userId, updates);
    await fetchProfile(userId);
    haptics.success();
    setIsEditing(false);
    setIsSaving(false);
    setExpandedPicker(null);
  };

  const onPressCancel = () => {
    haptics.light();
    setIsEditing(false);
    setExpandedPicker(null);
  };

  const togglePicker = (key: string) => {
    haptics.selection();
    setExpandedPicker((prev) => (prev === key ? null : key));
  };

  const handleToggleSwitch = async (
    field: 'notifications_enabled' | 'data_sharing_enabled',
    value: boolean,
  ) => {
    if (!userId) return;
    haptics.light();
    await updateUserProfile(userId, { [field]: value });
    await fetchProfile(userId);
  };

  // ── derived display values ──────────────────────────────────────────────────

  const displayName = profile?.display_name ?? 'Discoverer';
  const avatarUrl = profile?.avatar_url ?? null;
  const vibeTag = profile?.user_tag ?? null;
  const energies = profile?.fashion_preferences?.energies ?? [];
  const brandAffinity = profile?.fashion_preferences?.brand_affinity ?? [];
  const completionScore = profile?.profile_completion_score ?? 0;
  const authorityScore = profile?.authority_score ?? 0;
  const authorityLevel =
    authorityScore >= 75
      ? 'Taste Authority'
      : authorityScore >= 40
      ? 'Rising Tastemaker'
      : 'New Discoverer';
  const totalSignals = signalCount ?? profile?.total_signals ?? 0;

  if (!profile && !userId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingDash}>—</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── HEADER ── */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerLabel}>PROFILE</Text>
          <View style={styles.headerActions}>
            {!isEditing ? (
              <Pressable onPress={onPressEdit}>
                <Text style={styles.headerActionPrimary}>Edit</Text>
              </Pressable>
            ) : (
              <View style={styles.headerEditRow}>
                <Pressable onPress={onPressCancel}>
                  <Text style={styles.headerActionSecondary}>Cancel</Text>
                </Pressable>
                <Pressable onPress={onPressDone} disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color={colors.text.primary} />
                  ) : (
                    <Text style={styles.headerActionPrimary}>Done</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* ── SECTION 1: IDENTITY ── */}
        <View style={styles.identity}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.identityInfo}>
            <Text style={styles.displayName}>{displayName}</Text>
            {vibeTag && (
              <Text style={styles.vibeTag}>{vibeTag}</Text>
            )}
            <Text style={styles.email}>{profile?.email ?? ''}</Text>
            {profile?.aesthetic_vibe && (
              <View style={styles.aestheticBadge}>
                <Text style={styles.aestheticBadgeText}>
                  {profile.aesthetic_vibe.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioContainer}>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              value={draftBio}
              onChangeText={setDraftBio}
              placeholder="Your aesthetic in a sentence..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              maxLength={120}
            />
          ) : (
            <Text style={profile?.bio ? styles.bioText : styles.bioEmpty}>
              {profile?.bio ?? 'Add a bio →'}
            </Text>
          )}
        </View>

        {/* Instagram */}
        {(isEditing || profile?.instagram_handle) && (
          <View style={styles.instagramContainer}>
            {isEditing ? (
              <View style={styles.instagramInputRow}>
                <Text style={styles.instagramAt}>@</Text>
                <TextInput
                  style={styles.instagramInput}
                  value={draftInstagram}
                  onChangeText={setDraftInstagram}
                  placeholder="instagram"
                  placeholderTextColor={colors.text.tertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            ) : (
              <Text style={styles.instagramHandle}>@{profile?.instagram_handle}</Text>
            )}
          </View>
        )}

        {/* Completion bar */}
        <View style={styles.completionSection}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionLabel}>PROFILE STRENGTH</Text>
            <Text style={styles.completionScore}>{completionScore}%</Text>
          </View>
          <View style={styles.completionTrack}>
            <Animated.View style={[styles.completionFill, completionStyle]} />
          </View>
          <Text style={styles.completionCaption}>
            {completionScore < 60
              ? 'Complete your profile to increase your signal weight with brands'
              : 'Strong profile. Brands see your signals clearly.'}
          </Text>
        </View>

        <Divider />

        {/* ── SECTION 2: STATS ── */}
        <SectionLabel label="ACTIVITY" />
        <View style={styles.statsGrid}>
          <View style={[styles.statCell, styles.statCellRight, styles.statCellBottom]}>
            <Text style={styles.statValue}>{totalSignals}</Text>
            <Text style={styles.statLabel}>SIGNALS</Text>
          </View>
          <View style={[styles.statCell, styles.statCellBottom]}>
            <Text style={styles.statValue}>{savedCount}</Text>
            <Text style={styles.statLabel}>SAVED</Text>
          </View>
          <View style={[styles.statCell, styles.statCellRight]}>
            <Text style={styles.statValue}>{Math.round(authorityScore)}</Text>
            <Text style={styles.statLabel}>AUTHORITY</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{formatJoinDate(profile?.created_at ?? null)}</Text>
            <Text style={styles.statLabel}>SINCE</Text>
          </View>
        </View>

        <Divider />

        {/* ── SECTION 3: TASTE DNA ── */}
        <SectionLabel label="TASTE DNA" />

        <View style={styles.influenceRow}>
          <View style={styles.influenceHeader}>
            <Text style={styles.influenceLevel}>{authorityLevel}</Text>
            <Text style={styles.influenceCaption}>signal weight</Text>
          </View>
          <View style={styles.influenceTrack}>
            <Animated.View style={[styles.influenceFill, influenceStyle]} />
          </View>
        </View>

        {energies.length > 0 ? (
          <View style={styles.pillSection}>
            <Text style={styles.pillSectionLabel}>YOUR ENERGY</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScroll}
            >
              {energies.map((e: string) => (
                <View key={e} style={styles.pill}>
                  <Text style={styles.pillText}>{e}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <Text style={styles.tastePlaceholder}>
            Signal items to build your taste profile
          </Text>
        )}

        {brandAffinity.length > 0 && (
          <View style={styles.pillSection}>
            <Text style={styles.pillSectionLabel}>YOUR BRANDS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScroll}
            >
              {brandAffinity.map((b: string) => (
                <View key={b} style={styles.pill}>
                  <Text style={styles.pillText}>{b}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <Divider />

        {/* ── SECTION 4: ACCOUNT INFO ── */}
        <SectionLabel label="ACCOUNT" />

        <InfoRow
          label="AGE RANGE"
          value={draftAgeRange ?? profile?.age_range ?? null}
          onPress={() => togglePicker('age')}
          isEditing={isEditing}
        />
        {isEditing && expandedPicker === 'age' && (
          <PickerOptions
            options={AGE_OPTIONS}
            selected={draftAgeRange}
            onSelect={(v) => { setDraftAgeRange(v); haptics.selection(); setExpandedPicker(null); }}
          />
        )}

        <InfoRow
          label="EXPRESSION"
          value={draftGender ?? profile?.gender_expression ?? null}
          onPress={() => togglePicker('gender')}
          isEditing={isEditing}
        />
        {isEditing && expandedPicker === 'gender' && (
          <PickerOptions
            options={GENDER_OPTIONS}
            selected={draftGender}
            onSelect={(v) => { setDraftGender(v); haptics.selection(); setExpandedPicker(null); }}
          />
        )}

        {isEditing ? (
          <View style={subStyles.infoRow}>
            <Text style={subStyles.infoLabel}>LOCATION</Text>
            <TextInput
              style={styles.inlineInput}
              value={draftCity}
              onChangeText={setDraftCity}
              placeholder="City"
              placeholderTextColor={colors.text.tertiary}
              autoCorrect={false}
            />
          </View>
        ) : (
          <InfoRow
            label="LOCATION"
            value={profile?.location_city ?? null}
            isEditing={false}
          />
        )}

        <InfoRow
          label="BUDGET"
          value={
            isEditing
              ? (draftBudget ? BUDGET_LABELS[draftBudget] : null)
              : (profile?.budget_range ? BUDGET_LABELS[profile.budget_range] : null)
          }
          onPress={() => togglePicker('budget')}
          isEditing={isEditing}
        />
        {isEditing && expandedPicker === 'budget' && (
          <PickerOptions
            options={BUDGET_OPTIONS}
            selected={draftBudget}
            onSelect={(v) => { setDraftBudget(v); haptics.selection(); setExpandedPicker(null); }}
          />
        )}

        <InfoRow
          label="SHOPS"
          value={
            isEditing
              ? (draftFrequency ? FREQ_LABELS[draftFrequency] : null)
              : (profile?.shopping_frequency ? FREQ_LABELS[profile.shopping_frequency] : null)
          }
          onPress={() => togglePicker('freq')}
          isEditing={isEditing}
        />
        {isEditing && expandedPicker === 'freq' && (
          <PickerOptions
            options={FREQ_OPTIONS}
            selected={draftFrequency}
            onSelect={(v) => { setDraftFrequency(v); haptics.selection(); setExpandedPicker(null); }}
          />
        )}

        <Divider />

        {/* ── SECTION 5: PREFERENCES ── */}
        <SectionLabel label="PREFERENCES" />

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Notifications</Text>
            <Text style={styles.toggleSubtitle}>Drops and taste updates</Text>
          </View>
          <Switch
            value={profile?.notifications_enabled ?? true}
            onValueChange={(v) => handleToggleSwitch('notifications_enabled', v)}
            trackColor={{ false: colors.border.default, true: colors.text.primary }}
            thumbColor={colors.bg.primary}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Data & Insights</Text>
            <Text style={styles.toggleSubtitle}>Helps improve your taste signal accuracy</Text>
          </View>
          <Switch
            value={profile?.data_sharing_enabled ?? true}
            onValueChange={(v) => handleToggleSwitch('data_sharing_enabled', v)}
            trackColor={{ false: colors.border.default, true: colors.text.primary }}
            thumbColor={colors.bg.primary}
          />
        </View>

        <Divider />

        {/* ── SECTION 6: ACCOUNT ACTIONS ── */}

        <Pressable
          style={styles.actionButton}
          onPress={async () => {
            haptics.light();
            await signOutUser();
            router.replace('/');
          }}
        >
          <Text style={styles.actionButtonText}>Sign out</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            haptics.warning();
            import('react-native').then(({ Alert }) =>
              Alert.alert(
                'Delete Account',
                'This will permanently delete your account and all your data — signals, taste profile, everything. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel', onPress: () => haptics.selection() },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      haptics.heavy();
                      await supabase.rpc('delete_user');
                      await signOutUser();
                      router.replace('/');
                    },
                  },
                ],
              ),
            );
          }}
        >
          <Text style={styles.deleteButtonText}>Delete account</Text>
        </Pressable>

        {__DEV__ && (
          <View style={styles.devSection}>
            <Pressable
              style={styles.devButton}
              onPress={async () => {
                if (userId) await updateUserProfile(userId, { onboarding_completed: false });
                router.replace('/nametag');
              }}
            >
              <Text style={styles.devButtonText}>⚡ Reset onboarding</Text>
            </Pressable>
            <Pressable
              style={styles.devButton}
              onPress={() => router.replace('/feed')}
            >
              <Text style={styles.devButtonText}>⚡ Go to feed</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>

      <TabBar active="profile" />
    </View>
  );
}

// ── sub-component styles ──────────────────────────────────────────────────────

const subStyles = StyleSheet.create({
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    textTransform: 'uppercase',
    paddingHorizontal: space[7],
    marginBottom: space[3],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
    marginVertical: space[7],
    marginHorizontal: space[7],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[7],
    paddingVertical: space[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  infoLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    flex: 1,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  infoValue: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.primary,
  },
  infoEmpty: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
  },
  infoChevron: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.tertiary,
  },
  pickerOptions: {
    backgroundColor: colors.bg.elevated,
    marginHorizontal: space[7],
    marginBottom: space[2],
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  pickerOptionText: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
  },
  pickerOptionSelected: {
    color: colors.text.primary,
  },
  pickerCheck: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.primary,
  },
});

// ── screen styles ─────────────────────────────────────────────────────────────

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
    paddingBottom: 140,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space[7],
    marginBottom: space[2],
  },
  headerLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[5],
  },
  headerActionPrimary: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.primary,
  },
  headerActionSecondary: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
  },

  // Identity
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: space[7],
    marginTop: space[8],
    gap: space[5],
  },
  avatarContainer: {},
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bg.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.display,
    fontSize: size.xxxl,
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
  vibeTag: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    marginTop: space[1],
  },
  email: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    marginTop: space[1],
  },
  aestheticBadge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: space[2],
    alignSelf: 'flex-start',
  },
  aestheticBadgeText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.secondary,
    letterSpacing: tracking.widest,
  },

  // Bio
  bioContainer: {
    paddingHorizontal: space[7],
    marginTop: space[5],
  },
  bioInput: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.primary,
    paddingVertical: space[3],
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
    backgroundColor: 'transparent',
  },
  bioText: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  bioEmpty: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.tertiary,
  },

  // Instagram
  instagramContainer: {
    paddingHorizontal: space[7],
    marginTop: space[3],
  },
  instagramInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
    paddingVertical: space[2],
  },
  instagramAt: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    marginRight: 2,
  },
  instagramInput: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.primary,
    flex: 1,
  },
  instagramHandle: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
  },

  // Completion
  completionSection: {
    paddingHorizontal: space[7],
    marginTop: space[6],
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
  },
  completionScore: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.primary,
  },
  completionTrack: {
    height: 2,
    backgroundColor: colors.border.subtle,
    marginTop: space[2],
    overflow: 'hidden',
  },
  completionFill: {
    height: 2,
    backgroundColor: colors.text.primary,
  },
  completionCaption: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    marginTop: space[2],
    lineHeight: 18,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: space[7],
  },
  statCell: {
    width: '50%',
    paddingVertical: space[5],
    alignItems: 'center',
  },
  statCellRight: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border.subtle,
  },
  statCellBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: size.xl,
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

  // Influence / taste
  influenceRow: {
    paddingHorizontal: space[7],
    marginBottom: space[5],
  },
  influenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: space[2],
  },
  influenceLevel: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.primary,
  },
  influenceCaption: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
  },
  influenceTrack: {
    height: 1,
    backgroundColor: colors.border.subtle,
    overflow: 'hidden',
  },
  influenceFill: {
    height: 1,
    backgroundColor: colors.text.primary,
  },
  pillSection: {
    paddingHorizontal: space[7],
    marginTop: space[5],
  },
  pillSectionLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    marginBottom: space[3],
  },
  pillsScroll: {
    gap: space[2],
    paddingRight: space[7],
  },
  pill: {
    paddingVertical: 7,
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
  tastePlaceholder: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    paddingHorizontal: space[7],
    marginTop: space[3],
  },

  // Inline input for location row
  inlineInput: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },

  // Toggles
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space[7],
    paddingVertical: space[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  toggleInfo: {
    flex: 1,
    marginRight: space[4],
  },
  toggleTitle: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.primary,
  },
  toggleSubtitle: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Action buttons
  actionButton: {
    marginHorizontal: space[7],
    marginTop: space[3],
    paddingVertical: space[4],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.tertiary,
    letterSpacing: tracking.wide,
  },
  deleteButton: {
    borderColor: '#3a1a1a',
  },
  deleteButtonText: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: '#8A4A4A',
    letterSpacing: tracking.wide,
  },

  // Dev
  devSection: {
    marginTop: space[6],
    paddingHorizontal: space[7],
    flexDirection: 'row',
    gap: space[3],
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
