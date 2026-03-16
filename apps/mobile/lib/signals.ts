import { supabase } from './supabase';

export type SignalType = 'skip' | 'interest' | 'save' | 'long_press' | 'video_view';


//signal recording
export async function recordSignal(
  userId: string,
  productId: string,
  signalType: SignalType,
  experimentId?: string | null,
  context?: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('signals')
    .insert({
      user_id: userId,
      product_id: productId,
      signal_type: signalType,
      experiment_id: experimentId || null,
      context: context || {},
    })
    .select()
    .single();

  return { data, error };
}


//count
export async function getUserSignalCount(userId: string) {
  const { count, error } = await supabase
    .from('signals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return { count: count || 0, error };
}



export async function getSavedProducts(userId: string) {
  const { data, error } = await supabase
    .from('signals')
    .select('product_id, products(*)')
    .eq('user_id', userId)
    .eq('signal_type', 'save');

  return { data, error };
}

export async function getSavedItems(userId: string) {
  const { data, error } = await supabase
    .from('saved_items')
    .select('product_id, products(id, name, images, brands(name))')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  return { data, error };
}
