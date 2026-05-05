"use server";

import { revalidatePath } from "next/cache";

import { revalidateMarketplace } from "../marketplace/[contract_id]/actions";
import { revalidateProfile } from "../profile/actions";

export const revalidateApp = async () => {
  revalidatePath("/");
  await revalidateProfile();
  await revalidateMarketplace();
};
