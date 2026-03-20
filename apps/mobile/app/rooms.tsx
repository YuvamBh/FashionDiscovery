import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import { getSpaces, setSpacePreferences, type Space } from '../lib/spaces';
import { useHaptics } from '../lib/useHaptics';

// ─── RoomCard ─────────────────────────────────────────────────────────────────

function RoomCard({
  space,
  isSelected,
  onToggle,
}: {
  space: Space;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);
  const indicatorBg = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    indicatorBg.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, [isSelected]);

  const indicatorStyle = useAnimatedStyle(() => ({
    backgroundColor: indicatorBg.value === 1 ? colors.text.primary : 'transparent',
    borderColor: isSelected ? colors.text.primary : colors.border.strong,
  }));

  return (
    <Pressable
      onPress={onToggle}
      style={styles.roomRow}
    >
      <View style={styles.roomInfo}>
        <Text style={[styles.roomTitle, isSelected && styles.roomTitleActive]}>
          {space.title}
        </Text>
        {space.subtitle ? (
          <Text style={styles.roomSubtitle}>{space.subtitle}</Text>
        ) : null}
      </View>
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </Animated.View>
    </Pressable>
  );
}

// ─── RoomsScreen ──────────────────────────────────────────────────────────────

export default function RoomsScreen() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const userId = useAuthStore((s) => s.userId);

  const storeAllSpaces = useFeedStore((s) => s.availableSpaces);
  const storeUserSpaces = useFeedStore((s) => s.userSpaces);

  const [allSpaces, setAllSpaces] = useState<Space[]>(storeAllSpaces);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(storeUserSpaces.map((s) => s.id)),
  );
  const [originalIds] = useState<Set<string>>(
    new Set(storeUserSpaces.map((s) => s.id)),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const minNoticeOpacity = useSharedValue(0);
  const saveBarOpacity = useSharedValue(0);

  const minNoticeStyle = useAnimatedStyle(() => ({ opacity: minNoticeOpacity.value }));
  const saveBarStyle = useAnimatedStyle(() => ({ opacity: saveBarOpacity.value }));

  useEffect(() => {
    if (allSpaces.length === 0) {
      getSpaces().then((fetched) => {
        setAllSpaces(fetched);
        if (selectedIds.size === 0) {
          setSelectedIds(new Set(fetched.map((s) => s.id)));
        }
      });
    }
  }, []);

  const toggleRoom = (spaceId: string) => {
    const next = new Set(selectedIds);
    if (next.has(spaceId)) {
      if (next.size <= 1) {
        haptics.warning();
        minNoticeOpacity.value = withTiming(1, { duration: 200 });
        setTimeout(() => {
          minNoticeOpacity.value = withTiming(0, { duration: 300 });
        }, 2000);
        return;
      }
      next.delete(spaceId);
    } else {
      next.add(spaceId);
    }
    haptics.light();
    setSelectedIds(next);

    const changed = next.size !== originalIds.size || [...next].some((id) => !originalIds.has(id));
    setHasChanges(changed);
    saveBarOpacity.value = withTiming(changed ? 1 : 0, { duration: 200 });
  };

  const handleSave = async () => {
    if (!userId || isSaving) return;
    setIsSaving(true);
    haptics.medium();

    const activeIds = Array.from(selectedIds);
    await setSpacePreferences(userId, activeIds);

    const updatedSpaces = allSpaces.filter((s) => selectedIds.has(s.id));
    useFeedStore.getState().setUserSpaces(updatedSpaces);

    haptics.success();
    setIsSaving(false);
    setHasChanges(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>YOUR ROOMS</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn} hitSlop={12}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.text.secondary} />
          ) : hasChanges ? (
            <Text style={styles.saveBtnActive}>Save</Text>
          ) : (
            <Text style={styles.saveBtnIdle}>Done</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Hero text */}
        <View style={styles.hero}>
          <Text style={styles.heroHeadline}>Curate your world.</Text>
          <Text style={styles.heroBody}>
            Choose the rooms you want in your feed.{'\n'}Your taste shapes what gets made.
          </Text>
        </View>

        {/* Spaces list */}
        <View style={styles.list}>
          {allSpaces.map((s) => (
            <RoomCard
              key={s.id}
              space={s}
              isSelected={selectedIds.has(s.id)}
              onToggle={() => toggleRoom(s.id)}
            />
          ))}
        </View>

        {/* Min 1 notice */}
        <Animated.View style={[styles.minNotice, minNoticeStyle]}>
          <Text style={styles.minNoticeText}>You need at least one room.</Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom save button */}
      <Animated.View
        style={[
          styles.saveBar,
          { bottom: insets.bottom + space[6] },
          saveBarStyle,
        ]}
        pointerEvents={hasChanges ? 'auto' : 'none'}
      >
        <Pressable style={styles.saveBarBtn} onPress={handleSave}>
          <Text style={styles.saveBarBtnText}>Update feed</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[7],
    paddingBottom: space[4],
  },
  backBtn: {},
  backBtnText: {
    fontFamily: fonts.body,
    fontSize: size.lg,
    color: colors.text.secondary,
  },
  headerTitle: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
  },
  saveBtn: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  saveBtnActive: {
    fontFamily: fonts.bodyMedium,
    fontSize: size.sm,
    color: colors.text.primary,
  },
  saveBtnIdle: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
  },
  scrollContent: {},
  hero: {
    paddingHorizontal: space[7],
    marginTop: space[8],
  },
  heroHeadline: {
    fontFamily: fonts.display,
    fontSize: size.xxxl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
  },
  heroBody: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.tertiary,
    marginTop: space[3],
    lineHeight: 22,
  },
  list: {
    marginTop: space[8],
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[5],
    paddingHorizontal: space[7],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  roomInfo: {
    flex: 1,
  },
  roomTitle: {
    fontFamily: fonts.display,
    fontSize: size.lg,
    color: colors.text.tertiary,
    letterSpacing: tracking.tight,
  },
  roomTitleActive: {
    color: colors.text.primary,
  },
  roomSubtitle: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    marginTop: space[1],
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: size.xs,
    color: colors.text.inverse,
  },
  minNotice: {
    alignItems: 'center',
    marginTop: space[4],
    paddingHorizontal: space[7],
  },
  minNoticeText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  saveBar: {
    position: 'absolute',
    left: space[7],
    right: space[7],
  },
  saveBarBtn: {
    paddingVertical: 18,
    backgroundColor: colors.text.primary,
    alignItems: 'center',
  },
  saveBarBtnText: {
    fontFamily: fonts.display,
    fontSize: size.base,
    color: colors.text.inverse,
    letterSpacing: tracking.widest,
  },
});
