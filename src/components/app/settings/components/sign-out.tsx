"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/lib/utils";

export default function SignOut() {
  return (
    <Button className={cn("w-full")} variant="default" onClick={() => signOut()}>
      Sign out
    </Button>
  );
}
