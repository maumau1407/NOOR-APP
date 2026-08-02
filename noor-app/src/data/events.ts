import type { ReligiousEvent } from '../types/event';

// Données de test en dur, à remplacer par de vraies données (Supabase) plus tard.
// mosqueId correspond aux identifiants définis dans src/data/mosques.ts.
export const MOCK_EVENTS: ReligiousEvent[] = [
  {
    id: '1',
    title: 'Conférence : Le sens du sacrifice',
    date: '2026-08-10',
    time: '19:00',
    mosqueId: '1',
    description:
      "Conférence-débat animée par un invité local sur le sens spirituel du sacrifice dans l'islam. Ouvert à tous, hommes et femmes.",
  },
  {
    id: '2',
    title: 'Cours coranique pour enfants',
    date: '2026-08-09',
    time: '16:00',
    mosqueId: '4',
    description:
      "Séance hebdomadaire d'apprentissage du Coran pour les enfants de 6 à 12 ans, avec mémorisation de sourates courtes.",
  },
  {
    id: '3',
    title: 'Mawlid — Célébration de la naissance du Prophète',
    date: '2026-08-15',
    time: '20:00',
    mosqueId: '3',
    description:
      "Soirée de célébration du Mawlid : récitations, chants religieux (nashid) et repas partagé après la prière d'Isha.",
  },
  {
    id: '4',
    title: 'Collecte de dons pour les orphelins',
    date: '2026-08-20',
    time: '09:00',
    mosqueId: '2',
    description:
      "Collecte de vêtements, denrées et dons financiers au profit d'un orphelinat local. Point de collecte à l'entrée de la mosquée.",
  },
  {
    id: '5',
    title: 'Nuit du Doua',
    date: '2026-08-22',
    time: '21:00',
    mosqueId: '5',
    description:
      "Soirée d'invocations collectives (doua) et de rappel (dhikr), suivie d'une collation légère offerte par la mosquée.",
  },
];
