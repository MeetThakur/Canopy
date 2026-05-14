import { MediaSearchResult } from '../types/api';

// IGDB requires a Twitch Client ID and an OAuth Access Token.
// You can get these by creating an app at https://dev.twitch.tv/console
// To generate an access token, use:
// POST https://id.twitch.tv/oauth2/token?client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&grant_type=client_credentials
const CLIENT_ID = process.env.EXPO_PUBLIC_IGDB_CLIENT_ID ?? '';
const ACCESS_TOKEN = process.env.EXPO_PUBLIC_IGDB_ACCESS_TOKEN ?? '';
const BASE = 'https://api.igdb.com/v4';

interface IGDBGame {
  id: number;
  name: string;
  first_release_date?: number; // Unix timestamp
  cover?: {
    url: string;
  };
  genres?: { name: string }[];
  platforms?: { name: string }[];
}

async function fetchIGDB(endpoint: string, body: string): Promise<IGDBGame[]> {
  if (!CLIENT_ID || !ACCESS_TOKEN) return [];
  
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': CLIENT_ID,
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Accept': 'application/json',
      // IGDB uses plain text body for its APICalypse query language
      'Content-Type': 'text/plain',
    },
    body,
  });

  if (!res.ok) {
    console.error('IGDB Error:', await res.text());
    throw new Error('IGDB request failed');
  }

  return await res.json();
}

function mapIGDBToSearchResult(g: IGDBGame): MediaSearchResult {
  // IGDB cover URLs often start with //images.igdb.com and are thumbnails by default.
  // We change t_thumb to t_cover_big to get a better quality image.
  let coverUrl = '';
  if (g.cover?.url) {
    coverUrl = g.cover.url.startsWith('//') ? `https:${g.cover.url}` : g.cover.url;
    coverUrl = coverUrl.replace('t_thumb', 't_cover_big');
  }

  return {
    id: String(g.id),
    sourceId: String(g.id),
    type: 'game',
    title: g.name,
    subtitle: g.platforms?.[0]?.name ?? '',
    coverUrl,
    year: g.first_release_date ? new Date(g.first_release_date * 1000).getFullYear() : undefined,
    genre: g.genres?.map((gen) => gen.name),
    platform: g.platforms?.map((p) => p.name).join(', '),
  };
}

export async function searchGames(query: string): Promise<MediaSearchResult[]> {
  if (!CLIENT_ID || !ACCESS_TOKEN) return [];
  
  // Note: we escape quotes in the query
  const safeQuery = query.replace(/"/g, '\\"');
  
  const body = `
    search "${safeQuery}";
    fields name, first_release_date, cover.url, genres.name, platforms.name;
    limit 15;
  `;
  
  const results = await fetchIGDB('games', body);
  return results.map(mapIGDBToSearchResult);
}

export async function getTrendingGames(): Promise<MediaSearchResult[]> {
  if (!CLIENT_ID || !ACCESS_TOKEN) return [];
  
  const body = `
    fields name, first_release_date, cover.url, genres.name, platforms.name;
    sort rating desc;
    where rating_count > 50 & first_release_date != null;
    limit 15;
  `;
  
  const results = await fetchIGDB('games', body);
  return results.map(mapIGDBToSearchResult);
}
