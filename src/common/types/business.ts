import { UserResponse } from "@supabase/supabase-js";

export enum Network {
  TESTNET = "testnet",
  MAINNET = "mainnet",
}

export type SupabaseUser = UserResponse["data"]["user"];

export type TCryptoAddress = {
  value: string;
  isValid: boolean;
};

export enum OrderStatus {
  COMPLETED = "completed",
  PROCESSING = "processing",
}

export enum OrderType {
  PURCHASE = "purchase",
  SALE = "sale",
  BUY = "buy",
  TRANSFER = "transfer",
  RECEIVE = "receive",
  RENEW = "renew",
  PAUSE = "pause",
  DELETE = "delete",
}

export type Order = {
  id: number;
  created_at: string;
  address: string;
  transaction_id: string;
  domain_id: number;
  email: string;
  status: OrderStatus;
  type: OrderType;
};
export type OrderWithDomain = Order & { domains: { domain: string } };

export type Domain = {
  id: number;
  created_at: string;
  address: string;
  domain: string;
  contract_id: string;
  expiry: string;
  // optional on-chain expiry block (when known)
  expiry_block?: number;
  // state: 'pending' | 'active' | 'expired' etc.
  status?: string;
};

export type ListingBid = {
  amount: number;
  price: number;
  bidder: string;
  createdAt: string;
  acceptTx: string;
  fulfillTx: string;
  listingUtxo: string;
  supabaseListingId: number;
  supabaseDomainId: number;
  contractId: string;
  resevedUtxo: string;
  orderId: string;
  fullfilmentUtxos: string[];
  isPending: boolean;
  isCancelled: boolean;
};

export type Listing = {
  contractId: string;
  createdAt: string;
  domain: string;
  listingUtxo: string;
  price: number; // Price in sats
  recAddress: string;
  bestBid: number;
  bidCount: number;
  orderId: string;
  status: SupabaseStatus;
  supabaseListingId: number;
  supabaseDomain: Pick<Domain, "id" | "expiry">;
  isPremium?: boolean; // Optional field to indicate if the listing is premium
};
export type ListingDetailed = Listing & {
  bids: ListingBid[];
};

export enum SupabaseStatus {
  PENDING = 0,
  ACTIVE = 1,
  ENDED = 2,
}

export type SupabaseListing = {
  id: number;
  created_at: string;
  contract_id: string;
  price: number;
  owner: string;
  name: string;
  best_bid: number;
  bid_count: number;
  list_utxo: string;
  order_id: string;
  status: SupabaseStatus;
  domains: { id: number; expiry: string };
};

export type SupabaseBid = {
  id: number;
  created_at: string;
  contract_id: string;
  list_utxo: string;
  bid_utxo: string;
  owner: string;
  price: number;
  status: SupabaseStatus;
};

export type SupabaseBidWithListing = SupabaseBid & {
  listings: {
    list_utxo: string;
    name: string;
  };
};
