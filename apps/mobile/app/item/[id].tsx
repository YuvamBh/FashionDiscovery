import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { recordSignal } from '../../lib/signals';
import { supabase } from '../../lib/supabase';
import { colors, fonts, size, space, tracking, spring } from '../../lib/tokens';
import { useFeedStore } from '../../store/feedStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ItemScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    brandName: string;
    imageUri: string;
    videoUri: string;
    contextTag: string;
    isPlaceholder: string;
  }>();

  const { id, name, brandName, imageUri, videoUri, contextTag, isPlaceholder } = params;
  const userId = useRef<string | null>(null);

  const { savedItems, signalledItems, signalItem, saveItem } = useFeedStore();
  const saved = savedItems.includes(id);
  const signalled = signalledItems.some((s) => s.id === id);

  useEffect(() => {
    supabase.auth.getUser().then((result) => {
      userId.current = result.data.user?.id ?? null;
    });
  }, []);

  // ─── Shared values ───────────────────────────────────────────────────────────

  const videoOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const saveScale = useSharedValue(1);
  const signalScale = useSharedValue(1);
  const videoHintOpacity = useSharedValue(signalled ? 0 : 1);

  const pressInTime = useRef(0);
  const videoStartTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Animated styles ─────────────────────────────────────────────────────────

  const videoOverlayStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    opacity: videoOpacity.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const saveScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const signalScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: signalScale.value }],
  }));

  const videoHintStyle = useAnimatedStyle(() => ({
    opacity: videoHintOpacity.value,
  }));

  // ─── Press-and-hold video preview ────────────────────────────────────────────

  const handlePressIn = () => {
    pressInTime.current = Date.now();
    videoStartTimeout.current = setTimeout(() => {
      videoOpacity.value = withTiming(1, { duration: 400 });
      videoHintOpacity.value = withTiming(0, { duration: 300 });
      progressWidth.value = withTiming(SCREEN_WIDTH, {
        duration: 8000,
        easing: Easing.linear,
      });
    }, 300);
  };

  const handlePressOut = () => {
    if (videoStartTimeout.current) {
      clearTimeout(videoStartTimeout.current);
      videoStartTimeout.current = null;
    }
    cancelAnimation(progressWidth);
    progressWidth.value = withTiming(0, { duration: 200 });
    videoOpacity.value = withTiming(0, { duration: 300 });
  };

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const handleSave = () => {
    saveScale.value = withSequence(
      withSpring(1.3, spring.gentle),
      withSpring(1.0, spring.gentle),
    );
    saveItem(id);
  };

  const handleSignal = () => {
    if (signalled) return;
    signalScale.value = withSequence(withSpring(0.97), withSpring(1.0, spring.gentle));
    signalItem(id, 'strong');
    if (isPlaceholder !== '1' && userId.current) {
      recordSignal(userId.current, id, 'interest').catch(() => {});
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-bleed background image */}
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Video overlay — opacity-controlled (stub until dev client build) */}
      <Animated.View style={videoOverlayStyle}>
        <View style={styles.videoStub}>
          <Text style={styles.videoStubText}>Video preview coming soon</Text>
        </View>
      </Animated.View>

      {/* Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.97)']}
        style={styles.gradient}
      />

      {/* Progress bar — very bottom of image area */}
      <Animated.View style={[styles.progressBar, progressBarStyle]} />

      {/* Full-screen press area — behind top bar and bottom info */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Pressable onPress={handleSave} hitSlop={16}>
          <Animated.Text style={[styles.saveIcon, saveScaleStyle, saved && styles.saveIconSaved]}>
            ⊟
          </Animated.Text>
        </Pressable>
      </View>

      {/* Video hint */}
      {!signalled && (
        <Animated.View style={[styles.videoHint, { bottom: insets.bottom + 200, right: space[7] }, videoHintStyle]}>
          <Text style={styles.videoHintText}>Hold to preview</Text>
        </Animated.View>
      )}

      {/* Bottom info */}
      <View style={[styles.bottomInfo, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.brandName} numberOfLines={1}>{brandName}</Text>
        <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
        <Text style={styles.contextTag}>{contextTag}</Text>

        <Animated.View style={signalScaleStyle}>
          <Pressable
            style={[styles.signalBtn, signalled && styles.signalBtnDone]}
            onPress={handleSignal}
            disabled={signalled}
          >
            <Text style={[styles.signalBtnText, signalled && styles.signalBtnTextDone]}>
              {signalled ? 'Signal captured  ·' : 'Signal interest'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  videoStub: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoStubText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.wide,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '45%',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 1.5,
    backgroundColor: colors.text.primary,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space[7],
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: size.xl,
    color: colors.text.primary,
  },
  saveIcon: {
    fontSize: 22,
    color: colors.white.a40,
  },
  saveIconSaved: {
    color: colors.text.primary,
  },
  videoHint: {
    position: 'absolute',
  },
  videoHintText: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.wide,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space[7],
  },
  brandName: {
    fontFamily: fonts.display,
    fontSize: size.xxxl,
    color: colors.text.primary,
    letterSpacing: tracking.wide,
    lineHeight: 38,
  },
  itemName: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: tracking.wider,
    marginTop: space[2],
  },
  contextTag: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    marginTop: space[3],
  },
  signalBtn: {
    marginTop: space[8],
    paddingVertical: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.text.primary,
    alignItems: 'center',
  },
  signalBtnDone: {
    borderColor: colors.border.subtle,
    opacity: 0.5,
  },
  signalBtnText: {
    fontFamily: fonts.displayMedium,
    fontSize: size.base,
    color: colors.text.primary,
    letterSpacing: tracking.widest,
    textTransform: 'uppercase',
  },
  signalBtnTextDone: {
    color: colors.text.tertiary,
    textTransform: 'none',
  },
});
