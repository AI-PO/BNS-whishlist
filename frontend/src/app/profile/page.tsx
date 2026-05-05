 
import { Suspense } from "react";

import { Header } from "@/common/components/Header";

import { ProfileTabs } from "./components/ProfileTabs/ProfileTabs";
import { ProfileTabsLoading } from "./components/ProfileTabs/ProfileTabs.loading";
import { ProfileMarketplaceTab, ProfileTab } from "./types";

const ProfilePage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    tab: string | undefined;
    subtab: string | undefined;
  }>;
}) => {
  const searchParamsData = await searchParams;
  let searchParamsTab = searchParamsData.tab as
    | ProfileTab
    | "undefined"
    | undefined;
  let searchParamsSubTab = searchParamsData.subtab as
    | ProfileMarketplaceTab
    | "undefined"
    | undefined;
  if (
    !searchParamsTab ||
    searchParamsTab === "undefined" ||
    !Object.values(ProfileTab).includes(searchParamsTab as ProfileTab)
  ) {
    searchParamsTab = ProfileTab.DOMAINS;
  }
  if (
    !searchParamsSubTab ||
    searchParamsSubTab === "undefined" ||
    !Object.values(ProfileMarketplaceTab).includes(
      searchParamsSubTab as ProfileMarketplaceTab
    )
  ) {
    searchParamsSubTab = ProfileMarketplaceTab.LISTINGS;
  }

  return (
    <div className="relative w-screen h-screen min-h-[800px] pt-[96px] md:pt-[128px] pb-10 overflow-hidden flex flex-col">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 100%, rgba(247,147,26,0.10), transparent 65%), radial-gradient(ellipse 70% 55% at 100% 20%, rgba(247,147,26,0.09), transparent 60%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bn-dot-grid opacity-30" />
      <div className="max-w-[92vw] xl:max-w-[1240px] w-full m-auto flex flex-col flex-1 min-h-0">
        <div className="py-4 mb-5">
          <Header variant="h1">My profile</Header>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <Suspense
            fallback={
              <ProfileTabsLoading
                tab={searchParamsTab}
                subTab={searchParamsSubTab}
              />
            }
          >
            <ProfileTabs tab={searchParamsTab} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
