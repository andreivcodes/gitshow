import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";
import { useContext } from "react";
import { SubscriptionContext } from "../pages";
import { AvailableThemeNames } from "@gitshow/gitshow-lib";

export const ThemeSelect = () => {
  const subscription = useContext(SubscriptionContext);
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
          }).then(() => {
            subscription.setTheme(e as AvailableThemeNames);
          });
        };

        setTheme();

        toast({
          description: "Your theme has been changed",
        });
      }}
      defaultValue={subscription.theme}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="classic">Classic</SelectItem>
          <SelectItem value="githubDark">Github Dark</SelectItem>
          <SelectItem value="dracula">Dracula</SelectItem>
          <SelectItem value="spooky">Spooky</SelectItem>
          <SelectItem value="bnw">Black and White</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
