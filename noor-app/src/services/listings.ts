import { supabase } from './supabase';
import type { Listing, ListingCategory } from '../types/listing';

interface ListingRow {
  id: string;
  title: string;
  price: number;
  category: string;
  seller_name: string;
  seller_phone: string;
  neighborhood: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

const FALLBACK_IMAGE = 'https://picsum.photos/seed/noor-listing-fallback/600/400';

function mapRow(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    category: row.category as ListingCategory,
    sellerName: row.seller_name,
    sellerPhone: row.seller_phone,
    neighborhood: row.neighborhood,
    description: row.description,
    imageUrl: row.image_url ?? FALLBACK_IMAGE,
  };
}

export async function getListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map(mapRow);
}

export async function getListingById(id: string): Promise<Listing | undefined> {
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data ? mapRow(data) : undefined;
}

export interface NewListingInput {
  title: string;
  price: number;
  category: ListingCategory;
  sellerName: string;
  sellerPhone: string;
  neighborhood: string;
  description: string;
  imageUrl?: string;
}

export async function createListing(input: NewListingInput): Promise<Listing> {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      title: input.title,
      price: input.price,
      category: input.category,
      seller_name: input.sellerName,
      seller_phone: input.sellerPhone,
      neighborhood: input.neighborhood,
      description: input.description,
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return mapRow(data);
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} FCFA`;
}
