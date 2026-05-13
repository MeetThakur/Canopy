import { create } from 'zustand';
import { useLibraryStore } from './libraryStore';
import { MediaType, Status, UserStats } from '../types/media';

interface StatsState {
  stats: UserStats;
  recalculateStats: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: {
    totalItems: 0,
    byCategory: { book: 0, movie: 0, tv: 0, game: 0 },
    byStatus: { want: 0, inprogress: 0, completed: 0 },
    achievements: [],
  },
  recalculateStats: () => {
    const items = useLibraryStore.getState().getItems();
    
    const stats: UserStats = {
      totalItems: items.length,
      byCategory: { book: 0, movie: 0, tv: 0, game: 0 },
      byStatus: { want: 0, inprogress: 0, completed: 0 },
      achievements: [],
    };

    items.forEach((item) => {
      stats.byCategory[item.type]++;
      stats.byStatus[item.status]++;
    });

    if (stats.totalItems > 0) stats.achievements.push('First Item Logged');
    if (stats.byCategory.movie >= 10) stats.achievements.push('Movie Buff');
    if (stats.byCategory.book >= 10) stats.achievements.push('Bookworm');
    if (stats.totalItems >= 50) stats.achievements.push('Completionist');

    set({ stats });
  },
}));

// We can subscribe to library changes to automatically recalculate
useLibraryStore.subscribe(() => {
  useStatsStore.getState().recalculateStats();
});
