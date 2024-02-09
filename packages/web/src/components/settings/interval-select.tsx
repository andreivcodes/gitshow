"use client";

import { SubscriptionPlan, UpdateInterval } from "@gitshow/gitshow-lib";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../ui/use-toast";

export default function IntervalSelect({
  subscription_type,
  interval,
  setUpdateInterval,
}: {
  subscription_type?: SubscriptionPlan;
  interval?: UpdateInterval;
  setUpdateInterval: (interval: UpdateInterval) => void;
}) {
  const { toast } = useToast();

  return (
    <Select
      onValueChange={(e) => {
        setUpdateInterval(parseInt(e) as UpdateInterval);
        toast({
          description: "⏱️ Your interval has been changed",
        });
      }}
      defaultValue={
        interval ? interval.toString() : UpdateInterval.EVERY_MONTH.toString()
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an update interval" />
      </SelectTrigger>
      <SelectContent>
        {subscription_type != SubscriptionPlan.Premium ? (
          <SelectGroup>
            <SelectItem
              disabled={true}
              value={UpdateInterval.EVERY_DAY.toString()}
            >
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2">
                  Pro Only
                </p>
                <p>Daily</p>
              </div>
            </SelectItem>
            <SelectItem value={UpdateInterval.EVERY_WEEK.toString()}>
              <div className="flex flex-row gap-2">Weekly</div>
            </SelectItem>
            <SelectItem value={UpdateInterval.EVERY_MONTH.toString()}>
              <div className="flex flex-row gap-2">Monthly</div>
            </SelectItem>
          </SelectGroup>
        ) : (
          <SelectGroup>
            <SelectItem value={UpdateInterval.EVERY_DAY.toString()}>
              <div className="flex flex-row gap-2">
                <p>Daily</p>
              </div>
            </SelectItem>
            <SelectItem value={UpdateInterval.EVERY_WEEK.toString()}>
              <div className="flex flex-row gap-2">Weekly</div>
            </SelectItem>
            <SelectItem value={UpdateInterval.EVERY_MONTH.toString()}>
              <div className="flex flex-row gap-2">Monthly</div>
            </SelectItem>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
