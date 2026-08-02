import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITE_MOSQUES_KEY = 'noor.favoriteMosqueIds';
export const MAX_FAVORITE_MOSQUES = 2;

export async function getFavoriteMosqueIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(FAVORITE_MOSQUES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_FAVORITE_MOSQUES) : [];
  } catch {
    return [];
  }
}

export async function setFavoriteMosqueIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITE_MOSQUES_KEY, JSON.stringify(ids.slice(0, MAX_FAVORITE_MOSQUES)));
}
