import { MOCK_LISTINGS } from '../data/listings';
import type { Listing } from '../types/listing';

// Signature volontairement asynchrone : quand ce sera branché sur Supabase,
// seul le corps de ces fonctions changera (ex. supabase.from('listings').select()),
// les écrans qui les appellent n'auront rien à modifier.
export async function getListings(): Promise<Listing[]> {
  return MOCK_LISTINGS;
}

export async function getListingById(id: string): Promise<Listing | undefined> {
  return MOCK_LISTINGS.find((listing) => listing.id === id);
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} FCFA`;
}
