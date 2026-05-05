# Bitcoin Names — Waitlist

Pre-launch landing page for Bitcoin Names. Captures email + desired .btc name into Supabase. No wallet required, no payments.

## Goal
Collect emails and domain reservations before launch. Users commit their interest; no funds are charged.

## Stack
- Next.js 15 (App Router)
- Tailwind CSS v4
- Supabase (wishlist table)
- Orobit branding / design system

## Setup

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_WISHLIST_URL and NEXT_PUBLIC_SUPABASE_WISHLIST_ANON_KEY
# Set NEXT_PUBLIC_USE_MOCK_API=true for local dev without Supabase
npm install
npm run dev
```

## Supabase schema

```sql
create table wishlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  domain text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table wishlist enable row level security;

-- Allow anonymous inserts only
create policy "Allow anon inserts" on wishlist
  for insert to anon with check (true);
```

## Key changes from original
- `DomainChecker`: "Claim" → "Reserve", scrolls to #waitlist instead of /register
- `StickyNav`: Marketplace link removed, CTA = "Reserve your name"
- `Landing`: MarketplacePreview section removed
- No wallet connection, no /register, no /marketplace, no /profile routes

## Deploy
Vercel — set env vars in dashboard. Works with the existing `deploy-vercel.yml` workflow.
