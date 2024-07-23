
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import IntervalSelect from "./_components/interval-select";
import ThemeSelect from "./_components/theme-select";
import SignOut from "./_components/sign-out";
import { Label } from "@/components/ui/label";
import Update from "./_components/update";
import { initAction, } from "./actions";
import { cn } from "@/lib/utils";

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
    <Card className={cn("m-4 flex flex-col items-start gap-4 xl:min-w-[400px]")}>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className={cn("flex w-full flex-col gap-6")}>
        <div className="flex w-full flex-col justify-center gap-4">
          <Update
            automaticallyUpdate={session?.user.automaticallyUpdate}
            lastUpdate={session?.user.lastUpdateTimestamp}
          />
          <hr></hr>
          <div>
            <Label>Theme</Label>
            <ThemeSelect theme={session?.user.theme} />
          </div>
          <div>
            <Label>Update interval</Label>
            <IntervalSelect
              interval={session?.user.updateInterval}
            />
          </div>
        </div>
        <hr></hr>
      </CardContent>

      <CardFooter className={cn("flex w-full flex-row justify-center gap-2")}>
        <SignOut />
      </CardFooter>
    </Card >
  );
}
