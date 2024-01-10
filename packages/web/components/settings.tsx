import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { ThemeSelect } from "./theme-select";
import Link from "next/link";
import { IntervalSelect } from "./interval-select";

export function Settings() {
  const session = useSession();

  return (
    <div className="w-full max-w-fit m-auto flex flex-col items-center">
      <div className="w-full flex flex-col items-start p-4 gap-8">
        <div className="w-full flex flex-col items-start gap-4 p-4 border rounded-md ">
          <p className="font-medium">Settings:</p>

          <ThemeSelect />
          <IntervalSelect />

          <div className="flex flex-row gap-2">
            <Button variant="default">
              <Link href="https://billing.stripe.com/p/login/test_aEU2bUf6J7dw5UYaEF">
                Change Plan
              </Link>
            </Button>

            <Button variant="destructive">
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
