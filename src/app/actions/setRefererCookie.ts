"use server";

import { cookies } from "next/headers";

export const setRefererCookie = async (referer: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    httpOnly: true,
    secure: true,
    name: "referer",
    value: referer,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });
};
