import type { Mosque } from '../types/mosque';

// Données de test en dur, à remplacer par de vraies données (Supabase) plus tard.
export const MOCK_MOSQUES: Mosque[] = [
  {
    id: '1',
    name: 'Mosquée Al-Nour de Cocody',
    neighborhood: 'Cocody',
    address: 'Rue des Jardins, Cocody Angré, Abidjan',
    phone: '+225 07 12 34 56 78',
  },
  {
    id: '2',
    name: 'Mosquée Assalam de Yopougon',
    neighborhood: 'Yopougon',
    address: 'Boulevard Principal, Yopougon Selmer, Abidjan',
    phone: '+225 05 23 45 67 89',
  },
  {
    id: '3',
    name: 'Grande Mosquée de Treichville',
    neighborhood: 'Treichville',
    address: 'Avenue 16, Treichville, Abidjan',
    phone: '+225 01 34 56 78 90',
  },
  {
    id: '4',
    name: 'Mosquée Al-Fourkane de Marcory',
    neighborhood: 'Marcory',
    address: 'Rue du Commerce, Marcory Zone 4, Abidjan',
    phone: '+225 07 45 67 89 01',
  },
  {
    id: '5',
    name: 'Mosquée Ibn Sina d\'Adjamé',
    neighborhood: 'Adjamé',
    address: 'Rue du Marché, Adjamé, Abidjan',
    phone: '+225 05 56 78 90 12',
  },
];
