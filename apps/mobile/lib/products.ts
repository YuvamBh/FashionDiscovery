import { supabase } from './supabase';

export async function getProducts(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'live')
    .range(offset, offset + limit - 1);

  return { data, error };
}

export async function getProductsByExperiment(experimentId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('experiment_id', experimentId)
    .eq('status', 'live');

  return { data, error };
}
