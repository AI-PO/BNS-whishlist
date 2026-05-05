import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getWalletAddressFromCookies } from "@/app/actions/walletAddressInCookies";
import { Button } from "@/common/components/Button";
import { Header } from "@/common/components/Header";
import { SkeletonBox } from "@/common/components/SkeletonBox";

// eslint-disable-next-line react/function-component-definition
export default async function Loading() {
  const connectedWalletAccount = await getWalletAddressFromCookies();

  return (
    <div className="h-full max-w-[699px] w-full flex flex-col m-auto pt-[90px] sm:pt-[145px] pb-4 px-4 gap-y-[30px]">
      <div className="py-4 h-[68px] sm:h-[104px] flex items-center">
        <Header
          variant="h1"
          leading={
            <Link href="/#marketplace">
              <ArrowLeft height={24} width={24} />
            </Link>
          }
        >
          <SkeletonBox className="h-10 w-[300px]" />
        </Header>
      </div>
      <div className="w-full md:w-[667px] flex flex-col gap-y-[30px] sm:gap-y-[60px]">
        <div className="flex flex-col gap-y-3 text-14 sm:text-16 font-medium">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-1 sm:gap-x-6">
              <SkeletonBox className="h-[30px] sm:h-9 w-[100px]" />
              <div className="w-[1px] h-7 bg-neutral-200" />
              <SkeletonBox className="h-5 w-[100px]" />
            </div>
            <div className="flex items-center gap-x-1.5">
              <p>Owned by:</p>
              <SkeletonBox className="h-5 w-[80px]" />
            </div>
          </div>
          <div className="self-end flex items-center gap-x-1.5">
            <p>Renewal date:</p>
            <SkeletonBox className="h-5 w-[90px]" />
          </div>
        </div>
        <div>
          <label>
            <p className="text-16 text-neutral-500">Make your offer</p>
            <SkeletonBox className="h-[60px] w-full mt-3" />
          </label>
          <div className="h-[26px] mt-3 flex items-center gap-x-1.5 text-neutral-500">
            <Image src="/wallet-blue.svg" alt="Wallet" width={16} height={16} />
            <SkeletonBox className="h-5 w-[100px]" />
          </div>
          <p className="mt-5 text-16 text-black font-medium">
            Domain owner will see your offer and can accept or reject it. If the
            offer is accepted, the purchase will complete automatically.
          </p>
          <div className="mt-5">
            <Button size="M" variant="cta" className="w-full">
              {connectedWalletAccount
                ? "Submit offer"
                : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
