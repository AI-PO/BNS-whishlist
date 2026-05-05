import { ArrowLeft, MinusCircle, PlusCircle } from "lucide-react";
import Link from "next/link";

import { Header } from "@/common/components/Header";
import { Section } from "@/common/components/Section";
import { ShadowContainer } from "@/common/components/ShadowContainer";
import { SkeletonBox } from "@/common/components/SkeletonBox";
import { Subsection } from "@/common/components/Subsection";

const RegisterDomainLoading = async () => {
  return (
    <div className="h-full w-screen max-w-[660px] md:w-fit md:max-w-none flex flex-col m-auto pt-[90px] sm:pt-[145px] pb-4 px-4 gap-y-[30px]">
      <div className="py-4 h-[68px] md:h-[104px] flex items-center">
        <Header
          variant="h1"
          leading={
            <Link href="/#register">
              <span className="sr-only">Back to Register</span>
              <ArrowLeft height={24} width={24} />
            </Link>
          }
        >
          <SkeletonBox className="h-10 w-[300px]" />
        </Header>
      </div>
      <div className="hidden xl:block">
        <div className="flex gap-x-10">
          <Section label="Details">
            <div className="flex flex-col gap-y-[45px] w-[660px]">
              <RegisterDetailsSectionLoader />
              <RegisterButtonLoader />
            </div>
          </Section>
          <Section label="Order summary">
            <RegisterOrderSummarySectionLoader />
          </Section>
        </div>
      </div>
      <div className="xl:hidden">
        <div className="flex flex-col gap-y-[45px] w-full max-w-[660px] md:w-[660px]">
          <div className=" flex flex-col gap-y-6">
            <h2 className="text-20 font-semibold">Details</h2>
            <RegisterDetailsSectionLoader />
          </div>
          <div className=" flex flex-col gap-y-6">
            <h2 className="text-20 font-semibold">Order summary</h2>
            <RegisterOrderSummarySectionLoader />
          </div>
          <RegisterButtonLoader />
        </div>
      </div>
    </div>
  );
};

export default RegisterDomainLoading;

const RegisterDetailsSectionLoader = () => {
  return (
    <div className="flex flex-col gap-y-[30px]">
      <Subsection label="Claim for">
        <div className="grid grid-cols-2 items-center gap-x-[18px]">
          <NumberSelectorLoader initialValue={1} />
          <div>
            <SkeletonBox className="h-6 w-[150px] mb-3" />
            <SkeletonBox className="h-4 w-[150px]" />
          </div>
        </div>
      </Subsection>
      <WalletAddressSubsectionLoader />
      {/* <PaymentCurrencySubsection /> */}
    </div>
  );
};

const WalletAddressSubsectionLoader: React.FC = () => {
  return (
    <Subsection label="Wallet address">
      <SkeletonBox className="h-[66px] w-full rounded-[10px]" />
    </Subsection>
  );
};

const NumberSelectorLoader: React.FC<{
  initialValue: number;
}> = ({ initialValue }) => {
  return (
    <ShadowContainer>
      <div className="py-5 px-4 flex items-center justify-between">
        <div className="text-neutral-500 disabled:text-neutral-300">
          <MinusCircle />
        </div>
        <p className="text-20 font-semibold">{initialValue} year</p>
        <div className="text-neutral-500 disabled:text-neutral-300">
          <PlusCircle />
        </div>
      </div>
    </ShadowContainer>
  );
};

const RegisterButtonLoader = () => {
  return (
    <div className="flex items-center justify-center button button-cta button-size-m w-full opacity-50 cursor-normal">
      Buy a domain
    </div>
  );
};

const RegisterOrderSummarySectionLoader = () => {
  return (
    <div className="xl:h-[240px] xl:w-[380px] flex flex-col gap-y-6 xl:gap-y-0 xl:justify-between">
      <div className="flex flex-col gap-y-[30px]">
        <div className="flex items-center justify-between">
          <div className="w-[120px] h-6 bg-neutral-200 rounded-full animate-pulse" />
          <div className="w-[120px] h-6 bg-neutral-200 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base text-neutral-600 font-medium">Registration fee</p>
          <div className="w-[120px] h-6 bg-neutral-200 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base text-neutral-600 font-medium">Transaction fee</p>
          <div className="w-[120px] h-6 bg-neutral-200 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 xl:mt-0 pt-4 border-t border-neutral-200">
        <p className="text-lg font-bold text-neutral-900">Total</p>
        <div className="w-[120px] h-9 bg-neutral-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
};
