// app/api/domains/[searchValue]/route.ts
import validate from "bitcoin-address-validation";
import { NextResponse } from "next/server";

import { createSupabaseServiceRoleClient } from "@/utils/supabase/serverService";

const allowedOrigins = ["http://localhost:5173"];

const getHeadersWithCors = (request: Request) => {
  const origin = request.headers.get("origin");

  const headers: { [key: string]: string } = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
};

export async function OPTIONS(request: Request) {
  const headers = getHeadersWithCors(request);

  return new NextResponse(null, {
    status: 200,
    headers,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ searchValue: string }> }
) {
  const headers = getHeadersWithCors(request);
  const paramsData = await params;
  const searchValue = decodeURIComponent(paramsData.searchValue);
  const supabase = createSupabaseServiceRoleClient();

  // Determine search strategy based on input characteristics
  const isValidBitcoinAddress = validate(searchValue);

  let query = supabase
    .from("domains")
    .select("*")
    .order("created_at", { ascending: false });

  if (isValidBitcoinAddress) {
    // Search by exact address match
    query = query.eq("address", searchValue);
  } else {
    // Search by domain name - use ilike for case-insensitive partial matching
    query = query.ilike("domain", searchValue);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
        headers,
      }
    );
  }

  // Optional: Add cache headers to API response for CDN or browser
  return NextResponse.json(data, {
    status: 200,
    headers: {
      ...headers,
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=59",
    },
  });
}
