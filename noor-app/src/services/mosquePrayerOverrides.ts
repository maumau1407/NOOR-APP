import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MosquePrayerTimes } from '../types/mosque';

const OVERRIDES_KEY = 'noor.mosquePrayerOverrides';

export type MosquePrayerOverrides = Record<string, MosquePrayerTimes>;

export async function getMosquePrayerOverrides(): Promise<MosquePrayerOverrides> {
  const raw = await AsyncStorage.getItem(OVERRIDES_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function setMosquePrayerOverride(mosqueId: string, times: MosquePrayerTimes): Promise<void> {
  const all = await getMosquePrayerOverrides();
  all[mosqueId] = times;
  await AsyncStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
}

export async function clearMosquePrayerOverride(mosqueId: string): Promise<void> {
  const all = await getMosquePrayerOverrides();
  delete all[mosqueId];
  await AsyncStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
}
