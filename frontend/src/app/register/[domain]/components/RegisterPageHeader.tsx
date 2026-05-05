import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Header } from "@/common/components/Header";
import { TruncatedText } from "@/common/components/TruncatedText";

export const RegisterPageHeader: React.FC<{ domainName: string }> = ({
  domainName,
}) => {
  return (
    <div className="py-4">
      <Header
        variant="h1"
        leading={
          <Link href="/#domains" className="text-black hover:text-[#f7931a] transition-colors">
            <span className="sr-only">Back to Register</span>
            <ArrowLeft height={32} width={32} strokeWidth={3} />
          </Link>
        }
        following={<p className="text-green-600 font-bold text-base bg-green-50 px-3 py-1 rounded-full border border-green-100">Available</p>}
      >
        <TruncatedText name={`${domainName}`} tooltip />
      </Header>
    </div>
  );
};
