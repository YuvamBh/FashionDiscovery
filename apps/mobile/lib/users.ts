import { supabase } from './supabase';

export async function getOrCreateUser(userId: string, phone: string) {
  const { data: existing } = await supabase
    .from('users')
    .select()
    .eq('id', userId)
    .single();

  if (existing) return { user: existing, error: null };

  const { data, error } = await supabase
    .from('users')
    .insert({ id: userId, phone_number: phone })
    .select()
    .single();

  return { user: data, error };
}

export async function mergeTasteProfile(userId: string, updates: Record<string, unknown>) {
  const { data: existing } = await supabase
    .from('users')
    .select('taste_profile')
    .eq('id', userId)
    .single();

  const current = (existing?.taste_profile as Record<string, unknown>) || {};
  const merged = { ...current, ...updates };

  const { error } = await supabase
    .from('users')
    .update({ taste_profile: merged })
    .eq('id', userId);

  return { error };
}

// Keep old name as alias for backwards compat
export const updateTasteProfile = mergeTasteProfile;

export async function updateAuthorityScore(userId: string, score: number) {
  const { error } = await supabase
    .from('users')
    .update({ authority_score: score })
    .eq('id', userId);

  return { error };
}
