import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { getProducts } from '../lib/products';
import { recordSignal } from '../lib/signals';

const { width, height } = Dimensions.get('window');

export default function Calibration() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  useEffect(() => {
    // For calibration, let's just fetch 10 items
    getProducts(10).then(({ data }) => {
      if (data) setItems(data);
      setLoading(false);
    });
  }, []);

  const currentItem = items[currentIndex];
  // Calculate progress based on items available, minimum 1 to avoid NaN
  const safeLength = items.length || 1;
  const progress = (currentIndex / safeLength) * 100;

  const handleNext = async (type: 'skip' | 'interest') => {
    if (currentItem && !currentItem.isPlaceholder) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await recordSignal(data.user.id, currentItem.id, type);
      }
    }
    
    if (currentIndex >= items.length - 1) {
      router.replace('/feed');
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > 90) {
        cardOpacity.value = withTiming(0, { duration: 150 });
        translateX.value = withTiming(width, { duration: 200 }, () => {
          translateX.value = 0;
          cardOpacity.value = 1;
          runOnJS(handleNext)('interest');
        });
      } else if (e.translationX < -90) {
        cardOpacity.value = withTiming(0, { duration: 150 });
        translateX.value = withTiming(-width, { duration: 200 }, () => {
          translateX.value = 0;
          cardOpacity.value = 1;
          runOnJS(handleNext)('skip');
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-width / 2, 0, width / 2],
          [-8, 0, 8],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
    opacity: cardOpacity.value,
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));

  const skipOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, 0], [1, 0], Extrapolation.CLAMP),
  }));

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Loading Calibration...</Text>
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 16 }}>No items to display</Text>
        <TouchableOpacity onPress={() => router.replace('/feed')} style={{ marginTop: 20 }}>
          <Text style={{ color: '#444', fontSize: 14 }}>Skip to Feed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>02 — TASTE CALIBRATION</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1} / {items.length}</Text>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image source={{ uri: currentItem.images?.[0] }} style={styles.image} />

          <Animated.View style={[styles.badge, styles.badgeRight, likeOverlayStyle]}>
            <Text style={styles.badgeText}>YES</Text>
          </Animated.View>
          <Animated.View style={[styles.badge, styles.badgeLeft, skipOverlayStyle]}>
            <Text style={styles.badgeText}>SKIP</Text>
          </Animated.View>

          <View style={styles.cardInfo}>
            <Text style={styles.brandName}>{currentItem.brands?.name || 'Brand'}</Text>
            <Text style={styles.itemName}>{currentItem.category || currentItem.name}</Text>
          </View>
        </Animated.View>
      </GestureDetector>

      <Text style={styles.hint}>Swipe right to like  ·  Swipe left to skip</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => handleNext('skip')}
          activeOpacity={0.7}
        >
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.likeBtn}
          onPress={() => handleNext('interest')}
          activeOpacity={0.7}
        >
          <Text style={styles.likeBtnText}>Interested</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_HEIGHT = height * 0.58;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: 64,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 3,
    marginBottom: 12,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 1,
    marginBottom: 10,
  },
  progressFill: {
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  counter: {
    fontSize: 12,
    color: '#333',
    textAlign: 'right',
  },
  card: {
    width: width - 40,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 24,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 2,
  },
  badgeRight: {
    right: 20,
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  badgeLeft: {
    left: 20,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.15)',
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
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  itemName: {
    fontSize: 13,
    color: '#888',
    marginTop: 3,
  },
  hint: {
    fontSize: 11,
    color: '#2a2a2a',
    marginTop: 16,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 28,
    width: '100%',
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 10,
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },
  likeBtn: {
    flex: 2,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  likeBtnText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '700',
  },
});
