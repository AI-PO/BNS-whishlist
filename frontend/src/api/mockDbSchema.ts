import {
  Domain,
  OrderWithDomain,
  SupabaseBidWithListing,
  SupabaseListing,
} from "@/common/types/business";

export type MockDB = {
  domains: Domain[];
  orders: OrderWithDomain[];
  listings: SupabaseListing[];
  bids: SupabaseBidWithListing[];
  wishlist: { email: string; domain: string | null }[];
  last_sync?: string;
  last_pending_sync?: string;
  last_full_sync?: string;
  last_pending_sync_block?: number;
  last_full_sync_block?: number;
};

export const createEmptyMockDb = (): MockDB => ({
  domains: [],
  orders: [],
  listings: [],
  bids: [],
  wishlist: [],
  last_sync: undefined,
  last_pending_sync: undefined,
  last_full_sync: undefined,
  last_pending_sync_block: undefined,
  last_full_sync_block: undefined,
});
