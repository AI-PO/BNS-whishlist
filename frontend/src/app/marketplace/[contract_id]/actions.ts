"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export const revalidateMarketplace = async (contractId?: string) => {
  // First: Revalidate general marketplace data
  revalidateTag("marketplace-listings", "max");

  // If contractId is provided, also revalidate contract-specific data
  if ((contractId)) {
    revalidateTag(`listing-${contractId}`, "max");
    revalidateTag(`listing-bids-${contractId}`, "max");
  }

  // Last: Revalidate paths to trigger UI re-render with fresh data
  revalidatePath(`/marketplace/${contractId || ""}`);
  revalidatePath("/"); // Also revalidate home marketplace
};
