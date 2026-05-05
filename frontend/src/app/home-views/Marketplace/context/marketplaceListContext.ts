import { Listing } from "@/common/types/business";
import { SetState } from "@/common/types/generic";
import { createSafeContext } from "@/utils/createSafeContext";

import { SortBy } from "../types";

export type TMarketplaceListContext = {
  listings: Listing[];
  search: string;
  handleSearch: (searchTerm: string) => void;
  sortBy: SortBy | null;
  handleSort: (sort: SortBy | null) => void;
  isLoading: boolean;
  setIsLoading: SetState<boolean>;
};

export const [MarketplaceListContext, useMarketplaceListContext] =
  createSafeContext<TMarketplaceListContext>("MarketplaceList");
