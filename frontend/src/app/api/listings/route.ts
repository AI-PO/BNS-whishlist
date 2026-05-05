// app/api/listings/route.ts
import { NextResponse } from "next/server";

import { createSupabaseServiceRoleClient } from "@/utils/supabase/serverService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address"); // optional query param

  const supabase = createSupabaseServiceRoleClient();

  let query = supabase
    .from("listings")
    .select("*, domains!inner(id, expiry)")
    .order("created_at", { ascending: false });

  if (address) {
    query = query.eq("address", address);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=59",
    },
  });
}
