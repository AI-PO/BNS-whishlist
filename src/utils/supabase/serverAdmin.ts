import { createClient } from "@supabase/supabase-js";

import { NEXT_PUBLIC_SUPABASE_URL } from "@/env";

// Server-side client using service role key for admin operations
export const createAdminClient = () => {
  return createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
