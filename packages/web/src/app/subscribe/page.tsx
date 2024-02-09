"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PriceMenu } from "@/components/subscribe/menu";
import { SubscriptionPlan } from "@gitshow/gitshow-lib";

export default function SignIn() {
  const session = useSession();
  const router = useRouter();

  // if (!session.data) {
  //   router.push("/signin");
  //   return;
  // }

  return (
    <PriceMenu
      currentSubscription={
        session.data
          ? session.data.user.subscription_type
          : SubscriptionPlan.Free
      }
    />
  );
}
