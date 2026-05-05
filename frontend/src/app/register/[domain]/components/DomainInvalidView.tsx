import Link from "next/link";

export const DomainInvalidView: React.FC<{ domainName: string }> = ({
  domainName,
}) => {
  return (
    <div
      className={"relative h-screen flex flex-col justify-center items-center px-4"}
    >
      <div className="pointer-events-none absolute inset-0 bn-grid-light" />
      <div className="pointer-events-none absolute inset-0 bn-dot-grid opacity-45" />
      <h1 className="text-[32px] sm:text-[48px] text-black mb-4 leading-normal font-black tracking-tight z-10">
        {domainName}
      </h1>
      <h2 className="text-16 md:text-24 text-neutral-600 mb-[45px] z-10 text-center">
        This domain is not valid. Search for another one!
      </h2>
      <Link
        href="/#domains"
        className="button button-cta button-size-m flex items-center justify-center z-10"
      >
        Go to Domain Search
      </Link>
    </div>
  );
};
