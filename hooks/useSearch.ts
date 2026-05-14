import { useCallback, useRef } from 'react';
import { useSearchStore } from '../stores/searchStore';

/**
 * Hook providing a debounced search function bound to the search store.
 */
export function useSearch(delayMs = 300) {
  const { query, category, results, recentSearches, loading, error,
    setQuery, setCategory, search, clearRecentSearches } = useSearchStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (text.trim().length > 1) {
      timerRef.current = setTimeout(() => search(), delayMs);
    }
  }, [setQuery, search, delayMs]);

  return {
    query,
    category,
    results,
    recentSearches,
    loading,
    error,
    handleQueryChange,
    setCategory,
    clearRecentSearches,
    triggerSearch: search,
  };
}
