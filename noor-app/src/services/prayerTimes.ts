import {
  CalculationMethod,
  Coordinates as AdhanCoordinates,
  PrayerTimes as AdhanPrayerTimes,
} from 'adhan';

import type { MosquePrayerTimes } from '../types/mosque';
import type { Coordinates, PrayerName, PrayerTime } from '../types/prayer';

export type CalculationMethodName = keyof typeof CalculationMethod;

// Recommandée pour l'Afrique de l'Ouest en l'absence de méthode officielle
// locale ; modifiable plus tard (ex. écran de réglages).
export const DEFAULT_CALCULATION_METHOD: CalculationMethodName = 'MuslimWorldLeague';

const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export function getPrayerTimesForDate(
  coordinates: Coordinates,
  date: Date,
  method: CalculationMethodName = DEFAULT_CALCULATION_METHOD
): PrayerTime[] {
  const adhanCoordinates = new AdhanCoordinates(coordinates.latitude, coordinates.longitude);
  const params = CalculationMethod[method]();
  const times = new AdhanPrayerTimes(adhanCoordinates, date, params);

  return PRAYER_ORDER.map((name) => ({
    name,
    label: PRAYER_LABELS[name],
    date: times[name],
  }));
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

// Convertit les horaires publiés par une mosquée (chaînes "HH:MM", fixes au
// jour le jour) en PrayerTime[] pour une date donnée, avec la même forme que
// getPrayerTimesForDate afin de rester interchangeables dans l'UI.
export function getMosquePrayerTimesForDate(prayerTimes: MosquePrayerTimes, date: Date): PrayerTime[] {
  return PRAYER_ORDER.map((name) => ({
    name,
    label: PRAYER_LABELS[name],
    date: combineDateAndTime(date, prayerTimes[name]),
  }));
}

export function findNextPrayer(
  todayPrayerTimes: PrayerTime[],
  tomorrowFajr: PrayerTime,
  now: Date
): PrayerTime {
  const upcoming = todayPrayerTimes.find((prayer) => prayer.date.getTime() > now.getTime());
  return upcoming ?? tomorrowFajr;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatCountdown(targetDate: Date, now: Date): string {
  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
