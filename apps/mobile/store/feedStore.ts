import { create } from 'zustand';
import { type Space } from '../lib/spaces';

interface SignalledItem {
  id: string;
  strength: 'weak' | 'medium' | 'strong';
}

interface FeedState {
  signalledItems: SignalledItem[];
  savedItems: string[];
  seenIds: string[];
  activeSpaceId: string | null;
  availableSpaces: Space[];
  userSpaces: Space[];
  brandSentiments: Record<string, 'more' | 'less' | 'blocked'>;
  spacePrefsLoaded: boolean;

  signalItem(id: string, strength: 'weak' | 'medium' | 'strong'): void;
  saveItem(id: string): void;
  markSeen(id: string): void;
  setActiveSpace(id: string): void;
  hasSignalled(id: string): boolean;
  hasSaved(id: string): boolean;
  setAvailableSpaces(spaces: Space[]): void;
  setUserSpaces(spaces: Space[]): void;
  setBrandSentiments(sentiments: Record<string, 'more' | 'less' | 'blocked'>): void;
  setSpacePrefsLoaded(loaded: boolean): void;
  markBrandLess(brandId: string): void;
  markBrandMore(brandId: string): void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  signalledItems: [],
  savedItems: [],
  seenIds: [],
  activeSpaceId: null,
  availableSpaces: [],
  userSpaces: [],
  brandSentiments: {},
  spacePrefsLoaded: false,

  signalItem: (id, strength) =>
    set((state) => ({
      signalledItems: [...state.signalledItems, { id, strength }],
      seenIds: state.seenIds.includes(id) ? state.seenIds : [...state.seenIds, id],
    })),

  saveItem: (id) =>
    set((state) => ({
      savedItems: state.savedItems.includes(id) ? state.savedItems : [...state.savedItems, id],
      seenIds: state.seenIds.includes(id) ? state.seenIds : [...state.seenIds, id],
    })),

  markSeen: (id) =>
    set((state) => ({
      seenIds: state.seenIds.includes(id) ? state.seenIds : [...state.seenIds, id],
    })),

  setActiveSpace: (id) => set({ activeSpaceId: id }),

  hasSignalled: (id) => get().signalledItems.some((item) => item.id === id),

  hasSaved: (id) => get().savedItems.includes(id),

  setAvailableSpaces: (spaces) => set({ availableSpaces: spaces }),
  setUserSpaces: (spaces) => set({ userSpaces: spaces }),
  setBrandSentiments: (sentiments) => set({ brandSentiments: sentiments }),
  setSpacePrefsLoaded: (loaded) => set({ spacePrefsLoaded: loaded }),

  markBrandLess: (brandId) =>
    set((state) => ({ brandSentiments: { ...state.brandSentiments, [brandId]: 'less' } })),

  markBrandMore: (brandId) =>
    set((state) => ({ brandSentiments: { ...state.brandSentiments, [brandId]: 'more' } })),
}));
