"use server";

import { mockApiService } from "@/api/mockService";
import { NEXT_PUBLIC_USE_MOCK_API } from "@/env";
import { asyncFilter } from "@/utils/asyncFilter";

import { BLOCK_EXPLORER_URL, SCL_NODE_URL } from "../consts";
import { getUserNftTokens } from "./getUserSclTokens";
import { ContractBalanceSummary } from "../types/api.address.types";
import { ContractListSummary } from "../types/api.contract.types";
import { Bid, Listing, BidSummary } from "../types/api.listing.types";

export const getUserNotListedContracts = async (
  address: string
): Promise<ContractBalanceSummary[]> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.getUserNotListedContracts(address);
  }

  const userDomainNfts = await getUserNftTokens(address);

  const notListedDomains = userDomainNfts.filter(
    (domain) => domain.current_listings === 0
  );

  const notPendingDomains = await asyncFilter(
    notListedDomains,
    async (domain) => {
      const res = await getContractPendingListings(domain.contract_id);
      if (!res) return true;
      return res.length === 0;
    }
  );

  return notPendingDomains.sort((a, b) => {
    return a.ticker.toUpperCase() < b.ticker.toUpperCase() ? -1 : 1;
  });
};

export const getContractListings = async (
  contractId: string
): Promise<Listing["listings"] | null> => {
  const res = await fetch(`${SCL_NODE_URL}/${contractId}/listings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });
  const data = await res.json();

  return data?.data || [];
};

export const getContractPendingListings = async (
  contractId: string
): Promise<Listing["listings"] | null> => {
  const res = await fetch(`${SCL_NODE_URL}/${contractId}/pending-listings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });
  const data = await res.json();

  return data?.data || [];
};

export const getUserListings = async (address: string): Promise<Listing[]> => {
  const userSclTokens = await getUserNftTokens(address);
  const contracts = userSclTokens.map((token) => ({
    contract_id: token.contract_id,
    ticker: token.ticker,
  }));
  if (!contracts.length) {
    return [];
  }
  const listings = await getListings(contracts);
  return listings;
};

export const getListings = async (
  contracts: { contract_id: string; ticker: string }[]
): Promise<Listing[]> => {
  const listings = await Promise.all(
    contracts.map(async (contract) => {
      const listings = await getContractListings(contract.contract_id);

      return {
        contract_id: contract.contract_id,
        ticker: contract.ticker,
        is_pending: false,
        listings,
      };
    })
  );
  const pendingListingsResponse = await Promise.all(
    contracts.map(async (contract) => {
      const data = await getContractPendingListings(contract.contract_id);

      return {
        contract_id: contract.contract_id,
        ticker: contract.ticker,
        is_pending: true,
        listings: data,
      };
    })
  );

  // Pending listings request fetches all the listings - pending and finalised
  // To find the pending only we must filter out listings that are already in the main listings array
  const pendingListings = pendingListingsResponse.filter(
    (pendingListing) =>
      pendingListing.listings !== null &&
      pendingListing.listings?.length > 0 &&
      listings.some(
        (listing) =>
          listing.contract_id === pendingListing.contract_id &&
          listing.listings?.length === 0
      )
  ) as Listing[];

  // Filter out cancelled listings
  const currentListings = listings.filter((listing) =>
    pendingListingsResponse.some(
      (pendingListing) =>
        pendingListing.contract_id === listing.contract_id &&
        pendingListing.listings !== null &&
        pendingListing.listings?.length > 0
    )
  ) as Listing[];

  const allListings = [...pendingListings, ...currentListings];

  return allListings.filter((listing) => listing.listings?.length > 0);
};

export const getListingBids = async (
  contractId: string,
  listingUtxo: string
): Promise<Bid[]> => {
  const bidsRes = await fetch(
    `${SCL_NODE_URL}/${contractId}/bids_on_listing/${listingUtxo}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const pendingBidsRes = await fetch(
    `${SCL_NODE_URL}/${contractId}/pending-bids_on_listing/${listingUtxo}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const bids = Object.values(await bidsRes.json()) as Bid[];
  const pendingBids = Object.values(await pendingBidsRes.json()) as Bid[];

  const isBidCancelled = (bid: Bid) =>
    !pendingBids.some(
      (pendingBid) => pendingBid.reseved_utxo === bid.reseved_utxo
    );

  const getPendingBids = () => {
    return pendingBids
      .filter(
        (pendingBid) =>
          !bids.some((bid) => pendingBid.reseved_utxo === bid.reseved_utxo)
      )
      .map((pendingBid) => {
        return {
          ...pendingBid,
          is_pending: true,
        };
      });
  };

  // Combine pending and current bids
  const allBids = [...getPendingBids(), ...bids];

  // Map through all bids to add is_cancelled and sort them
  const resultBids = allBids
    .map((bid) => {
      return {
        ...bid,
        is_cancelled: isBidCancelled(bid),
      };
    })
    .sort((a, b) => {
      return a.is_pending === b.is_pending
        ? 0
        : a.is_pending
          ? -1
          : a.is_cancelled === b.is_cancelled
            ? 0
            : a.is_cancelled
              ? 1
              : -1;
    });

  return resultBids;
};

export const getListingSummaries = async (
  listings: { contract_id: string; utxos: string[] }[]
): Promise<ContractListSummary[]> => {
  if (!listings.length) {
    return [];
  }
  const response = await fetch(`${SCL_NODE_URL}/listing_summaries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listings),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch contract summaries: ${response.statusText}`
    );
  }
  const data = (await response.json()) as ContractListSummary[];
  return data;
};

export const getBidSummary = async (bidTx: string): Promise<BidSummary> => {
  const response = await fetch(`${BLOCK_EXPLORER_URL}/tx/${bidTx}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch bid summary: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
};

export const getContractBids = async (contractId: string) => {
  const res = await fetch(`${SCL_NODE_URL}/${contractId}/bids`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });
  const data = await res.json();

  return (data?.data?.map(
    (b: [string, Omit<Bid, "is_pending" | "is_cancelled">]) => b[1]
  ) || []) as Omit<Bid, "is_pending" | "is_cancelled">[];
};

export const getContractPendingBids = async (contractId: string) => {
  const res = await fetch(`${SCL_NODE_URL}/${contractId}/pending-bids`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });
  const data = await res.json();

  return (data?.data?.map(
    (b: [string, Omit<Bid, "is_pending" | "is_cancelled">]) => b[1]
  ) || []) as Omit<Bid, "is_pending" | "is_cancelled">[];
};
