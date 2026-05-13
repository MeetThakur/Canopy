export type MediaType = 'book' | 'movie' | 'tv' | 'game';
export type Status = 'want' | 'inprogress' | 'completed';

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

  // Type-specific fields (optional)
  pages?: number;
  pagesRead?: number;
  runtime?: number;
  seasons?: number;
  episodesWatched?: number;
  platform?: string;
  hoursPlayed?: number;
  genre?: string[];
  year?: number;
  language?: string;
}

export interface UserStats {
  totalItems: number;
  byCategory: Record<MediaType, number>;
  byStatus: Record<Status, number>;
  achievements: string[];
}
