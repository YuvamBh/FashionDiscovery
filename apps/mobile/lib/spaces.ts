import { supabase } from './supabase';

export type SpaceItem = {
  id: string;
  name: string;
  contextTag: string;
  images: string[];
  videoUri: string | null;
  isPlaceholder: false;
  brands: { name: string; slug: string };
};

export type Space = {
  id: string;
  title: string;
  subtitle: string;
  items: SpaceItem[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((v) => typeof v === 'string');
  if (typeof raw === 'string') return [raw];
  return [];
}

async function fetchItemsForSpace(spaceId: string): Promise<SpaceItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, images, context_tag, video_url, brands(name, slug)')
    .eq('space_id', spaceId)
    .eq('status', 'live')
    .order('display_order');

  if (error || !data) return [];

  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    contextTag: p.context_tag ?? 'Early signal',
    images: parseImages(p.images),
    videoUri: p.video_url ?? null,
    isPlaceholder: false as const,
    brands: {
      name: p.brands?.name ?? '',
      slug: p.brands?.slug ?? '',
    },
  }));
}

export type SpacePreference = {
  spaceId: string
  isActive: boolean
  displayOrder: number
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getSpaces(): Promise<Space[]> {
  try {
    const { data: spacesData, error } = await supabase
      .from('spaces')
      .select('id, title, subtitle, display_order')
      .eq('is_active', true)
      .order('display_order');

    if (error || !spacesData) return [];

    const spaces = await Promise.all(
      spacesData.map(async (s: any) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle ?? '',
        items: await fetchItemsForSpace(s.id),
      })),
    );

    return spaces;
  } catch {
    console.warn('[spaces] Failed to fetch spaces from Supabase');
    return [];
  }
}

export async function getUserSpaces(userId: string): Promise<Space[]> {
  const { data, error } = await supabase
    .from('user_space_preferences')
    .select('space_id, display_order')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('display_order');

  if (error || !data || data.length === 0) return getSpaces();

  const spaces = await Promise.all(
    data.map((row: any) => getSpaceById(row.space_id)),
  );
  return spaces.filter((s): s is Space => s !== null);
}

export async function getUserSpacePreferences(
  userId: string,
): Promise<SpacePreference[]> {
  const { data, error } = await supabase
    .from('user_space_preferences')
    .select('space_id, is_active, display_order')
    .eq('user_id', userId)
    .order('display_order');

  if (error || !data) return [];

  return data.map((row: any) => ({
    spaceId: row.space_id,
    isActive: row.is_active,
    displayOrder: row.display_order,
  }));
}

export async function setSpacePreferences(
  userId: string,
  activeSpaceIds: string[],
): Promise<{ error: any }> {
  const current = await getUserSpacePreferences(userId);

  const upsertRows = activeSpaceIds.map((spaceId, index) => ({
    user_id: userId,
    space_id: spaceId,
    is_active: true,
    display_order: index,
  }));

  const { error: upsertError } = await supabase
    .from('user_space_preferences')
    .upsert(upsertRows, { onConflict: 'user_id,space_id' });

  if (upsertError) return { error: upsertError };

  const deactivated = current
    .filter((p) => p.isActive && !activeSpaceIds.includes(p.spaceId))
    .map((p) => p.spaceId);

  if (deactivated.length > 0) {
    const { error: deactivateError } = await supabase
      .from('user_space_preferences')
      .update({ is_active: false })
      .eq('user_id', userId)
      .in('space_id', deactivated);

    if (deactivateError) return { error: deactivateError };
  }

  return { error: null };
}

export async function recordBrandSentiment(
  userId: string,
  brandId: string,
  sentiment: 'more' | 'less' | 'blocked',
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('brand_interest')
    .upsert(
      { user_id: userId, brand_id: brandId, sentiment, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,brand_id' },
    );
  return { error };
}

export async function getUserBrandSentiments(
  userId: string,
): Promise<Record<string, 'more' | 'less' | 'blocked'>> {
  const { data, error } = await supabase
    .from('brand_interest')
    .select('brand_id, sentiment')
    .eq('user_id', userId);

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row: any) => [row.brand_id, row.sentiment]),
  );
}

export const getAllSpaces = getSpaces;

export async function getSpaceById(id: string): Promise<Space | null> {
  try {
    const { data, error } = await supabase
      .from('spaces')
      .select('id, title, subtitle')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      subtitle: data.subtitle ?? '',
      items: await fetchItemsForSpace(data.id),
    };
  } catch {
    return null;
  }
}
