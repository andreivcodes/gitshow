"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useTransition } from "react";
import { setUpdateInterval } from "../actions";
import { RefreshInterval } from "@gitshow/db";

export default function IntervalSelect({
  interval,
}: {
  interval: RefreshInterval;
}) {
  const { toast } = useToast();
  const [_, startTransition] = useTransition();

  return (
    <Select
      onValueChange={(e) => {
        toast({
          description: "⏱️ Your interval has been changed.",
        });
        startTransition(() => {
          setUpdateInterval(e as RefreshInterval);
        });
      }}
      defaultValue={interval}
    >
      <SelectTrigger>
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
