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
