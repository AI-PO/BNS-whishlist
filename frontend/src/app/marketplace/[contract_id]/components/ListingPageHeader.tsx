import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Header } from "@/common/components/Header";

export const ListingPageHeader: React.FC<{
  ticker: string;
}> = ({ ticker }) => {
  return (
    <div className="py-4">
      <Header
        variant="h1"
        leading={
          <Link href="/marketplace" className="text-black hover:text-[#f7931a] transition-colors">
            <ArrowLeftIcon height={24} width={24} />
          </Link>
        }
      >
        {ticker}
      </Header>
    </div>
  );
};
