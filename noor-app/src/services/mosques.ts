import { MOCK_MOSQUES } from '../data/mosques';
import type { Mosque } from '../types/mosque';

// Signature volontairement asynchrone : quand ce sera branché sur Supabase,
// seul le corps de cette fonction changera (ex. supabase.from('mosques').select()),
// les écrans qui l'appellent n'auront rien à modifier.
export async function getMosques(): Promise<Mosque[]> {
  return MOCK_MOSQUES;
}

export async function getMosqueById(id: string): Promise<Mosque | undefined> {
  return MOCK_MOSQUES.find((mosque) => mosque.id === id);
}
