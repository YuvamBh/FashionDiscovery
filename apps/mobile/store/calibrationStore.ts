import { create } from 'zustand';

interface UserCalibrationState {
  // Step 1: Energy / aesthetic pull (max 3)
  preferredStyles: string[];
  setPreferredStyles: (styles: string[]) => void;

  // Step 2: Brand affinities
  brandAffinity: string[];
  setBrandAffinity: (brands: string[]) => void;

  // Step 3: One-word self-description
  styleAspiration: string | null;
  setStyleAspiration: (aspiration: string) => void;

  // Serialise for Supabase taste_profile column
  getCompleteProfile: () => Record<string, any>;
}

export const useCalibrationStore = create<UserCalibrationState>((set, get) => ({
  preferredStyles: [],
  setPreferredStyles: (styles) => set({ preferredStyles: styles }),

  brandAffinity: [],
  setBrandAffinity: (brands) => set({ brandAffinity: brands }),

  styleAspiration: null,
  setStyleAspiration: (aspiration) => set({ styleAspiration: aspiration }),

  getCompleteProfile: () => {
    const { preferredStyles, brandAffinity, styleAspiration } = get();
    return {
      preferred_styles: preferredStyles,
      brand_affinity: brandAffinity,
      style_aspiration: styleAspiration,
    };
  },
}));
