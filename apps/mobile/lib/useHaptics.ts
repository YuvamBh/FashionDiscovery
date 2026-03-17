import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection';

export const useHaptics = () => {
  const isWeb = Platform.OS === 'web';

  const trigger = (type: HapticType) => {
    if (isWeb) return;
    
    // Use .catch to prevent unhandled promise rejections on non-rebuilt dev clients
    try {
      switch (type) {
        case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); break;
        case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); break;
        case 'heavy': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}); break;
        case 'success': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); break;
        case 'error': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); break;
        case 'warning': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); break;
        case 'selection': Haptics.selectionAsync().catch(() => {}); break;
      }
    } catch (_) {
      // Synchronous catch as a fallback
    }
  };

  return {
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
    success: () => trigger('success'),
    error: () => trigger('error'),
    warning: () => trigger('warning'),
    selection: () => trigger('selection'),
    
    /**
     * Plays a sequence of haptics with specific delays between them.
     */
    playSequence: async (sequence: { type: HapticType, delay: number }[]) => {
      for (const step of sequence) {
        trigger(step.type);
        if (step.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, step.delay));
        }
      }
    },

    /**
     * Predefined sequence: Increasing frequency pulses for feed entry
     * Creates an "acceleration" feeling leading into the final transition.
     */
    playPulseSequence: async () => {
      const pulses: { type: HapticType, delay: number }[] = [
        { type: 'light', delay: 400 },
        { type: 'light', delay: 300 },
        { type: 'light', delay: 200 },
        { type: 'medium', delay: 150 },
        { type: 'medium', delay: 100 },
        { type: 'medium', delay: 80 },
        { type: 'heavy', delay: 60 },
        { type: 'heavy', delay: 40 },
        { type: 'success', delay: 0 },
      ];
      for (const step of pulses) {
        trigger(step.type);
        if (step.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, step.delay));
        }
      }
    }
  };
};
