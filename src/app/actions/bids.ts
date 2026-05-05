"use server";

import { revalidatePath } from "next/cache";

import {
  getContractBids,
  getContractPendingBids,
} from "@/api/exchangeApi/actions/listings";
import { mockApiService } from "@/api/mockService";
import { supabaseEdgeFunctionFetcher } from "@/api/supabase/supabaseEdgeFunctionsFetcher";
import {
  SupabaseBid,
  SupabaseBidWithListing,
  SupabaseStatus,
} from "@/common/types/business";
import { PartialKeys } from "@/common/types/generic";
import {
  NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_USE_MOCK_API,
} from "@/env";

import { revalidateMarketplace } from "../marketplace/[contract_id]/actions";

export const getUserBidsFromSupabase = async (
  userAddress: string
): Promise<SupabaseBidWithListing[]> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.getUserBidsFromSupabase(userAddress);
  }
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_BASE_URL}/api/bids/${encodeURIComponent(userAddress)}`,
      {
        next: { 
          revalidate: 30, // Cache for 30 seconds
          tags: ["user-bids", `user-bids-${userAddress}`] // Tag for targeted revalidation
        },
      }
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        `Failed to fetch domains: ${data.error || res.statusText}`
      );
    }

    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const createOrUpdateBidSupabase = async (body: {
  contractId: string;
  listingUtxo: string;
  bidUtxo: string;
  owner: string;
  price?: number;
}): Promise<SupabaseBid> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.createOrUpdateBidSupabase(body);
  }
  return supabaseEdgeFunctionFetcher<SupabaseBid>({
    functionName: "add-bid",
    body: {
      contract_id: body.contractId,
      list_utxo: body.listingUtxo,
      bid_utxo: body.bidUtxo,
      owner: body.owner,
      price: body.price,
    },
  });
};

export const updateBidsSupabase = async (
  bids: PartialKeys<SupabaseBidWithListing, "id">[]
): Promise<void> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.updateBidsSupabase(bids);
  }
  if (!bids || bids.length === 0) {
    return;
  }

  const [hasPendingUpdates, hasActiveUpdates] = await Promise.all([
    updatePendingBidsStatus(bids),
    updateActiveBidsStatus(bids),
  ]);

  if (!hasPendingUpdates && !hasActiveUpdates) {
    return;
  }

  revalidatePath("/profile");
};

const isBidActive = async (contractId: string, bidUtxo: string) => {
  const contractBids = await getContractBids(contractId);
  const isActive = contractBids.some(
    (pendingBid) => pendingBid.reseved_utxo.split(":")[0] === bidUtxo
  );
  return isActive;
};

const updatePendingBidsStatus = async (
  bids: PartialKeys<SupabaseBidWithListing, "id">[]
) => {
  const pendingBids = bids.filter(
    (bid) => bid.status === SupabaseStatus.PENDING
  );
  if (pendingBids.length === 0) {
    return false;
  }

  const pendingBidsStatusData = await Promise.all(
    pendingBids.map(async (bid) => {
      const isActive = await isBidActive(bid.contract_id, bid.bid_utxo);
      return { bid, isActive };
    })
  );

  const updates = await Promise.all(
    pendingBidsStatusData.map(async ({ bid, isActive }) => {
      if (isActive) {
        await createOrUpdateBidSupabase({
          contractId: bid.contract_id,
          listingUtxo: bid.listings.list_utxo,
          bidUtxo: bid.bid_utxo,
          owner: bid.owner,
        });
        revalidateMarketplace(bid.contract_id);
        return Promise.resolve(1);
      }
      return Promise.resolve();
    })
  );

  // Filter out any undefined updates
  const filteredUpdates = updates.filter((update) => update !== undefined);

  return filteredUpdates.length > 0;
};

const updateActiveBidsStatus = async (
  bids: PartialKeys<SupabaseBidWithListing, "id">[]
) => {
  const activeBids = bids.filter((bid) => bid.status === SupabaseStatus.ACTIVE);
  if (activeBids.length === 0) {
    return false;
  }

  const pendingBidsStatusData = await Promise.all(
    activeBids.map(async (bid) => {
      const contractBids = await getContractPendingBids(bid.contract_id);
      const isActive = contractBids.some(
        (pendingBid) => pendingBid.reseved_utxo.split(":")[0] === bid.bid_utxo
      );
      return { bid, isActive };
    })
  );

  const updates = await Promise.all(
    pendingBidsStatusData.map(async ({ bid, isActive }) => {
      if (!isActive) {
        await createOrUpdateBidSupabase({
          contractId: bid.contract_id,
          listingUtxo: bid.listings.list_utxo,
          bidUtxo: bid.bid_utxo,
          owner: bid.owner,
        });
        revalidateMarketplace(bid.contract_id);
        return Promise.resolve(1);
      }
      return Promise.resolve();
    })
  );

  // Filter out any undefined updates
  const filteredUpdates = updates.filter((update) => update !== undefined);

  return filteredUpdates.length > 0;
};
