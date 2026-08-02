export interface MosquePrayerTimes {
  fajr: string; // format "HH:MM"
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface Mosque {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  phone: string;
  // Horaires publiés par la mosquée elle-même. Absent = pas d'horaires
  // personnalisés, on retombe sur le calcul automatique par géolocalisation.
  prayerTimes?: MosquePrayerTimes;
}
