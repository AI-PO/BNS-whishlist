"use server";

import { redirect } from "next/navigation";

import { NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL } from "@/env";

import { createClient } from "./supabase/server";

export const handleLoginWithGoogle = async () => {
  const { data, error } = await (
    await createClient()
  ).auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL,
    },
  });

  if (error) {
    console.log("Error logging in with Google:", error);
  } else {
    console.log("Login successful:", data);
  }

  if (data.url) {
    redirect(data.url);
  }
};

export const signOut = async () => {
  const { error } = await (await createClient()).auth.signOut();
  if (error) {
    console.log("Error signing out:", error);
  } else {
    console.log("Sign out successful");
  }
};

export const getLoggedInUser = async () => {
  const { data, error } = await (await createClient()).auth.getUser();
  if (error) {
    console.log("Error getting user:", error);
  }
  return data;
};
