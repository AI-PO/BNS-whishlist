// env.ts — safe for Vercel builds without all vars set.
// Required vars (Supabase, wallet) will surface errors at runtime, not build time.

export const NEXT_PUBLIC_NETWORK =
  process.env.NEXT_PUBLIC_NETWORK ?? "mainnet";

export const NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL ?? "";

export const NEXT_PUBLIC_SUPABASE_WISHLIST_URL =
  process.env.NEXT_PUBLIC_SUPABASE_WISHLIST_URL ?? "";

export const NEXT_PUBLIC_SUPABASE_WISHLIST_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_WISHLIST_ANON_KEY ?? "";

export const NEXT_PUBLIC_WALLET_URL =
  process.env.NEXT_PUBLIC_WALLET_URL ?? "";

export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export const NEXT_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const NEXT_PUBLIC_EXCHANGE_URL =
  process.env.NEXT_PUBLIC_EXCHANGE_URL ?? "";

export const NEXT_PUBLIC_BLOCK_EXPLORER_URL =
  process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL ?? "";

export const NEXT_PUBLIC_SCL_NODE_URL =
  process.env.NEXT_PUBLIC_SCL_NODE_URL ?? "";

export const NEXT_PUBLIC_EXPLORER_APP_URL =
  process.env.NEXT_PUBLIC_EXPLORER_APP_URL ?? "";

export const NEXT_PUBLIC_USE_MOCK_API =
  process.env.NEXT_PUBLIC_USE_MOCK_API ?? "true";

export const NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID ?? "";

export const NEXT_PUBLIC_TOKEN_FAUCET_CONTRACT_ID =
  process.env.NEXT_PUBLIC_TOKEN_FAUCET_CONTRACT_ID ?? "";
