import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';
import { colors, fonts, size, space, tracking, spring, radius } from '../lib/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BrandMiniSheetProps {
  isVisible: boolean;
  onClose: () => void;
  brand: {
    name: string;
    description?: string;
    origin?: string;
    founded?: string;
  } | null;
}

export function BrandMiniSheet({ isVisible, onClose, brand }: BrandMiniSheetProps) {
  if (!isVisible || !brand) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View 
        entering={SlideInDown.springify().damping(25).stiffness(200)}
        exiting={SlideOutDown.duration(300)}
        style={styles.sheet}
      >
        <View style={styles.handle} />
        
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          <Text style={styles.brandName}>{brand.name}</Text>
          
          <View style={styles.metaRow}>
            {brand.origin && <Text style={styles.metaText}>{brand.origin}</Text>}
            {brand.origin && brand.founded && <Text style={styles.separator}>•</Text>}
            {brand.founded && <Text style={styles.metaText}>Est. {brand.founded}</Text>}
          </View>

          <Text style={styles.description}>
            {brand.description || "A luxury label focused on minimal silhouettes and experimental craftsmanship. Defining the modern wardrobe through an archival lens."}
          </Text>

          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>View Collection</Text>
            </Pressable>
            
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Track Brand</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: space[3],
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.strong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: space[6],
  },
  content: {
    paddingHorizontal: space[8],
    paddingBottom: space[12],
  },
  brandName: {
    fontFamily: fonts.display,
    fontSize: size.xxl,
    color: colors.text.primary,
    letterSpacing: tracking.wide,
    marginBottom: space[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginBottom: space[6],
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: tracking.wider,
  },
  separator: {
    color: colors.text.tertiary,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: size.base,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: space[10],
  },
  actions: {
    gap: space[3],
  },
  primaryButton: {
    backgroundColor: colors.text.primary,
    paddingVertical: space[4],
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  primaryButtonText: {
    fontFamily: fonts.displayMedium,
    fontSize: size.sm,
    color: colors.bg.primary,
    textTransform: 'uppercase',
    letterSpacing: tracking.wider,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border.strong,
    paddingVertical: space[4],
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  secondaryButtonText: {
    fontFamily: fonts.displayMedium,
    fontSize: size.sm,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: tracking.wider,
  },
});
