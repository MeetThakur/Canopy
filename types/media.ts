export type MediaType = "book" | "movie" | "tv" | "game";
export type Status = "want" | "inprogress" | "completed";

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  subtitle: string; // author/director/studio
  coverUrl: string;
  status: Status;
  rating: number; // 0-5
  notes: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sourceId: string; // API id for reference

  // Shared optional fields
  description?: string;
  genre?: string[];
  year?: number;
  language?: string;
  releaseDate?: string; // full date string e.g. "2023-09-22"

  // Book-specific
  pages?: number;
  pagesRead?: number;
  publisher?: string;

  // Movie-specific
  runtime?: number; // minutes
  director?: string;
  cast?: string[];
  budget?: number;
  revenue?: number;
  tagline?: string;
  imdbRating?: string;
  boxOffice?: string;
  awards?: string;

  // TV-specific
  seasons?: number;
  episodesWatched?: number;
  numberOfEpisodes?: number;
  network?: string;
  status_tv?: string; // "Ended", "Returning Series", etc.

  // Game-specific
  platform?: string;
  hoursPlayed?: number;
  developer?: string;
  publisher_game?: string;
  igdbRating?: number;
}

export interface UserStats {
  totalItems: number;
  byCategory: Record<MediaType, number>;
  byStatus: Record<Status, number>;
  achievements: string[];
}
