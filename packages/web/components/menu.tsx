import { CheckoutMenu } from "./checkout-menu";
import { useSession } from "next-auth/react";
import { SignIn } from "./auth";
import { Settings } from "./settings";
import { AvailableSubscriptionTypes, NONE_PLAN } from "@gitshow/gitshow-lib";

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

      {fullyAuthenticated && storedSubscriptionType != NONE_PLAN && (
        <Settings />
      )}

      {fullyAuthenticated && storedSubscriptionType == NONE_PLAN && (
        <CheckoutMenu />
      )}
    </div>
  );
}
