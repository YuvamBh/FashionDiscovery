import { supabase } from './supabase';

export type UserProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  calibration_completed: boolean;
  aesthetic_vibe: string | null;
  fashion_preferences: Record<string, any>;
  taste_profile: Record<string, any>;
  authority_score: number;
  total_signals: number;
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

/*
Run in Supabase SQL Editor:

create or replace function increment_signal_count(user_id uuid)
returns void language plpgsql security definer as $$
begin
  update users
  set total_signals = total_signals + 1,
      last_active = now()
  where id = user_id;
end;
$$;
*/
