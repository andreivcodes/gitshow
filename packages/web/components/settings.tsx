import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Settings() {
	const session = useSession();
	const router = useRouter();

	if (session.status === "authenticated")
		return (
			<div className="absolute mx-4 md:mx-10">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="secondary">
							<span className="sr-only">Actions</span>
							<DotsHorizontalIcon className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{(session.data.user.subscription_type === "free" ||
							session.data.user.subscription_type === "standard" ||
							session.data.user.subscription_type === "premium") && (
							<DropdownMenuItem
								onSelect={() =>
									router.push(
										"https://billing.stripe.com/p/login/test_aEU2bUf6J7dw5UYaEF",
									)
								}
								className="text-red-700"
							>
								Cancel subscription
							</DropdownMenuItem>
						)}

						<DropdownMenuItem onSelect={() => signOut()}>
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		);
	return <></>;
}
