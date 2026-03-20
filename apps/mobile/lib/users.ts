import { supabase } from './supabase';

export type UserProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  user_tag: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram_handle: string | null;

  onboarding_completed: boolean;
  calibration_completed: boolean;

  // Demographics
  age_range: string | null;
  gender_expression: string | null;
  location_city: string | null;
  location_country: string | null;

  // Shopping behavior
  budget_range: string | null;
  shopping_frequency: string | null;

  // Style DNA
  aesthetic_vibe: string | null;
  fashion_preferences: Record<string, any>;
  fit_preferences: string[];
  style_icons: string[];

  // Signal-derived
  taste_profile: Record<string, any>;
  authority_score: number;
  total_signals: number;

  // Privacy / settings
  profile_completion_score: number;
  notifications_enabled: boolean;
  data_sharing_enabled: boolean;
  account_visibility: string;

  created_at: string;
  last_active: string;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getUserProfile(
  userId: string,
): Promise<{ data: UserProfile | null; error: any }> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data: data as UserProfile | null, error };
}

// ─── Calibration ──────────────────────────────────────────────────────────────

export async function updateCalibration(
  userId: string,
  calibration: {
    energies: string[];
    brandAffinity: string[];
    aestheticVibe: string;
  },
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('users')
    .update({
      aesthetic_vibe: calibration.aestheticVibe,
      fashion_preferences: {
        energies: calibration.energies,
        brand_affinity: calibration.brandAffinity,
        aesthetic_vibe: calibration.aestheticVibe,
      },
      calibration_completed: true,
      onboarding_completed: true,
      last_active: new Date().toISOString(),
    })
    .eq('id', userId);
  return { error };
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export async function updateLastActive(userId: string): Promise<void> {
  await supabase
    .from('users')
    .update({ last_active: new Date().toISOString() })
    .eq('id', userId);
}

export async function incrementSignalCount(userId: string): Promise<void> {
  await supabase.rpc('increment_signal_count', { user_id: userId });
}

// ─── Delete Account ───────────────────────────────────────────────────────────

export async function updateNametag(
  userId: string,
  name: string,
  tag: string
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('users')
    .update({
      display_name: name,
      user_tag: tag,
      onboarding_completed: true
    })
    .eq('id', userId);

  return { error };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('users')
    .update({ ...updates, last_active: new Date().toISOString() })
    .eq('id', userId);
  return { error };
}

export async function deleteAccount(_userId: string): Promise<{ error: any }> {
  const { error } = await supabase.rpc('delete_user');
  return { error };
}