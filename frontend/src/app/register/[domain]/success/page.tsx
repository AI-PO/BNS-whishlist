import Link from "next/link";

import { TruncatedText } from "@/common/components/TruncatedText";

import { SuccessAnimation } from "./components/SuccessAnimation";

const DomainRegisterSuccessPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const domainName = decodeURIComponent((await params).domain);

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center px-4">
      <div className="relative z-10 flex flex-col items-center">
      <p className="text-24 text-center sm:text-[32px] md:text-[48px] sm:leading-[60px] mb-5 text-bn-ink">
        Your domain has been registered!
      </p>
      <p className="mb-9 bg-gradient-to-r from-[#C96F00] via-[#f7931a] to-[#FFC163] bg-clip-text text-transparent text-32 sm:text-[48px] md:text-[64px] leading-[80px] font-semibold tracking-tight">
        <TruncatedText name={domainName} tooltip />
      </p>
      <Link
        href="/profile"
        className="cursor-hover button button-cta button-size-m w-[246px] flex items-center justify-center"
      >
        <p>View your profile</p>
      </Link>
      </div>
      <SuccessAnimation />
    </div>
  );
};

export default DomainRegisterSuccessPage;
