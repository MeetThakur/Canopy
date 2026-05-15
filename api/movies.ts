import { MediaSearchResult } from '../types/api';

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';
const BASE = 'https://api.themoviedb.org/3';
const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';

function yearFromDate(dateStr: string): number | undefined {
  const y = parseInt(dateStr?.split('-')[0] ?? '', 10);
  return isNaN(y) ? undefined : y;
}

export async function searchMovies(query: string): Promise<MediaSearchResult[]> {
  if (!API_KEY) return [];
  const res = await fetch(`${BASE}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}&append_to_response=credits`);
  if (!res.ok) throw new Error('Movie search failed');
  const data: { results: any[] } = await res.json();

  // For search results, fetch details for top 5 to get credits
  const results = data.results.slice(0, 15);
  return results.map((m) => ({
    id: String(m.id),
    sourceId: String(m.id),
    type: 'movie' as const,
    title: m.title,
    subtitle: '',
    coverUrl: m.poster_path ? `${IMG_W500}${m.poster_path}` : '',
    backdropUrl: m.backdrop_path ? `${IMG_ORIGINAL}${m.backdrop_path}` : '',
    year: yearFromDate(m.release_date),
    releaseDate: m.release_date,
    description: m.overview,
    genre: [],
    popularity: m.popularity,
    voteAverage: m.vote_average,
  }));
}

export async function getMovieDetails(id: string): Promise<MediaSearchResult | null> {
  if (!API_KEY) return null;
  try {
    const [detailRes, creditsRes] = await Promise.all([
      fetch(`${BASE}/movie/${id}?api_key=${API_KEY}`),
      fetch(`${BASE}/movie/${id}/credits?api_key=${API_KEY}`),
    ]);
    if (!detailRes.ok) return null;
    const m = await detailRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { crew: [], cast: [] };

    const director = credits.crew?.find((c: any) => c.job === 'Director')?.name ?? '';
    const cast = credits.cast?.slice(0, 5).map((c: any) => c.name) ?? [];

    return {
      id: String(m.id),
      sourceId: String(m.id),
      type: 'movie',
      title: m.title,
      subtitle: director,
      coverUrl: m.poster_path ? `${IMG_W500}${m.poster_path}` : '',
      backdropUrl: m.backdrop_path ? `${IMG_ORIGINAL}${m.backdrop_path}` : '',
      year: yearFromDate(m.release_date),
      releaseDate: m.release_date,
      description: m.overview,
      runtime: m.runtime,
      genre: m.genres?.map((g: any) => g.name) ?? [],
      language: m.original_language,
      director,
      cast,
      tagline: m.tagline,
      budget: m.budget,
      revenue: m.revenue,
      voteAverage: m.vote_average,
    };
  } catch {
    return null;
  }
}

export async function searchTV(query: string): Promise<MediaSearchResult[]> {
  if (!API_KEY) return [];
  const res = await fetch(`${BASE}/search/tv?query=${encodeURIComponent(query)}&api_key=${API_KEY}`);
  if (!res.ok) throw new Error('TV search failed');
  const data: { results: any[] } = await res.json();
  return data.results.slice(0, 15).map((s) => ({
    id: String(s.id),
    sourceId: String(s.id),
    type: 'tv' as const,
    title: s.name,
    subtitle: '',
    coverUrl: s.poster_path ? `${IMG_W500}${s.poster_path}` : '',
    backdropUrl: s.backdrop_path ? `${IMG_ORIGINAL}${s.backdrop_path}` : '',
    year: yearFromDate(s.first_air_date),
    releaseDate: s.first_air_date,
    description: s.overview,
    seasons: s.number_of_seasons,
    genre: [],
  }));
}

export async function getTVDetails(id: string): Promise<MediaSearchResult | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${BASE}/tv/${id}?api_key=${API_KEY}`);
    if (!res.ok) return null;
    const s = await res.json();
    const creator = s.created_by?.[0]?.name ?? '';
    const cast = s.credits?.cast?.slice(0, 5).map((c: any) => c.name) ?? [];

    return {
      id: String(s.id),
      sourceId: String(s.id),
      type: 'tv',
      title: s.name,
      subtitle: creator,
      coverUrl: s.poster_path ? `${IMG_W500}${s.poster_path}` : '',
      backdropUrl: s.backdrop_path ? `${IMG_ORIGINAL}${s.backdrop_path}` : '',
      year: yearFromDate(s.first_air_date),
      releaseDate: s.first_air_date,
      description: s.overview,
      seasons: s.number_of_seasons,
      numberOfEpisodes: s.number_of_episodes,
      genre: s.genres?.map((g: any) => g.name) ?? [],
      language: s.original_language,
      network: s.networks?.[0]?.name ?? '',
      status_tv: s.status,
      cast,
    };
  } catch {
    return null;
  }
}

export async function getTrendingAll(): Promise<MediaSearchResult[]> {
  if (!API_KEY) return [];
  const res = await fetch(`${BASE}/trending/all/week?api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Trending fetch failed');
  const data: { results: any[] } = await res.json();
  return data.results
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => ({
      id: String(r.id),
      sourceId: String(r.id),
      type: r.media_type as 'movie' | 'tv',
      title: r.title ?? r.name ?? '',
      subtitle: '',
      coverUrl: r.poster_path ? `${IMG_W500}${r.poster_path}` : '',
      year: yearFromDate(r.release_date ?? r.first_air_date ?? ''),
      description: r.overview,
    }));
}
