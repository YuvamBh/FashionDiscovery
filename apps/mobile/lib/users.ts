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

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  return { error };
}

// Keep old name as alias for backwards compat where used, or we can just update usages.
export const updateTasteProfile = updateUserProfile;

export async function updateAuthorityScore(userId: string, score: number) {
  const { error } = await supabase
    .from('users')
    .update({ authority_score: score })
    .eq('id', userId);

  return { error };
}
