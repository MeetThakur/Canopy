import { MediaSearchResult } from '../types/api';
import { searchBooks, getTrendingBooks } from './books';
import { searchMovies, searchTV, getTrendingAll } from './movies';
import { searchGames, getTrendingGames } from './games';

type CategoryFilter = 'all' | 'book' | 'movie' | 'tv' | 'game';

export async function unifiedSearch(
  query: string,
  category: CategoryFilter = 'all'
): Promise<MediaSearchResult[]> {
  const searches: Promise<MediaSearchResult[]>[] = [];

  if (category === 'all' || category === 'book') searches.push(searchBooks(query).catch(() => []));
  if (category === 'all' || category === 'movie') searches.push(searchMovies(query).catch(() => []));
  if (category === 'all' || category === 'tv') searches.push(searchTV(query).catch(() => []));
  if (category === 'all' || category === 'game') searches.push(searchGames(query).catch(() => []));

  const results = await Promise.all(searches);
  return results.flat();
}

export async function fetchTrending(): Promise<{
  movies: MediaSearchResult[];
  books: MediaSearchResult[];
  games: MediaSearchResult[];
}> {
  const [tmdb, books, games] = await Promise.all([
    getTrendingAll().catch(() => []),
    getTrendingBooks().catch(() => []),
    getTrendingGames().catch(() => []),
  ]);

  return {
    movies: tmdb.filter((r) => r.type === 'movie' || r.type === 'tv'),
    books,
    games,
  };
}

export async function getMediaDetails(
  type: string,
  sourceId: string
): Promise<MediaSearchResult | null> {
  if (type === 'movie') {
    const { getMovieDetails } = await import('./movies');
    return getMovieDetails(sourceId);
  }
  if (type === 'tv') {
    const { getTVDetails } = await import('./movies');
    return getTVDetails(sourceId);
  }
  if (type === 'game') {
    const { getGameDetails } = await import('./games');
    return getGameDetails(sourceId);
  }
  // Books API currently returns full details in search, or we don't have a separate ID lookup yet.
  return null;
}
