import { create } from 'zustand';
import { MediaSearchResult } from '../types/api';
import { fetchTrending } from '../api/unified';

interface DiscoverState {
  movies: MediaSearchResult[];
  books: MediaSearchResult[];
  games: MediaSearchResult[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  fetchTrending: () => Promise<void>;
}

export const useDiscoverStore = create<DiscoverState>((set, get) => ({
  movies: [],
  books: [],
  games: [],
  loading: false,
  error: null,
  lastFetchedAt: null,
  fetchTrending: async () => {
    // Cache for 10 minutes per session
    const { lastFetchedAt } = get();
    if (lastFetchedAt && Date.now() - lastFetchedAt < 10 * 60 * 1000) return;

    set({ loading: true, error: null });
    try {
      const { movies, books, games } = await fetchTrending();
      set({ movies, books, games, loading: false, lastFetchedAt: Date.now() });
    } catch {
      set({ error: 'Could not load trending content.', loading: false });
    }
  },
}));
