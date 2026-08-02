-- NOOR — Marketplace : table "listings"
-- À exécuter dans le Dashboard Supabase → SQL Editor → New query → Run.

-- 1) La table elle-même : une ligne = une annonce.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price integer not null check (price > 0),
  category text not null check (category in ('Viande & Boucherie', 'Tenues', 'Traiteur', 'Autre')),
  seller_name text not null,
  seller_phone text not null,
  neighborhood text not null,
  description text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

-- 2) Active la sécurité "Row Level Security" (RLS).
-- Sans ça, par défaut, Supabase bloque tout accès à la table dès que RLS
-- est actif sur le projet (recommandé) — il faut donc des "policies"
-- explicites pour autoriser la lecture et l'écriture.
alter table public.listings enable row level security;

-- 3) Policy de lecture : tout le monde peut voir les annonces
-- (l'app n'a pas encore de comptes utilisateurs, donc pas besoin d'être
-- connecté pour consulter le marketplace).
create policy "Les annonces sont visibles par tous"
  on public.listings
  for select
  using (true);

-- 4) Policy d'écriture : tout le monde peut publier une annonce, pour
-- l'instant.
-- ⚠️ Politique volontairement ouverte le temps qu'il n'y ait pas de
-- comptes utilisateurs. À restreindre plus tard (ex. réserver l'insertion
-- aux utilisateurs authentifiés via `with check (auth.uid() is not null)`),
-- sans quoi n'importe qui connaissant la clé publique de l'app pourrait
-- publier des annonces en masse (spam).
create policy "Tout le monde peut publier une annonce (temporaire, sans auth)"
  on public.listings
  for insert
  with check (true);
