// app/api/listings/[address]/route.ts
import { NextResponse } from "next/server";

import { createSupabaseServiceRoleClient } from "@/utils/supabase/serverService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const paramsData = await params;

  const address = decodeURIComponent(paramsData.address);
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, domains!inner(id, expiry)")
    .eq("owner", address)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optional: Add cache headers to API response for CDN or browser
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=9", // Shorter cache for user-specific data
    },
  });
}
