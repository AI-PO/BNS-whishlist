"use client";

import { PropsWithChildren, useEffect, useMemo, useState } from "react";

import { SupabaseUser } from "@/common/types/business";
import { getLoggedInUser } from "@/utils/googleSso";

import { AppContext } from "./appContext";

type Props = PropsWithChildren;

export const AppContextProvider: React.FC<Props> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser>(null);

  // useEffect(() => {
  //   const setupUser = async () => {
  //     const user = await getLoggedInUser();
  //     setSupabaseUser(user.user);
  //   };
  //   setupUser();
  // }, []);

  const value = useMemo(() => ({ supabaseUser }), [supabaseUser]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
