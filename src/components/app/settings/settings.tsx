"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import IntervalSelect from "./components/interval-select";
import ThemeSelect from "./components/theme-select";
import SignOut from "./components/sign-out";
import { Label } from "@/components/ui/label";
import Update from "./components/update";
import { cn } from "@/components/lib/utils";
import { useSession } from "next-auth/react";
import Delete from "./components/delete";

export default function Settings() {
  const { data } = useSession();

  if (!data)
    return (
      <Card className={cn("w-full sm:w-[448px] h-auto sm:min-h-[460px] flex flex-col")}></Card>
    );

  return (
    <Card className={cn("w-full sm:w-[448px] h-auto sm:min-h-[460px] flex flex-col")}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Settings</CardTitle>
      </CardHeader>
      <CardContent className={cn("flex-1 flex w-full flex-col gap-4")}>
        <div className="bg-muted/50 rounded-lg p-3">
          <Update
            automaticallyUpdate={data?.user.automaticallyUpdate}
            lastUpdate={data?.user.lastUpdateTimestamp}
          />
        </div>

        <div className="space-y-3">
          <div className="grid gap-2">
            <Label className="text-sm">Theme</Label>
            <ThemeSelect theme={data?.user.theme} />
          </div>

          <div className="grid gap-2">
            <Label className="text-sm">Update Frequency</Label>
            <IntervalSelect interval={data?.user.updateInterval} />
          </div>
        </div>
      </CardContent>

      <CardFooter className={cn("grid grid-cols-2 gap-2 border-t pt-4")}>
        <SignOut />
        <Delete />
      </CardFooter>
    </Card>
  );
}
