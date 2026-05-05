import { NextRequest } from "next/server";

import { StripeCheckoutItem } from "@/common/types/stripe";
import { NEXT_PUBLIC_BASE_URL } from "@/env";
import { getStripe } from "@/utils/stripe/server";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const { items, address, email, claimYears } = await request.json(); // items: [{ name, price, quantity }]

    const session = await stripe.checkout.sessions.create({
      line_items: items.map((item: StripeCheckoutItem) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${NEXT_PUBLIC_BASE_URL}/api/stripe/domain-payment-success?domainName=${items[0].name}&address=${address}&email=${email}&claimYears=${claimYears}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${NEXT_PUBLIC_BASE_URL}/register/${items[0].name}?currency=USD&address=${address}&claimYears=${claimYears}`,
      metadata: {
        domainName: items[0].name,
        address: address,
        email,
      },
      customer_email: email,
    });
    return Response.json({ sessionId: session.id }, { status: 200 });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return Response.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}
