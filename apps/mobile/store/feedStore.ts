import { create } from 'zustand';

interface SignalledItem {
  id: string;
  strength: 'weak' | 'medium' | 'strong';
}

interface FeedState {
  signalledItems: SignalledItem[];
  savedItems: string[];
  seenIds: string[];
  activeSpaceId: string | null;

  signalItem(id: string, strength: 'weak' | 'medium' | 'strong'): void;
  saveItem(id: string): void;
  markSeen(id: string): void;
  setActiveSpace(id: string): void;
  hasSignalled(id: string): boolean;
  hasSaved(id: string): boolean;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  signalledItems: [],
  savedItems: [],
  seenIds: [],
  activeSpaceId: null,

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
}));
