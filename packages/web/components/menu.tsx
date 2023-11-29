import { CheckoutMenu } from "./checkout-menu";

import { AvailableSubscriptionTypes } from "@gitshow/svg-gen";
import { useSession } from "next-auth/react";
import { SignIn } from "./auth";
import { Settings } from "./settings";

export function Menu({
	signedIn,
	storedSubscriptionType,
}: {
	signedIn: boolean;
	storedSubscriptionType: AvailableSubscriptionTypes;
}) {
	const { data: session } = useSession();

	return (
		<div>
			{signedIn ? (
				<div className="flex flex-row justify-end">
					<CheckoutMenu storedSubscriptionType={storedSubscriptionType} />
					<Settings />
				</div>
			) : (
				<SignIn
					githubSigned={session?.user?.githubAuthenticated}
					twitterSigned={session?.user?.twitterAuthenticated}
				/>
			)}
		</div>
	);
}
