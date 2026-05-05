import { loadStripe, Stripe } from "@stripe/stripe-js";

import { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY } from "@/env";

let stripePromise: Stripe | null = null;
export const getStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
