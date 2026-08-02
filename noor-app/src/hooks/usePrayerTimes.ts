import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestUserLocation } from '../services/location';
import {
  cancelPrayerNotifications,
  requestNotificationPermission,
  schedulePrayerNotifications,
} from '../services/notifications';
import { DEFAULT_CALCULATION_METHOD, findNextPrayer, getPrayerTimesForDate } from '../services/prayerTimes';
import type { Coordinates, PrayerTime } from '../types/prayer';

const NOTIFICATIONS_ENABLED_KEY = 'noor.prayerNotificationsEnabled';

export type LocationState =
  | { status: 'loading' }
  | { status: 'granted'; coordinates: Coordinates }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error'; message: string };

export function usePrayerTimes() {
  const [locationState, setLocationState] = useState<LocationState>({ status: 'loading' });
  const [now, setNow] = useState(() => new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setLocationState({ status: 'loading' });
    const result = await requestUserLocation();
    if (result.status === 'granted') {
      setLocationState({ status: 'granted', coordinates: result.coordinates });
    } else if (result.status === 'denied') {
      setLocationState({ status: 'denied', canAskAgain: result.canAskAgain });
    } else {
      setLocationState({ status: 'error', message: result.message });
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY).then((value) => {
      if (value === 'true') {
        setNotificationsEnabled(true);
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const coordinatesKey =
    locationState.status === 'granted'
      ? `${locationState.coordinates.latitude},${locationState.coordinates.longitude}`
      : null;
  const dayKey = now.toDateString();

  const { todayPrayerTimes, tomorrowFajr } = useMemo(() => {
    if (locationState.status !== 'granted') {
      return { todayPrayerTimes: [] as PrayerTime[], tomorrowFajr: null as PrayerTime | null };
    }
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTimes = getPrayerTimesForDate(locationState.coordinates, today, DEFAULT_CALCULATION_METHOD);
    const tomorrowTimes = getPrayerTimesForDate(
      locationState.coordinates,
      tomorrow,
      DEFAULT_CALCULATION_METHOD
    );

    return { todayPrayerTimes: todayTimes, tomorrowFajr: tomorrowTimes[0] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinatesKey, dayKey]);

  const nextPrayer = useMemo(() => {
    if (todayPrayerTimes.length === 0 || !tomorrowFajr) {
      return null;
    }
    return findNextPrayer(todayPrayerTimes, tomorrowFajr, now);
  }, [todayPrayerTimes, tomorrowFajr, now]);

  useEffect(() => {
    if (!notificationsEnabled || todayPrayerTimes.length === 0) {
      return;
    }
    let cancelled = false;
    schedulePrayerNotifications(todayPrayerTimes)
      .then(() => {
        if (!cancelled) setNotificationsError(null);
      })
      .catch(() => {
        if (!cancelled) setNotificationsError('Impossible de programmer les notifications.');
      });
    return () => {
      cancelled = true;
    };
  }, [notificationsEnabled, todayPrayerTimes]);

  const toggleNotifications = useCallback(async () => {
    setNotificationsBusy(true);
    setNotificationsError(null);
    try {
      if (notificationsEnabled) {
        await cancelPrayerNotifications();
        setNotificationsEnabled(false);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      } else {
        const granted = await requestNotificationPermission();
        if (!granted) {
          setNotificationsError(
            'Permission de notifications refusée. Active-la dans les réglages du téléphone.'
          );
          return;
        }
        setNotificationsEnabled(true);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
      }
    } finally {
      setNotificationsBusy(false);
    }
  }, [notificationsEnabled]);

  return {
    locationState,
    requestLocation,
    now,
    todayPrayerTimes,
    nextPrayer,
    notificationsEnabled,
    notificationsBusy,
    notificationsError,
    toggleNotifications,
  };
}
