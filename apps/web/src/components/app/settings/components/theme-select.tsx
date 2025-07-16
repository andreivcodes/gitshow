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
import { AvailableThemeNames } from "@gitshow/gitshow-lib";
import { setUserTheme } from "../actions";

export default function ThemeSelect({ theme }: { theme: AvailableThemeNames }) {
  const [_, startTransition] = useTransition();

  return (
    <Select
      onValueChange={(e) => {
        startTransition(() => {
          setUserTheme(e as AvailableThemeNames);
        });
      }}
      defaultValue={theme}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
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
          <SelectItem value="winter">
            <p>Winter</p>
          </SelectItem>
          <SelectItem value="bnw">
            <p>Black and White</p>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
