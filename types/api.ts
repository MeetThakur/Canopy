export interface MediaSearchResult {
  id: string;
  sourceId: string;
  type: 'book' | 'movie' | 'tv' | 'game';
  title: string;
  subtitle: string;
  coverUrl: string;
  year?: number;
  description?: string;
  genre?: string[];
  // type-specific
  pages?: number;
  runtime?: number;
  seasons?: number;
  platform?: string;
  language?: string;
}
