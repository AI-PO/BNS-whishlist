"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  getContractPendingSummary,
  getContractSummaries,
} from "@/api/exchangeApi/actions/getUserSclTokens";
import {
  getBidSummary,
  getListingBids,
  getListingSummaries,
} from "@/api/exchangeApi/actions/listings";
import { mockApiService } from "@/api/mockService";
import { supabaseEdgeFunctionFetcher } from "@/api/supabase/supabaseEdgeFunctionsFetcher";
import {
  Listing,
  ListingBid,
  ListingDetailed,
  SupabaseListing,
  SupabaseStatus,
} from "@/common/types/business";
import {
  NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_USE_MOCK_API,
} from "@/env";

const getBids = async (
  contractId: string,
  listingUtxo: string,
  supabaseListingId: number,
  supabaseDomainId: number
): Promise<ListingBid[]> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.getBidsForListing(contractId, listingUtxo, supabaseListingId, supabaseDomainId);
  }

  const apiBids = await getListingBids(contractId, listingUtxo);

  const bids: ListingBid[] = await Promise.all(
    apiBids.map(async (bid) => {
      const bidSummary = await getBidSummary(bid.reseved_utxo.split(":")[0]);

      const createdAt = bidSummary.status.block_time
        ? new Date(bidSummary.status.block_time * 1000).toISOString()
        : new Date().toISOString();

      return {
        amount: bid.bid_amount,
        price: bid.bid_price,
        bidder: bidSummary.vout[0].scriptpubkey_address || "",
        createdAt,
        acceptTx: bid.accept_tx,
        fulfillTx: bid.fulfill_tx,
        listingUtxo: listingUtxo,
        supabaseListingId,
        supabaseDomainId,
        contractId: contractId,
        resevedUtxo: bid.reseved_utxo,
        orderId: bid.order_id,
        fullfilmentUtxos: bid.fullfilment_utxos,
        isPending: bid.is_pending || false,
        isCancelled: bid.is_cancelled || false,
      } satisfies ListingBid;
    })
  );
  return bids;
};

export const getDetailedListing = async (
  listing: Listing
): Promise<ListingDetailed> => {
  const bids = await getBids(
    listing.contractId,
    listing.listingUtxo,
    listing.supabaseListingId,
    listing.supabaseDomain.id
  );
  return {
    ...listing,
    bids,
  };
};

export const selectAllListingsFromSupabase = async () => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.selectAllListingsFromSupabase();
  }
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_BASE_URL}/api/listings`,
      {
        next: {
          revalidate: 60, // Cache general marketplace data longer since it's public
          tags: ["marketplace-listings"], // Tag for marketplace revalidation
        },
      }
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        `Failed to fetch listings: ${data.error || res.statusText}`
      );
    }

    return data as SupabaseListing[];
  } catch (error) {
    console.log(error);
    return [] as SupabaseListing[];
  }
};

export const selectAllUserListingsFromSupabase = async (
  userAddress: string
) => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.selectAllUserListingsFromSupabase(userAddress);
  }
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_BASE_URL}/api/listings/user/${encodeURIComponent(userAddress)}`,
      {
        next: {
          revalidate: 30, // Cache for 30 seconds
          tags: ["user-listings", `user-listings-${userAddress}`], // Tag for targeted revalidation
        },
      }
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        `Failed to fetch listings: ${data.error || res.statusText}`
      );
    }

    return data as SupabaseListing[];
  } catch (error) {
    console.log(error);
    return [] as SupabaseListing[];
  }
};

