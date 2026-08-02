import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { PrayerTime } from '../types/prayer';

const ANDROID_CHANNEL_ID = 'prayer-times';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Heures de prière',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

// Ne programme que les prières du jour restant à venir : l'app doit être
// rouverte au moins une fois par jour pour reprogrammer le lendemain.
export async function schedulePrayerNotifications(prayerTimes: PrayerTime[]): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = Date.now();
  const upcoming = prayerTimes.filter((prayer) => prayer.date.getTime() > now);

  await Promise.all(
    upcoming.map((prayer) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayer.label} — c'est l'heure de la prière`,
          body: "Ouvre NOOR pour voir les heures de prière du jour.",
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: prayer.date,
          channelId: ANDROID_CHANNEL_ID,
        },
      })
    )
  );
}

export async function cancelPrayerNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
