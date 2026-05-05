// app/api/listings/[contractId]/route.ts
import { NextResponse } from "next/server";

import { createSupabaseServiceRoleClient } from "@/utils/supabase/serverService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const paramsData = await params;

  const contractId = decodeURIComponent(paramsData.contractId);
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, domains!inner(id, expiry)")
    .eq("contract_id", contractId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the first listing if found
  const listing = data[0] || null;

  return NextResponse.json(listing, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=29", // Shorter cache for specific listings
    },
  });
}
