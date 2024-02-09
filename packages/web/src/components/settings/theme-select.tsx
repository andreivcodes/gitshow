"use client";

import {
  AvailablePlanTypes,
  AvailableThemeNames,
  Intervals,
  UpdateIntervalsType,
  PREMIUM_PLAN,
} from "@gitshow/gitshow-lib";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../ui/use-toast";

export default function ThemeSelect({
  subscription_type,
  theme,
  setUserTheme,
}: {
  subscription_type?: AvailablePlanTypes;
  theme?: AvailableThemeNames;
  setUserTheme: (theme: AvailableThemeNames) => void;
}) {
  const { toast } = useToast();

  return (
    <Select
      onValueChange={(e) => {
        setUserTheme(e as AvailableThemeNames);
        toast({
          description: "🎨 Your theme has been changed",
        });
      }}
      defaultValue={theme ? theme : "classic"}
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
}
