export interface MediaSearchResult {
  id: string;
  sourceId: string;
  type: 'book' | 'movie' | 'tv' | 'game';
  title: string;
  subtitle: string;
  coverUrl: string;
  backdropUrl?: string;
  year?: number;
  releaseDate?: string;
  description?: string;
  genre?: string[];
  language?: string;
  tagline?: string;
  voteAverage?: number;
  popularity?: number;
  // Book-specific
  pages?: number;
  publisher?: string;
  // Movie-specific
  runtime?: number;
  director?: string;
  cast?: string[];
  budget?: number;
  revenue?: number;
  // TV-specific
  seasons?: number;
  numberOfEpisodes?: number;
  network?: string;
  status_tv?: string;
  // Game-specific
  platform?: string;
  developer?: string;
  publisher_game?: string;
  igdbRating?: number;
}
