import { useEffect, useRef, useState } from 'react';
import { useHaptics } from '../lib/useHaptics';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Space, SpaceItem, getAllSpaces, getUserSpaces, recordBrandSentiment } from '../lib/spaces';
import { recordSignal } from '../lib/signals';
import { incrementSignalCount } from '../lib/users';
import { supabase } from '../lib/supabase';
import { colors, fonts, size, space, tracking, spring } from '../lib/tokens';
import { useFeedStore } from '../store/feedStore';
import { TabBar } from '../components/TabBar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.52);

// ─── FeedScreen ───────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [activeSpaceIndex, setActiveSpaceIndex] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const userId = useRef<string | null>(null);

  const [showPassFeedback, setShowPassFeedback] = useState(false);

  const savedItems = useFeedStore((state) => state.savedItems);
  const { signalItem, saveItem, hasSignalled, hasSaved } = useFeedStore();
  const haptics = useHaptics();

  const gridOpacity = useSharedValue(1);
  const signalBtnScale = useSharedValue(1);
  const passFeedbackOpacity = useSharedValue(0);

  const activeSpace: Space | null = spaces[activeSpaceIndex] ?? null;
  const activeItem: SpaceItem | null = activeSpace?.items[activeItemIndex] ?? null;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      userId.current = data.user?.id ?? null;
      const [userSpacesData, allSpacesData] = await Promise.all([
        getUserSpaces(userId.current ?? ''),
        getAllSpaces(),
      ]);
      setSpaces(userSpacesData.length > 0 ? userSpacesData : allSpacesData);
      useFeedStore.getState().setAvailableSpaces(allSpacesData);
      useFeedStore.getState().setUserSpaces(userSpacesData);
      useFeedStore.getState().setSpacePrefsLoaded(true);
      setSpacesLoading(false);
    })();
  }, []);

  const handleSpaceChange = (idx: number) => {
    if (idx === activeSpaceIndex) return;
    gridOpacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setActiveSpaceIndex(idx);
      setActiveItemIndex(0);
      gridOpacity.value = withTiming(1, { duration: 150 });
    }, 150);
  };

  const handlePass = () => {
    const items = activeSpace!.items;
    setActiveItemIndex(activeItemIndex < items.length - 1 ? activeItemIndex + 1 : 0);
    setShowPassFeedback(true);
    passFeedbackOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      passFeedbackOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setShowPassFeedback(false), 300);
    }, 3000);
  };

  const passFeedbackStyle = useAnimatedStyle(() => ({
    opacity: passFeedbackOpacity.value,
  }));

  const handleSignal = () => {
    const item = activeItem!;
    if (hasSignalled(item.id)) return;
    signalBtnScale.value = withSequence(withSpring(0.97), withSpring(1.0, spring.gentle));
    signalItem(item.id, 'strong');
    if (userId.current) {
      recordSignal(userId.current, item.id, 'interest').catch(() => {});
      incrementSignalCount(userId.current).catch(() => {});
    }
  };

  const handleSave = () => {
    saveItem(activeItem!.id);
  };

  const handleHeroPress = () => {
    const item = activeItem!;
    router.push({
      pathname: '/item/[id]',
      params: {
        id: item.id,
        name: item.name,
        brandName: item.brands.name,
        imageUri: item.images[0],
        videoUri: item.videoUri ?? '',
        contextTag: item.contextTag,
        isPlaceholder: '0',
      },
    });
  };

  const gridStyle = useAnimatedStyle(() => ({
    opacity: gridOpacity.value,
  }));

  const signalBtnScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: signalBtnScale.value }],
  }));

  if (spacesLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyDash}>—</Text>
        </View>
        <TabBar active="feed" />
      </View>
    );
  }

  if (!activeItem) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>The room is being prepared.</Text>
          <Text style={styles.emptySubtext}>Check back soon.</Text>
        </View>
        <TabBar active="feed" />
      </View>
    );
  }

  const alreadySignalled = hasSignalled(activeItem.id);
  const alreadySaved = hasSaved(activeItem.id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.wordmark}>◈</Text>
          <View style={styles.headerRight}>
            {savedItems.length > 0 && (
              <Text style={styles.savedCount}>{savedItems.length}</Text>
            )}
            <Pressable onPress={() => router.push('/rooms' as any)} style={styles.roomsBtn}>
              <Text style={styles.roomsBtnText}>Rooms</Text>
            </Pressable>
          </View>
        </View>

        {/* Room switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.switcherScroll}
          contentContainerStyle={styles.switcherContent}
        >
          {spaces.map((s, idx) => {
            const isActive = idx === activeSpaceIndex;
            return (
              <Pressable
                key={s.id}
                onPress={() => handleSpaceChange(idx)}
                style={[styles.pill, isActive && styles.pillActive]}
              >
                <Text style={[styles.pillLabel, isActive && styles.pillLabelActive]}>
                  {s.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Animated.View style={gridStyle}>
          {/* Active space label */}
          <View style={styles.spaceLabel}>
            <Text style={styles.spaceTitle}>{activeSpace.title}</Text>
            <Text style={styles.spaceSubtitle}>{activeSpace.subtitle}</Text>
          </View>

          {/* Hero item */}
          <Pressable style={styles.hero} onPress={handleHeroPress}>
            <Image
              source={{ uri: activeItem.images[0] }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', colors.black.a80]}
              style={styles.heroGradient}
            >
              <View style={styles.heroInfo}>
                <Text style={styles.heroBrand}>{activeItem.brands.name}</Text>
                <Text style={styles.heroName}>{activeItem.name}</Text>
                <Text style={styles.heroTag}>{activeItem.contextTag}</Text>
              </View>
              {alreadySaved && (
                <Text style={styles.heroSaved}>⊟</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {activeSpace.items.map((_, i) => (
              <Pressable key={i} onPress={() => setActiveItemIndex(i)} hitSlop={8}>
                <View style={[styles.dot, i === activeItemIndex && styles.dotActive]} />
              </Pressable>
            ))}
          </View>

          {/* Action row */}
          <View style={styles.actions}>
            <Pressable style={styles.passBtn} onPress={handlePass}>
              <Text style={styles.passBtnText}>PASS</Text>
            </Pressable>

            <Animated.View style={[styles.signalBtnWrapper, signalBtnScaleStyle]}>
              <Pressable
                style={[styles.signalBtn, alreadySignalled && styles.signalBtnDone]}
                onPress={handleSignal}
                disabled={alreadySignalled}
              >
                {alreadySignalled && <View style={styles.signalDot} />}
                <Text style={[styles.signalBtnText, alreadySignalled && styles.signalBtnTextDone]}>
                  {alreadySignalled ? 'CAPTURED' : 'SIGNAL'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>

          {/* Pass feedback */}
          {showPassFeedback && activeItem && (
            <Animated.View style={[styles.passFeedback, passFeedbackStyle]}>
              <Text style={styles.passFeedbackLabel}>
                Not feeling {activeItem.brands.name}?
              </Text>
              <Pressable
                onPress={() => {
                  haptics.selection();
                  if (userId.current) {
                    recordBrandSentiment(userId.current, activeItem.id, 'less').catch(() => {});
                  }
                  useFeedStore.getState().markBrandLess(activeItem.brands.name);
                  passFeedbackOpacity.value = withTiming(0, { duration: 150 });
                  setTimeout(() => setShowPassFeedback(false), 150);
                }}
              >
                <Text style={styles.passFeedbackAction}>Less of this</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Save link */}
          <Pressable style={styles.saveLink} onPress={handleSave}>
            <Text style={[styles.saveLinkText, alreadySaved && styles.saveLinkTextSaved]}>
              {alreadySaved ? '⊟  Saved' : '⊟  Save to board'}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <TabBar active="feed" />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space[7],
  },
  wordmark: {
    fontSize: 18,
    color: colors.text.tertiary,
  },
  savedCount: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
  },
  switcherScroll: {
    marginTop: space[4],
  },
  switcherContent: {
    paddingHorizontal: space[7],
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
    marginRight: space[3],
  },
  pillActive: {
    backgroundColor: colors.bg.elevated,
    borderColor: colors.border.strong,
  },
  pillLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: size.sm,
    color: colors.text.tertiary,
    letterSpacing: tracking.wide,
  },
  pillLabelActive: {
    color: colors.text.primary,
  },
  spaceLabel: {
    paddingHorizontal: space[7],
    marginTop: space[5],
  },
  spaceTitle: {
    fontFamily: fonts.display,
    fontSize: size.xl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
  },
  spaceSubtitle: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    marginTop: space[1],
  },
  hero: {
    marginHorizontal: space[4],
    marginTop: space[4],
    height: HERO_HEIGHT,
    backgroundColor: colors.bg.elevated,
    overflow: 'hidden',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingBottom: space[4],
  },
  heroInfo: {
    flex: 1,
  },
  heroBrand: {
    fontFamily: fonts.displayMedium,
    fontSize: size.xs,
    color: colors.text.primary,
    letterSpacing: tracking.widest,
    textTransform: 'uppercase',
  },
  heroName: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.secondary,
    marginTop: space[1],
  },
  heroTag: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    marginTop: space[2],
  },
  heroSaved: {
    fontSize: 16,
    color: colors.text.secondary,
    alignSelf: 'flex-end',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: space[4],
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: space[3],
    paddingHorizontal: space[7],
    marginTop: space[5],
  },
  passBtn: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passBtnText: {
    fontFamily: fonts.displayMedium,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
  },
  signalBtnWrapper: {
    flex: 1,
  },
  signalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  signalBtnDone: {
    borderColor: colors.border.subtle,
  },
  signalDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.text.tertiary,
    marginRight: space[2],
  },
  signalBtnText: {
    fontFamily: fonts.displayMedium,
    fontSize: size.xs,
    color: colors.text.primary,
    letterSpacing: tracking.widest,
  },
  signalBtnTextDone: {
    color: colors.text.tertiary,
  },
  saveLink: {
    alignItems: 'center',
    marginTop: space[3],
  },
  saveLinkText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.wide,
  },
  saveLinkTextSaved: {
    color: colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDash: {
    fontFamily: fonts.body,
    fontSize: size.xl,
    color: colors.text.tertiary,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: size.xl,
    color: colors.text.tertiary,
    letterSpacing: tracking.tight,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    marginTop: space[3],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  roomsBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
  },
  roomsBtnText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.secondary,
    letterSpacing: tracking.wide,
  },
  passFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
    marginTop: space[2],
    paddingVertical: space[2],
  },
  passFeedbackLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.wide,
  },
  passFeedbackAction: {
    fontFamily: fonts.bodyMedium,
    fontSize: size.xs,
    color: colors.text.secondary,
    letterSpacing: tracking.wide,
    textDecorationLine: 'underline',
  },
});
