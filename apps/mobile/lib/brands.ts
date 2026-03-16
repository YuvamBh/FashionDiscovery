import { supabase } from './supabase';

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  aesthetic_tags: string[];
  is_verified: boolean;
};

const BRAND_FIELDS = 'id,name,slug,description,aesthetic_tags,is_verified';

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchBrands(query: string): Promise<{ data: Brand[]; error: any }> {
  if (query.trim().length < 2) {
    const { data, error } = await supabase
      .from('brands')
      .select(BRAND_FIELDS)
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('name')
      .limit(30);
    return { data: (data as Brand[]) ?? [], error };
  }

  const { data, error } = await supabase
    .from('brands')
    .select(BRAND_FIELDS)
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(20);
  return { data: (data as Brand[]) ?? [], error };
}

// ─── Suggest ──────────────────────────────────────────────────────────────────

export async function requestBrand(name: string, userId: string): Promise<{ error: any }> {
  const normalized = name.trim().toUpperCase();

  const { error } = await supabase.from('brand_requests').upsert(
    { requested_name: normalized, requested_by: userId, request_count: 1 },
    { onConflict: 'requested_name', ignoreDuplicates: false },
  );

  if (!error) {
    await supabase.rpc('increment_brand_request', { brand_name: normalized });
  }

  return { error };
}

// ─── Resolve by name ──────────────────────────────────────────────────────────

export async function getBrandsByNames(names: string[]): Promise<{ data: Brand[]; error: any }> {
  if (!names.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from('brands')
    .select(BRAND_FIELDS)
    .in('name', names);
  return { data: (data as Brand[]) ?? [], error };
}

/*
Run this in Supabase SQL Editor:

create or replace function increment_brand_request(brand_name text)
returns void language plpgsql as $$
begin
  update brand_requests
  set request_count = request_count + 1
  where requested_name = brand_name;
end;
$$;
*/
