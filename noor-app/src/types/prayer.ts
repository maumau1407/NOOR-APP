export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTime {
  name: PrayerName;
  label: string;
  date: Date;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
