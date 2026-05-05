import { getWalletAddressFromCookies } from "@/app/actions/walletAddressInCookies";

import { DesktopNavBar } from "./components/DesktopNavBar";
import { MobileNavBar } from "./components/MobileNavBar";
import { UpdateBrowser } from "../components/UpdateBrowser";

export const NavBar: React.FC = async () => {
  const account = await getWalletAddressFromCookies();
  return (
    <div className="fixed z-50 top-0 left-0 w-full">
      <UpdateBrowser />
      <div className="hidden sm:block w-full">
        <DesktopNavBar account={account} />
      </div>
      <div className="sm:hidden w-full">
        <MobileNavBar account={account} />
      </div>
    </div>
  );
};
