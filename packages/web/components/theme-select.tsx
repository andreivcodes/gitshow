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
import { AvailableThemeNames, PREMIUM_PLAN } from "@gitshow/gitshow-lib";
import { useRouter } from "next/navigation";

export const ThemeSelect = () => {
  const subscription = useContext(SubscriptionContext);
  const { toast } = useToast();
  const router = useRouter();

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
            router.refresh();
          });
        };

        setTheme();

        toast({
          description: "🎨 Your theme has been changed",
        });
      }}
      defaultValue={subscription.theme}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        {subscription.subscriptionType != PREMIUM_PLAN ? (
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
