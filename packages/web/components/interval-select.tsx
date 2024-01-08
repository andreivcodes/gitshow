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
import { AvailableIntervals } from "@gitshow/gitshow-lib";

export const IntervalSelect = () => {
  const subscription = useContext(SubscriptionContext);
  const { toast } = useToast();

  return (
    <Select
      onValueChange={(e) => {
        const setInterval = async () => {
          fetch("/api/set-interval", {
            body: JSON.stringify({
              theme: e,
            }),
            method: "POST",
          }).then(() => {
            subscription.setInterval(parseInt(e) as AvailableIntervals);
          });
        };

        setInterval();

        toast({
          description: "Your interval has been changed",
        });
      }}
      defaultValue={subscription.theme}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an update interval" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="1">Hourly</SelectItem>
          <SelectItem value="24">Daily</SelectItem>
          <SelectItem value="168">Weekly</SelectItem>
          <SelectItem value="720">Monthly</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
