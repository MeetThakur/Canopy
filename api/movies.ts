import { MediaSearchResult } from '../types/api';

// Get your free key at https://www.themoviedb.org/settings/api
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';
const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  genre_ids: number[];
  runtime?: number;
}

interface TMDBShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  number_of_seasons?: number;
}

interface TMDBTrendingResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
}

function yearFromDate(dateStr: string): number | undefined {
  const y = parseInt(dateStr?.split('-')[0] ?? '', 10);
  return isNaN(y) ? undefined : y;
}

export async function searchMovies(query: string): Promise<MediaSearchResult[]> {
  if (!API_KEY) return [];
  const res = await fetch(`${BASE}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Movie search failed');
  const data: { results: TMDBMovie[] } = await res.json();
  return data.results.map((m) => ({
    id: String(m.id),
    sourceId: String(m.id),
    type: 'movie',
    title: m.title,
    subtitle: '',
    coverUrl: m.poster_path ? `${IMG}${m.poster_path}` : '',
    year: yearFromDate(m.release_date),
    description: m.overview,
    runtime: m.runtime,
  }));
}

export async function searchTV(query: string): Promise<MediaSearchResult[]> {
  if (!API_KEY) return [];
  const res = await fetch(`${BASE}/search/tv?query=${encodeURIComponent(query)}&api_key=${API_KEY}`);
  if (!res.ok) throw new Error('TV search failed');
  const data: { results: TMDBShow[] } = await res.json();
  return data.results.map((s) => ({
    id: String(s.id),
    sourceId: String(s.id),
    type: 'tv',
    title: s.name,
    subtitle: '',
    coverUrl: s.poster_path ? `${IMG}${s.poster_path}` : '',
    year: yearFromDate(s.first_air_date),
    description: s.overview,
    seasons: s.number_of_seasons,
  }));
}

export async function getTrendingAll(): Promise<MediaSearchResult[]> {
  if (!API_KEY) return [];
  const res = await fetch(`${BASE}/trending/all/week?api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Trending fetch failed');
  const data: { results: TMDBTrendingResult[] } = await res.json();
  return data.results
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => ({
      id: String(r.id),
      sourceId: String(r.id),
      type: r.media_type as 'movie' | 'tv',
      title: r.title ?? r.name ?? '',
      subtitle: '',
      coverUrl: r.poster_path ? `${IMG}${r.poster_path}` : '',
      year: yearFromDate(r.release_date ?? r.first_air_date ?? ''),
      description: r.overview,
    }));
}
