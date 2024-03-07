"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { setUserTheme } from "@/app/settings/actions";
import { useTransition } from "react";
import { SubscriptionPlan } from "@prisma/client";
import { AvailableThemeNames } from "@gitshow/gitshow-lib";

export default function ThemeSelect({
  subscription_type,
  theme,
}: {
  subscription_type?: SubscriptionPlan;
  theme?: AvailableThemeNames;
}) {
  const { toast } = useToast();
  const [_, startTransition] = useTransition();

  return (
    <Select
      onValueChange={(e) => {
        toast({
          description:
            subscription_type == "FREE"
              ? "🎨 Your theme has been changed. Changes will take effect on next automatic update."
              : "🎨 Your theme has been changed.",
        });
        startTransition(() => {
          setUserTheme(e as AvailableThemeNames);
        });
      }}
      defaultValue={theme ? theme : "normal"}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        {subscription_type != "PREMIUM" ? (
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
                <p className="animate-premium-select opacity-200 rounded-md px-2">Pro Only</p>
                <p>Dracula</p>
              </div>
            </SelectItem>
            <SelectItem value="spooky" disabled={true}>
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select opacity-200 rounded-md px-2">Pro Only</p>
                <p>Spooky</p>
              </div>
            </SelectItem>
            <SelectItem value="bnw" disabled={true}>
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select opacity-200 rounded-md px-2">Pro Only</p>
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
}
