import { MediaSearchResult } from "../types/api";

const HARDCOVER_TOKEN = process.env.EXPO_PUBLIC_HARDCOVER_TOKEN;
const BASE = "https://api.hardcover.app/v1/graphql";

interface HardcoverDocument {
  id: string;
  title: string;
  subtitle?: string;
  author_names?: string[];
  image?: { url: string };
  release_year?: number;
  pages?: number;
  description?: string;
  genres?: string[];
}

interface HardcoverSearchResult {
  document: HardcoverDocument;
}

function mapHardcoverToSearchResult(doc: HardcoverDocument): MediaSearchResult {
  return {
    id: String(doc.id),
    sourceId: String(doc.id),
    type: "book",
    title: doc.title,
    subtitle: doc.author_names?.[0] ?? doc.subtitle ?? "Unknown Author",
    coverUrl: doc.image?.url ?? "",
    year: doc.release_year,
    pages: doc.pages,
    description: doc.description,
    genre: doc.genres?.slice(0, 3),
  };
}

export async function searchBooks(query: string): Promise<MediaSearchResult[]> {
  const graphqlQuery = `
    query SearchBooks($query: String!) {
      search(query: $query) {
        results
      }
    }
  `;

  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HARDCOVER_TOKEN}`,
    },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { query },
    }),
  });

  if (!res.ok) throw new Error("Books search failed");
  const data = await res.json();

  if (data.errors) {
    console.error("Hardcover API Errors:", data.errors);
    throw new Error("Books search failed via Hardcover");
  }

  const results = data.data?.search?.results;
  if (!results || !results.hits) return [];

  return results.hits.map((hit: HardcoverSearchResult) =>
    mapHardcoverToSearchResult(hit.document),
  );
}

export async function getTrendingBooks(): Promise<MediaSearchResult[]> {
  return searchBooks("bestseller");
}
