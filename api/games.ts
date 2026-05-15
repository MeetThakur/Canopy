import { MediaSearchResult } from "../types/api";

const CLIENT_ID = process.env.EXPO_PUBLIC_IGDB_CLIENT_ID ?? "";
const ACCESS_TOKEN = process.env.EXPO_PUBLIC_IGDB_ACCESS_TOKEN ?? "";
const BASE = "https://api.igdb.com/v4";

interface IGDBGame {
  id: number;
  name: string;
  first_release_date?: number;
  summary?: string;
  storyline?: string;
  cover?: { url: string };
  genres?: { name: string }[];
  platforms?: { name: string }[];
  involved_companies?: {
    company: { name: string };
    developer: boolean;
    publisher: boolean;
  }[];
  rating?: number;
  aggregated_rating?: number;
  themes?: { name: string }[];
}

async function fetchIGDB(endpoint: string, body: string): Promise<any[]> {
  if (!CLIENT_ID || !ACCESS_TOKEN) return [];

  const res = await fetch(`${BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      Accept: "application/json",
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!res.ok) {
    console.error("IGDB Error:", await res.text());
    throw new Error("IGDB request failed");
  }

  return await res.json();
}

function buildCoverUrl(url?: string): string {
  if (!url) return "";
  const full = url.startsWith("//") ? `https:${url}` : url;
  return full.replace("t_thumb", "t_cover_big");
}

function mapIGDBToSearchResult(g: IGDBGame): MediaSearchResult {
  const developer = g.involved_companies?.find((c) => c.developer)?.company.name ?? "";
  const publisher = g.involved_companies?.find((c) => c.publisher)?.company.name ?? "";
  const platforms = g.platforms?.map((p) => p.name) ?? [];
  const allGenres = [
    ...(g.genres?.map((gen) => gen.name) ?? []),
    ...(g.themes?.map((t) => t.name) ?? []),
  ];

  return {
    id: String(g.id),
    sourceId: String(g.id),
    type: "game",
    title: g.name,
    subtitle: developer || publisher,
    coverUrl: buildCoverUrl(g.cover?.url),
    year: g.first_release_date
      ? new Date(g.first_release_date * 1000).getFullYear()
      : undefined,
    releaseDate: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
      : undefined,
    genre: allGenres.slice(0, 5),
    platform: platforms.join(", "),
    developer,
    publisher_game: publisher,
    description: g.storyline || g.summary,
    igdbRating: g.rating ? Math.round(g.rating) / 10 : undefined,
  };
}

export async function searchGames(query: string): Promise<MediaSearchResult[]> {
  if (!CLIENT_ID || !ACCESS_TOKEN) return [];

  const safeQuery = query.replace(/"/g, '\\"');
  const body = `
    search "${safeQuery}";
    fields name, summary, storyline, first_release_date, cover.url,
           genres.name, platforms.name, themes.name,
           involved_companies.company.name, involved_companies.developer,
           involved_companies.publisher, rating, aggregated_rating;
    limit 15;
  `;

  const results = await fetchIGDB("games", body);
  return results.map(mapIGDBToSearchResult);
}

export async function getGameDetails(id: string): Promise<MediaSearchResult | null> {
  if (!CLIENT_ID || !ACCESS_TOKEN) return null;
  try {
    const body = `
      fields name, summary, storyline, first_release_date, cover.url,
             genres.name, platforms.name, themes.name,
             involved_companies.company.name, involved_companies.developer,
             involved_companies.publisher, rating, aggregated_rating;
      where id = ${id};
    `;
    const results = await fetchIGDB("games", body);
    if (!results.length) return null;
    return mapIGDBToSearchResult(results[0]);
  } catch {
    return null;
  }
}

export async function getTrendingGames(): Promise<MediaSearchResult[]> {
  if (!CLIENT_ID || !ACCESS_TOKEN) return [];

  const body = `
    fields name, summary, storyline, first_release_date, cover.url,
           genres.name, platforms.name, themes.name,
           involved_companies.company.name, involved_companies.developer,
           involved_companies.publisher, rating;
    sort rating desc;
    where rating_count > 50 & first_release_date != null;
    limit 15;
  `;

  const results = await fetchIGDB("games", body);
  return results.map(mapIGDBToSearchResult);
}
