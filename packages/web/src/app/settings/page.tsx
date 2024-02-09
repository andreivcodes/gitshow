import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { setRefreshInterval, setUserTheme } from "./actions";
import IntervalSelect from "@/components/interval-select";
import ThemeSelect from "@/components/theme-select";
import SignOut from "@/components/sign-out";

export default async function Settings() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user && session.user.githubAuthenticated === false) ||
    (session.user && session.user.twitterAuthenticated === false)
  )
    redirect("/signin");

  return (
    <div className="flex justify-center p-4">
      <Card className="flex flex-col items-start gap-4">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <ThemeSelect
              subscription_type={session?.user.subscription_type}
              theme={session?.user.theme}
              setUserTheme={setUserTheme}
            />
            <IntervalSelect
              subscription_type={session?.user.subscription_type}
              interval={session?.user.interval}
              setRefreshInterval={setRefreshInterval}
            />
          </div>
          <div className="flex flex-row gap-2">
            <Button variant="default">
              <Link href="">Change Plan</Link>
            </Button>

            <Button variant="destructive">
              <Link href="">Cancel Subscription</Link>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="w-full flex flex-col justify-center items-center">
          <SignOut />
        </CardFooter>
      </Card>
    </div>
  );
}
