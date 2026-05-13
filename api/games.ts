import { MediaSearchResult } from '../types/api';

// Get your free key at https://rawg.io/apidocs
const API_KEY = process.env.EXPO_PUBLIC_RAWG_API_KEY ?? '';
const BASE = 'https://api.rawg.io/api';

interface RAWGGame {
  id: number;
  name: string;
  released: string;
  background_image: string | null;
  genres: { name: string }[];
  platforms?: { platform: { name: string } }[];
  metacritic?: number;
}

export async function searchGames(query: string): Promise<MediaSearchResult[]> {
  if (!API_KEY) return [];
  const res = await fetch(`${BASE}/games?search=${encodeURIComponent(query)}&key=${API_KEY}&page_size=15`);
  if (!res.ok) throw new Error('Games search failed');
  const data: { results: RAWGGame[] } = await res.json();
  return data.results.map((g) => ({
    id: String(g.id),
    sourceId: String(g.id),
    type: 'game',
    title: g.name,
    subtitle: g.platforms?.[0]?.platform.name ?? '',
    coverUrl: g.background_image ?? '',
    year: g.released ? parseInt(g.released.split('-')[0], 10) : undefined,
    genre: g.genres.map((gen) => gen.name),
    platform: g.platforms?.map((p) => p.platform.name).join(', '),
  }));
}

export async function getTrendingGames(): Promise<MediaSearchResult[]> {
  if (!API_KEY) return [];
  const res = await fetch(`${BASE}/games?ordering=-rating&key=${API_KEY}&page_size=15`);
  if (!res.ok) throw new Error('Trending games failed');
  const data: { results: RAWGGame[] } = await res.json();
  return data.results.map((g) => ({
    id: String(g.id),
    sourceId: String(g.id),
    type: 'game',
    title: g.name,
    subtitle: g.platforms?.[0]?.platform.name ?? '',
    coverUrl: g.background_image ?? '',
    year: g.released ? parseInt(g.released.split('-')[0], 10) : undefined,
    genre: g.genres.map((gen) => gen.name),
    platform: g.platforms?.map((p) => p.platform.name).join(', '),
  }));
}
