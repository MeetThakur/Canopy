import { MediaSearchResult } from '../types/api';

const OMDB_API_KEY = 'thewdb';
const OMDB_BASE = 'https://www.omdbapi.com';
const TVMAZE_BASE = 'https://api.tvmaze.com';

function yearFromDate(dateStr: string): number | undefined {
  const y = parseInt(dateStr?.split('-')[0] ?? '', 10);
  return isNaN(y) ? undefined : y;
}

export async function searchMovies(query: string): Promise<MediaSearchResult[]> {
  const res = await fetch(`${OMDB_BASE}/?apikey=${OMDB_API_KEY}&type=movie&s=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Movie search failed');
  const data = await res.json();
  if (data.Response === 'False' || !data.Search) return [];
  
  return data.Search.slice(0, 15).map((m: any) => ({
    id: m.imdbID,
    sourceId: m.imdbID,
    type: 'movie' as const,
    title: m.Title,
    subtitle: '',
    coverUrl: m.Poster && m.Poster !== 'N/A' ? m.Poster : '',
    year: parseInt(m.Year, 10) || undefined,
  }));
}

export async function getMovieDetails(id: string): Promise<MediaSearchResult | null> {
  try {
    const res = await fetch(`${OMDB_BASE}/?apikey=${OMDB_API_KEY}&i=${id}&plot=full`);
    if (!res.ok) return null;
    const m = await res.json();
    if (m.Response === 'False') return null;

    return {
      id: m.imdbID,
      sourceId: m.imdbID,
      type: 'movie',
      title: m.Title,
      subtitle: m.Director !== 'N/A' ? m.Director : '',
      coverUrl: m.Poster !== 'N/A' ? m.Poster : '',
      year: parseInt(m.Year, 10) || undefined,
      description: m.Plot !== 'N/A' ? m.Plot : '',
      runtime: m.Runtime !== 'N/A' ? parseInt(m.Runtime, 10) : undefined,
      genre: m.Genre !== 'N/A' ? m.Genre.split(', ') : [],
      director: m.Director !== 'N/A' ? m.Director : '',
      cast: m.Actors !== 'N/A' ? m.Actors.split(', ') : [],
      imdbRating: m.imdbRating !== 'N/A' ? m.imdbRating : undefined,
      boxOffice: m.BoxOffice !== 'N/A' ? m.BoxOffice : undefined,
      awards: m.Awards !== 'N/A' ? m.Awards : undefined,
    };
  } catch {
    return null;
  }
}

export async function searchTV(query: string): Promise<MediaSearchResult[]> {
  const res = await fetch(`${TVMAZE_BASE}/search/shows?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('TV search failed');
  const data: any[] = await res.json();
  
  return data.slice(0, 15).map((s) => {
    const show = s.show;
    return {
      id: String(show.id),
      sourceId: String(show.id),
      type: 'tv' as const,
      title: show.name,
      subtitle: show.network?.name || '',
      coverUrl: show.image?.original || show.image?.medium || '',
      year: show.premiered ? parseInt(show.premiered.split('-')[0], 10) : undefined,
      description: show.summary ? show.summary.replace(/<[^>]+>/g, '') : '', 
      genre: show.genres || [],
    };
  });
}

export async function getTVDetails(id: string): Promise<MediaSearchResult | null> {
  try {
    const res = await fetch(`${TVMAZE_BASE}/shows/${id}`);
    if (!res.ok) return null;
    const show = await res.json();

    return {
      id: String(show.id),
      sourceId: String(show.id),
      type: 'tv',
      title: show.name,
      subtitle: show.network?.name || '',
      coverUrl: show.image?.original || show.image?.medium || '',
      year: show.premiered ? parseInt(show.premiered.split('-')[0], 10) : undefined,
      description: show.summary ? show.summary.replace(/<[^>]+>/g, '') : '',
      genre: show.genres || [],
      network: show.network?.name || '',
      status_tv: show.status,
      imdbRating: show.rating?.average ? String(show.rating.average) : undefined,
    };
  } catch {
    return null;
  }
}

export async function getTrendingAll(): Promise<MediaSearchResult[]> {
  // Gracefully fallback to empty since TVMaze/OMDB don't have a simple unified trending endpoint without extra setup
  return [];
}
