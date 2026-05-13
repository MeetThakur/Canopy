import { create } from 'zustand';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

// In a real app, we would persist this to MMKV, but for simplicity here we just use zustand memory first
// Or actually we should persist it.
import { MMKV } from 'react-native-mmkv';
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';

const storage = new MMKV({ id: 'theme-storage' });

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

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

export function useTheme() {
  const { themeMode } = useThemeStore();
  const systemColorScheme = useColorScheme();
  
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  
  return {
    isDark,
    themeMode,
  };
}
