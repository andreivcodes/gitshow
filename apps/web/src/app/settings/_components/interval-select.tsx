"use client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { setUpdateInterval } from "@/app/settings/actions";
import { useTransition } from "react";
import { RefreshInterval, SubscriptionPlan } from "@prisma/client";

export default function IntervalSelect({
  subscription_type,
  interval,
}: {
  subscription_type?: SubscriptionPlan;
  interval?: RefreshInterval;
}) {
  const { toast } = useToast();
  const [_, startTransition] = useTransition();

  return (
    <Select
      onValueChange={(e) => {
        toast({
          description:
            subscription_type == "FREE"
              ? "⏱️ Your interval has been changed. Changes will take effect on next automatic update."
              : "⏱️ Your interval has been changed.",
        });
        startTransition(() => {
          setUpdateInterval(e as RefreshInterval);
        });
      }}
      defaultValue={interval ? interval : "EVERY_MONTH"}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an update interval" />
      </SelectTrigger>
      <SelectContent>
        {subscription_type != "PREMIUM" ? (
          <SelectGroup>
            <SelectItem disabled={true} value={"EVERY_DAY"}>
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2">Pro Only</p>
                <p>Daily</p>
              </div>
            </SelectItem>
            <SelectItem value={"EVERY_WEEK"} disabled={true}>
              <div className="flex flex-row gap-2">
                <p className="animate-premium-select rounded-md px-2">Pro Only</p>
                <p>Weekly</p>
              </div>
            </SelectItem>
            <SelectItem value={"EVERY_MONTH"}>
              <div className="flex flex-row gap-2">Monthly</div>
            </SelectItem>
          </SelectGroup>
        ) : (
          <SelectGroup>
            <SelectItem value={"EVERY_DAY"}>
              <div className="flex flex-row gap-2">
                <p>Daily</p>
              </div>
            </SelectItem>
            <SelectItem value={"EVERY_WEEK"}>
              <div className="flex flex-row gap-2">Weekly</div>
            </SelectItem>
            <SelectItem value={"EVERY_MONTH"}>
              <div className="flex flex-row gap-2">Monthly</div>
            </SelectItem>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
