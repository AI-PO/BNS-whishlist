import { redirect } from "next/navigation";

import { getUserBidsFromSupabase } from "@/app/actions/bids";
import { selectUserDomains, selectUserOrders } from "@/app/actions/domains";
import { getListings } from "@/app/actions/listings";
import { getWalletAddressFromCookies } from "@/app/actions/walletAddressInCookies";

import { ProfileTabsContent } from "./ProfileTabsContent";
import { ProfileTab } from "../../types";

export const ProfileTabs: React.FC<{ tab: ProfileTab }> = async ({ tab }) => {
  const connectedAccount = await getWalletAddressFromCookies();

  if (!connectedAccount) {
    redirect("/");
  }

  const userListings = await getListings(connectedAccount.address);
  const userDomains = await selectUserDomains(connectedAccount.address);
  const userOrders = await selectUserOrders(connectedAccount.address);
  const userBids = await getUserBidsFromSupabase(connectedAccount.address);

  return (
    <ProfileTabsContent
      initTab={tab}
      userListings={userListings}
      userDomains={userDomains}
      userOrders={userOrders}
      userBids={userBids}
    />
  );
};