export const getContractListingFromSupabase = async (contractId: string) => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.getContractListingFromSupabase(contractId);
  }
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_BASE_URL}/api/listings/contract/${encodeURIComponent(contractId)}`,
      {
        next: {
          revalidate: 30, // Cache for 30 seconds
          tags: [`listing-${contractId}`, "marketplace-listings"], // Tag for targeted revalidation
        },
      }
    );

    if (!res.ok) {
      console.warn(
        "[getContractListingFromSupabase] API error:",
        res.statusText
      );
      throw new Error(`Failed to fetch listing: ${await res.json()}`);
    }

    const data = await res.json();

    return data as SupabaseListing | null;
  } catch (error) {
    console.warn("[getContractListingFromSupabase] Caught error:", error);
    throw error; // Re-throw to see in production
  }
};

export const getListings = async (address?: string): Promise<Listing[]> => {
  const supabaseListings = address
    ? await selectAllUserListingsFromSupabase(address)
    : await selectAllListingsFromSupabase();

  const listings: Listing[] = supabaseListings
    .filter((listing) =>
      address ? listing.status !== SupabaseStatus.ENDED : true
    )
    .flatMap((listing) => {
      if (!listing.domains.id) {
        console.warn(
          `Listing with contract ID ${listing.contract_id} has no associated domain.`
        );
        return [];
      }

      return {
        contractId: listing.contract_id,
        domain: listing.name,
        listingUtxo: listing.list_utxo,
        price: listing.price,
        status: listing.status,
        recAddress: listing.owner,
        bestBid: listing.best_bid,
        orderId: listing.order_id,
        createdAt: listing.created_at,
        bidCount: listing.bid_count,
        supabaseListingId: listing.id,
        supabaseDomain: listing.domains,
        isPremium: false, // Assuming no premium listings for now
      } satisfies Listing;
    });
  return listings;
};

/**
 * If this function is called with a contractId that not exists in the database, it will create a new listing.
 * If listing already exists, it will update the existing listing status.
 *
 * @param contractId
 */
export const createOrUpdateListingSupabase = async (body: {
  contractId: string;
  bidCount?: number;
  bestBid?: number;
  price?: number;
  owner?: string;
  listingUtxo?: string;
  orderId?: string;
  name?: string;
  status?: SupabaseStatus;
}): Promise<SupabaseListing> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.createOrUpdateListingSupabase(body);
  }
  return supabaseEdgeFunctionFetcher<SupabaseListing>({
    functionName: "add-listing",
    body: {
      contract_id: body.contractId,
      best_bid: body.bestBid,
      bid_count: body.bidCount,
    },
  });
};

export const updateListingsSupabase = async (listings: Listing[]) => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.updateListingsSupabase(listings);
  }
  if (!listings || listings.length === 0) {
    return;
  }

  const [hasPendingUpdates, hasActiveUpdates, changedOffersData] =
    await Promise.all([
      updatePendingListingsStatus(listings),
      updateActiveListingsStatus(listings),
      updateListingsOffersDataInSupabase(listings),
    ]);

  if (!hasPendingUpdates && !hasActiveUpdates && !changedOffersData) {
    return;
  }

  revalidateOnModifyListing();
};

const updatePendingListingsStatus = async (listings: Listing[]) => {
  const pendingListings = listings.filter(
    (listing) => listing.status === SupabaseStatus.PENDING
  );
  if (pendingListings.length === 0) {
    return false;
  }
  const pendingListingsSummaries = await getContractSummaries(
    pendingListings.map((listing) => listing.contractId)
  );
  const updates = await Promise.all(
    pendingListingsSummaries.map(async (summary) => {
      const listing = listings.find(
        (l) => l.contractId === summary.contract_id
      );
      if (listing) {
        if (summary.current_listings === 1) {
          // Listing is now active
          await createOrUpdateListingSupabase({
            contractId: listing.contractId,
          });
          return Promise.resolve(1);
        }
      }
      return Promise.resolve(); // No update needed for this listing
    })
  );

  // Filter out any undefined updates
  const filteredUpdates = updates.filter((update) => update !== undefined);

  return filteredUpdates.length > 0;
};

const updateActiveListingsStatus = async (listings: Listing[]) => {
  const activeListings = listings.filter(
    (listing) => listing.status === SupabaseStatus.ACTIVE
  );
  if (activeListings.length === 0) {
    return false;
  }

  const activeListingsSummaries = await Promise.all(
    activeListings.map((contract) =>
      getContractPendingSummary(contract.contractId)
    )
  );
  const updates = await Promise.all(
    activeListingsSummaries.map(async (summary) => {
      if (!summary) {
        return Promise.resolve(); // No summary found for this contract
      }
      const listing = listings.find(
        (l) => l.contractId === summary.contract_id
      );
      if (listing) {
        if (summary.current_listings === 0) {
          // Listing is no longer active
          await createOrUpdateListingSupabase({
            contractId: listing.contractId,
          });
          return Promise.resolve(1);
        }
      }
      return Promise.resolve(); // No update needed for this listing
    })
  );

  // Filter out any undefined updates
  const filteredUpdates = updates.filter((update) => update !== undefined);

  return filteredUpdates.length > 0;
};

const updateListingsOffersDataInSupabase = async (listings: Listing[]) => {
  if (!listings.length) {
    return false;
  }

  const listingsData: { contract_id: string; utxos: string[] }[] = listings.map(
    (listing) => ({
      contract_id: listing.contractId,
      utxos: [listing.listingUtxo],
    })
  );
  const listingsSummaries = await getListingSummaries(listingsData);

  const updates = await Promise.all(
    listingsSummaries.map(async (summary) => {
      const listing = listings.find(
        (l) =>
          l.contractId === summary.contract_id &&
          l.listingUtxo === summary.listing_summaries[0].listing_utxo
      );
      if (!listing) return Promise.resolve();

      const listingSummary = summary.listing_summaries[0];
      if (
        listing?.bestBid !== listingSummary.highest_bid ||
        listing.bidCount !== listingSummary.bid_count
      ) {
        await createOrUpdateListingSupabase({
          contractId: listing.contractId,
          bestBid: listingSummary.highest_bid,
          bidCount: listingSummary.bid_count,
        });
        return Promise.resolve(1);
      }
    })
  );

  // Filter out any undefined updates
  const filteredUpdates = updates.filter((update) => update !== undefined);

  return filteredUpdates.length > 0;
};

export const revalidateOnModifyListing = async (userAddress?: string) => {
  // First: Revalidate user-specific data
  if (userAddress) {
    revalidateTag(`user-listings-${userAddress}`, "max");
    revalidateTag(`user-domains-${userAddress}`, "max");
    revalidateTag(`user-orders-${userAddress}`, "max");
    revalidateTag(`user-bids-${userAddress}`, "max");
  }

  // Revalidate general tags
  revalidateTag("user-listings", "max");
  revalidateTag("user-domains", "max");

  // Last: Revalidate paths to trigger UI re-render with fresh data
  revalidatePath("/");
  revalidatePath("/profile");
};
