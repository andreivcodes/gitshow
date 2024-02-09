"use client";

import {
  AvailablePlanTypes,
  AvailableThemeNames,
  Intervals,
  IntervalsType,
  PREMIUM_PLAN,
} from "@gitshow/gitshow-lib";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";

export default function IntervalSelect({
  subscription_type,
  interval,
  setRefreshInterval,
}: {
  subscription_type?: AvailablePlanTypes;
  interval?: IntervalsType;
  setRefreshInterval: (interval: IntervalsType) => void;
}) {
  const { toast } = useToast();

  return (
    <Select
      onValueChange={(e) => {
        setRefreshInterval(parseInt(e) as IntervalsType);
        toast({
          description: "⏱️ Your interval has been changed",
        });
      }}
      defaultValue={
        interval ? interval.toString() : Intervals.EVERY_MONTH.toString()
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an update interval" />
      </SelectTrigger>
      <SelectContent>
        {subscription_type != PREMIUM_PLAN ? (
          <SelectGroup>
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
}
