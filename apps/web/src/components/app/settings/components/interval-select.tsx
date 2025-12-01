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
import { setUpdateInterval } from "../actions";
import { RefreshInterval } from "@gitshow/db";
import { toast } from "sonner";

export default function IntervalSelect({
  interval,
}: {
  interval: RefreshInterval;
}) {
  const [_, startTransition] = useTransition();

  return (
    <Select
      onValueChange={(e) => {
        startTransition(async () => {
          const result = await setUpdateInterval(e as RefreshInterval);
          if (result.success) {
            toast.success("Update interval changed successfully");
          } else {
            toast.error(result.error);
          }
        });
      }}
      defaultValue={interval}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an update interval" />
      </SelectTrigger>
      <SelectContent>
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
      </SelectContent>
    </Select>
  );
}
