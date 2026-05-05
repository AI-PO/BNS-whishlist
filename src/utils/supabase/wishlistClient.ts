import { createClient } from "@supabase/supabase-js";

import {
  NEXT_PUBLIC_SUPABASE_WISHLIST_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_WISHLIST_URL,
} from "@/env";

export const createWishlistClient = () => {
  return createClient(
    NEXT_PUBLIC_SUPABASE_WISHLIST_URL,
    NEXT_PUBLIC_SUPABASE_WISHLIST_ANON_KEY
  );
};
