import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MediaItem } from "../types/media";

interface LibraryState {
  items: Record<string, MediaItem>;
  order: string[];
  addItem: (item: MediaItem) => void;
  updateItem: (id: string, updates: Partial<MediaItem>) => void;
  removeItem: (id: string) => void;
  reorderItems: (newOrder: string[]) => void;
  getItems: () => MediaItem[];
  getItemById: (id: string) => MediaItem | undefined;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: {},
      order: [],
      addItem: (item) =>
        set((state) => ({
          items: { ...state.items, [item.id]: item },
          order: [item.id, ...state.order],
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
          return {
            items: newItems,
            order: state.order.filter((itemId) => itemId !== id),
          };
        }),
      reorderItems: (newOrder) => set({ order: newOrder }),
      getItems: () => {
        const state = get();
        // If an item isn't in `order`, it will just be added to the end
        const orderedItems: MediaItem[] = [];
        const itemsCopy = { ...state.items };
        for (const id of state.order) {
          if (itemsCopy[id]) {
            orderedItems.push(itemsCopy[id]);
            delete itemsCopy[id];
          }
        }
        const remainingItems = Object.values(itemsCopy).sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        return [...orderedItems, ...remainingItems];
      },
      getItemById: (id) => get().items[id],
    }),
    {
      name: "library-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Automatically convert string dates back to Date objects on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.order) state.order = [];
          for (const key in state.items) {
            const item = state.items[key];
            if (item.createdAt) item.createdAt = new Date(item.createdAt);
            if (item.updatedAt) item.updatedAt = new Date(item.updatedAt);
            if (item.startDate) item.startDate = new Date(item.startDate);
            if (item.endDate) item.endDate = new Date(item.endDate);
          }
        }
      },
    },
  ),
);
