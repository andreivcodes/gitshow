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
import {
  type RefreshInterval,
  refreshIntervalValues,
  refreshIntervalDisplayNames,
} from "@/lib/schemas";
import { toast } from "sonner";

interface IntervalSelectProps {
  interval: RefreshInterval;
}

export default function IntervalSelect({ interval }: IntervalSelectProps) {
  const [, startTransition] = useTransition();

  return (
    <Select
      onValueChange={(value) => {
        startTransition(async () => {
          const result = await setUpdateInterval(value as RefreshInterval);
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
          {refreshIntervalValues.map((intervalValue) => (
            <SelectItem key={intervalValue} value={intervalValue}>
              <div className="flex flex-row gap-2">
                {refreshIntervalDisplayNames[intervalValue]}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
