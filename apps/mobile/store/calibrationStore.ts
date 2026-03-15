import { create } from 'zustand';

interface UserCalibrationState {
  // Step 1: Style
  preferredStyles: string[];
  setPreferredStyles: (styles: string[]) => void;
  
  // Step 2: Brands
  brandAffinity: string[];
  setBrandAffinity: (brands: string[]) => void;

  // Step 3: Current Wardrobe
  currentWardrobe: string[];
  setCurrentWardrobe: (items: string[]) => void;

  // Step 4: Aspiration
  styleAspiration: string | null;
  setStyleAspiration: (aspiration: string) => void;

  // Step 5: Self-Perception
  selfPerception: string | null;
  setSelfPerception: (perception: string) => void;

  // Step 6: App Goals
  appGoals: string[];
  setAppGoals: (goals: string[]) => void;

  // Step 7: Frequency
  discoveryFrequency: string | null;
  setDiscoveryFrequency: (frequency: string) => void;

  // Step 8: Visual Vibe
  visualVibes: string[];
  setVisualVibes: (vibes: string[]) => void;

  // Sync Action
  getCompleteProfile: () => Record<string, any>;
}

export const useCalibrationStore = create<UserCalibrationState>((set, get) => ({
  preferredStyles: [],
  setPreferredStyles: (styles) => set({ preferredStyles: styles }),

  brandAffinity: [],
  setBrandAffinity: (brands) => set({ brandAffinity: brands }),

  currentWardrobe: [],
  setCurrentWardrobe: (items) => set({ currentWardrobe: items }),

  styleAspiration: null,
  setStyleAspiration: (aspiration) => set({ styleAspiration: aspiration }),

  selfPerception: null,
  setSelfPerception: (perception) => set({ selfPerception: perception }),

  appGoals: [],
  setAppGoals: (goals) => set({ appGoals: goals }),

  discoveryFrequency: null,
  setDiscoveryFrequency: (frequency) => set({ discoveryFrequency: frequency }),

  visualVibes: [],
  setVisualVibes: (vibes) => set({ visualVibes: vibes }),

  getCompleteProfile: () => {
    const state = get();
    return {
      preferred_styles: state.preferredStyles,
      brand_affinity: state.brandAffinity,
      current_wardrobe: state.currentWardrobe,
      style_aspiration: state.styleAspiration,
      self_perception: state.selfPerception,
      app_goals: state.appGoals,
      discovery_frequency: state.discoveryFrequency,
      visual_vibes: state.visualVibes,
    };
  }
}));
