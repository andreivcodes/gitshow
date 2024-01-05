import { CheckoutMenu } from "./checkout-menu";

import { AvailableSubscriptionTypes } from "@gitshow/svg-gen";
import { useSession } from "next-auth/react";
import { SignIn } from "./auth";
import { Settings } from "./settings";

export function Menu({
  fullyAuthenticated,
  storedSubscriptionType,
}: {
  fullyAuthenticated: boolean;
  storedSubscriptionType: AvailableSubscriptionTypes;
}) {
  const { data: session } = useSession();

  return (
    <div className="w-full">
      <SignIn
        githubSigned={session?.user?.githubAuthenticated}
        twitterSigned={session?.user?.twitterAuthenticated}
      />

      <Settings />

      <CheckoutMenu storedSubscriptionType={storedSubscriptionType} />
    </div>
  );
}
