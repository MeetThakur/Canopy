import { MediaItem, MediaType, Status } from '../types/media';

/**
 * Formats a duration in minutes to "Xh Ym" string.
 */
export function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Returns a human-readable status label.
 */
export function formatStatus(status: Status): string {
  switch (status) {
    case 'want': return 'Want to Read / Watch / Play';
    case 'inprogress': return 'In Progress';
    case 'completed': return 'Completed';
  }
}

/**
 * Returns a human-readable media type label.
 */
export function formatType(type: MediaType): string {
  switch (type) {
    case 'book': return 'Book';
    case 'movie': return 'Movie';
    case 'tv': return 'TV Show';
    case 'game': return 'Game';
  }
}

/**
 * Formats a rating number to a display string (e.g. 4.5 → "4.5 / 5").
 */
export function formatRating(rating: number): string {
  if (rating === 0) return 'Not rated';
  return `${rating} / 5`;
}

/**
 * Pluralizes a word based on count.
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
