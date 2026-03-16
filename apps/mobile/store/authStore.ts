import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type UserProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  user_tag: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  calibration_completed: boolean;
  aesthetic_vibe: string | null;
  fashion_preferences: {
    energies?: string[];
    brand_affinity?: string[];
    aesthetic_vibe?: string;
  } | null;
  authority_score: number;
  total_signals: number;
  taste_profile: object | null;
};

interface AuthState {
  userId: string | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** True once the startup session check has resolved (with or without a session). */
  isAuthReady: boolean;
  /** Route that AuthGate should redirect to. Cleared after navigation. */
  pendingRoute: string | null;

  setUserId: (id: string | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;

  fetchProfile: (userId: string) => Promise<UserProfile | null>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  isAuthReady: false,
  pendingRoute: null,

  setUserId: (id) => set({ userId: id, isAuthenticated: id !== null }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),

  clearAuth: () => set({
    userId: null,
    profile: null,
    isAuthenticated: false,
  }),

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[AuthStore] fetchProfile error:', error.message);
      return null;
    }

    if (data) set({ profile: data as UserProfile });
    return data as UserProfile | null;
  },

  updateProfile: async (updates) => {
    const { userId, profile } = get();
    if (!userId) return;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.warn('[AuthStore] updateProfile error:', error.message);
      return;
    }

    set({ profile: profile ? { ...profile, ...updates } : null });
  },

  signOutUser: async () => {
    await supabase.auth.signOut();
    get().clearAuth();
  },
}));
