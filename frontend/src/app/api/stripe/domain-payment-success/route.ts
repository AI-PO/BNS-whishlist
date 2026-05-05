import { NextRequest, NextResponse } from "next/server";

import { getStripe } from "@/utils/stripe/server";
import { createSupabaseServiceRoleClient } from "@/utils/supabase/serverService";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const domainName = searchParams.get("domainName");
  const address = searchParams.get("address");
  const stripeSessionId = searchParams.get("session_id");
  const claimYears = searchParams.get("claimYears");

  const redirectToError = (
    defaultMessage: string,
    domainName?: string,
    btcAddress?: string,
    details?: string
  ) => {
    const path = domainName
      ? `/register/${domainName}?address=${btcAddress}&currency=USD&claimYears=${claimYears || 1}`
      : "/";
    const errorPageUrl = new URL(path, request.nextUrl.origin);
    errorPageUrl.searchParams.set("error", defaultMessage);
    if (details) {
      errorPageUrl.searchParams.set("error_details", details);
    }
    if (btcAddress) {
      errorPageUrl.searchParams.set("address", btcAddress);
    }
    return NextResponse.redirect(errorPageUrl.toString());
  };

  if (!domainName) {
    return redirectToError("Domain name is required");
  }
  if (!address) {
    return redirectToError("Bitcoin address is required", domainName);
  }
  if (!stripeSessionId) {
    return redirectToError(
      "Stripe payment error",
      domainName,
      address,
      "Stripe session ID is required for payment verification."
    );
  }

  try {
    const session =
      await getStripe().checkout.sessions.retrieve(stripeSessionId);
    if (!session) {
      return redirectToError(
        "Stripe payment error",
        domainName,
        address,
        `No Stripe session found for ID: ${stripeSessionId}`
      );
    }
    if (session.payment_status !== "paid") {
      return redirectToError(
        "Stripe payment not completed",
        domainName,
        address,
        `Stripe session status: ${session.payment_status}`
      );
    }
    if (session.metadata?.domainName !== domainName) {
      return redirectToError(
        "Stripe payment domain name mismatch",
        domainName,
        address,
        `Expected domain name: ${domainName}, Received domain name: ${session.metadata?.domainName}`
      );
    }
    if (session.metadata?.address !== address) {
      return redirectToError(
        "Stripe payment address mismatch",
        domainName,
        address,
        `Expected address: ${address}, Received address: ${session.metadata?.address}`
      );
    }

    // create domain and order in the database
    const supabaseServiceRoleClient = createSupabaseServiceRoleClient();

    const userEmailForDb = session.metadata?.email;

    if (!userEmailForDb) {
      return redirectToError(
        "Register domain error",
        domainName,
        address,
        "Missing user email in stripe session metadata."
      );
    }

    const { error: rpcError } = await supabaseServiceRoleClient.rpc(
      "create_domain_and_order",
      {
        domain_name: domainName,
        domain_address: address,
        user_email: userEmailForDb, // Użyj ustalonego emaila
      }
    );

    if (rpcError) {
      return redirectToError(
        "Register domain error",
        domainName,
        address,
        `Supabase error: ${rpcError.message}`
      );
    }

    // TODO: mint domain NFT

    const successUrl = new URL(
      `/register/${domainName}/success`,
      request.nextUrl.origin
    );
    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error("Error in domain registration:", error);
    return redirectToError(
      "Failed to register domain",
      domainName,
      address,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
