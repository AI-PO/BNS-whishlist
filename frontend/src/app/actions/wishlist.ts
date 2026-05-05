"use server";

import { mockApiService } from "@/api/mockService";
import { NEXT_PUBLIC_USE_MOCK_API } from "@/env";
import { createWishlistClient } from "@/utils/supabase/wishlistClient";

export async function submitWishlist(prevState: unknown, formData: FormData) {
  const email = formData.get("email")?.toString();
  let domain = formData.get("domain")?.toString();

  if (!email || typeof email !== "string") {
    return { error: "Please enter a valid email address.", success: false };
  }

  if (domain && domain.trim() !== "") {
    domain = domain.trim().toLowerCase().replace(/\.btc$/, "") + ".btc";
  } else {
    domain = undefined;
  }

  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    const { error } = await mockApiService.addWishlist(email, domain || null);
    if (error) {
      if (error === "23505") { // Unique violation
         return { error: "This email is already on the waitlist.", success: false };
      }
      return { error: "An error occurred while saving to the waitlist. Please try again later.", success: false };
    }
    return { success: true, domain };
  }

  const supabase = createWishlistClient();

  const { error } = await supabase.from("wishlist").insert([
    {
      email,
      domain: domain || null,
    },
  ]);

  if (error) {
    if (error.code === "23505") { // Unique violation if any
       return { error: "This email is already on the waitlist.", success: false };
    }
    console.error("Supabase insertion error:", error);
    return { error: "An error occurred while saving to the waitlist. Please try again later.", success: false };
  }

  return { success: true, domain };
}
