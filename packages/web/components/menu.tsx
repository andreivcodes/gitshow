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
      {!fullyAuthenticated && (
        <SignIn
          githubSigned={session?.user?.githubAuthenticated}
          twitterSigned={session?.user?.twitterAuthenticated}
        />
      )}

      {fullyAuthenticated && storedSubscriptionType != "none" && <Settings />}

      {fullyAuthenticated && storedSubscriptionType == "none" && (
        <CheckoutMenu storedSubscriptionType={storedSubscriptionType} />
      )}
    </div>
  );
}
