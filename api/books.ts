import { MediaSearchResult } from '../types/api';

const BASE = 'https://openlibrary.org';

interface OLDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  language?: string[];
  number_of_pages_median?: number;
  subject?: string[];
}

export async function searchBooks(query: string): Promise<MediaSearchResult[]> {
  const res = await fetch(
    `${BASE}/search.json?q=${encodeURIComponent(query)}&limit=15&fields=key,title,author_name,cover_i,first_publish_year,language,number_of_pages_median,subject`
  );
  if (!res.ok) throw new Error('Books search failed');
  const data: { docs: OLDoc[] } = await res.json();

  return data.docs
    .filter((doc) => doc.title)
    .map((doc) => ({
      id: doc.key,
      sourceId: doc.key,
      type: 'book',
      title: doc.title,
      subtitle: doc.author_name?.[0] ?? 'Unknown Author',
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : '',
      year: doc.first_publish_year,
      language: doc.language?.[0],
      pages: doc.number_of_pages_median,
      genre: doc.subject?.slice(0, 3),
    }));
}

export async function getTrendingBooks(): Promise<MediaSearchResult[]> {
  return searchBooks('bestseller');
}
