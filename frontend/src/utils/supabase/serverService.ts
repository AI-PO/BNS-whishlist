import { createClient } from "@supabase/supabase-js";

import { NEXT_PUBLIC_SUPABASE_URL } from "@/env";

// Service role client for server-side operations that bypass RLS
// Does NOT use cookies or user sessions - uses service role key for admin access
export const createSupabaseServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    const error = new Error(
      "Env variable SUPABASE_SERVICE_ROLE_KEY is not defined."
    );
    console.error(
      "[createSupabaseServiceRoleClient] Missing service role key:",
      error
    );
    throw error;
  }

  try {
    const client = createClient(NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return client;
  } catch (error) {
    console.error(
      "[createSupabaseServiceRoleClient] Failed to create client:",
      error
    );
    throw error;
  }
};
