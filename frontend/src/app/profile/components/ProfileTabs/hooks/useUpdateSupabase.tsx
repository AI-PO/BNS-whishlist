import { useEffect, useRef, useMemo } from "react";

import { updateBidsSupabase } from "@/app/actions/bids";
import { updateOrdersSupabase } from "@/app/actions/domains";
import { updateListingsSupabase } from "@/app/actions/listings";
import {
  Listing,
  OrderWithDomain,
  SupabaseBidWithListing,
} from "@/common/types/business";

export const useUpdateSupabase = (
  orders: OrderWithDomain[],
  listings: Listing[],
  bids: SupabaseBidWithListing[]
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create stable references for the arrays using JSON serialization
  const ordersStr = useMemo(() => JSON.stringify(orders), [orders]);
  const listingsStr = useMemo(() => JSON.stringify(listings), [listings]);
  const bidsStr = useMemo(() => JSON.stringify(bids), [bids]);

  useEffect(() => {
    const update = async () => {
      try {
        await Promise.all([
          updateListingsSupabase(listings),
          updateBidsSupabase(bids),
          updateOrdersSupabase(orders),
        ]);
      } catch (error) {
        console.warn("Error updating supabase:", error);
      }
    };

    // Initial update
    update();

    // Set new interval
    intervalRef.current = setInterval(() => {
      update();
    }, 60_000); // Update every minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ordersStr, listingsStr, bidsStr]);
};
