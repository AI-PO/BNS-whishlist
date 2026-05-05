import { MagnifyingGlassIcon as Search } from "@phosphor-icons/react/dist/ssr";
import { ListFilter } from "lucide-react";
import { useEffect, useState } from "react";

import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { ShadowContainer } from "@/common/components/ShadowContainer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import { cn } from "@/lib/utils";

import { useMarketplaceListContext } from "../context/marketplaceListContext";
import { SortBy } from "../types";

export const MarketplaceListTopBar: React.FC = () => {
  return (
    <div className="flex items-center gap-x-3 w-full">
      <DomainsListSearchBar />
      <DomainsListSortButton />
    </div>
  );
};

const DomainsListSearchBar: React.FC = () => {
  const { search, handleSearch, isLoading } = useMarketplaceListContext();
  const [inputValue, setInputValue] = useState(search);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== search) {
        handleSearch(inputValue);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, search, handleSearch]);

  useEffect(() => {
    if (search !== inputValue) {
      setInputValue(search);
    }
     
  }, [search]);

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
    <ShadowContainer className="flex-1">
      <div
        className={cn(
          "w-full transition-all duration-300 flex items-center bg-white/88 border border-bn-line focus-within:ring-4 focus-within:ring-[#f7931a]/20 p-4 rounded-[18px]",
          {
            "ring-4 ring-[#f7931a]/10": isLoading || inputValue.length > 0,
          }
        )}
      >
        <input
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={cn(
            "w-full bg-transparent flex-1 text-black font-bold placeholder:font-medium placeholder-neutral-400 focus:outline-none transition-colors",
            "text-base sm:text-lg"
          )}
          placeholder="Search for a domain"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
    </ShadowContainer>
  );
};

const DomainsListSortButton: React.FC = () => {
  const { sortBy, handleSort } = useMarketplaceListContext();

  const sortByOptions: { label: string; value: SortBy }[] = [
    {
      label: "Price: from lowest",
      value: SortBy.PRICE_ASC,
    },
    {
      label: "Price: from highest",
      value: SortBy.PRICE_DESC,
    },
    {
      label: "Name: (A-Z)",
      value: SortBy.NAME_ASC,
    },
    {
      label: "Name: (Z-A)",
      value: SortBy.NAME_DESC,
    },
    // {
    //   label: "Premium domains first",
    //   value: SortBy.PREMIUM_FIRST,
    // },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="S" className="p-4">
          <ListFilter size={28} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        side="bottom"
        align="end"
        className="w-[260px] p-4 rounded-[18px] border border-bn-line bg-white/92 backdrop-blur-xl"
      >
        <div className="flex flex-col">
          {sortByOptions.map((option) => (
            <button
              key={option.value}
              className={cn(
                "text-base font-medium p-3 text-start transition-colors rounded-lg",
                sortBy === option.value ? "text-[#f7931a] bg-[#f7931a]/10" : "text-black hover:text-[#f7931a] hover:bg-neutral-100/70"
              )}
              onClick={() => handleSort(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
