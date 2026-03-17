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
  /**
   * Set by the auth listener once it has resolved the user's destination.
   * - 'feed'    → user is authenticated and onboarding is done
   * - 'nametag' → user is authenticated but needs onboarding
   * - null      → no session / signed out, show sign-in UI
   */
  authOutcome: 'feed' | 'nametag' | null;

  setUserId: (id: string | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;

  fetchProfile: (userId: string, maxRetries?: number, delayMs?: number) => Promise<UserProfile | null>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  isAuthReady: false,
  authOutcome: null,

  setUserId: (id) => set({ userId: id, isAuthenticated: id !== null }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),

  clearAuth: () => set({
    userId: null,
    profile: null,
    isAuthenticated: false,
  }),

  fetchProfile: async (userId, maxRetries = 3, delayMs = 500) => {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn(`[AuthStore] fetchProfile error (attempt ${attempt + 1}):`, error.message);
      }

      if (data) {
        set({ profile: data as UserProfile });
        return data as UserProfile;
      }

      console.log(`[AuthStore] Profile not found, retrying... (${attempt + 1}/${maxRetries})`);
      attempt++;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.warn('[AuthStore] fetchProfile failed after retries for user:', userId);
    return null;
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
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('[AuthStore] Error during signOut:', error);
    }
    set({
      userId: null,
      profile: null,
      isAuthenticated: false,
      isAuthReady: true, // Mark ready so the login screen can show
      authOutcome: null,
    });
  },
}));
