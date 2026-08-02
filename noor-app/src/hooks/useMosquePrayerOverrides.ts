import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import {
  clearMosquePrayerOverride,
  getMosquePrayerOverrides,
  setMosquePrayerOverride,
  type MosquePrayerOverrides,
} from '../services/mosquePrayerOverrides';
import type { MosquePrayerTimes } from '../types/mosque';

export function useMosquePrayerOverrides() {
  const [overrides, setOverrides] = useState<MosquePrayerOverrides>({});
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getMosquePrayerOverrides().then((all) => {
        if (active) {
          setOverrides(all);
          setLoaded(true);
        }
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const saveOverride = useCallback(async (mosqueId: string, times: MosquePrayerTimes) => {
    await setMosquePrayerOverride(mosqueId, times);
    setOverrides((current) => ({ ...current, [mosqueId]: times }));
  }, []);

  const clearOverride = useCallback(async (mosqueId: string) => {
    await clearMosquePrayerOverride(mosqueId);
    setOverrides((current) => {
      const next = { ...current };
      delete next[mosqueId];
      return next;
    });
  }, []);

  return { overrides, loaded, saveOverride, clearOverride };
}
