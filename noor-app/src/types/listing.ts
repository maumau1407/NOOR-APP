export type ListingCategory = 'Viande & Boucherie' | 'Tenues' | 'Traiteur' | 'Autre';

export const LISTING_CATEGORIES: ListingCategory[] = ['Viande & Boucherie', 'Tenues', 'Traiteur', 'Autre'];

export interface Listing {
  id: string;
  title: string;
  price: number; // en FCFA
  category: ListingCategory;
  sellerName: string;
  sellerPhone: string; // format international, ex. +2250712345678
  neighborhood: string;
  description: string;
  imageUrl: string;
}
