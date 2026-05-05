"use client";

import { User } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { handleLoginWithGoogle, signOut } from "@/utils/googleSso";

import { Button } from "../../components/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";

export const GoogleLoginButton = () => {
  return (
    <Button variant="primary" size="S" onClick={handleLoginWithGoogle}>
      Log In
    </Button>
  );
};

export const GoogleSignOutButton = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <div className={cn("button button-secondary text-neutral-600")}>
          <User size={20} />
        </div>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        side="bottom"
        align="end"
        className="w-40 py-0"
      >
        <div className="flex flex-col">
          <Link href="/profile" className="text-16 font-medium py-3">
            My Profile
          </Link>
          <button
            className="text-16 font-medium py-3 text-start"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
