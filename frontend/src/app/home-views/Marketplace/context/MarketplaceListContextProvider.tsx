"use client";

import { PropsWithChildren, useEffect, useMemo, useState } from "react";

import { updateListingsSupabase } from "@/app/actions/listings";
import { Listing } from "@/common/types/business";

import {
  MarketplaceListContext,
  TMarketplaceListContext,
} from "./marketplaceListContext";
import { SortBy } from "../types";

export const DomainsListContextProvider: React.FC<
  PropsWithChildren<{ listings: Listing[] }>
> = ({ listings, children }) => {
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<TMarketplaceListContext["sortBy"]>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [visibleListings, setVisibleListings] = useState<Listing[]>(listings);

  useEffect(() => {
    const update = async () => {
      try {
        await updateListingsSupabase(listings);
      } catch (error) {
        console.warn("Error updating listings in supabase:", error);
      }
    };
    update();
    const interval = setInterval(() => {
      update();
    }, 60_000); // Update every minute

    return () => clearInterval(interval);
  }, [listings]);

  const sortListings = (
    listings: Listing[],
    sortOption: TMarketplaceListContext["sortBy"]
  ) => {
    const sortedListings = [...listings].sort((a, b) => {
      if (sortOption === null || sortOption === SortBy.CREATED_AT_DESC) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortOption === SortBy.PRICE_ASC) {
        return a.price - b.price;
      }
      if (sortOption === SortBy.PRICE_DESC) {
        return b.price - a.price;
      }
      if (sortOption === SortBy.NAME_ASC) {
        return a.domain.localeCompare(b.domain);
      }
      if (sortOption === SortBy.NAME_DESC) {
        return b.domain.localeCompare(a.domain);
      }
      // if (sortOption === SortBy.PREMIUM_FIRST) {
      //   return a.is_premium === b.is_premium ? 0 : a.is_premium ? -1 : 1;
      // }
      return 0;
    });

    return sortedListings;
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    const filteredListings = listings.filter((listing) =>
      listing.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sortedListings = sortListings(filteredListings, sortBy);
    setVisibleListings(sortedListings);
  };

  const handleSort = (sortOption: TMarketplaceListContext["sortBy"]) => {
    const isSameSort = sortBy === sortOption;
    const newSortBy = isSameSort ? null : sortOption;
    setSortBy(newSortBy);
    const sortedListings = sortListings(visibleListings, newSortBy);
    setVisibleListings(sortedListings);
  };

  const value = useMemo<TMarketplaceListContext>(
    () => ({
      search,
      handleSearch,
      sortBy,
      handleSort,
      isLoading,
      setIsLoading,
      listings: visibleListings,
    }),
    [search, sortBy, isLoading]
  );
  return (
    <MarketplaceListContext.Provider value={value}>
      {children}
    </MarketplaceListContext.Provider>
  );
};
