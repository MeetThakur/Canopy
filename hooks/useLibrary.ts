import { useLibraryStore } from '../stores/libraryStore';
import { MediaItem, MediaType, Status } from '../types/media';

/**
 * Convenience hook exposing common library operations.
 */
export function useLibrary() {
  const items = useLibraryStore((s) => s.items);
  const addItem = useLibraryStore((s) => s.addItem);
  const updateItem = useLibraryStore((s) => s.updateItem);
  const removeItem = useLibraryStore((s) => s.removeItem);
  const getItems = useLibraryStore((s) => s.getItems);
  const getItemById = useLibraryStore((s) => s.getItemById);

  const getByType = (type: MediaType) =>
    getItems().filter((i) => i.type === type);

  const getByStatus = (status: Status) =>
    getItems().filter((i) => i.status === status);

  const getInProgress = () => getByStatus('inprogress');
  const getCompleted = () => getByStatus('completed');
  const getWantList = () => getByStatus('want');

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    getItems,
    getItemById,
    getByType,
    getByStatus,
    getInProgress,
    getCompleted,
    getWantList,
  };
}
