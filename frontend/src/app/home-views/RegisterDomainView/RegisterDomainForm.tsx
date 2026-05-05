"use client";

import {
  ArrowCircleRightIcon as ArrowRightCircle,
  MagnifyingGlassIcon as Search,
  XCircleIcon
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "react-use";

import {
  isDomainAvailable,
  isDomainAvailableOnMarketplace,
} from "@/app/actions/domains";
import { Spinner } from "@/common/components/bn";
import { ShadowContainer } from "@/common/components/ShadowContainer";
import { TruncatedText } from "@/common/components/TruncatedText";
import { cn } from "@/lib/utils";
import { checkIsDomainValid } from "@/utils/checkIsDomainValid";

type TResults = {
  name: string;
  available: boolean;
  listingContractId?: string;
}[];

export const RegisterDomainForm: React.FC = () => {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<TResults>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [validationError, setValidationError] = useState<string | undefined>();

  const [isFocused, setIsFocused] = useState(false);

  const handleDomainChange = async (value: string) => {
    setDomain(value);
    setValidationError(undefined);

    if (value.length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const { isValid, message } = checkIsDomainValid(value);

    if (!isValid) {
      setResults([]);
      setIsLoading(false);
      setValidationError(message);
      return;
    }

    setIsLoading(true);

    try {
      const btcDomain = `${value}.btc`;
      const available = await isDomainAvailable(btcDomain);
      let listingContractId: string | undefined;
      if (!available) {
        listingContractId = await isDomainAvailableOnMarketplace(btcDomain);
      }
      setResults([
        {
          name: btcDomain,
          available,
          listingContractId,
        },
      ]);
    } catch (error) {
      console.error("Error checking domain availability:", error);
      setResults([]);
    }

    setIsLoading(false);
  };

  useDebounce(
    () => {
      handleDomainChange(domain);
    },
    300,
    [domain]
  );

  const handleInputFocus = () => {
    setIsFocused(true);
    // Prevent zoom on iOS and small screens
    if (window.innerWidth < 768) {
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        );
      }
    }
    
    // Scroll to input on mobile to ensure it's visible above keyboard
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const element = document.querySelector("input[placeholder=\"Search for a name\"]");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Restore zoom capability
    if (window.innerWidth < 768) {
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute("content", "width=device-width, initial-scale=1");
      }
    }
  };

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-lg mx-auto h-[60px]">
      <ShadowContainer>
        <div
          className={cn(
            "transition-all duration-300 flex items-center bg-transparent focus-within:ring-4 focus-within:ring-[#f7931a]/20 p-4 rounded-[14px]",
            {
              "ring-4 ring-[#f7931a]/10": isLoading || domain.length > 0,
            }
          )}
        >
          <input
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={cn(
              "bg-transparent flex-1 text-black font-bold placeholder:font-medium placeholder-neutral-400 focus:outline-none transition-colors",
              // Mobile-optimized font size to prevent zoom
              "text-lg sm:text-xl"
            )}
            placeholder="Search for a name"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
          />
          <span>
            {isLoading ? (
              <Spinner size={20} color="#E8E0E0" />
            ) : (
              <Search size={20} className="text-neutral-400" />
            )}
          </span>
        </div>
        {/* Dropdown Results */}
        <div
          className={`
              transition-all duration-300 origin-top border-t border-neutral-100 bg-transparent rounded-b-[14px]
              ${(domain && results.length > 0) || !!validationError ? "scale-y-100 opacity-100 max-h-40" : "scale-y-0 opacity-0 max-h-0 pointer-events-none"}
            `}
          style={{ minHeight: 0 }}
        >
          {validationError ? (
            <ValidationErrorInfo message={validationError} />
          ) : (
            <ResultsList results={results} />
          )}
        </div>
      </ShadowContainer>
    </div>
  );
};

const ValidationErrorInfo = ({ message }: { message: string }) => {
  return (
    <div className="w-full flex items-center justify-between px-5 py-3 last-of-type:rounded-b-[10px]">
      <div className="flex items-center">
        <span className="text-red-500 font-bold text-base">{message}</span>
      </div>
      <XCircleIcon size={20} className="text-red-500" />
    </div>
  );
};

const ResultsList: React.FC<{ results: TResults }> = ({ results }) => {
  const router = useRouter();

  const handleRegisterDomain = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    domainName: string
  ) => {
    event.preventDefault();

    router.push(`/register/${domainName}`);
  };

  const handleRedirectToMarketplace = (
    event: React.MouseEvent<HTMLAnchorElement>,
    contractId: string
  ) => {
    event.preventDefault();
    router.push(`/marketplace/${contractId}`);
  };

  return results.map((r) => (
    <Link
      href={`/register/${r.name}`}
      key={r.name}
      onClick={(event) => {
        if (r.available) {
          return handleRegisterDomain(event, r.name);
        }
        if (r.listingContractId) {
          return handleRedirectToMarketplace(event, r.listingContractId);
        }
      }}
      aria-disabled={!r.available && !r.listingContractId}
      tabIndex={r.available || !!r.listingContractId ? undefined : -1}
      className={cn(
        "group flex items-center justify-between px-5 py-3 last-of-type:rounded-b-[14px]",
        {
          "cursor-pointer hover:bg-neutral-50":
            r.available || !!r.listingContractId,
          "cursor-not-allowed pointer-events-none":
            !r.available && !r.listingContractId,
        }
      )}
    >
      <div className="flex items-center gap-x-4 sm:gap-x-10">
        <span className="block text-black font-bold text-lg max-w-[160px] sm:max-w-none overflow-hidden whitespace-nowrap text-ellipsis">
          <TruncatedText name={r.name} />
        </span>
        {r.available ? (
          <span className="text-green-600 font-bold text-base">Available</span>
        ) : r.listingContractId ? (
          <span className="text-green-600 font-bold text-base">
            Available on Marketplace
          </span>
        ) : (
          <span className="text-red-500 font-bold text-base">Taken</span>
        )}
      </div>
      {r.available || r.listingContractId ? (
        <ArrowRightCircle
          size={20}
          className="text-[#f7931a] transform transition-transform scale-100 group-hover:scale-110 group-hover:translate-x-1"
        />
      ) : (
        <XCircleIcon size={20} className="text-red-500" />
      )}
    </Link>
  ));
};
