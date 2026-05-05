"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export const revalidateProfile = async (userAddress?: string) => {
  // First: Revalidate general user data tags
  revalidateTag("user-listings", "max");
  revalidateTag("user-domains", "max");
  revalidateTag("user-orders", "max");
  revalidateTag("user-bids", "max");

  // If userAddress is provided, also revalidate user-specific tags
  if (userAddress) {
    revalidateTag(`user-listings-${userAddress}`, "max");
    revalidateTag(`user-domains-${userAddress}`, "max");
    revalidateTag(`user-orders-${userAddress}`, "max");
    revalidateTag(`user-bids-${userAddress}`, "max");
  }

  // Last: Revalidate the path to trigger UI re-render with fresh data
  revalidatePath("/profile");
};
