import { MediaItem, MediaType, Status, UserStats } from '../types/media';

export function calculateStats(items: MediaItem[]): UserStats {
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

  // Achievements
  if (stats.totalItems >= 1) stats.achievements.push('first');
  if (stats.byCategory.movie >= 10) stats.achievements.push('movie_buff');
  if (stats.byCategory.book >= 10) stats.achievements.push('bookworm');
  if (stats.byCategory.game >= 5) stats.achievements.push('gamer');
  if (stats.totalItems >= 50) stats.achievements.push('completionist');

  return stats;
}

/**
 * Estimates the total "time consumed" for a user's library.
 */
export function estimateTimeConsumed(items: MediaItem[]): {
  booksPages: number;
  movieHours: number;
  gameHours: number;
} {
  const completed = items.filter((i) => i.status === 'completed');
  const booksPages = completed
    .filter((i) => i.type === 'book')
    .reduce((acc, i) => acc + (i.pages ?? 0), 0);
  const movieHours = completed
    .filter((i) => i.type === 'movie' || i.type === 'tv')
    .reduce((acc, i) => acc + (i.runtime ?? 120) / 60, 0);
  const gameHours = completed
    .filter((i) => i.type === 'game')
    .reduce((acc, i) => acc + (i.hoursPlayed ?? 0), 0);

  return { booksPages, movieHours: Math.round(movieHours), gameHours };
}
