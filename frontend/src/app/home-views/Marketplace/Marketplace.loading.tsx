import { SkeletonBox } from "@/common/components/SkeletonBox";

export const MarketplaceLoading = () => {
  return (
    <>
      <h2 className="mt-[100px] md:mt-[120px] mb-[20px] text-20 sm:text-[32px] md:text-[40px] lg:text-[48px] xl:text-[64px] text-black text-shadow-[0_6px_10px_rgba(51,54,67,1)]/40 text-shadow-white leading-normal">
        <span className="font-semibold">Premium names</span> available now ⚡️
      </h2>
      <div className="mt-[30px] w-full flex flex-col">
        <div className="flex flex-col gap-4">
          <SkeletonBox className="h-12 w-full" />
          <SkeletonBox className="h-12 w-full" />
          <SkeletonBox className="h-12 w-full" />
          <SkeletonBox className="h-12 w-full" />
          <SkeletonBox className="h-12 w-full" />
        </div>
      </div>
    </>
  );
};
