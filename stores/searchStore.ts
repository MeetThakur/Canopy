import { create } from 'zustand';
import { MediaSearchResult } from '../types/api';
import { unifiedSearch } from '../api/unified';

interface SearchState {
  query: string;
  category: 'all' | 'book' | 'movie' | 'tv' | 'game';
  results: MediaSearchResult[];
  recentSearches: string[];
  loading: boolean;
  error: string | null;
  setQuery: (q: string) => void;
  setCategory: (c: SearchState['category']) => void;
  search: () => Promise<void>;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  category: 'all',
  results: [],
  recentSearches: [],
  loading: false,
  error: null,
  setQuery: (q) => set({ query: q }),
  setCategory: (c) => set({ category: c }),
  search: async () => {
    const { query, category } = get();
    if (!query.trim()) {
      set({ results: [] });
      return;
    }
    set({ loading: true, error: null });
    try {
      const results = await unifiedSearch(query.trim(), category);
      set({ results, loading: false });
      get().addRecentSearch(query.trim());
    } catch (e) {
      set({ error: 'Search failed. Please try again.', loading: false });
    }
  },
  addRecentSearch: (q) =>
    set((state) => ({
      recentSearches: [q, ...state.recentSearches.filter((r) => r !== q)].slice(0, 10),
    })),
  clearRecentSearches: () => set({ recentSearches: [] }),
}));
