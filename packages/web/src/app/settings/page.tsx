import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import IntervalSelect from "./_components/interval-select";
import ThemeSelect from "./_components/theme-select";
import SignOut from "./_components/sign-out";
import { Label } from "@/components/ui/label";
import Update from "./_components/update";
import { initAction } from "./actions";

export default async function Settings() {
  await initAction();

  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user && session.user.githubAuthenticated === false) ||
    (session.user && session.user.twitterAuthenticated === false)
  )
    redirect("/signin");

  return (
    <Card className="flex flex-col items-start gap-4 m-4 xl:min-w-[400px]">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-4 justify-center w-full">
          <Update
            automaticallyUpdate={session?.user.automaticallyUpdate}
            lastUpdate={session?.user.lastUpdateTimestamp}
          />
          <hr></hr>
          <div>
            <Label>Theme</Label>
            <ThemeSelect
              subscription_type={session?.user.subscriptionPlan}
              theme={session?.user.theme}
            />
          </div>
          <div>
            <Label>Update interval</Label>
            <IntervalSelect
              subscription_type={session?.user.subscriptionPlan}
              interval={session?.user.updateInterval}
            />
          </div>
        </div>
        <hr></hr>
      </CardContent>

      <CardFooter className="w-full flex gap-2 flex-row justify-center">
        <Button variant="default">
          <Link href="/subscribe">Change Plan</Link>
        </Button>
        <SignOut />
      </CardFooter>
    </Card>
  );
}
