import { MediaSearchResult } from "../types/api";

const HARDCOVER_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJIYXJkY292ZXIiLCJ2ZXJzaW9uIjoiOCIsImp0aSI6IjY1MmEzMGIwLTYxNTEtNDE5Mi1iZWEzLTA4OGIyY2FmNWFjMyIsImFwcGxpY2F0aW9uSWQiOjIsInN1YiI6Ijk5MTQwIiwiYXVkIjoiMSIsImlkIjoiOTkxNDAiLCJsb2dnZWRJbiI6dHJ1ZSwiaWF0IjoxNzc4ODMzMTQ3LCJleHAiOjE4MTAzNjkxNDcsImh0dHBzOi8vaGFzdXJhLmlvL2p3dC9jbGFpbXMiOnsieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1yb2xlIjoidXNlciIsIlgtaGFzdXJhLXVzZXItaWQiOiI5OTE0MCJ9LCJ1c2VyIjp7ImlkIjo5OTE0MH19.KIHyF8_0E4i9mhxvVNkUwN93cqQQW42SyZSgWunqeTw";
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
