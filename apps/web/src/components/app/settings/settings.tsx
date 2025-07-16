"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card
        className={cn(
          "m-4 flex flex-col items-start gap-4 xl:min-w-[400px] h-[27.8rem]",
        )}
      ></Card>
    );

  return (
    <Card
      className={cn("m-4 flex flex-col items-start gap-4 xl:min-w-[400px]")}
    >
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className={cn("flex w-full flex-col gap-6")}>
        <div className="flex w-full flex-col justify-center gap-4">
          <Update
            automaticallyUpdate={data?.user.automaticallyUpdate}
            lastUpdate={data?.user.lastUpdateTimestamp}
          />
          <hr></hr>
          <div>
            <Label>Theme</Label>
            <ThemeSelect theme={data?.user.theme} />
          </div>
          <div>
            <Label>Update interval</Label>
            <IntervalSelect interval={data?.user.updateInterval} />
          </div>
        </div>
        <hr></hr>
      </CardContent>

      <CardFooter className={cn("flex w-full flex-row justify-center gap-2")}>
        <Delete />
        <SignOut />
      </CardFooter>
    </Card>
  );
}
