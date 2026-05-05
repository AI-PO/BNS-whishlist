 
import { notFound } from "next/navigation";

import { getContractSummaries } from "@/api/exchangeApi/actions/getUserSclTokens";
import {
  getContractListingFromSupabase,
  getDetailedListing,
} from "@/app/actions/listings";
import { NEXT_PUBLIC_USE_MOCK_API } from "@/env";

import { ListingPageContent } from "./components/ListingPageContent";
import { ListingPageHeader } from "./components/ListingPageHeader";

const buildMockContractSummary = (
  contractId: string,
  ticker?: string
) => ({
  contract_id: contractId,
  ticker: ticker?.trim() || `domain_${contractId.slice(0, 8)}`,
  max_supply: "0",
  deployed_supply: "0",
  decimals: 0,
  deploy_height: 0,
});

const ListingPage = async ({
  params,
}: {
  params: Promise<{ contract_id: string }>;
}) => {
  let contractId = "";

  try {
    // Step 1: Parse params
    try {
      const { contract_id: contractIdParam } = await params;
      contractId = decodeURIComponent(contractIdParam);
    } catch (error) {
      console.error("[ListingPage] ❌ FAILED: Parsing params", error);
      throw new Error(`Failed to parse params: ${error}`);
    }

    // Step 2: Get listing data from Supabase
    let listingData;
    try {
      listingData = await getContractListingFromSupabase(contractId);
    } catch (error) {
      console.error(
        "[ListingPage] ❌ FAILED: getContractListingFromSupabase",
        error
      );
      throw new Error(`Supabase listing query failed: ${error}`);
    }

    if (!listingData) {
      console.log(
        "[ListingPage] ❌ No listing data found for contractId:",
        contractId
      );
      notFound();
    }

    // Step 3: Get contract summary from external API
    let contractSummary;
    try {
      if (NEXT_PUBLIC_USE_MOCK_API === "true") {
        contractSummary = buildMockContractSummary(contractId, listingData.name);
        console.log("[ListingPage] ✅ Using mock contract summary:", contractSummary);
      } else {
        const contractSummaries = await getContractSummaries([contractId]);
        contractSummary = contractSummaries[0];

        if (!contractSummary && contractSummaries.length === 0) {
          console.log(
            "[ListingPage] ⚠️ External API returned empty array for contractId:",
            contractId,
            "- contract may not exist in external system"
          );

          // Create a fallback summary using listing data
          contractSummary = buildMockContractSummary(contractId, listingData.name);

          console.log("[ListingPage] ✅ Created fallback contract summary:", contractSummary);
        }
      }
    } catch (error) {
      console.error("[ListingPage] ❌ FAILED: getContractSummaries", error);
      
      // Create a fallback summary if external API fails completely
      console.log("[ListingPage] ⚠️ External API failed, creating fallback summary");
      contractSummary = buildMockContractSummary(contractId, listingData.name);
    }

    // Step 4: Parse detailed listing
    let parsedListing;
    try {
      parsedListing = await getDetailedListing({
        contractId: contractId,
        domain: contractSummary.ticker,
        listingUtxo: listingData.list_utxo,
        price: listingData.price,
        recAddress: listingData.owner,
        bestBid: listingData.best_bid,
        createdAt: listingData.created_at,
        orderId: listingData.order_id,
        status: listingData.status,
        bidCount: listingData.bid_count,
        supabaseListingId: listingData.id,
        supabaseDomain: listingData.domains,
      });
    } catch (error) {
      console.error("[ListingPage] ❌ FAILED: getDetailedListing", error);
      throw new Error(`Detailed listing parsing failed: ${error}`);
    }

    if (!parsedListing) {
      console.log("[ListingPage] ❌ No parsed listing generated");
      notFound();
    }

    return (
      <div className="relative h-full max-w-[760px] w-full md:w-fit md:max-w-none flex flex-col m-auto pt-[96px] sm:pt-[136px] pb-8 px-4 gap-y-[26px]">
        <div className="pointer-events-none absolute inset-0 -z-10 bn-grid-light opacity-70" />
        <div className="pointer-events-none absolute inset-0 -z-10 bn-dot-grid opacity-30" />
        <ListingPageHeader ticker={parsedListing.domain} />
        <ListingPageContent listing={parsedListing} />
      </div>
    );
  } catch (error) {
    console.error("[ListingPage] ❌ CRITICAL ERROR in ListingPage:", {
      contractId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Create a detailed error for production debugging
    const detailedError = new Error(
      `MARKETPLACE_PAGE_ERROR: ${error instanceof Error ? error.message : String(error)} | ContractId: ${contractId}`
    );

    // Preserve original stack trace
    if (error instanceof Error && error.stack) {
      detailedError.stack = error.stack;
    }

    throw detailedError;
  }
};

export default ListingPage;
