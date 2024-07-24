"use client";

import { useTransition } from "react";
import { deleteAccount, setUpdateInterval } from "../actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

export default function Delete() {

  const [_, startTransition] = useTransition();

  return (
    <Button
      className={cn("w-full")} variant="destructive"
      onClick={(e) => {
        startTransition(() => {
          deleteAccount().then(() => signOut());
        });
      }}

    >
      Delete my account
    </Button>
  );
}
