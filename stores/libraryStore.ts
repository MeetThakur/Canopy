import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { MediaItem } from '../types/media';

const storage = new MMKV({ id: 'library-storage' });

const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};

interface LibraryState {
  items: Record<string, MediaItem>;
  addItem: (item: MediaItem) => void;
  updateItem: (id: string, updates: Partial<MediaItem>) => void;
  removeItem: (id: string) => void;
  getItems: () => MediaItem[];
  getItemById: (id: string) => MediaItem | undefined;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: {},
      addItem: (item) =>
        set((state) => ({
          items: { ...state.items, [item.id]: item },
        })),
      updateItem: (id, updates) =>
        set((state) => {
          const item = state.items[id];
          if (!item) return state;
          return {
            items: {
              ...state.items,
              [id]: { ...item, ...updates, updatedAt: new Date() },
            },
          };
        }),
      removeItem: (id) =>
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[id];
          return { items: newItems };
        }),
      getItems: () => {
        return Object.values(get().items).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      },
      getItemById: (id) => get().items[id],
    }),
    {
      name: 'library-storage',
      storage: createJSONStorage(() => zustandStorage),
      // Automatically convert string dates back to Date objects on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          for (const key in state.items) {
            const item = state.items[key];
            if (item.createdAt) item.createdAt = new Date(item.createdAt);
            if (item.updatedAt) item.updatedAt = new Date(item.updatedAt);
            if (item.startDate) item.startDate = new Date(item.startDate);
            if (item.endDate) item.endDate = new Date(item.endDate);
          }
        }
      },
    }
  )
);
