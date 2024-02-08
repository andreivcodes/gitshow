"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  AvailablePlanTypes,
  AvailableThemeNames,
  Intervals,
  IntervalsType,
  PREMIUM_PLAN,
  Plans,
} from "@gitshow/gitshow-lib";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Settings() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status !== "loading" && session.status !== "authenticated") {
      if (router) {
        router.push("/signin");
      }
    }
  }, [session, router]);

  if (!session || !session.data || !session.data.user) {
    return <></>;
  }

  return (
    <div className="w-full max-w-fit m-auto flex flex-col items-center">
      <div className="w-full flex flex-col items-start p-4 gap-8">
        <Card className="flex flex-col items-start gap-4 p-4">
          <p className="font-medium">Settings:</p>

          <ThemeSelect
            subscription_type={session.data?.user.subscription_type}
            theme={session.data?.user.theme}
          />
          <IntervalSelect
            subscription_type={session.data?.user.subscription_type}
            interval={session.data?.user.interval}
          />

          <div className="flex flex-row gap-2">
            <Button variant="default">
              <Link href="https://billing.stripe.com/p/login/test_eVa6sa3o19lE1EI8wy">
                Change Plan
              </Link>
            </Button>

            <Button variant="destructive">
              <Link href="https://billing.stripe.com/p/login/test_eVa6sa3o19lE1EI8wy">
                Cancel Subscription
              </Link>
            </Button>
          </div>
        </Card>
      </div>
      <div className="flex flex-row gap-2">
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

const ThemeSelect = ({
  subscription_type,
  theme,
}: {
  subscription_type?: AvailablePlanTypes;
  theme?: AvailableThemeNames;
}) => {
  const { toast } = useToast();

  return (
    <Select
      onValueChange={(e) => {
        const setTheme = async () => {
          fetch("/api/set-theme", {
            body: JSON.stringify({
              theme: e,
            }),
            method: "POST",
          });
        };

        setTheme();

        toast({
          description: "🎨 Your theme has been changed",
        });
      }}
      defaultValue={theme}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        {subscription_type != PREMIUM_PLAN ? (
          <SelectGroup>
            <SelectItem value="normal">
              <p>Normal</p>
            </SelectItem>
            <SelectItem value="classic">
              <p>Classic</p>
            </SelectItem>
            <SelectItem value="githubDark">
              <p>Github Dark</p>
            </SelectItem>
            <SelectItem value="dracula" disabled={true}>
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2 opacity-200">
                  Pro Only
                </p>
                <p>Dracula</p>
              </div>
            </SelectItem>
            <SelectItem value="spooky" disabled={true}>
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2 opacity-200">
                  Pro Only
                </p>
                <p>Spooky</p>
              </div>
            </SelectItem>
            <SelectItem value="bnw" disabled={true}>
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2 opacity-200">
                  Pro Only
                </p>
                <p>Black and White</p>
              </div>
            </SelectItem>
          </SelectGroup>
        ) : (
          <SelectGroup>
            <SelectItem value="normal">
              <p>Normal</p>
            </SelectItem>
            <SelectItem value="classic">
              <p>Classic</p>
            </SelectItem>
            <SelectItem value="githubDark">
              <p>Github Dark</p>
            </SelectItem>
            <SelectItem value="dracula">
              <p>Dracula</p>
            </SelectItem>
            <SelectItem value="spooky">
              <p>Spooky</p>
            </SelectItem>
            <SelectItem value="bnw">
              <p>Black and White</p>
            </SelectItem>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
};

const IntervalSelect = ({
  subscription_type,
  interval,
}: {
  subscription_type?: AvailablePlanTypes;
  interval?: IntervalsType;
}) => {
  const { toast } = useToast();

  return (
    <Select
      onValueChange={(e) => {
        const setInterval = async () => {
          fetch("/api/set-interval", {
            body: JSON.stringify({
              interval: e,
            }),
            method: "POST",
          });
        };

        setInterval();

        toast({
          description: "⏱️ Your interval has been changed",
        });
      }}
      defaultValue={interval ? interval.toString() : ""}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an update interval" />
      </SelectTrigger>
      <SelectContent>
        {subscription_type != PREMIUM_PLAN ? (
          <SelectGroup>
            <SelectItem disabled={true} value={Intervals.EVERY_HOUR.toString()}>
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2">
                  Pro Only
                </p>
                <p>Hourly</p>
              </div>
            </SelectItem>
            <SelectItem disabled={true} value={Intervals.EVERY_DAY.toString()}>
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2">
                  Pro Only
                </p>
                <p>Daily</p>
              </div>
            </SelectItem>
            <SelectItem value={Intervals.EVERY_WEEK.toString()}>
              <div className="flex flex-row gap-2">Weekly</div>
            </SelectItem>
            <SelectItem value={Intervals.EVERY_MONTH.toString()}>
              <div className="flex flex-row gap-2">Monthly</div>
            </SelectItem>
          </SelectGroup>
        ) : (
          <SelectGroup>
            <SelectItem value={Intervals.EVERY_HOUR.toString()}>
              <div className="flex flex-row gap-2">
                <p>Hourly</p>
              </div>
            </SelectItem>
            <SelectItem value={Intervals.EVERY_DAY.toString()}>
              <div className="flex flex-row gap-2">
                <p>Daily</p>
              </div>
            </SelectItem>
            <SelectItem value={Intervals.EVERY_WEEK.toString()}>
              <div className="flex flex-row gap-2">Weekly</div>
            </SelectItem>
            <SelectItem value={Intervals.EVERY_MONTH.toString()}>
              <div className="flex flex-row gap-2">Monthly</div>
            </SelectItem>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
};
