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
import { AvailableIntervals, PREMIUM_PLAN } from "@gitshow/gitshow-lib";

export const IntervalSelect = () => {
  const subscription = useContext(SubscriptionContext);
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
          }).then(() => {
            subscription.setInterval(parseInt(e) as AvailableIntervals);
          });
        };

        setInterval();

        toast({
          description: "Your interval has been changed",
        });
      }}
      defaultValue={subscription.interval.toString()}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an update interval" />
      </SelectTrigger>
      <SelectContent>
        {subscription.subscriptionType != PREMIUM_PLAN ? (
          <SelectGroup>
            <SelectItem disabled={true} value="1">
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2">
                  Pro Only
                </p>
                <p>Hourly</p>
              </div>
            </SelectItem>
            <SelectItem disabled={true} value="24">
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2">
                  Pro Only
                </p>
                <p>Daily</p>
              </div>
            </SelectItem>
            <SelectItem value="168">
              <div className="flex flex-row gap-2">Weekly</div>
            </SelectItem>
            <SelectItem value="720">
              <div className="flex flex-row gap-2">Monthly</div>
            </SelectItem>
          </SelectGroup>
        ) : (
          <SelectGroup>
            <SelectItem value="1">
              <div className="flex flex-row gap-2">
                <p>Hourly</p>
              </div>
            </SelectItem>
            <SelectItem value="24">
              <div className="flex flex-row gap-2">
                <p>Daily</p>
              </div>
            </SelectItem>
            <SelectItem value="168">
              <div className="flex flex-row gap-2">Weekly</div>
            </SelectItem>
            <SelectItem value="720">
              <div className="flex flex-row gap-2">Monthly</div>
            </SelectItem>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
};
