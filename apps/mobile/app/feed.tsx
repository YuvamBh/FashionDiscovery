import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { recordSignal, SignalType } from '../lib/signals';
import { getProducts } from '../lib/products';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

const PLACEHOLDER_ITEMS = [
  { id: '1', images: ['https://picsum.photos/500/900?random=11'], name: 'Oversized Linen Shirt', brands: { name: 'VOID.STUDIO' } },
  { id: '2', images: ['https://picsum.photos/500/900?random=12'], name: 'Graphic Tee', brands: { name: 'KAALA' } },
  { id: '3', images: ['https://picsum.photos/500/900?random=13'], name: 'Tailored Blazer', brands: { name: 'STUDIO.NOIR' } },
  { id: '4', images: ['https://picsum.photos/500/900?random=14'], name: 'Minimal Hoodie', brands: { name: 'BLANC' } },
  { id: '5', images: ['https://picsum.photos/500/900?random=15'], name: 'Printed Bomber', brands: { name: 'RUHAAN' } },
  { id: '6', images: ['https://picsum.photos/500/900?random=16'], name: 'Wide Leg Trousers', brands: { name: 'MONO' } },
  { id: '7', images: ['https://picsum.photos/500/900?random=17'], name: 'Knit Cardigan', brands: { name: 'FORM' } },
];

export default function Feed() {
  const [products, setProducts] = useState(PLACEHOLDER_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    getProducts().then(({ data }) => {
      if (data && data.length > 0) setProducts(data as typeof PLACEHOLDER_ITEMS);
    });
  }, []);

  const currentItem = products[currentIndex];

  const handleSignal = useCallback(async (type: SignalType) => {
    if (userId && currentItem) {
      await recordSignal(userId, currentItem.id, type);
    }
    if (currentIndex < products.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, currentItem, userId, products.length]);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > 100) {
        runOnJS(handleSignal)('interest');
      } else if (e.translationX < -100) {
        runOnJS(handleSignal)('skip');
      } else if (e.translationY < -100) {
        runOnJS(handleSignal)('save');
      }
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onEnd(() => {
      runOnJS(handleSignal)('long_press');
    });

  const composed = Gesture.Simultaneous(gesture, longPressGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-width / 2, 0, width / 2],
          [-6, 0, 6],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  const interestOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));

  const skipOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const saveOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-80, 0], [1, 0], Extrapolation.CLAMP),
  }));

  if (!currentItem) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>You've seen everything</Text>
        <Text style={styles.emptySubtitle}>Check back tomorrow for new drops</Text>
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => {}}>
            <Text style={[styles.tabIcon, styles.tabActive]}>◈</Text>
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/moodboard')}>
            <Text style={styles.tabIcon}>⊞</Text>
            <Text style={styles.tabLabel}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
            <Text style={styles.tabIcon}>◯</Text>
            <Text style={styles.tabLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image source={{ uri: currentItem.images?.[0] }} style={styles.image} />

          {/* Overlays */}
          <Animated.View style={[styles.badge, styles.badgeRight, interestOverlayStyle]}>
            <Text style={styles.badgeText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[styles.badge, styles.badgeLeft, skipOverlayStyle]}>
            <Text style={styles.badgeText}>SKIP</Text>
          </Animated.View>
          <Animated.View style={[styles.badge, styles.badgeTop, saveOverlayStyle]}>
            <Text style={styles.badgeText}>SAVE</Text>
          </Animated.View>

          {/* Card info */}
          <View style={styles.cardInfo}>
            <View style={styles.cardMeta}>
              <Text style={styles.brandName}>{currentItem.brands?.name || 'Brand'}</Text>
              <Text style={styles.itemName}>{currentItem.name}</Text>
            </View>
            <View style={styles.signalHints}>
              <Text style={styles.signalHint}>↑ Save</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Counter */}
      <Text style={styles.counter}>{currentIndex + 1} / {products.length}</Text>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => {}}>
          <Text style={[styles.tabIcon, styles.tabActive]}>◈</Text>
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/moodboard')}>
          <Text style={styles.tabIcon}>⊞</Text>
          <Text style={styles.tabLabel}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
          <Text style={styles.tabIcon}>◯</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#444',
  },
  card: {
    width: width,
    height: height * 0.78,
    backgroundColor: '#111',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 2,
  },
  badgeRight: {
    top: 56,
    right: 20,
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  badgeLeft: {
    top: 56,
    left: 20,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  badgeTop: {
    top: 56,
    alignSelf: 'center',
    left: width / 2 - 40,
    borderColor: '#0ea5e9',
    backgroundColor: 'rgba(14,165,233,0.15)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardMeta: {
    flex: 1,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  signalHints: {
    alignItems: 'flex-end',
  },
  signalHint: {
    fontSize: 12,
    color: '#444',
  },
  counter: {
    fontSize: 11,
    color: '#222',
    marginTop: 12,
    letterSpacing: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#111',
    paddingBottom: 32,
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabIcon: {
    fontSize: 20,
    color: '#333',
  },
  tabActive: {
    color: '#fff',
  },
  tabLabel: {
    fontSize: 10,
    color: '#333',
    letterSpacing: 1,
  },
  tabLabelActive: {
    color: '#fff',
  },
});
