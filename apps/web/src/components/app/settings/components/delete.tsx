"use client";

import { useTransition } from "react";
import { deleteAccount } from "../actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/lib/utils";
import { signOut } from "next-auth/react";

export default function Delete() {
  const [_, startTransition] = useTransition();

  return (
    <Button
      className={cn("w-full")}
      variant="outline"
      onClick={(e) => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
          startTransition(() => {
            deleteAccount().then(() => signOut());
          });
        }
      }}
    >
      Delete account
    </Button>
  );
}
