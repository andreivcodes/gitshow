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
import {
  setAutomaticallyUpdate,
  setUpdateInterval,
  setUserTheme,
} from "./actions";
import IntervalSelect from "@/components/settings/interval-select";
import ThemeSelect from "@/components/settings/theme-select";
import SignOut from "@/components/sign-out";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Update from "@/components/settings/update";

export default async function Settings() {
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
            automaticallyUpdate={session.user.automaticallyUpdate}
            lastUpdate={session.user.lastUpdateTimestamp}
            setAutomaticallyUpdate={setAutomaticallyUpdate}
          />
          <hr></hr>
          <div>
            <Label>Theme</Label>
            <ThemeSelect
              subscription_type={session?.user.subscription_type}
              theme={session?.user.theme}
              setUserTheme={setUserTheme}
            />
          </div>
          <div>
            <Label>Update interval</Label>
            <IntervalSelect
              subscription_type={session?.user.subscription_type}
              interval={session?.user.updateInterval}
              setUpdateInterval={setUpdateInterval}
            />
          </div>
        </div>
        <hr></hr>
      </CardContent>

      <CardFooter className="w-full flex gap-2 flex-row justify-center">
        <Button variant="default">
          <Link href="">Change Plan</Link>
        </Button>
        <SignOut />
      </CardFooter>
    </Card>
  );
}
