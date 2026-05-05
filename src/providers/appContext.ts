import { SupabaseUser } from "@/common/types/business";
import { createSafeContext } from "@/utils/createSafeContext";

export type TAppContext = {
  supabaseUser: SupabaseUser;
};

export const [AppContext, useAppContext] =
  createSafeContext<TAppContext>("AppContext");
