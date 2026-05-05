import Link from "next/link";

const ListingNotFoundPage = () => {
  return (
    <div className="relative h-full max-w-[760px] w-full md:w-fit md:max-w-none flex flex-col m-auto pt-[96px] sm:pt-[136px] pb-8 px-4 gap-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bn-grid-light opacity-70" />
      <div className="pointer-events-none absolute inset-0 -z-10 bn-dot-grid opacity-30" />

      <div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
        <h1 className="text-24 sm:text-32 font-bold text-black">
          Listing not found
        </h1>
        <p className="mt-3 text-16 text-neutral-600 max-w-[560px]">
          This marketplace listing does not exist, may have expired, or is no
          longer available.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link href="/" className="button button-cta">
            Go to main page
          </Link>
          <Link href="/marketplace" className="button button-secondary">
            Back to marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingNotFoundPage;
