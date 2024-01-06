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
import { useSearchParams } from "next/navigation";
import { ThemeSelect } from "./theme-select";
import Link from "next/link";

export function Settings() {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme");

  return (
    <div className="w-full max-w-fit m-auto flex flex-col items-center">
      <div className="w-full flex flex-col items-start p-4 gap-8">
        <div
          className={`w-full flex flex-col items-start gap-4 p-6 border rounded-md ${
            session.data?.user.subscription_type == "premium"
              ? ""
              : "opacity-50 pointer-events-none"
          }`}
        >
          <p className="font-medium">Theme selection:</p>
          {session.data?.user.subscription_type != "premium" && (
            <p className="text-red-500">
              Themes are only available on the premium plan.
            </p>
          )}
          <ThemeSelect selected={theme} />
        </div>

        <div className="w-full flex flex-col items-start gap-4 p-6 border rounded-md">
          <p className="font-medium">
            Active Subscription: {session.data?.user.subscription_type}
          </p>

          <div className="flex flex-row gap-2 self-end">
            <Button variant="default">
              <Link href="https://billing.stripe.com/p/login/test_aEU2bUf6J7dw5UYaEF">
                Change Subscription
              </Link>
            </Button>

            <Button variant="destructive" onClick={() => signOut()}>
              <Link href="https://billing.stripe.com/p/login/test_aEU2bUf6J7dw5UYaEF">
                Cancel Subscription
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function SettingsOld() {
  const session = useSession();
  const router = useRouter();

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
          {(session?.data?.user.subscription_type === "free" ||
            session?.data?.user.subscription_type === "standard" ||
            session?.data?.user.subscription_type === "premium") && (
            <DropdownMenuItem
              onSelect={() =>
                router.push(
                  "https://billing.stripe.com/p/login/test_aEU2bUf6J7dw5UYaEF"
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
}
