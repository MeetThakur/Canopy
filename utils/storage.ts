import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic typed getter for AsyncStorage JSON values.
 */
export async function getStoredJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generic typed setter for AsyncStorage JSON values.
 */
export async function setStoredJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/**
 * Remove a key from AsyncStorage.
 */
export async function removeStored(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
