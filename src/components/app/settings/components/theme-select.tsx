"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";
import { type ThemeName, themeNames, themeDisplayNames } from "@/lib/schemas";
import { setUserTheme } from "../actions";
import { useViewTransition } from "@/hooks/use-view-transition";
import { toast } from "sonner";

interface ThemeSelectProps {
  theme: ThemeName;
}

export default function ThemeSelect({ theme }: ThemeSelectProps) {
  const [, startTransition] = useTransition();
  const startViewTransition = useViewTransition();

  return (
    <Select
      onValueChange={(value) => {
        startViewTransition(() => {
          startTransition(async () => {
            const result = await setUserTheme(value as ThemeName);
            if (result.success) {
              toast.success("Theme updated successfully");
            } else {
              toast.error(result.error);
            }
          });
        });
      }}
      defaultValue={theme}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {themeNames.map((themeName) => (
            <SelectItem key={themeName} value={themeName}>
              <p>{themeDisplayNames[themeName]}</p>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
